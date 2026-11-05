using Dapper;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public CourseRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<PagedResponse<CourseListDto>> GetCoursesAsync(int instituteId, CourseSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Build SQL condition dynamically
            string sqlCondition = string.Empty;

            if (!string.IsNullOrEmpty(search.CourseName))
                sqlCondition += " AND c.course_name LIKE '" + search.CourseName.Replace("'", "''") + "%'";

            if (search.Status != 2)
                sqlCondition += " AND c.StatusFlag = " + search.Status;
            else
                sqlCondition += " AND c.StatusFlag <>" + search.Status;
            if (search.CurriculumId.HasValue && search.CurriculumId.Value > 0)
                sqlCondition += " AND c.crclmId = " + search.CurriculumId.Value;

            #region Sorting
            string direction =
    search.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
        ? "DESC"
        : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "CourseName":
                    orderByColumn = "c.course_Name";
                    break;

                default:
                    orderByColumn = "c.courseID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, c.courseID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY c.courseID DESC";
            }
            #endregion Sorting
            string query = string.Format(CourseQueries.GetCourses, sqlCondition, orderByClause);
            string countQuery = string.Format(CourseQueries.GetCoursesCount, sqlCondition);
            var parameters = new
            {
                BranchId = search.BranchId,
                InstituteId = instituteId,
                PageSize = search.PageSize,
                Offset = search.Offset
            };

            // Get total count
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(countQuery, parameters);

            // Get paginated data
            var courses = await db.QueryAsync<CourseListDto>(query, parameters);

            return new PagedResponse<CourseListDto>
            {
                Items = courses.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<CourseListDto?> GetCourseByIdAsync(int courseId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var course = await db.QueryFirstOrDefaultAsync<CourseListDto>(CourseQueries.GetCourseById, new { CourseId = courseId });

            if (course != null)
            {
                // Fetch payment template details
                var template = await db.QueryFirstOrDefaultAsync<PaymentTemplateDto>(
                    CourseQueries.GetPaymentTemplateDetails,
                    new { CourseId = courseId });
                var rawTemplate = await db.QueryFirstOrDefaultAsync<dynamic>(
        CourseQueries.GetPaymentTemplateDetails,
        new { CourseId = courseId });

                Console.WriteLine($"DTO TemplateType: {template?.TemplateType}");
                Console.WriteLine($"DTO TemplateDurationType: {template?.TemplateDurationType}");

                Console.WriteLine($"RAW TemplateType: {rawTemplate?.TemplateType}");
                Console.WriteLine($"RAW TemplateDurationType: {rawTemplate?.TemplateDurationType}");
                if (template != null)
                {
                    course.PaymentTemplate = template;

                    var installments = await db.QueryAsync<PaymentTemplateInstallmentDto>(
                        CourseQueries.GetPaymentTemplateInstallments,
                        new { PaymentTemplateId = template.PaymentTemplateId });

                    if (installments != null)
                    {
                        var installmentList = installments.ToList();
                        for (int i = 0; i < installmentList.Count; i++)
                        {
                            installmentList[i].SrNo = i + 1;
                        }
                        course.TemplateInstallments = installmentList;
                    }
                    else
                    {
                        course.TemplateInstallments = new List<PaymentTemplateInstallmentDto>();
                    }
                }

                // Check if adhoc course has students assigned
                if (course.adhocCourse == 1)
                {
                    var studentCount = await db.QueryFirstOrDefaultAsync<int>(
                        CourseQueries.CheckAdhocCourseHasStudents,
                        new { CourseId = courseId });

                    course.HasStudentsAssignedToAdhoc = studentCount > 0;
                }

                // Check if course has any students assigned (general check)
                var generalStudentCount = await db.QueryFirstOrDefaultAsync<int>(
                    CourseQueries.CheckCourseRecords,
                    new { CourseId = courseId });

                course.HasStudentsAssigned = generalStudentCount > 0;

                // Fetch assigned trainers
                var trainers = await db.QueryAsync<int>(
                    CourseQueries.GetTrainersByCourseId,
                    new { CourseId = courseId });

                if (trainers != null)
                {
                    course.TrainerIds = trainers.ToList();
                }
            }

            return course;
        }

        public async Task<(bool Success, string Message, int CourseId)> CreateCourseAsync(CourseSubmitDto request, int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check duplicate course name
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    CourseQueries.CheckDuplicateCourse,
                    new { CourseName = request.CourseName, BranchId = request.BranchId, CourseId = 0 },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Course/Class Name already exists!", 0);

                // Additional validations
                //if (request.IsCourseLvl && request.CourseFee <= 0)
                //{
                //    if (request.CourseFeeWise == 1)
                //        return (false, "Please enter course/class fees.", 0);
                //    else if (request.CourseFeeWise == 2)
                //        return (false, "Please enter per session fees.", 0);
                //}

                // Session fee logic: disable installment if not course level or session wise fee
                if (!request.IsCourseLvl || request.CourseFeeWise == 2)
                {
                    request.AllowInstallment = false;
                    request.MaxInstallment = 0;
                }

                if (request.IsCourseLvl && request.AllowInstallment && request.AdhocCourse == 0)
                {
                    if (request.MaxInstallment <= 0)
                        return (false, "Please enter no. of installment.", 0);
                }

                // Validate payment template if creating one
                if (request.IsCreateTemplate && request.AdhocCourse == 0)
                {
                    if (request.TemplateDetails == null || request.TemplateDetails.Count == 0)
                        return (false, "Please create template installments!", 0);

                    if (request.TemplateType == 1 && request.NoofDays <= 0)
                        return (false, "Please Enter interval days!", 0);

                    if (request.TemplateType == 2 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a days of start between 1-28!", 0);

                    if (request.TemplateType == 3 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a days of start between 1-28!", 0);

                    // Validate template amounts match course fee
                    double templateTotal = 0;
                    foreach (var detail in request.TemplateDetails)
                    {
                        var parts = detail.Split('#');
                        if (parts.Length >= 2 && double.TryParse(parts[1], out double amount))
                        {
                            templateTotal += amount;
                        }
                    }

                    if (request.CourseFee != Math.Round(templateTotal))
                        return (false, "Course fees amount must be matched with sum of template installment amount", 0);

                    if (request.MaxInstallment != request.TemplateDetails.Count)
                        return (false, "Maximum Installment must be matched with the number of installment rows created", 0);
                }

                // Insert new course
                var parameters = new
                {
                    CourseName = request.CourseName.Replace("'", "''"),
                    Description = request.Description.Replace("'", "''"),
                    Duration = request.Duration,
                    DurationType = request.DurationType,
                    IsCourseLvl = request.IsCourseLvl,
                    CourseFee = request.CourseFee,
                    CrclmId = request.CrclmId,
                    Taxable = request.Taxable,
                    IncludingTax = request.IncludingTax,
                    AllowInstallment = request.AllowInstallment,
                    MaxInstallment = request.MaxInstallment,
                    Type = request.Type.Replace("'", "''"),
                    Hsncode = request.Hsncode.Replace("'", "''"),
                    AdhocCourse = request.AdhocCourse,
                    CourseFeeWise = request.CourseFeeWise,
                    BranchId = request.BranchId,
                    InstId = instituteId
                };

                int courseId = await db.QuerySingleAsync<int>(CourseQueries.InsertCourse, parameters, transaction);

                // Create payment template if requested
                if (request.IsCreateTemplate)
                {
                    await CreatePaymentTemplateAsync(courseId, request, instituteId, db, transaction);
                }

                // Assign trainers/counselors
                if (request.TrainerIds != null && request.TrainerIds.Count > 0)
                {
                    await AssignTrainersToCourseAsync(courseId, request.TrainerIds, instituteId, request.BranchId, db, transaction);
                }

                // Create session-wise subject if course fee wise is session
                if (request.CourseFeeWise == 2)
                {
                    await CreateSessionWiseSubjectAsync(courseId, request, db, transaction);
                }

                transaction.Commit();

                if (request.CourseFeeWise == 1)
                    return (true, "Course/Class saved successfully.Please add subjects to register students in this course/class.", courseId);
                else
                    return (true, "Course/Class saved successfully.", courseId);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error saving course: {ex.Message}", 0);
            }
        }

        private async Task CreatePaymentTemplateAsync(int courseId, CourseSubmitDto request, int instituteId, IDbConnection db, IDbTransaction transaction)
        {
            var templateParams = new
            {
                TemplateType = request.TemplateType,
                NoofDays = request.NoofDays,
                TemplateStatus = request.TemplateStatus ? 1 : 0,
                BranchId = request.BranchId,
                InstituteId = instituteId
            };

            int paymentTemplateId = await db.QuerySingleAsync<int>(CourseQueries.InsertPaymentTemplate, templateParams, transaction);

            await db.ExecuteAsync(CourseQueries.InsertPaymentTemplateCourse,
                new { PaymentTemplateId = paymentTemplateId, CourseId = courseId }, transaction);

            // Insert template details
            foreach (var detail in request.TemplateDetails)
            {
                var parts = detail.Split('#');
                if (parts.Length >= 2)
                {
                    await db.ExecuteAsync(CourseQueries.InsertPaymentTemplateDetail,
                        new
                        {
                            PaymentTemplateId = paymentTemplateId,
                            NoOfDay = int.Parse(parts[0]),
                            Amount = double.Parse(parts[1])
                        }, transaction);
                }
            }
        }

        private async Task AssignTrainersToCourseAsync(int courseId, List<int> trainerIds, int instituteId, int branchId, IDbConnection db, IDbTransaction transaction)
        {
            foreach (var trainerId in trainerIds)
            {
                await db.ExecuteAsync(CourseQueries.InsertTrainerCourseAssignment,
                    new
                    {
                        CourseId = courseId,
                        TrainerId = trainerId,
                        InstituteId = instituteId,
                        BranchId = branchId
                    }, transaction);
            }
        }

        private async Task CreateSessionWiseSubjectAsync(int courseId, CourseSubmitDto request, IDbConnection db, IDbTransaction transaction)
        {
            var subjectParams = new
            {
                CourseId = courseId,
                SubName = request.CourseName.Replace("'", "''"),
                Fees = request.CourseFee,
                Taxable = request.Taxable ? 1 : 0,
                IncludingTax = request.IncludingTax ? 1 : 0,
                AllowInstallment = request.AllowInstallment ? 1 : 0,
                MaxInstallment = request.MaxInstallment,
                Duration = request.Duration,
                CourseEndDate = DateTime.MinValue.ToString("yyyy-MM-dd")
            };

            await db.ExecuteAsync(CourseQueries.InsertSessionWiseSubject, subjectParams, transaction);
        }

        public async Task<(bool Success, string Message)> UpdateCourseAsync(CourseEditDto request, int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check duplicate course name
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    CourseQueries.CheckDuplicateCourse,
                    new { CourseName = request.CourseName, BranchId = request.BranchId, CourseId = request.CourseId },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Course/Class Name already exists!");

                // Additional validations
                //if (request.IsCourseLvl && request.CourseFee <= 0)
                //{
                //    if (request.CourseFeeWise == 1)
                //        return (false, "Please enter course/class fees.");
                //    else if (request.CourseFeeWise == 2)
                //        return (false, "Please enter per session fees.");
                //}

                // Session fee logic: disable installment if not course level or session wise fee
                if (!request.IsCourseLvl || request.CourseFeeWise == 2)
                {
                    request.AllowInstallment = false;
                    request.MaxInstallment = 0;
                }

                if (request.IsCourseLvl && request.AllowInstallment && request.AdhocCourse == 0)
                {
                    if (request.MaxInstallment <= 0)
                        return (false, "Please enter no. of installment.");
                }

                // Validate payment template if creating one
                if (request.IsCreateTemplate && request.AdhocCourse == 0)
                {
                    if (request.TemplateDetails == null || request.TemplateDetails.Count == 0)
                        return (false, "Please create template installments!");

                    if (request.TemplateType == 1 && request.NoofDays <= 0)
                        return (false, "Please Enter interval days!");

                    if (request.TemplateType == 2 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a days of start between 1-28!");

                    if (request.TemplateType == 3 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a days of start between 1-28!");

                    // Validate template amounts match course fee
                    double templateTotal = 0;
                    foreach (var detail in request.TemplateDetails)
                    {
                        var parts = detail.Split('#');
                        if (parts.Length >= 2 && double.TryParse(parts[1], out double amount))
                        {
                            templateTotal += amount;
                        }
                    }

                    if (request.CourseFee != Math.Round(templateTotal))
                        return (false, "Course fees amount must be matched with sum of template installment amount");

                    if (request.MaxInstallment != request.TemplateDetails.Count)
                        return (false, "Maximum Installment must be matched with the number of installment rows created");
                }

                // Check if course level is changing and if it has subjects
                var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                    CourseQueries.GetCourseTypeAndSubcount,
                    new { CourseId = request.CourseId },
                    transaction);

                if (courseInfo != null)
                {
                    bool currentIsCourseLvl = Convert.ToBoolean(courseInfo.IscourseLvl);
                    int subCount = (int)courseInfo.subcount;

                    if (request.IsCourseLvl != currentIsCourseLvl && subCount > 0)
                        return (false, "Unable to change course/class fees level, this course/class already have subjects.");
                }

                // Add audit logs before update
                await AddAuditLogsForCourseUpdateAsync(request.CourseId, userId, ipAddress, db, transaction);

                // Delete existing trainer assignments
                await db.ExecuteAsync(CourseQueries.DeleteTrainerCourseAssignments,
                    new { InstituteId = instituteId, BranchId = request.BranchId, CourseId = request.CourseId }, transaction);

                // Update existing course
                var parameters = new
                {
                    CourseName = request.CourseName.Replace("'", "''"),
                    Description = request.Description.Replace("'", "''"),
                    Duration = request.Duration,
                    DurationType = request.DurationType,
                    Status = request.status,
                    IsCourseLvl = request.IsCourseLvl,
                    CourseFee = request.CourseFee,
                    CrclmId = request.CrclmId,
                    Taxable = request.Taxable,
                    IncludingTax = request.IncludingTax,
                    AllowInstallment = request.AllowInstallment,
                    MaxInstallment = request.MaxInstallment,
                    Type = request.Type.Replace("'", "''"),
                    Hsncode = request.Hsncode.Replace("'", "''"),
                    AdhocCourse = request.AdhocCourse,
                    CourseFeeWise = request.CourseFeeWise,
                    CourseId = request.CourseId
                };

                await db.ExecuteAsync(CourseQueries.UpdateCourse, parameters, transaction);

                // Update/create payment template
                if (request.AdhocCourse == 0 && request.IsCreateTemplate)
                {
                    await UpdatePaymentTemplateAsync(
                        request.CourseId,
                        request,
                        instituteId,
                        db,
                        transaction);
                }
                else if (request.PaymentTemplateId > 0)
                {
                    // User removed the template
                    await db.ExecuteAsync(
                        CourseQueries.DeletePaymentTemplateDetailsByTemplateId,
                        new { PaymentTemplateId = request.PaymentTemplateId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeletePaymentTemplateCoursesByTemplateId,
                        new { PaymentTemplateId = request.PaymentTemplateId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeletePaymentTemplateById,
                        new { PaymentTemplateId = request.PaymentTemplateId },
                        transaction);
                }

                // Assign trainers/counselors
                if (request.TrainerIds != null && request.TrainerIds.Count > 0)
                {
                    await AssignTrainersToCourseAsync(request.CourseId, request.TrainerIds, instituteId, request.BranchId, db, transaction);
                }

                // If course level, update subject fees
                if (request.IsCourseLvl && courseInfo != null)
                {
                    await UpdateSubjectFeesAsync(request.CourseId, request.CourseFee, request.Taxable,
                        request.IncludingTax, request.AllowInstallment, request.MaxInstallment, db, transaction);
                }

                // Update session-wise subject if course fee wise is session
                if (request.CourseFeeWise == 2)
                {
                    await UpdateSessionWiseSubjectAsync(request.CourseId, request, db, transaction);
                }

                // Deactivate online tests if status is 0
                if (parameters.Status == 0)
                {
                    await DeactivateOnlineTestsAsync(request.CourseId, db, transaction);
                }

                // Update all branches if requested and branchId is 0
                if (request.BranchId == 0 && request.UpdateAllBranches)
                {
                    await UpdateReferenceCoursesAsync(request, instituteId, db, transaction);
                }

                transaction.Commit();

                return (true, "Course/Class updated successfully.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error updating course: {ex.Message}");
            }
        }

        private async Task AddAuditLogsForCourseUpdateAsync(int courseId, int userId, string ipAddress, IDbConnection db, IDbTransaction transaction)
        {
            // Get subject IDs for the course
            var subjectIds = await db.QueryFirstOrDefaultAsync<string>(
                CourseQueries.GetCourseSubjectIds,
                new { CourseId = courseId },
                transaction);

            // Add subject audit logs if subjects exist
            if (!string.IsNullOrEmpty(subjectIds))
            {
                string subjectAuditQuery = string.Format(CourseQueries.InsertSubjectAuditUpdate, subjectIds);
                await db.ExecuteAsync(
                    subjectAuditQuery,
                    new { UserId = userId, UpdateDate = DateTime.Now, IpAddress = ipAddress },
                    transaction);
            }

            // Add course audit log
            await db.ExecuteAsync(
                CourseQueries.InsertCourseAuditUpdate,
                new { CourseId = courseId, UserId = userId, UpdateDate = DateTime.Now, IpAddress = ipAddress },
                transaction);
        }

        private async Task UpdateSubjectFeesAsync(int courseId, double courseFee, bool taxable, bool includingTax,
            bool allowInstallment, int maxInstallment, IDbConnection db, IDbTransaction transaction)
        {
            var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                CourseQueries.GetCourseTypeAndSubcount,
                new { CourseId = courseId },
                transaction);

            if (courseInfo != null && courseInfo.subIds != null)
            {
                string subIds = courseInfo.subIds.ToString();
                if (!string.IsNullOrEmpty(subIds))
                {
                    string query = string.Format(CourseQueries.GetSubjectDetailsForFeeUpdate, subIds);
                    var subjectDetails = await db.QueryAsync<dynamic>(query, transaction);

                    int activeCount = 0;
                    string activeSubjectIds = "";
                    string inactiveSubjectIds = "";

                    foreach (var subject in subjectDetails)
                    {
                        if (Convert.ToBoolean(subject.IscourseLvl))
                        {
                            if (subject.StatusFlag == 1)
                            {
                                activeCount++;
                                activeSubjectIds += subject.subID + "#";
                            }
                            else
                            {
                                inactiveSubjectIds += subject.subID + "#";
                            }
                        }
                    }

                    // Set inactive subjects to 0 fee
                    if (!string.IsNullOrEmpty(inactiveSubjectIds))
                    {
                        var inactiveIds = inactiveSubjectIds.TrimEnd('#').Split('#');
                        foreach (var subIdStr in inactiveIds)
                        {
                            if (int.TryParse(subIdStr, out int subId))
                            {
                                await db.ExecuteAsync(CourseQueries.UpdateSubFeeBySubId,
                                    new
                                    {
                                        SubId = subId,
                                        Fees = 0,
                                        Taxable = taxable ? 1 : 0,
                                        IncludingTax = includingTax ? 1 : 0,
                                        AllowInstallment = allowInstallment ? 1 : 0,
                                        MaxInstallment = maxInstallment
                                    }, transaction);
                            }
                        }
                    }

                    // Calculate and set active subject fees
                    if (activeCount > 0 && !string.IsNullOrEmpty(activeSubjectIds))
                    {
                        double newSubjectFee = Math.Round(courseFee / activeCount);
                        var activeIds = activeSubjectIds.TrimEnd('#').Split('#');

                        for (int i = 0; i < activeIds.Length; i++)
                        {
                            if (int.TryParse(activeIds[i], out int subId))
                            {
                                double fee = newSubjectFee;
                                // Adjust last subject to account for rounding
                                if (i == activeIds.Length - 1)
                                {
                                    fee = Math.Round(courseFee - (newSubjectFee * (activeCount - 1)));
                                }

                                await db.ExecuteAsync(CourseQueries.UpdateSubFeeBySubId,
                                    new
                                    {
                                        SubId = subId,
                                        Fees = fee,
                                        Taxable = taxable ? 1 : 0,
                                        IncludingTax = includingTax ? 1 : 0,
                                        AllowInstallment = allowInstallment ? 1 : 0,
                                        MaxInstallment = maxInstallment
                                    }, transaction);
                            }
                        }
                    }
                }
            }
        }

        private async Task UpdateReferenceCoursesAsync(CourseEditDto request, int instituteId, IDbConnection db, IDbTransaction transaction)
        {
            var referenceCourses = await db.QueryAsync<dynamic>(
                CourseQueries.GetReferenceCourses,
                new { CourseId = request.CourseId },
                transaction);

            // Get payment templates from institute course
            var institutePaymentTemplates = await db.QueryAsync<dynamic>(
                CourseQueries.GetPaymentTemplatesForInstituteCourse,
                new { CourseId = request.CourseId },
                transaction);

            foreach (var refCourse in referenceCourses)
            {
                int branchCourseId = refCourse.courseid;
                int branchId = refCourse.BranchID;

                // Update the reference course
                await db.ExecuteAsync(CourseQueries.UpdateReferenceCourse,
                    new
                    {
                        CourseName = request.CourseName.Replace("'", "''"),
                        Duration = request.Duration,
                        DurationType = request.DurationType,
                        Description = request.Description.Replace("'", "''"),
                        Status = 1,
                        IsCourseLvl = request.IsCourseLvl,
                        CourseFee = request.CourseFee,
                        Taxable = request.Taxable ? 1 : 0,
                        IncludingTax = request.IncludingTax ? 1 : 0,
                        AllowInstallment = request.AllowInstallment ? 1 : 0,
                        MaxInstallment = request.MaxInstallment,
                        AdhocCourse = request.AdhocCourse,
                        CourseId = request.CourseId
                    }, transaction);

                // Handle payment templates for branch course
                // Get existing payment templates for branch course
                var branchPaymentTemplates = await db.QueryAsync<dynamic>(
                    CourseQueries.GetPaymentTemplatesForInstituteCourse,
                    new { CourseId = branchCourseId },
                    transaction);

                foreach (var branchTemplate in branchPaymentTemplates)
                {
                    int templateId = branchTemplate.paymenttemplateid;
                    // Delete payment template details
                    await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateDetailsByTemplateId,
                        new { PaymentTemplateId = templateId }, transaction);
                    // Delete payment template courses
                    await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateCoursesByTemplateId,
                        new { PaymentTemplateId = templateId }, transaction);
                    // Delete payment template
                    await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateById,
                        new { PaymentTemplateId = templateId }, transaction);
                }

                // Create new payment templates from institute course
                foreach (var instituteTemplate in institutePaymentTemplates)
                {
                    int instituteTemplateId = instituteTemplate.paymenttemplateid;
                    int templateDurationType = instituteTemplate.templatedurationtype;
                    int noofDays = instituteTemplate.noofdays;
                    int statusFlag = instituteTemplate.statusflag;
                    int instituteTemplateInstituteId = instituteTemplate.instituteid;

                    // Create new payment template for branch
                    int newTemplateId = await db.QuerySingleAsync<int>(
                        CourseQueries.CreatePaymentTemplateForBranch,
                        new
                        {
                            TemplateDurationType = templateDurationType,
                            NoofDays = noofDays,
                            StatusFlag = statusFlag,
                            BranchId = branchId,
                            InstituteId = instituteTemplateInstituteId
                        },
                        transaction);

                    // Link template to branch course
                    await db.ExecuteAsync(CourseQueries.LinkPaymentTemplateToBranchCourse,
                        new { PaymentTemplateId = newTemplateId, CourseId = branchCourseId },
                        transaction);

                    // Get template details from institute course
                    var templateDetails = await db.QueryAsync<dynamic>(
                        CourseQueries.GetPaymentTemplateDetails,
                        new { PaymentTemplateId = instituteTemplateId },
                        transaction);

                    // Copy template details from institute course to branch course
                    foreach (var detail in templateDetails)
                    {
                        await db.ExecuteAsync(CourseQueries.CopyPaymentTemplateDetailsForBranch,
                            new
                            {
                                PaymentTemplateId = newTemplateId,
                                NoOfDay = detail.noofday,
                                Amount = detail.amount
                            },
                            transaction);
                    }
                }

                // If course level, update subject fees for reference course
                if (request.IsCourseLvl && Convert.ToBoolean(refCourse.IscourseLvl))
                {
                    string subIds = refCourse.subIds?.ToString() ?? "";
                    int subCount = refCourse.subcount ?? 0;

                    if (subCount > 0 && !string.IsNullOrEmpty(subIds))
                    {
                        double newSubjectFee = Math.Round(request.CourseFee / subCount);
                        var subIdArray = subIds.Split(',');

                        for (int i = 0; i < subIdArray.Length; i++)
                        {
                            if (int.TryParse(subIdArray[i], out int subId))
                            {
                                double fee = newSubjectFee;
                                if (i == subIdArray.Length - 1)
                                {
                                    fee = Math.Round(request.CourseFee - (newSubjectFee * (subCount - 1)));
                                }

                                await db.ExecuteAsync(CourseQueries.UpdateSubFeeBySubId,
                                    new
                                    {
                                        SubId = subId,
                                        Fees = fee,
                                        Taxable = request.Taxable ? 1 : 0,
                                        IncludingTax = request.IncludingTax ? 1 : 0,
                                        AllowInstallment = request.AllowInstallment ? 1 : 0,
                                        MaxInstallment = request.MaxInstallment
                                    }, transaction);
                            }
                        }
                    }
                }
            }
        }

        private async Task UpdatePaymentTemplateAsync(int courseId, CourseEditDto request, int instituteId, IDbConnection db, IDbTransaction transaction)
        {
            // Delete existing payment template if it exists
            if (request.PaymentTemplateId > 0)
            {
                await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateDetailsByTemplateId,
                    new { PaymentTemplateId = request.PaymentTemplateId }, transaction);

                await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateCoursesByTemplateId,
                    new { PaymentTemplateId = request.PaymentTemplateId }, transaction);

                await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateById,
                    new { PaymentTemplateId = request.PaymentTemplateId }, transaction);
            }

            // Create new payment template
            var templateParams = new
            {
                TemplateType = request.TemplateType,
                NoofDays = request.NoofDays,
                TemplateStatus = request.TemplateStatus ? 1 : 0,
                BranchId = request.BranchId,
                InstituteId = instituteId
            };

            int paymentTemplateId = await db.QuerySingleAsync<int>(CourseQueries.InsertPaymentTemplate, templateParams, transaction);

            await db.ExecuteAsync(CourseQueries.InsertPaymentTemplateCourse,
                new { PaymentTemplateId = paymentTemplateId, CourseId = courseId }, transaction);

            // Insert template details
            foreach (var detail in request.TemplateDetails)
            {
                var parts = detail.Split('#');
                if (parts.Length >= 2)
                {
                    await db.ExecuteAsync(CourseQueries.InsertPaymentTemplateDetail,
                        new
                        {
                            PaymentTemplateId = paymentTemplateId,
                            NoOfDay = int.Parse(parts[0]),
                            Amount = double.Parse(parts[1])
                        }, transaction);
                }
            }
        }

        private async Task UpdateSessionWiseSubjectAsync(int courseId, CourseEditDto request, IDbConnection db, IDbTransaction transaction)
        {
            var subjectParams = new
            {
                CourseId = courseId,
                SubName = request.CourseName.Replace("'", "''"),
                Fees = request.CourseFee,
                Taxable = request.Taxable ? 1 : 0,
                IncludingTax = request.IncludingTax ? 1 : 0,
                AllowInstallment = request.AllowInstallment ? 1 : 0,
                MaxInstallment = request.MaxInstallment,
                Duration = request.Duration,
                CourseEndDate = DateTime.MinValue.ToString("yyyy-MM-dd")
            };

            await db.ExecuteAsync(CourseQueries.UpdateSessionWiseSubject, subjectParams, transaction);
        }

        private async Task DeactivateOnlineTestsAsync(int courseId, IDbConnection db, IDbTransaction transaction)
        {
            var onlineTests = await db.QueryAsync<int>(
                CourseQueries.GetOnlineTestsBySubjectIds,
                new { CourseId = courseId },
                transaction);

            foreach (var testId in onlineTests)
            {
                await db.ExecuteAsync(CourseQueries.DeactivateOnlineTest,
                    new { OnlineTestId = testId }, transaction);
            }
        }

        public async Task<(bool Success, string Message)> DeleteCourseAsync(int courseId, bool deleteStatus, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Comprehensive check if course can be deleted
                bool canDelete = await CheckCourseRecordsAsync(courseId, db, transaction);

                if (!canDelete)
                    return (false, "Unable to delete course. The course has related records that prevent deletion.");

                // Add audit logs before deletion
                await AddAuditLogsForCourseDeletionAsync(courseId, userId, ipAddress, db, transaction);


                int status = deleteStatus ? 1 : 0;

                // Get all subject IDs for the course
                var subjectIds = await db.QueryAsync<int>(
                    CourseQueries.GetSubjectIdsByCourseId,
                    new { CourseId = courseId },
                    transaction);

                bool allSubjectsDeleted = true;

                // If no subjects, mark as true
                if (subjectIds == null || !subjectIds.Any())
                {
                    allSubjectsDeleted = true;
                }
                else
                {
                    // Delete each subject
                    foreach (var subId in subjectIds)
                    {
                        bool result = await DeleteSubjectAsync(status, subId, db, transaction);
                        if (!result)
                        {
                            allSubjectsDeleted = false;
                            break;
                        }
                    }
                }

                if (allSubjectsDeleted)
                {
                    // Perform deletion based on status
                    if (deleteStatus == false)
                    {
                        // Soft delete - make inactive
                        await db.ExecuteAsync(CourseQueries.SoftDeleteCourse, new { CourseId = courseId }, transaction);
                        transaction.Commit();
                        return (true, "Course made inactive successfully.");
                    }
                    else if (deleteStatus == true)
                    {
                        // Hard delete - permanent deletion
                        // Delete from student_course
                        await db.ExecuteAsync(CourseQueries.DeleteStudentCourse, new { CourseId = courseId }, transaction);

                        // Delete from testcourse
                        await db.ExecuteAsync(CourseQueries.DeleteTestCourse, new { CourseId = courseId }, transaction);

                        // Delete from trainercourse
                        await db.ExecuteAsync(CourseQueries.DeleteTrainerCourse, new { CourseId = courseId }, transaction);

                        // Delete from batchcourse
                        await db.ExecuteAsync(CourseQueries.DeleteBatchCourse, new { CourseId = courseId }, transaction);

                        // Delete payment template details
                        await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateDetails, new { CourseId = courseId }, transaction);

                        // Delete payment templates
                        await db.ExecuteAsync(CourseQueries.DeletePaymentTemplates, new { CourseId = courseId }, transaction);

                        // Delete payment template courses
                        await db.ExecuteAsync(CourseQueries.DeletePaymentTemplateCourses, new { CourseId = courseId }, transaction);

                        // Delete the course
                        await db.ExecuteAsync(CourseQueries.HardDeleteCourse, new { CourseId = courseId }, transaction);

                        transaction.Commit();
                        return (true, "Course deleted successfully.");
                    }
                    else
                    {
                        return (false, "Invalid delete status.");
                    }
                }
                else
                {
                    return (false, "Something went wrong, please again after some time.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error deleting course: {ex.Message}");
            }
        }

        private async Task<bool> DeleteSubjectAsync(int status, int subId, IDbConnection db, IDbTransaction transaction)
        {
            try
            {
                if (status == 0)
                {
                    // Deactivate subject
                    var onlineTestIds = await db.QueryAsync<int>(
                        CourseQueries.GetOnlineTestIdsBySubjectId,
                        new { SubId = subId },
                        transaction);

                    foreach (var testId in onlineTestIds)
                    {
                        await db.ExecuteAsync(
                            CourseQueries.UpdateOnlineTestStatus,
                            new { OnlineTestId = testId },
                            transaction);
                    }

                    await db.ExecuteAsync(
                        CourseQueries.UpdateSubjectStatus,
                        new { Status = 0, SubId = subId },
                        transaction);

                    return true;
                }
                else if (status == 1)
                {
                    // Delete subject
                    await db.ExecuteAsync(
                        CourseQueries.DeleteStudentSubjects,
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeleteTestSubject,
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeleteTrainerSubject,
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeleteBatchSubject,
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeletePaymentTemplateDetailsBySubject,
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeletePaymentTemplatesBySubject,
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeletePaymentTemplateSubject,
                        new { SubId = subId },
                        transaction);

                    // Get subject details before deletion
                    var subject = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT * FROM tbl_subject WHERE subid = @SubId",
                        new { SubId = subId },
                        transaction);

                    await db.ExecuteAsync(
                        CourseQueries.DeleteSubject,
                        new { SubId = subId },
                        transaction);

                    // Recalculate fees for remaining subjects in the course
                    if (subject != null)
                    {
                        int courseId = (int)subject.courseID;
                        var subjectDetails = await db.QueryAsync<dynamic>(
                            CourseQueries.GetSubjectDetailsForFeeRecalculation,
                            new { CourseId = courseId },
                            transaction);

                        int activeCount = 0;
                        string activeSubjects = "";
                        string inactiveSubjects = "";

                        foreach (var sub in subjectDetails)
                        {
                            if (Convert.ToBoolean(sub.IscourseLvl))
                            {
                                if (sub.StatusFlag == 1)
                                {
                                    activeCount++;
                                    activeSubjects += $"Active#{sub.subID}#{sub.Fees}#{sub.courseFees};";
                                }
                                else
                                {
                                    inactiveSubjects += $"Inactive#{sub.subID}#{sub.Fees}#{sub.courseFees};";
                                }
                            }
                        }

                        // Set inactive subjects fees to 0
                        if (!string.IsNullOrEmpty(inactiveSubjects))
                        {
                            var inactiveList = inactiveSubjects.TrimEnd(';').Split(';');
                            foreach (var subData in inactiveList)
                            {
                                var parts = subData.Split('#');
                                if (int.TryParse(parts[1], out int subIdToUpdate))
                                {
                                    await db.ExecuteAsync(
                                        "UPDATE tbl_subject SET Fees = 0 WHERE subID = @SubId",
                                        new { SubId = subIdToUpdate },
                                        transaction);
                                }
                            }
                        }

                        // Recalculate active subjects fees
                        if (activeCount > 0 && !string.IsNullOrEmpty(activeSubjects))
                        {
                            double courseFees = Convert.ToDouble(subjectDetails.FirstOrDefault()?.courseFees ?? 0);
                            double newSubjectFee = Math.Round(courseFees / activeCount);
                            var activeList = activeSubjects.TrimEnd(';').Split(';');

                            for (int i = 0; i < activeList.Length; i++)
                            {
                                var parts = activeList[i].Split('#');
                                if (int.TryParse(parts[1], out int subIdToUpdate))
                                {
                                    double fee = newSubjectFee;
                                    // Adjust last subject to account for rounding
                                    if (i == activeList.Length - 1)
                                    {
                                        fee = Math.Round(courseFees - (newSubjectFee * (activeCount - 1)));
                                    }

                                    await db.ExecuteAsync(
                                        "UPDATE tbl_subject SET Fees = @Fees WHERE subID = @SubId",
                                        new { SubId = subIdToUpdate, Fees = fee },
                                        transaction);
                                }
                            }
                        }
                    }

                    return true;
                }

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private async Task<bool> CheckCourseRecordsAsync(int courseId, IDbConnection db, IDbTransaction transaction)
        {
            // Check if course has students
            var studentCount = await db.QueryFirstOrDefaultAsync<int>(
                CourseQueries.CheckCourseRecords,
                new { CourseId = courseId },
                transaction);

            if (studentCount > 0)
                return false;

            // Check if course has scheduled subjects
            var scheduledSubjectCount = await db.QueryFirstOrDefaultAsync<int>(
                CourseQueries.CheckCourseScheduledSubjects,
                new { CourseId = courseId },
                transaction);

            if (scheduledSubjectCount > 0)
                return false;

            // Check each subject in the course
            var subjects = await db.QueryAsync<int>(
                CourseQueries.GetCourseSubjects,
                new { CourseId = courseId },
                transaction);

            foreach (var subId in subjects)
            {
                if (!await CheckSubjectRecordsAsync(subId, db, transaction))
                    return false;
            }

            return true;
        }

        private async Task<bool> CheckSubjectRecordsAsync(int subId, IDbConnection db, IDbTransaction transaction)
        {
            // Check if subject has test questions
            var questionCount = await db.QueryFirstOrDefaultAsync<int>(
                CourseQueries.CheckSubjectTestQuestions,
                new { SubId = subId },
                transaction);

            if (questionCount > 0)
                return false;

            // Check if subject has scheduled student subjects
            var scheduledSubjectCount = await db.QueryFirstOrDefaultAsync<int>(
                CourseQueries.CheckSubjectScheduledSubjects,
                new { SubId = subId },
                transaction);

            if (scheduledSubjectCount > 0)
                return false;

            //Check if subject has payments
            var CheckSubjectPayment = await db.QueryFirstOrDefaultAsync<int>(
                 CourseQueries.CheckSubjectPayments,
                 new { SubId = subId },
                 transaction,
                 commandTimeout: 300);

            if (CheckSubjectPayment > 0)
                return false;

            // Check if subject has tests
            var testCount = await db.QueryFirstOrDefaultAsync<int>(
                CourseQueries.CheckSubjectTests,
                new { SubId = subId },
                transaction);

            if (testCount > 0)
                return false;

            return true;
        }

        private async Task AddAuditLogsForCourseDeletionAsync(int courseId, int userId, string ipAddress, IDbConnection db, IDbTransaction transaction)
        {
            // Get subject IDs for the course
            var subjectIds = await db.QueryFirstOrDefaultAsync<string>(
                CourseQueries.GetCourseSubjectIds,
                new { CourseId = courseId },
                transaction);

            // Add subject audit logs if subjects exist
            if (!string.IsNullOrEmpty(subjectIds))
            {
                string subjectAuditQuery = string.Format(CourseQueries.InsertSubjectAudit, subjectIds);
                await db.ExecuteAsync(
                    subjectAuditQuery,
                    new { UserId = userId, DeleteDate = DateTime.Now, IpAddress = ipAddress },
                    transaction);
            }

            // Add course audit log
            await db.ExecuteAsync(
                CourseQueries.InsertCourseAudit,
                new { CourseId = courseId, UserId = userId, DeleteDate = DateTime.Now, IpAddress = ipAddress },
                transaction);
        }

        public async Task<PagedResponse<CourseInstituteListDto>> GetInstituteCoursesAsync(CourseInstituteDto course_institute, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var parameters = new
            {
                BranchId = course_institute.BranchId,
                InstituteId = instituteId,
                PageSize = course_institute.PageSize,
                Offset = course_institute.Offset
            };
            #region Sorting
            string direction =
        course_institute.SortDirection?.Equals(
            "desc",
            StringComparison.OrdinalIgnoreCase) == true
            ? "DESC"
            : "ASC";

            string orderByColumn;

            switch (course_institute.SortBy)
            {
                case "CourseName":
                    orderByColumn = "c.course_Name";
                    break;

                default:
                    orderByColumn = "c.courseID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(course_institute.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, c.courseID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY curriculum_name ASC, c.course_Name ASC, c.courseID ASC";
            }
            #endregion Sorting
            // Get total count
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(CourseQueries.GetInstituteCoursesForImportCount, parameters);

            // Get paginated data
            string query = string.Format(
       CourseQueries.GetInstituteCoursesForImport,
       orderByClause);

            var courses = await db.QueryAsync<CourseInstituteListDto>(
                query,
                parameters);

            return new PagedResponse<CourseInstituteListDto>
            {
                Items = courses.ToList(),
                TotalCount = totalCount,
                PageNumber = course_institute.PageNumber,
                PageSize = course_institute.PageSize
            };
        }

        public async Task<PagedResponse<CourseInstituteListDto>> GetInstituteCoursesbyCrclmIdsAsync(CourseInstituteDto course_institute, int instituteId, int[] CrclmIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            if (db.State == ConnectionState.Closed)
                db.Open();

            bool bindAllCrclm = CrclmIds == null || CrclmIds.Length == 0 || (CrclmIds.Length == 1 && CrclmIds[0] == 0);

            var parameters = new
            {
                BranchId = course_institute.BranchId,
                InstituteId = instituteId,
                PageSize = course_institute.PageSize,
                Offset = course_institute.Offset,
                CrclmId = bindAllCrclm ? new int[] { -1 } : CrclmIds,
                BindAllCrclm = bindAllCrclm
            };
            #region Sorting
            string direction =
        course_institute.SortDirection?.Equals(
            "desc",
            StringComparison.OrdinalIgnoreCase) == true
            ? "DESC"
            : "ASC";

            string orderByColumn;

            switch (course_institute.SortBy)
            {
                case "CourseName":
                    orderByColumn = "c.course_Name";
                    break;

                default:
                    orderByColumn = "c.courseID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(course_institute.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, c.courseID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY curriculum_name ASC, c.course_Name ASC, c.courseID ASC";
            }

            #endregion Sorting
            // Get total count
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(CourseQueries.GetInstituteCoursesbyCrclmIdForImportCount, parameters);

            // Get paginated data
            string query = string.Format(
       CourseQueries.GetInstituteCoursesbyCrclmIdForImport,
       orderByClause);

            var courses = await db.QueryAsync<CourseInstituteListDto>(
                query,
                parameters);

            return new PagedResponse<CourseInstituteListDto>
            {
                Items = courses.ToList(),
                TotalCount = totalCount,
                PageNumber = course_institute.PageNumber,
                PageSize = course_institute.PageSize
            };
        }

        public async Task<PagedResponse<CourseSubjectListDto>> GetCourseSubjectsAsync(
     List<int> courseIds,
     int instituteId,
     CourseSubjectsDto request)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            if (courseIds == null || courseIds.Count == 0)
            {
                return new PagedResponse<CourseSubjectListDto>
                {
                    Items = new List<CourseSubjectListDto>(),
                    TotalCount = 0,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize
                };
            }

            string courseIdsStr = string.Join(",", courseIds);

            string query = string.Format(
                CourseQueries.GetSubjectsByCourseIds,
                courseIdsStr
            );

            string queryCount = string.Format(
                CourseQueries.GetSubjectsByCourseIdsCount,
                courseIdsStr
            );

            // Pagination
            int offset = (request.PageNumber - 1) * request.PageSize;

            var subjects = await db.QueryAsync<CourseSubjectListDto>(
                query,
                new
                {
                    InstituteId = instituteId,
                    BranchId = request.BranchId,
                    PageSize = request.PageSize,
                    Offset = offset
                }
            );

            var totalCount = await db.QueryFirstOrDefaultAsync<int>(
                queryCount,
                new
                {
                    InstituteId = instituteId,
                    BranchId = request.BranchId
                }
            );

            return new PagedResponse<CourseSubjectListDto>
            {
                Items = subjects.ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }

        public async Task<(bool Success, string Message)> SubmitInstituteCoursesAsync(int branchId, int instituteId, List<int> courseIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int importedCount = 0;

                foreach (int sourceCourseId in courseIds)
                {
                    // Get course info
                    var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT course_Name, crclmId FROM tbl_course WHERE courseID = @CourseId",
                        new { CourseId = sourceCourseId },
                        transaction);

                    if (courseInfo == null)
                    {
                        continue;
                    }

                    int? curriculumId = (int?)(courseInfo.crclmId ?? 0);
                    int? newCrclmId = null;

                    // Handle curriculum if exists
                    if (curriculumId.HasValue && curriculumId > 0)
                    {
                        // Check if curriculum already exists in branch
                        var curriculumExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckCurriculumExistsInBranch,
                            new { SourceCrclmId = curriculumId, BranchId = branchId },
                            transaction);

                        if (curriculumExists > 0)
                        {
                            // Get existing curriculum ID in branch
                            newCrclmId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT crclmId FROM tbl_curriculum WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId) AND branchid = @BranchId",
                                new { SourceCrclmId = curriculumId, BranchId = branchId },
                                transaction);
                        }
                        else
                        {
                            // Import curriculum
                            var curriculumParams = new
                            {
                                BranchId = branchId,
                                InstituteId = instituteId,
                                SourceCrclmId = curriculumId
                            };

                            newCrclmId = await db.QuerySingleAsync<int>(
                                CurriculumQueries.ImportCurriculum,
                                curriculumParams,
                                transaction);
                        }
                    }

                    // Check if course already exists in branch
                    var courseExists = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckCourseExistsInBranch,
                        new { SourceCourseId = sourceCourseId, BranchId = branchId },
                        transaction);

                    if (courseExists > 0)
                    {
                        continue;
                    }

                    // Import course
                    var courseParams = new
                    {
                        InstituteId = instituteId,
                        BranchId = branchId,
                        NewCrclmId = newCrclmId,
                        SourceCourseId = sourceCourseId,
                        SourceCrclmId = curriculumId
                    };

                    int newCourseId = await db.QuerySingleAsync<int>(CurriculumQueries.ImportCourses, courseParams, transaction);

                    // Copy payment templates for course
                    var paymentTemplates = await db.QueryAsync<dynamic>(
                        CourseQueries.GetPaymentTemplatesForCourse,
                        new { CourseId = sourceCourseId },
                        transaction);

                    foreach (var template in paymentTemplates)
                    {
                        int templateId = Convert.ToInt32(template.paymenttemplateid);

                        int newTemplateId = await db.QuerySingleAsync<int>(
                            CourseQueries.CopyPaymentTemplate,
                            new
                            {
                                PaymentTemplateId = templateId,
                                BranchId = branchId
                            },
                            transaction);

                        await db.ExecuteAsync(
                            CourseQueries.CopyPaymentTemplateCourse,
                            new
                            {
                                PaymentTemplateId = newTemplateId,
                                CourseId = newCourseId
                            },
                            transaction);

                        await db.ExecuteAsync(
                            CourseQueries.CopyPaymentTemplateDetails,
                            new
                            {
                                PaymentTemplateId = newTemplateId,
                                SourcePaymentTemplateId = templateId
                            },
                            transaction);
                    }

                    // Get all subjects for the source course
                    var sourceSubjects = await db.QueryAsync<dynamic>(
                         "SELECT subID FROM tbl_subject WHERE courseID = @SourceCourseId AND StatusFlag = 1",
                         new { SourceCourseId = sourceCourseId },
                         transaction);

                    foreach (var sourceSubject in sourceSubjects)
                    {
                        int sourceSubjectId = (int)sourceSubject.subID;

                        // Check if subject already exists in branch
                        var subjectExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckSubjectExistsInBranch,
                            new { SourceSubjectId = sourceSubjectId, BranchId = branchId },
                            transaction);

                        int newSubjectId;
                        if (subjectExists > 0)
                        {
                            // Get existing subject ID in branch
                            newSubjectId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT subID FROM tbl_subject WHERE sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId) AND courseID = @NewCourseId",
                                new { SourceSubjectId = sourceSubjectId, NewCourseId = newCourseId },
                                transaction);
                        }
                        else
                        {
                            // Import subject
                            var subjectParams = new
                            {
                                NewCourseId = newCourseId,
                                SourceCourseId = sourceCourseId,
                                SourceSubjectId = sourceSubjectId
                            };

                            await db.ExecuteAsync(CurriculumQueries.ImportSubjects, subjectParams, transaction);

                            // Get the new subject ID
                            newSubjectId = await db.QuerySingleAsync<int>(
                                "SELECT LAST_INSERT_ID()",
                                transaction);

                            // Copy subject payment templates
                            var subjectTemplates = await db.QueryAsync<dynamic>(
                                CourseQueries.GetPaymentTemplatesForSubject,
                                new { SubId = sourceSubjectId },
                                transaction);

                            foreach (var subjectTemplate in subjectTemplates)
                            {
                                int templateId = Convert.ToInt32(subjectTemplate.paymenttemplateid);

                                int newTemplateId = await db.QuerySingleAsync<int>(
                                    CourseQueries.CopyPaymentTemplate,
                                    new
                                    {
                                        PaymentTemplateId = templateId,
                                        BranchId = branchId
                                    },
                                    transaction);

                                await db.ExecuteAsync(
                                    CourseQueries.CopyPaymentTemplateSubject,
                                    new
                                    {
                                        PaymentTemplateId = newTemplateId,
                                        SubId = newSubjectId
                                    },
                                    transaction);

                                await db.ExecuteAsync(
                                    CourseQueries.CopyPaymentTemplateDetails,
                                    new
                                    {
                                        PaymentTemplateId = newTemplateId,
                                        SourcePaymentTemplateId = templateId
                                    },
                                    transaction);
                            }
                        }

                        // Get all topics for the source subject
                        var sourceTopics = await db.QueryAsync<dynamic>(
                            "SELECT TopicID FROM subject_topics WHERE SubjectID = @SourceSubjectId AND IsActive = 1",
                            new { SourceSubjectId = sourceSubjectId },
                            transaction);


                        foreach (var sourceTopic in sourceTopics)
                        {
                            int sourceTopicId = (int)sourceTopic.TopicID;

                            // Check if topic already exists in branch
                            var topicExists = await db.QueryFirstOrDefaultAsync<int>(
                                CurriculumQueries.CheckTopicExistsInBranch,
                                new { SourceTopicId = sourceTopicId, BranchId = branchId },
                                transaction);

                            int newTopicId;
                            if (topicExists > 0)
                            {
                                // Get existing topic ID in branch
                                newTopicId = await db.QueryFirstOrDefaultAsync<int>(
                                    "SELECT TopicID FROM subject_topics WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId) AND SubjectID = @NewSubjectId",
                                    new { SourceTopicId = sourceTopicId, NewSubjectId = newSubjectId },
                                    transaction);
                            }
                            else
                            {
                                // Import topic
                                var topicParams = new
                                {
                                    NewSubjectId = newSubjectId,
                                    InstituteId = instituteId,
                                    BranchId = branchId,
                                    NewCourseId = newCourseId,
                                    SourceSubjectId = sourceSubjectId
                                };

                                await db.ExecuteAsync(CurriculumQueries.ImportTopics, topicParams, transaction);

                                // Get the new topic ID
                                newTopicId = await db.QuerySingleAsync<int>(
                                    "SELECT LAST_INSERT_ID()",
                                    transaction);
                            }

                            // Get all study materials for the source topic
                            //var sourceStudyMaterials = await db.QueryAsync<dynamic>(
                            //    "SELECT studymaterialId FROM tblstudymaterial WHERE courseId = @SourceCourseId AND subjectId = @SourceSubjectId AND topicId = @SourceTopicId",
                            //    new { SourceCourseId = sourceCourseId, SourceSubjectId = sourceSubjectId, SourceTopicId = sourceTopicId },
                            //    transaction);

                            //foreach (var sourceStudyMaterial in sourceStudyMaterials)
                            //{
                            //    int sourceStudyMaterialId = (int)sourceStudyMaterial.studymaterialId;

                            //    // Check if study material already exists in branch
                            //    var studyMaterialExists = await db.QueryFirstOrDefaultAsync<int>(
                            //        CurriculumQueries.CheckStudyMaterialExistsInBranch,
                            //        new { SourceStudyMaterialId = sourceStudyMaterialId, BranchId = branchId },
                            //        transaction);

                            //    if (studyMaterialExists == 0)
                            //    {
                            //        // Import study material
                            //        var studyMaterialParams = new
                            //        {
                            //            InstituteId = instituteId,
                            //            BranchId = branchId,
                            //            NewCourseId = newCourseId,
                            //            NewSubjectId = newSubjectId,
                            //            NewTopicId = newTopicId,
                            //            SourceCourseId = sourceCourseId,
                            //            SourceSubjectId = sourceSubjectId,
                            //            SourceTopicId = sourceTopicId,
                            //            CrclmId = newCrclmId,
                            //            AddedIP = "System",
                            //            AddedBy = 0
                            //        };

                            //        await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);
                            //    }
                            //}
                        }
                    }

                    importedCount++;
                }

                transaction.Commit();

                if (importedCount > 0)
                    return (true, $"Course{(importedCount > 1 ? "s" : "")} with subjects, topics, and study materials added successfully.");
                else if (importedCount == 0)
                    return (false, $"Course/Class with same name already exists in branch!");
                else
                    return (false, "Please select course/class.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error importing course: {ex.Message}");
            }
        }

        public async Task<InstallmentIntervalResponseDto> CreateInstallmentTemplateAsync(int templateType, int day, int maxInstallment, double courseFee, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Get IsCalculationRoundOff from config
            var isCalculationRoundOff = await db.QueryFirstOrDefaultAsync<int?>(
                CourseQueries.GetIsCalculationRoundOff,
                new { BranchId = branchId });

            int roundOff = isCalculationRoundOff ?? 0;

            var templates = new List<InstallmentTemplateDto>();
            double totalAmount = 0;

            if (roundOff == 0)
            {
                // Decimal calculation
                List<double> templateAmounts = new List<double>();
                double temp = 0;

                for (int i = 0; i < maxInstallment - 1; i++)
                {
                    double calculatedAmount = Math.Round((courseFee / maxInstallment), 2, MidpointRounding.AwayFromZero);
                    temp += calculatedAmount;
                    templateAmounts.Add(calculatedAmount);
                }

                templateAmounts.Add(Math.Round(courseFee - temp, 2, MidpointRounding.AwayFromZero));

                for (int i = 0; i < templateAmounts.Count; i++)
                {
                    templates.Add(new InstallmentTemplateDto
                    {
                        SrNo = i + 1,
                        DayOfMonth = templateType == 1 ? (i * day) : day,
                        Amount = templateAmounts[i]
                    });
                    totalAmount += templateAmounts[i];
                }
            }
            else
            {
                // Integer calculation
                List<int> templateAmounts = DistributeInteger((int)courseFee, maxInstallment);

                for (int i = 0; i < templateAmounts.Count; i++)
                {
                    templates.Add(new InstallmentTemplateDto
                    {
                        SrNo = i + 1,
                        DayOfMonth = templateType == 1 ? (i * day) : day,
                        Amount = templateAmounts[i]
                    });
                    totalAmount += templateAmounts[i];
                }
            }

            return new InstallmentIntervalResponseDto
            {
                Templates = templates,
                TotalAmount = totalAmount
            };
        }

        private List<int> DistributeInteger(int total, int parts)
        {
            List<int> result = new List<int>();
            int baseValue = total / parts;
            int remainder = total % parts;

            for (int i = 0; i < parts; i++)
            {
                result.Add(baseValue + (i < remainder ? 1 : 0));
            }

            return result;
        }

        public async Task<(bool Success, string Message)> ExportCourseAsync(List<int> courseIds, int instituteId, List<int> branchIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int totalExportedCount = 0;
                List<int> exportedCurriculumIds = new List<int>();
                List<string> successDetails = new List<string>();
                List<string> failureDetails = new List<string>();

                // Get branch names for all branch IDs
                var branchNames = new Dictionary<int, string>();
                foreach (int branchId in branchIds)
                {
                    var branchInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT branchname FROM branch WHERE branchid = @BranchId",
                        new { BranchId = branchId },
                        transaction);
                    if (branchInfo != null)
                    {
                        branchNames[branchId] = branchInfo.branchname;
                    }
                    else
                    {
                        branchNames[branchId] = $"Branch {branchId}";
                    }
                }

                foreach (int courseId in courseIds)
                {
                    // Get course name and curriculum ID
                    var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT course_Name, crclmId FROM tbl_course WHERE courseID = @CourseId",
                        new { CourseId = courseId },
                        transaction);

                    string courseName = courseInfo.course_Name;
                    int? curriculumId = (int?)(courseInfo.crclmId ?? 0);

                    if (courseInfo == null)
                    {
                        failureDetails.Add($"Course ID {courseName} not found");
                        continue;
                    }

                    foreach (int branchId in branchIds)
                    {
                        // Check if course already exists in branch
                        var courseExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckCourseExistsInBranch,
                            new { SourceCourseId = courseId, BranchId = branchId },
                            transaction);

                        if (courseExists > 0)
                        {
                            failureDetails.Add($"Course '{courseName}' already exists in branch '{branchNames[branchId]}'");
                            continue;
                        }

                        int? newCrclmId = null;

                        // If course has curriculum, handle curriculum export
                        if (curriculumId.HasValue && curriculumId > 0)
                        {
                            // Check if curriculum already exists in branch
                            var curriculumExists = await db.QueryFirstOrDefaultAsync<int>(
                                CurriculumQueries.CheckCurriculumExistsInBranch,
                                new { SourceCrclmId = curriculumId, BranchId = branchId },
                                transaction);

                            if (curriculumExists > 0)
                            {
                                // Get existing curriculum ID in branch
                                newCrclmId = await db.QueryFirstOrDefaultAsync<int>(
                                    "SELECT crclmId FROM tbl_curriculum WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId) AND branchid = @BranchId",
                                    new { SourceCrclmId = curriculumId, BranchId = branchId },
                                    transaction);
                            }
                            else
                            {
                                // Import curriculum (using CurriculumQueries)
                                var curriculumParams = new
                                {
                                    BranchId = branchId,
                                    InstituteId = instituteId,
                                    SourceCrclmId = curriculumId
                                };

                                newCrclmId = await db.QuerySingleAsync<int>(
                                    CurriculumQueries.ImportCurriculum,
                                    curriculumParams,
                                    transaction);

                                if (!exportedCurriculumIds.Contains(curriculumId.Value))
                                {
                                    exportedCurriculumIds.Add(curriculumId.Value);
                                }
                            }
                        }

                        // Import course
                        var courseParams = new
                        {
                            InstituteId = instituteId,
                            BranchId = branchId,
                            NewCrclmId = newCrclmId,
                            SourceCourseId = courseId
                        };

                        int newCourseId = await db.QuerySingleAsync<int>(
                            CurriculumQueries.ImportSingleCourse,
                            courseParams,
                            transaction);

                        // Copy payment templates for the course
                        var coursePaymentTemplates = await db.QueryAsync<dynamic>(
                            CourseQueries.GetPaymentTemplatesForCourse,
                            new { CourseId = courseId },
                            transaction);

                        foreach (var template in coursePaymentTemplates)
                        {
                            int templateId = Convert.ToInt32(template.paymenttemplateid);

                            int newTemplateId = await db.QuerySingleAsync<int>(
                                CourseQueries.CopyPaymentTemplate,
                                new
                                {
                                    PaymentTemplateId = templateId,
                                    BranchId = branchId
                                },
                                transaction);

                            await db.ExecuteAsync(
                                CourseQueries.CopyPaymentTemplateCourse,
                                new
                                {
                                    PaymentTemplateId = newTemplateId,
                                    CourseId = newCourseId
                                },
                                transaction);

                            await db.ExecuteAsync(
                                CourseQueries.CopyPaymentTemplateDetails,
                                new
                                {
                                    PaymentTemplateId = newTemplateId,
                                    SourcePaymentTemplateId = templateId
                                },
                                transaction);
                        }

                        // Get all subjects for the source course
                        var sourceSubjects = await db.QueryAsync<dynamic>(
                              "SELECT subID FROM tbl_subject WHERE courseID = @SourceCourseId AND StatusFlag = 1",
                              new { SourceCourseId = courseId },
                              transaction);

                        foreach (var sourceSubject in sourceSubjects)
                        {
                            int sourceSubjectId = (int)sourceSubject.subID;

                            // Check if subject already exists in branch
                            var subjectExists = await db.QueryFirstOrDefaultAsync<int>(
                                CurriculumQueries.CheckSubjectExistsInBranch,
                                new { SourceSubjectId = sourceSubjectId, BranchId = branchId },
                                transaction);

                            int newSubjectId;
                            if (subjectExists > 0)
                            {
                                // Get existing subject ID in branch
                                newSubjectId = await db.QueryFirstOrDefaultAsync<int>(
                                    "SELECT subID FROM tbl_subject WHERE sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId) AND courseID = @NewCourseId",
                                    new { SourceSubjectId = sourceSubjectId, NewCourseId = newCourseId },
                                    transaction);
                            }
                            else
                            {
                                // Import subject
                                var subjectParams = new
                                {
                                    NewCourseId = newCourseId,
                                    SourceCourseId = courseId,
                                    SourceSubjectId = sourceSubjectId
                                };

                                await db.ExecuteAsync(
                                    CurriculumQueries.ImportSubjects,
                                    subjectParams,
                                    transaction);

                                // Get the new subject ID
                                newSubjectId = await db.QuerySingleAsync<int>(
                                    "SELECT LAST_INSERT_ID()",
                                    transaction);

                                // Copy subject payment templates
                                var subjectTemplates = await db.QueryAsync<dynamic>(
                                    CourseQueries.GetPaymentTemplatesForSubject,
                                    new { SubId = sourceSubjectId },
                                    transaction);

                                foreach (var subjectTemplate in subjectTemplates)
                                {
                                    int templateId = Convert.ToInt32(subjectTemplate.paymenttemplateid);

                                    int newTemplateId = await db.QuerySingleAsync<int>(
                                        CourseQueries.CopyPaymentTemplate,
                                        new
                                        {
                                            PaymentTemplateId = templateId,
                                            BranchId = branchId
                                        },
                                        transaction);

                                    await db.ExecuteAsync(
                                        CourseQueries.CopyPaymentTemplateSubject,
                                        new
                                        {
                                            PaymentTemplateId = newTemplateId,
                                            SubId = newSubjectId
                                        },
                                        transaction);

                                    await db.ExecuteAsync(
                                        CourseQueries.CopyPaymentTemplateDetails,
                                        new
                                        {
                                            PaymentTemplateId = newTemplateId,
                                            SourcePaymentTemplateId = templateId
                                        },
                                        transaction);
                                }
                            }

                            // Get all topics for the source subject
                            var sourceTopics = await db.QueryAsync<dynamic>(
                                  "SELECT TopicID FROM subject_topics WHERE SubjectID = @SourceSubjectId AND IsActive = 1",
                                  new { SourceSubjectId = sourceSubjectId },
                                  transaction);

                            foreach (var sourceTopic in sourceTopics)
                            {
                                int sourceTopicId = (int)sourceTopic.TopicID;

                                // Check if topic already exists in branch
                                var topicExists = await db.QueryFirstOrDefaultAsync<int>(
                                    CurriculumQueries.CheckTopicExistsInBranch,
                                    new { SourceTopicId = sourceTopicId, BranchId = branchId },
                                    transaction);

                                int newTopicId;
                                if (topicExists > 0)
                                {
                                    // Get existing topic ID in branch
                                    newTopicId = await db.QueryFirstOrDefaultAsync<int>(
                                        "SELECT TopicID FROM subject_topics WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId) AND SubjectID = @NewSubjectId",
                                        new { SourceTopicId = sourceTopicId, NewSubjectId = newSubjectId },
                                        transaction);
                                }
                                else
                                {
                                    // Import topic
                                    var topicParams = new
                                    {
                                        NewSubjectId = newSubjectId,
                                        InstituteId = instituteId,
                                        BranchId = branchId,
                                        NewCourseId = newCourseId,
                                        SourceSubjectId = sourceSubjectId
                                    };

                                    await db.ExecuteAsync(
                                        CurriculumQueries.ImportTopics,
                                        topicParams,
                                        transaction);

                                    // Get the new topic ID
                                    newTopicId = await db.QuerySingleAsync<int>(
                                        "SELECT LAST_INSERT_ID()",
                                        transaction);
                                }

                                // Get all study materials for the source topic
                                //var sourceStudyMaterials = await db.QueryAsync<dynamic>(
                                //    "SELECT studymaterialId FROM tblstudymaterial WHERE courseId = @SourceCourseId AND subjectId = @SourceSubjectId AND topicId = @SourceTopicId",
                                //    new { SourceCourseId = courseId, SourceSubjectId = sourceSubjectId, SourceTopicId = sourceTopicId },
                                //    transaction);

                                //foreach (var sourceStudyMaterial in sourceStudyMaterials)
                                //{
                                //    int sourceStudyMaterialId = (int)sourceStudyMaterial.studymaterialId;

                                //    // Check if study material already exists in branch
                                //    var studyMaterialExists = await db.QueryFirstOrDefaultAsync<int>(
                                //        CurriculumQueries.CheckStudyMaterialExistsInBranch,
                                //        new { SourceStudyMaterialId = sourceStudyMaterialId, BranchId = branchId },
                                //        transaction);

                                //    if (studyMaterialExists == 0)
                                //    {
                                //        // Import study material
                                //        var studyMaterialParams = new
                                //        {
                                //            InstituteId = instituteId,
                                //            BranchId = branchId,
                                //            NewCourseId = newCourseId,
                                //            NewSubjectId = newSubjectId,
                                //            NewTopicId = newTopicId,
                                //            SourceCourseId = courseId,
                                //            SourceSubjectId = sourceSubjectId,
                                //            SourceTopicId = sourceTopicId,
                                //            CrclmId = newCrclmId,
                                //            AddedIP = "System",
                                //            AddedBy = 0
                                //        };

                                //        await db.ExecuteAsync(
                                //            CurriculumQueries.ImportStudyMaterials,
                                //            studyMaterialParams,
                                //            transaction);
                                //    }
                                //}
                            }
                        }

                        totalExportedCount++;
                        successDetails.Add($"Course '{courseName}' exported to branch '{branchNames[branchId]}' successfully");
                    }
                }

                transaction.Commit();

                // Build detailed message
                string message = "";
                if (totalExportedCount > 0)
                {
                    message += $"Export Summary: {totalExportedCount} course export(s) successful\n";
                    if (successDetails.Count > 0)
                    {
                        message += "\nSuccessful Exports:\n";
                        foreach (var detail in successDetails)
                        {
                            message += $"- {detail}\n";
                        }
                    }
                    if (exportedCurriculumIds.Count > 0)
                    {
                        message += $"\nNote: {exportedCurriculumIds.Count} curriculum{(exportedCurriculumIds.Count > 1 ? "s" : "")} also exported due to course-curriculum relationship\n";
                    }
                }

                if (failureDetails.Count > 0)
                {
                    message += "\nFailed Exports:\n";
                    foreach (var detail in failureDetails)
                    {
                        message += $"- {detail}\n";
                    }
                }

                if (totalExportedCount > 0)
                {
                    return (true, message.Trim());
                }
                else
                {
                    return (false, message.Trim() != "" ? message.Trim() : "No courses exported. Courses may already exist in target branches.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error exporting course: {ex.Message}");
            }
        }
    }
}
