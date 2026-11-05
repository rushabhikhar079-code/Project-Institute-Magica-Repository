using Dapper;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class SubjectRepository : ISubjectRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public SubjectRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<PagedResponse<SubjectListDto>> GetSubjectsAsync(int instituteId, SubjectSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Build SQL condition dynamically
            string sqlCondition = string.Empty;

            if (!string.IsNullOrEmpty(search.SubjectName))
                sqlCondition += " AND s.sub_Name LIKE '" + search.SubjectName.Replace("'", "''") + "%'";

            if (search.CrclmId.HasValue && search.CrclmId > 0)
                sqlCondition += " AND c.CrclmId = " + search.CrclmId;

            if (search.CourseId.HasValue && search.CourseId > 0)
                sqlCondition += " AND c.courseID = " + search.CourseId;

            if (search.Status.HasValue && search.Status != 2)
                sqlCondition += " AND s.StatusFlag = " + search.Status;
            else if (search.Status.HasValue && search.Status == 2)
                sqlCondition += " AND s.StatusFlag <> " + search.Status;

            #region Sorting
            string direction =
    search.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
        ? "DESC"
        : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "SubjectName":
                    orderByColumn = "s.sub_Name";
                    break;

                default:
                    orderByColumn = "s.subID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, s.subID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY c.course_name ASC, s.sub_Name ASC, s.subID ASC";
            }
            #endregion Sorting
            string query = string.Format(SubjectQueries.GetSubjects, sqlCondition, orderByClause);
            string countQuery = string.Format(SubjectQueries.GetSubjectsCount, sqlCondition);

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
            var subjects = await db.QueryAsync<SubjectListDto>(query, parameters);
            var subjectList = subjects.ToList();

            // If institute level, count branch references
            if (search.BranchId == 0)
            {
                foreach (var subject in subjectList)
                {
                    var branchCount = await db.QueryFirstOrDefaultAsync<int>(
                        SubjectQueries.CountBranchReferences,
                        new { RefSubId = subject.SubId });
                    subject.BranchReferenceCount = branchCount;
                }
            }

            return new PagedResponse<SubjectListDto>
            {
                Items = subjectList,
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }


        public async Task<SubjectSubmitDto?> GetSubjectByIdAsync(int subjectId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var subject = await db.QueryFirstOrDefaultAsync<SubjectSubmitDto>(
                SubjectQueries.GetSubjectById,
                new { SubjectId = subjectId });

            if (subject != null)
            {
                // Get payment template details
                var templateDetails = await db.QueryAsync<PaymentTemplateDetailDto>(
                    SubjectQueries.GetPaymentTemplateDetailsBySubjectId,
                    new { SubjectId = subjectId });

                subject.TemplateDetails = templateDetails
                    .Select(x => $"{x.NoOfDay}#{x.Amount:0.##}")
                    .ToList();

                // Check if adhoc subject has students assigned
                if (subject.AdhocSub == 1)
                {
                    var studentCount = await db.QueryFirstOrDefaultAsync<int>(
                        SubjectQueries.CheckAdhocSubjectHasStudents,
                        new { SubjectId = subjectId });

                    subject.HasStudentsAssigned = studentCount > 0;
                }
            }

            return subject;
        }
        public class PaymentTemplateDetailDto
        {
            public int NoOfDay { get; set; }
            public decimal Amount { get; set; }
        }
        public async Task<SubjectPaymentTemplateDto?> GetPaymentTemplateAsync(int subjectId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var template = await db.QueryFirstOrDefaultAsync<SubjectPaymentTemplateDto>(
                SubjectQueries.GetTemplateDetailsSubject,
                new { SubjectId = subjectId });

            if (template != null)
            {
                var templateDetails = await db.QueryAsync<SubjectPaymentTemplateDetailDto>(
                    SubjectQueries.GetTemplateInstallments,
                    new { PaymentTemplateId = template.PaymentTemplateId });

                template.TemplateDetails = templateDetails.ToList();
            }

            return template;
        }

        public async Task<(bool Success, string Message)> AddSubjectAsync(SubjectSubmitDto request, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Validation for monthly fees type
                if (request.FeesType == "Monthly")
                {
                    if (request.SubFeesType == 1 && request.NoofMonths <= 0)
                        return (false, "Please enter no. of months for fixed duration");
                    if (request.SubFeesType == 2 && request.NoofMonths <= 0)
                        return (false, "Please enter no. of months for ongoing");
                    if (request.SubFeesType == 3 && string.IsNullOrEmpty(request.CourseEndDate))
                        return (false, "Please select course end date");
                }

                // Payment template validation if creating template
                if (request.IsCreateTemplate)
                {
                    if (request.TemplateDetails.Count != request.MaxInstallment)
                        return (false, "No. of installments should match with created template installment");

                    if (request.TemplateType == 1 && request.NoofDays <= 0)
                        return (false, "Please enter interval days");

                    if (request.TemplateType == 2 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a day of start between 1-28");

                    if (request.TemplateType == 3 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a day of start between 1-28");

                    if (request.TemplateDetails.Count <= 0)
                        return (false, "Please create template installments");

                    double templateTotal = 0;
                    foreach (var detail in request.TemplateDetails)
                    {
                        var parts = detail.Split('#');
                        if (parts.Length < 2 || !double.TryParse(parts[1], out double amount))
                            return (false, "Please enter template installment amount");
                        templateTotal += amount;
                    }

                    if (request.Fees != Math.Round(templateTotal))
                        return (false, "Subject fees amount must match with sum of template installment amount");

                    if (request.MaxInstallment != request.TemplateDetails.Count)
                        return (false, "Maximum Installment must match with the number of installment rows created");
                }

                // Check duplicate subject
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    SubjectQueries.CheckDuplicateSubject,
                    new
                    {
                        SubName = request.SubName,
                        CourseId = request.CourseId,
                        InstituteId = instituteId,
                        BranchId = request.BranchId,
                        SubjectId = 0
                    },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Subject Name already exists!");

                // Check if course is adhoc and set adhoc subject accordingly
                if (request.AdhocSub == 1)
                {
                    request.AllowInstallment = true;
                    request.MaxInstallment = 1;
                }
                else
                {
                    var adhocCourse = await db.QueryFirstOrDefaultAsync<int?>(
                        SubjectQueries.CheckAdhocCourse,
                        new { CourseId = request.CourseId },
                        transaction);

                    if (adhocCourse == 1)
                    {
                        request.AdhocSub = 1;
                        request.AllowInstallment = true;
                        request.MaxInstallment = 1;
                    }
                }

                // Set course end date if not monthly
                if (request.FeesType != "M")
                {
                    request.CourseEndDate = DateTime.MinValue.ToString("yyyy-MM-dd");
                }

                var parameters = new
                {
                    CourseId = request.CourseId,
                    SubName = request.SubName.Replace("'", "''"),
                    Description = request.Description.Replace("'", "''"),
                    Duration = request.Duration,
                    DurationType = request.DurationType,
                    Fees = request.Fees,
                    Taxable = request.Taxable ? 1 : 0,
                    IncludingTax = request.IncludingTax ? 1 : 0,
                    AllowInstallment = request.AllowInstallment ? 1 : 0,
                    MaxInstallment = request.MaxInstallment,
                    AllowProrated = request.AllowProrated ? 1 : 0,
                    FeesType = request.FeesType,
                    Status = 1,
                    SubFeesType = request.SubFeesType,
                    NoofMonths = request.NoofMonths,
                    CourseEndDate = string.IsNullOrWhiteSpace(request.CourseEndDate) ? null : request.CourseEndDate,
                    InstituteId = instituteId,
                    BranchId = request.BranchId,
                    AdhocSub = request.AdhocSub
                };

                var subjectId = await db.QuerySingleAsync<int>(
                    SubjectQueries.InsertSubject,
                    parameters,
                    transaction);

                // Handle course-level fee redistribution
                await RedistributeCourseFeesAsync(request.CourseId, db, transaction);

                // Handle payment template if creating one
                if (request.IsCreateTemplate)
                {
                    await CreatePaymentTemplateForSubjectAsync(subjectId, request, instituteId, request.BranchId, db, transaction);
                }

                transaction.Commit();
                return (true, "Subject saved successfully");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error adding subject: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> UpdateSubjectAsync(SubjectSubmitDto request, int SubjectId, int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Validation for monthly fees type
                if (request.FeesType == "Monthly")
                {
                    if (request.SubFeesType == 1 && request.NoofMonths <= 0)
                        return (false, "Please enter no. of months for fixed duration");
                    if (request.SubFeesType == 2 && request.NoofMonths <= 0)
                        return (false, "Please enter no. of months for ongoing");
                    if (request.SubFeesType == 3 && string.IsNullOrEmpty(request.CourseEndDate))
                        return (false, "Please select course end date");
                }

                // Payment template validation if creating template
                if (request.IsCreateTemplate)
                {
                    if (request.TemplateDetails.Count != request.MaxInstallment)
                        return (false, "No. of installments should match with created template installment");

                    if (request.TemplateType == 1 && request.NoofDays <= 0)
                        return (false, "Please enter interval days");

                    if (request.TemplateType == 2 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a day of start between 1-28");

                    if (request.TemplateType == 3 && (request.NoofDays < 1 || request.NoofDays > 28))
                        return (false, "Please enter a day of start between 1-28");

                    if (request.TemplateDetails.Count <= 0)
                        return (false, "Please create template installments");

                    double templateTotal = 0;
                    foreach (var detail in request.TemplateDetails)
                    {
                        var parts = detail.Split('#');
                        if (parts.Length < 2 || !double.TryParse(parts[1], out double amount))
                            return (false, "Please enter template installment amount");
                        templateTotal += amount;
                    }

                    if (request.Fees != Math.Round(templateTotal))
                        return (false, "Subject fees amount must match with sum of template installment amount");

                    if (request.MaxInstallment != request.TemplateDetails.Count)
                        return (false, "Maximum Installment must match with the number of installment rows created");
                }

                // Check duplicate subject
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    SubjectQueries.CheckDuplicateSubject,
                    new
                    {
                        SubName = request.SubName,
                        CourseId = request.CourseId,
                        InstituteId = instituteId,
                        BranchId = request.BranchId,
                        SubjectId = SubjectId
                    },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Subject Name already exists!");

                // Check if course is adhoc and set adhoc subject accordingly
                if (request.AdhocSub == 1)
                {
                    request.AllowInstallment = true;
                    request.MaxInstallment = 1;
                }
                else
                {
                    var adhocCourse = await db.QueryFirstOrDefaultAsync<int?>(
                        SubjectQueries.CheckAdhocCourse,
                        new { CourseId = request.CourseId },
                        transaction);

                    if (adhocCourse == 1)
                    {
                        request.AdhocSub = 1;
                        request.AllowInstallment = true;
                        request.MaxInstallment = 1;
                    }
                }

                // Set course end date if not monthly
                //if (request.FeesType != "M")
                //{
                //    request.CourseEndDate = DateTime.MinValue.ToString("yyyy-MM-dd");
                //}
                // Set course end date if not monthly
                if (request.FeesType != "Monthly")
                {
                    request.CourseEndDate = null;
                }

                // Add audit logs before update
                await AddAuditLogsForSubjectUpdateAsync(SubjectId, userId, ipAddress, db, transaction);

                // Update subject
                var parameters = new
                {
                    SubjectId = SubjectId,
                    SubName = request.SubName.Replace("'", "''"),
                    CourseId = request.CourseId, // <-- ADD THIS

                    Description = request.Description.Replace("'", "''"),
                    Duration = request.Duration,
                    DurationType = request.DurationType,
                    Fees = request.Fees,
                    Taxable = request.Taxable ? 1 : 0,
                    IncludingTax = request.IncludingTax ? 1 : 0,
                    AllowInstallment = request.AllowInstallment ? 1 : 0,
                    MaxInstallment = request.MaxInstallment,
                    AllowProrated = request.AllowProrated ? 1 : 0,
                    FeesType = request.FeesType,
                    Status = request.Status,
                    SubFeesType = request.SubFeesType,
                    NoofMonths = request.NoofMonths,
                    CourseEndDate = string.IsNullOrWhiteSpace(request.CourseEndDate) ? null : request.CourseEndDate,
                    AdhocSub = request.AdhocSub
                };
                Console.WriteLine($"SubjectId: {SubjectId}");
                Console.WriteLine($"FeesType: {request.FeesType}");
                Console.WriteLine($"SubFeesType: {request.SubFeesType}");
                Console.WriteLine($"NoofMonths: {request.NoofMonths}");
                Console.WriteLine($"CourseEndDate: '{request.CourseEndDate}'");
                //await db.ExecuteAsync(SubjectQueries.UpdateSubject, parameters, transaction);
                var affectedRows = await db.ExecuteAsync(
    SubjectQueries.UpdateSubject,
    parameters,
    transaction);


                Console.WriteLine($"SubjectId: {SubjectId}");
                Console.WriteLine($"Request Fees: {request.Fees}");
                Console.WriteLine($"Request CourseId: {request.CourseId}");
                Console.WriteLine($"Affected Rows: {affectedRows}");

                // Handle course-level fee redistribution
                await RedistributeCourseFeesAsync(request.CourseId, db, transaction);

                // Handle payment template if creating one
                if (request.IsCreateTemplate)
                {
                    // Delete existing template if any
                    var existingTemplate = await db.QueryFirstOrDefaultAsync<dynamic>(
                        SubjectQueries.GetPaymentTemplateForSubject,
                        new { SubjectId = SubjectId },
                        transaction);

                    if (existingTemplate != null)
                    {
                        int templateId = Convert.ToInt32(existingTemplate.PaymentTemplateId);
                        await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateDetails,
                            new { PaymentTemplateId = templateId },
                            transaction);
                        await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateCourses,
                            new { PaymentTemplateId = templateId },
                            transaction);
                        await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateSubjectLinksById,
                            new { PaymentTemplateId = templateId },
                            transaction);
                        await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateById,
                            new { PaymentTemplateId = templateId },
                            transaction);
                    }

                    await CreatePaymentTemplateForSubjectAsync(SubjectId, request, instituteId, request.BranchId, db, transaction);
                }

                // Deactivate online tests if status is 0
                if (request.Status == 0)
                {
                    await db.ExecuteAsync(SubjectQueries.DeactivateOnlineTestsForSubject,
                        new { SubjectId = SubjectId },
                        transaction);
                }

                // Update reference subjects if institute level and update all branches
                if (request.BranchId == 0 && request.UpdateAllBranches)
                {
                    await UpdateReferenceSubjectsAsync(request, SubjectId, instituteId, db, transaction);
                }

                transaction.Commit();
                return (true, "Subject updated successfully");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error updating subject: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> DeleteSubjectAsync(int subjectId, bool deleteStatus, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check if subject has related records
                var hasRecords = await db.QueryFirstOrDefaultAsync<int>(
                    SubjectQueries.CheckSubjectRecords,
                    new { SubjectId = subjectId },
                    transaction);

                if (deleteStatus == false)
                {
                    // Soft delete - deactivate online tests and set status to 0
                    await db.ExecuteAsync(SubjectQueries.DeactivateOnlineTestsForSubject,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.SoftDeleteSubject,
                        new { SubjectId = subjectId },
                        transaction);

                    transaction.Commit();
                    return (true, "Subject made inactive successfully");
                }
                else if (deleteStatus == true)
                {
                    // Hard delete
                    if (hasRecords > 0)
                    {
                        // If has records, update course fees first if course level
                        var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                            SubjectQueries.GetCourseInfoSubwise,
                            new { SubjectId = subjectId },
                            transaction);

                        if (courseInfo != null && courseInfo.IscourseLvl == true)
                        {
                            string subIds = courseInfo.subIds?.ToString() ?? "";
                            double courseFees = courseInfo.courseFees;
                            int subCount = (int)courseInfo.subcount - 1;
                            bool subTaxable = courseInfo.cTaxable == 1;
                            bool subIncludTax = courseInfo.cIncluding_Tax == 1;
                            bool subInstAllow = courseInfo.cAllow_Installment == 1;
                            int subMaxInst = courseInfo.cMax_Installment;

                            if (subCount > 0 && !string.IsNullOrEmpty(subIds))
                            {
                                double fees = Math.Round(courseFees / subCount);
                                var subIdArray = subIds.Split(',');

                                for (int i = 0; i < subIdArray.Length; i++)
                                {
                                    if (int.TryParse(subIdArray[i], out int subId) && subId != subjectId)
                                    {
                                        double fee = fees;
                                        if (i == subIdArray.Length - 1)
                                        {
                                            double remfees = Math.Round(courseFees - (fees * subCount));
                                            fee = fees + remfees;
                                        }

                                        await db.ExecuteAsync(SubjectQueries.UpdateSubFeeBySubId,
                                            new
                                            {
                                                SubId = subId,
                                                Fees = fee,
                                                Taxable = subTaxable ? 1 : 0,
                                                IncludingTax = subIncludTax ? 1 : 0,
                                                AllowInstallment = subInstAllow ? 1 : 0,
                                                MaxInstallment = subMaxInst,
                                                Status = 1
                                            },
                                            transaction);
                                    }
                                }
                            }
                        }
                    }

                    // Add audit logs before delete
                    await db.ExecuteAsync(
                        SubjectQueries.InsertSubjectAuditDelete,
                        new
                        {
                            SubjectId = subjectId,
                            UserId = userId,
                            DeleteDate = DateTime.Now,
                            IpAddress = ipAddress
                        },
                        transaction);

                    // Perform hard delete operations
                    await db.ExecuteAsync(SubjectQueries.DeleteStudentSubjectsNoPayment,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.DeleteTestSubjects,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.DeleteTrainerSubjects,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.DeleteBatchSubjects,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateDetailsForSubject,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplatesForSubject,
                        new { SubjectId = subjectId },
                        transaction);

                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateSubjectLinks,
                        new { SubjectId = subjectId },
                        transaction);

                    // Get course ID before deleting subject
                    var subjectInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT courseID FROM tbl_subject WHERE subID = @SubjectId",
                        new { SubjectId = subjectId },
                        transaction);

                    int courseId = (int)(subjectInfo?.courseID ?? 0);

                    // Delete the subject
                    await db.ExecuteAsync(SubjectQueries.HardDeleteSubject,
                        new { SubjectId = subjectId },
                        transaction);

                    // After deletion, redistribute fees if course level
                    if (courseId > 0)
                    {
                        var courseSubjects = await db.QueryAsync<dynamic>(
                            SubjectQueries.GetCourseSubjectsInfo,
                            new { CourseId = courseId },
                            transaction);

                        var subjectList = courseSubjects.ToList();
                        int activeCount = 0;
                        string activeSubjects = "";
                        string inactiveSubjects = "";

                        foreach (var sub in subjectList)
                        {
                            if (sub.IscourseLvl == true)
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

                        // Set fees to 0 for inactive subjects
                        if (!string.IsNullOrEmpty(inactiveSubjects))
                        {
                            var inactiveParts = inactiveSubjects.TrimEnd(';').Split(';');
                            foreach (var part in inactiveParts)
                            {
                                var subParts = part.Split('#');
                                if (subParts.Length >= 2 && int.TryParse(subParts[1], out int subId))
                                {
                                    await db.ExecuteAsync(SubjectQueries.UpdateSubjectFeeToZero,
                                        new { SubId = subId },
                                        transaction);
                                }
                            }
                        }

                        // Redistribute fees among active subjects
                        if (activeCount > 0 && subjectList.Count > 0)
                        {
                            double courseFees = subjectList.First().courseFees;
                            double newFee = Math.Round(courseFees / activeCount);

                            var activeParts = activeSubjects.TrimEnd(';').Split(';');
                            foreach (var part in activeParts)
                            {
                                var subParts = part.Split('#');
                                if (subParts.Length >= 2 && int.TryParse(subParts[1], out int subId))
                                {
                                    await db.ExecuteAsync(SubjectQueries.UpdateSubjectFee,
                                        new { SubId = subId, Fees = newFee },
                                        transaction);
                                }
                            }
                        }
                    }

                    transaction.Commit();
                    return (true, "Subject deleted successfully");
                }
                else
                {
                    return (false, "Invalid delete status");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error deleting subject: {ex.Message}");
            }
        }

        public async Task<SubjectInstallmentIntervalResponseDto> CreateInstallmentTemplateAsync(int templateType, int day, int maxInstallment, double courseFee, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Get IsCalculationRoundOff from config
            var isCalculationRoundOff = await db.QueryFirstOrDefaultAsync<int?>(
                "SELECT IsCalculationRoundOff FROM config WHERE Branch_Id = @BranchId",
                new { BranchId = branchId });

            int roundOff = isCalculationRoundOff ?? 0;

            var templates = new List<SubjectInstallmentTemplateDto>();
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
                    templates.Add(new SubjectInstallmentTemplateDto
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
                    templates.Add(new SubjectInstallmentTemplateDto
                    {
                        SrNo = i + 1,
                        DayOfMonth = templateType == 1 ? (i * day) : day,
                        Amount = templateAmounts[i]
                    });
                    totalAmount += templateAmounts[i];
                }
            }

            return new SubjectInstallmentIntervalResponseDto
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

        private async Task RedistributeCourseFeesAsync(int courseId, IDbConnection db, IDbTransaction transaction)
        {
            var courseSubjects = await db.QueryAsync<dynamic>(
                SubjectQueries.GetCourseSubjectsForFeeRedistribution,
                new { CourseId = courseId },
                transaction);

            var subjectList = courseSubjects.ToList();
            if (subjectList.Count == 0) return;

            int activeCount = 0;
            string activeSubjects = "";
            string inactiveSubjects = "";

            foreach (var sub in subjectList)
            {
                if (sub.IscourseLvl == true)
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

            // Set fees to 0 for inactive subjects
            if (!string.IsNullOrEmpty(inactiveSubjects))
            {
                var inactiveParts = inactiveSubjects.TrimEnd(';').Split(';');
                foreach (var part in inactiveParts)
                {
                    var subParts = part.Split('#');
                    if (subParts.Length >= 2 && int.TryParse(subParts[1], out int subId))
                    {
                        await db.ExecuteAsync(SubjectQueries.UpdateSubjectFeeToZero,
                            new { SubId = subId },
                            transaction);
                    }
                }
            }

            // Redistribute fees among active subjects
            if (activeCount > 0)
            {
                double courseFees = subjectList.First().courseFees;
                double newFee = Math.Round(courseFees / activeCount, 2);
                double totalDistributed = 0;

                var activeParts = activeSubjects.TrimEnd(';').Split(';');
                int lastSubId = 0;

                for (int i = 0; i < activeParts.Length; i++)
                {
                    var subParts = activeParts[i].Split('#');
                    if (subParts.Length >= 2 && int.TryParse(subParts[1], out int subId))
                    {
                        lastSubId = subId;
                        if (i < activeParts.Length - 1)
                        {
                            totalDistributed += newFee;
                            await db.ExecuteAsync(SubjectQueries.UpdateSubjectFee,
                                new { SubId = subId, Fees = newFee },
                                transaction);
                        }
                    }
                }

                // Adjust last subject fee to match total course fees
                if (lastSubId > 0)
                {
                    double remainingFee = Math.Round(courseFees - totalDistributed, 2);
                    await db.ExecuteAsync(SubjectQueries.UpdateSubjectFee,
                        new { SubId = lastSubId, Fees = remainingFee },
                        transaction);
                }
            }
        }

        private async Task CreatePaymentTemplateForSubjectAsync(int subjectId, SubjectSubmitDto request, int instituteId, int branchId, IDbConnection db, IDbTransaction transaction)
        {
            // Create payment template
            int templateId = await db.QuerySingleAsync<int>(
                SubjectQueries.InsertPaymentTemplate,
                new
                {
                    TemplateType = request.TemplateType,
                    NoofDays = request.NoofDays,
                    TemplateStatus = request.TemplateStatus ? 1 : 0,
                    BranchId = branchId,
                    InstituteId = instituteId
                },
                transaction);

            // Link template to subject
            await db.ExecuteAsync(
                SubjectQueries.LinkPaymentTemplateToSubject,
                new { PaymentTemplateId = templateId, SubjectId = subjectId },
                transaction);

            // Add template details
            foreach (var detail in request.TemplateDetails)
            {
                var parts = detail.Split('#');
                if (parts.Length >= 2 && int.TryParse(parts[0], out int noOfDay) && double.TryParse(parts[1], out double amount))
                {
                    await db.ExecuteAsync(
                        SubjectQueries.InsertPaymentTemplateDetails,
                        new
                        {
                            PaymentTemplateId = templateId,
                            NoOfDay = noOfDay,
                            Amount = amount
                        },
                        transaction);
                }
            }
        }

        private async Task UpdateReferenceSubjectsAsync(SubjectSubmitDto request, int SubjectId, int instituteId, IDbConnection db, IDbTransaction transaction)
        {
            // Update reference subjects
            await db.ExecuteAsync(SubjectQueries.UpdateReferenceSubject,
                new
                {
                    SubName = request.SubName.Replace("'", "''"),
                    Description = request.Description.Replace("'", "''"),
                    Duration = request.Duration,
                    DurationType = request.DurationType,
                    Fees = request.Fees,
                    Taxable = request.Taxable ? 1 : 0,
                    IncludingTax = request.IncludingTax ? 1 : 0,
                    AllowInstallment = request.AllowInstallment ? 1 : 0,
                    MaxInstallment = request.MaxInstallment,
                    AllowProrated = request.AllowProrated ? 1 : 0,
                    FeesType = request.FeesType,
                    Status = request.Status,
                    AdhocSub = request.AdhocSub,
                    SubjectId = SubjectId
                },
                transaction);

            // Handle fee redistribution for course-level subjects
            await RedistributeCourseFeesAsync(request.CourseId, db, transaction);

            // Get reference subjects with branch info
            var referenceSubjects = await db.QueryAsync<dynamic>(
                SubjectQueries.GetReferenceSubjectsWithBranch,
                new { SubjectId = SubjectId },
                transaction);

            // Get payment template for the main subject
            var mainTemplate = await db.QueryFirstOrDefaultAsync<dynamic>(
                SubjectQueries.GetPaymentTemplateForSubject,
                new { SubjectId = SubjectId },
                transaction);

            // Update payment templates for reference subjects
            foreach (var refSub in referenceSubjects)
            {
                int refSubId = refSub.subid;
                int refBranchId = refSub.BranchID;
                int refInstituteId = refSub.InstituteID;

                // Delete existing template for reference subject
                var existingRefTemplate = await db.QueryFirstOrDefaultAsync<dynamic>(
                    SubjectQueries.GetPaymentTemplateForSubject,
                    new { SubjectId = refSubId },
                    transaction);

                if (existingRefTemplate != null)
                {
                    int templateId = existingRefTemplate.PaymentTemplateId;
                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateDetails,
                        new { PaymentTemplateId = templateId },
                        transaction);
                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateCourses,
                        new { PaymentTemplateId = templateId },
                        transaction);
                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateSubjectLinksById,
                        new { PaymentTemplateId = templateId },
                        transaction);
                    await db.ExecuteAsync(SubjectQueries.DeletePaymentTemplateById,
                        new { PaymentTemplateId = templateId },
                        transaction);
                }

                // Create new template for reference subject if main subject has template
                if (mainTemplate != null)
                {
                    int newTemplateId = await db.QuerySingleAsync<int>(
                        SubjectQueries.InsertPaymentTemplate,
                        new
                        {
                            TemplateType = mainTemplate.TemplateDurationType,
                            NoofDays = mainTemplate.NoofDays,
                            TemplateStatus = mainTemplate.StatusFlag,
                            BranchId = refBranchId,
                            InstituteId = refInstituteId
                        },
                        transaction);

                    await db.ExecuteAsync(
                        SubjectQueries.LinkPaymentTemplateToSubject,
                        new { PaymentTemplateId = newTemplateId, SubjectId = refSubId },
                        transaction);

                    // Copy template details
                    var templateDetails = await db.QueryAsync<dynamic>(
                        SubjectQueries.GetTemplateInstallments,
                        new { PaymentTemplateId = mainTemplate.PaymentTemplateId },
                        transaction);

                    foreach (var detail in templateDetails)
                    {
                        await db.ExecuteAsync(
                            SubjectQueries.InsertPaymentTemplateDetails,
                            new
                            {
                                PaymentTemplateId = newTemplateId,
                                NoOfDay = detail.NoOfDay,
                                Amount = detail.Amount
                            },
                            transaction);
                    }
                }
            }
        }

        private async Task AddAuditLogsForSubjectUpdateAsync(int subjectId, int userId, string ipAddress, IDbConnection db, IDbTransaction transaction)
        {
            await db.ExecuteAsync(
                string.Format(SubjectQueries.InsertSubjectAuditUpdate, subjectId),
                new
                {
                    UserId = userId,
                    UpdateDate = DateTime.Now,
                    IpAddress = ipAddress
                },
                transaction);
        }

        //public async Task<List<InstituteSubjectListDto>> GetInstituteSubjectsForAsync(int courseId, int refCourseId, int instituteId)
        //{
        //    using IDbConnection db = _dbFactory.CreateConnection();

        //    var subjects = await db.QueryAsync<InstituteSubjectListDto>(
        //        SubjectQueries.GetInstituteSubjects,
        //        new { CourseId = courseId, RefCourseId = refCourseId, InstituteId = instituteId });

        //    return subjects.ToList();
        //}
        public async Task<PagedResponse<InstituteSubjectListDto>> GetInstituteSubjectsForAsync(InstituteSubjectSearchDto search, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            string direction =
                search.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
                    ? "DESC"
                    : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "SubjectName":
                    orderByColumn = "s.sub_Name";
                    break;

                default:
                    orderByColumn = "s.subID";
                    break;
            }

            string orderByClause =
                !string.IsNullOrEmpty(search.SortBy)
                    ? $"ORDER BY {orderByColumn} {direction}, s.subID {direction}"
                    : "ORDER BY c.course_name ASC, s.sub_Name ASC, s.subID ASC";

            var parameters = new
            {
                CourseId = search.CourseId,
                RefCourseId = search.RefCourseId,
                CrclmId = search.CrclmId,
                InstituteId = instituteId,
                PageSize = search.PageSize,
                Offset = search.Offset
            };

            var totalCount = await db.QueryFirstOrDefaultAsync<int>(
                SubjectQueries.GetInstituteSubjectsCount,
                parameters);

            string query = string.Format(
                SubjectQueries.GetInstituteSubjects,
                orderByClause);

            var subjects = await db.QueryAsync<InstituteSubjectListDto>(
                query,
                parameters);

            return new PagedResponse<InstituteSubjectListDto>
            {
                Items = subjects.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<PagedResponse<InstituteSubjectListDto>> GetInstituteSubjectsByCourseCrclmAsync(SubjectInstituteDto subject_institute, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            if (db == null)
                return new PagedResponse<InstituteSubjectListDto> { Items = new List<InstituteSubjectListDto>(), TotalCount = 0 };

            if (db.State == ConnectionState.Closed)
                db.Open();

            if (subject_institute == null)
                return new PagedResponse<InstituteSubjectListDto> { Items = new List<InstituteSubjectListDto>(), TotalCount = 0 };

            // If CrclmIds is null, empty, or contains only 0, pass dummy value to SQL
            bool bindAllCrclm = subject_institute.CrclmIds == null || subject_institute.CrclmIds.Length == 0 || (subject_institute.CrclmIds.Length == 1 && subject_institute.CrclmIds[0] == 0);

            // If CourseIds is null, empty, or contains only 0, pass dummy value to SQL
            bool bindAllCourses = subject_institute.CourseIds == null || subject_institute.CourseIds.Length == 0 || (subject_institute.CourseIds.Length == 1 && subject_institute.CourseIds[0] == 0);

            var parameters = new
            {
                BranchId = subject_institute.BranchId,
                InstituteId = instituteId,
                CourseIds = bindAllCourses ? new int[] { -1 } : subject_institute.CourseIds,
                PageSize = subject_institute.PageSize > 0 ? subject_institute.PageSize : 10,
                Offset = subject_institute.Offset >= 0 ? subject_institute.Offset : 0,
                CrclmId = bindAllCrclm ? new int[] { -1 } : subject_institute.CrclmIds,
                BindAllCrclm = bindAllCrclm,
                BindAllCourses = bindAllCourses
            };

            if (parameters == null)
                return new PagedResponse<InstituteSubjectListDto> { Items = new List<InstituteSubjectListDto>(), TotalCount = 0 };

            #region Sorting
            string direction = "ASC";
            if (subject_institute.SortDirection != null)
            {
                direction = subject_institute.SortDirection.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase) == true
                    ? "DESC"
                    : "ASC";
            }

            string orderByColumn;

            switch (subject_institute.SortBy)
            {
                case "SubjectName":
                    orderByColumn = "s.sub_Name";
                    break;

                default:
                    orderByColumn = "s.subID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(subject_institute.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, s.subID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY c.course_name ASC, s.sub_Name ASC, s.subID ASC";
            }
            #endregion Sorting
            // Get total count
            int totalCount = 0;
            try
            {
                totalCount = await db.QueryFirstOrDefaultAsync<int>(SubjectQueries.GetInstituteSubjectsByCourseCrclmCount, parameters);
            }
            catch (NullReferenceException nre)
            {
                // Log or handle the specific null reference
                totalCount = 0;
            }

            // Get paginated data
            if (string.IsNullOrEmpty(orderByClause))
                orderByClause = "ORDER BY c.course_name ASC, s.sub_Name ASC, s.subID ASC";

            string query = string.Format(
       SubjectQueries.GetInstituteSubjectsByCourseCrclm,
       orderByClause);

            IEnumerable<InstituteSubjectListDto> subjects = new List<InstituteSubjectListDto>();
            try
            {
                subjects = await db.QueryAsync<InstituteSubjectListDto>(
                    query,
                    parameters);
            }
            catch (NullReferenceException nre)
            {
                // Log or handle the specific null reference
                subjects = new List<InstituteSubjectListDto>();
            }

            return new PagedResponse<InstituteSubjectListDto>
            {
                Items = subjects.ToList(),
                TotalCount = totalCount,
                PageNumber = subject_institute.PageNumber,
                PageSize = subject_institute.PageSize
            };
        }

        public async Task<(bool Success, string Message, int ImportedCount, int TotalCount)> SubmitInstituteSubjectsAsync(
    InstituteSubjectSubmitDto request, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // ===== FIX #4: Track original vs expanded counts separately =====
                int originalTotalCount = request.InstSubIds.Count;
                List<int> validSubIds = new List<int>();

                // ===== Expand subject list for IsCourseLvl = 1 =====
                HashSet<int> allSubjectsToImport = new HashSet<int>();
                Dictionary<int, int> subjectToCourseMap = new Dictionary<int, int>();

                foreach (int instSubId in request.InstSubIds)
                {
                    var subInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name, courseID FROM tbl_subject WHERE subID = @SubId",
                        new { SubId = instSubId },
                        transaction);

                    if (subInfo == null)
                        continue;

                    int sourceCourseId = (int)subInfo.courseID;

                    var isCourseLvl = await db.QueryFirstOrDefaultAsync<int>(
                        SubjectQueries.CheckCourseIsCourseLvl,
                        new { CourseId = sourceCourseId },
                        transaction);

                    if (isCourseLvl == 1)
                    {
                        // Pull ALL subjects of this course
                        var allCourseSubjects = await db.QueryAsync<dynamic>(
                            SubjectQueries.GetAllSubjectsForCourse,
                            new { CourseId = sourceCourseId },
                            transaction);

                        foreach (var s in allCourseSubjects)
                        {
                            int subId = (int)s.subID;
                            allSubjectsToImport.Add(subId);
                            subjectToCourseMap[subId] = sourceCourseId;
                        }
                    }
                    else
                    {
                        allSubjectsToImport.Add(instSubId);
                        subjectToCourseMap[instSubId] = sourceCourseId;
                    }
                }

                // Expanded total count (may be larger than originalTotalCount)
                int expandedTotalCount = allSubjectsToImport.Count;

                // ===== Duplicate check on expanded list =====
                foreach (int instSubId in allSubjectsToImport)
                {
                    var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckSubjectExistsInBranch,
                        new
                        {
                            SourceSubjectId = instSubId,
                            BranchId = request.BranchId
                        },
                        transaction);

                    if (duplicateCount <= 0)
                    {
                        validSubIds.Add(instSubId);
                    }
                }

                int submittedCount = 0;

                // Insert valid subjects with full hierarchy
                foreach (int instSubId in validSubIds)
                {
                    // Get subject details from institute level
                    var sourceSubject = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name, courseID FROM tbl_subject WHERE subID = @SubId",
                        new { SubId = instSubId },
                        transaction);

                    if (sourceSubject == null)
                        continue;

                    int sourceCourseId = (int)sourceSubject.courseID;

                    // Get course info including curriculum ID
                    var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT course_Name, crclmId FROM tbl_course WHERE courseID = @CourseId",
                        new { CourseId = sourceCourseId },
                        transaction);

                    if (courseInfo == null)
                        continue;

                    int? curriculumId = (int?)(courseInfo.crclmId ?? 0);
                    int? newCrclmId = null;
                    int? newCourseId = null;

                    // Handle curriculum if exists
                    if (curriculumId.HasValue && curriculumId > 0)
                    {
                        var curriculumExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckCurriculumExistsInBranch,
                            new { SourceCrclmId = curriculumId, BranchId = request.BranchId },
                            transaction);

                        if (curriculumExists > 0)
                        {
                            newCrclmId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT crclmId FROM tbl_curriculum WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId) AND branchid = @BranchId",
                                new { SourceCrclmId = curriculumId, BranchId = request.BranchId },
                                transaction);
                        }
                        else
                        {
                            var curriculumParams = new
                            {
                                BranchId = request.BranchId,
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
                        new { SourceCourseId = sourceCourseId, BranchId = request.BranchId },
                        transaction);

                    if (courseExists > 0)
                    {
                        newCourseId = await db.QueryFirstOrDefaultAsync<int>(
                            "SELECT courseID FROM tbl_course WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId) AND branchid = @BranchId",
                            new { SourceCourseId = sourceCourseId, BranchId = request.BranchId },
                            transaction);
                    }
                    else
                    {
                        var courseParams = new
                        {
                            InstituteId = instituteId,
                            BranchId = request.BranchId,
                            NewCrclmId = newCrclmId,
                            SourceCourseId = sourceCourseId
                        };

                        newCourseId = await db.QuerySingleAsync<int>(
                            CurriculumQueries.ImportSingleCourse,
                            courseParams,
                            transaction);

                        // Copy payment templates for course
                        var paymentTemplates = await db.QueryAsync<dynamic>(
                            "SELECT paymenttemplateid FROM paymenttemplatecourses WHERE courseid = @CourseId",
                            new { CourseId = sourceCourseId },
                            transaction);

                        foreach (var template in paymentTemplates)
                        {
                            int templateId = Convert.ToInt32(template.paymenttemplateid);

                            int newTemplateId = await db.QuerySingleAsync<int>(
                                "INSERT INTO paymenttemplates (templatetype,templatename,templatedurationtype, noofdays, statusflag, branchid, instituteid) SELECT templatetype,templatename,templatedurationtype, noofdays, statusflag, @BranchId, instituteid FROM paymenttemplates WHERE paymenttemplateid = @PaymentTemplateId; SELECT LAST_INSERT_ID();",
                                new { PaymentTemplateId = templateId, BranchId = request.BranchId },
                                transaction);

                            await db.ExecuteAsync(
                                "INSERT INTO paymenttemplatecourses (paymenttemplateid, courseid) VALUES (@PaymentTemplateId, @CourseId)",
                                new { PaymentTemplateId = newTemplateId, CourseId = newCourseId },
                                transaction);

                            await db.ExecuteAsync(
                                "INSERT INTO paymenttemplatedetails (paymenttemplateid, noofday, amount) SELECT @NewPaymentTemplateId, noofday, amount FROM paymenttemplatedetails WHERE paymenttemplateid = @SourcePaymentTemplateId",
                                new { NewPaymentTemplateId = newTemplateId, SourcePaymentTemplateId = templateId },
                                transaction);
                        }
                    }

                    // ===== FIX #1: Pass SINGLE subject id, not the List =====
                    // ===== FIX #2: Use QuerySingleAsync so LAST_INSERT_ID() returns properly =====
                    var subjectParams = new
                    {
                        NewCourseId = newCourseId,
                        SourceCourseId = sourceCourseId,
                        SourceSubjectId = instSubId   // ✅ FIXED: was request.InstSubIds (List<int>)
                    };

                    // If ImportSubjects SQL ends with "SELECT LAST_INSERT_ID();", use QuerySingleAsync.
                    // Otherwise switch to ExecuteAsync + separate SELECT LAST_INSERT_ID().
                    int newSubjectId;
                    try
                    {
                        newSubjectId = await db.QuerySingleAsync<int>(
                            CurriculumQueries.ImportSubjects,
                            subjectParams,
                            transaction);
                    }
                    catch
                    {
                        // Fallback: run as Execute and then query last insert id
                        await db.ExecuteAsync(CurriculumQueries.ImportSubjects, subjectParams, transaction);
                        newSubjectId = await db.QuerySingleAsync<int>(
                            "SELECT LAST_INSERT_ID()",
                            transaction);
                    }

                    // Safety: if newSubjectId is 0, skip dependent inserts to avoid orphan data
                    if (newSubjectId <= 0)
                    {
                        continue;
                    }

                    // Copy subject payment templates
                    var subjectTemplates = await db.QueryAsync<dynamic>(
                        "SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubId",
                        new { SubId = instSubId },
                        transaction);

                    foreach (var subjectTemplate in subjectTemplates)
                    {
                        int templateId = Convert.ToInt32(subjectTemplate.paymenttemplateid);

                        int newTemplateId = await db.QuerySingleAsync<int>(
                            "INSERT INTO paymenttemplates (templatetype,templatename,templatedurationtype, noofdays, statusflag, branchid, instituteid) SELECT templatetype,templatename,templatedurationtype, noofdays, statusflag, @BranchId, instituteid FROM paymenttemplates WHERE paymenttemplateid = @PaymentTemplateId; SELECT LAST_INSERT_ID();",
                            new { PaymentTemplateId = templateId, BranchId = request.BranchId },
                            transaction);

                        await db.ExecuteAsync(
                            "INSERT INTO paymenttemplatesubject (paymenttemplateid, subjectid) VALUES (@PaymentTemplateId, @SubId)",
                            new { PaymentTemplateId = newTemplateId, SubId = newSubjectId },
                            transaction);

                        await db.ExecuteAsync(
                            "INSERT INTO paymenttemplatedetails (paymenttemplateid, noofday, amount) SELECT @NewPaymentTemplateId, noofday, amount FROM paymenttemplatedetails WHERE paymenttemplateid = @SourcePaymentTemplateId",
                            new { NewPaymentTemplateId = newTemplateId, SourcePaymentTemplateId = templateId },
                            transaction);
                    }

                    // Import topics for the subject
                    var sourceTopics = await db.QueryAsync<dynamic>(
                        "SELECT TopicID FROM subject_topics WHERE SubjectID = @SourceSubjectId AND IsActive = 1",
                        new { SourceSubjectId = instSubId },
                        transaction);

                    foreach (var sourceTopic in sourceTopics)
                    {
                        int sourceTopicId = (int)sourceTopic.TopicID;

                        var topicExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckTopicExistsInBranch,
                            new { SourceTopicId = sourceTopicId, BranchId = request.BranchId },
                            transaction);

                        int newTopicId;
                        if (topicExists > 0)
                        {
                            newTopicId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT TopicID FROM subject_topics WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId) AND SubjectID = @NewSubjectId",
                                new { SourceTopicId = sourceTopicId, NewSubjectId = newSubjectId },
                                transaction);
                        }
                        else
                        {
                            var topicParams = new
                            {
                                NewSubjectId = newSubjectId,
                                InstituteId = instituteId,
                                BranchId = request.BranchId,
                                NewCourseId = newCourseId,
                                SourceSubjectId = instSubId
                            };

                            await db.ExecuteAsync(CurriculumQueries.ImportTopics, topicParams, transaction);

                            newTopicId = await db.QuerySingleAsync<int>(
                                "SELECT LAST_INSERT_ID()",
                                transaction);
                        }

                        // Import study materials for this topic
                        //var sourceStudyMaterials = await db.QueryAsync<dynamic>(
                        //    "SELECT studymaterialId FROM tblstudymaterial WHERE courseId = @SourceCourseId AND subjectId = @SourceSubjectId AND topicId = @SourceTopicId",
                        //    new { SourceCourseId = sourceCourseId, SourceSubjectId = instSubId, SourceTopicId = sourceTopicId },
                        //    transaction);

                        //foreach (var sourceStudyMaterial in sourceStudyMaterials)
                        //{
                        //    int sourceStudyMaterialId = (int)sourceStudyMaterial.studymaterialId;

                        //    var studyMaterialExists = await db.QueryFirstOrDefaultAsync<int>(
                        //        CurriculumQueries.CheckStudyMaterialExistsInBranch,
                        //        new { SourceStudyMaterialId = sourceStudyMaterialId, BranchId = request.BranchId },
                        //        transaction);

                        //    if (studyMaterialExists == 0)
                        //    {
                        //        var studyMaterialParams = new
                        //        {
                        //            InstituteId = instituteId,
                        //            BranchId = request.BranchId,
                        //            NewCourseId = newCourseId,
                        //            NewSubjectId = newSubjectId,
                        //            NewTopicId = newTopicId,
                        //            SourceCourseId = sourceCourseId,
                        //            SourceSubjectId = instSubId,
                        //            SourceTopicId = sourceTopicId
                        //        };

                        //        await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);
                        //    }
                        //}
                    }

                    // ===== FIX #4: Increment only after successful insert =====
                    submittedCount++;
                }

                // ===== Fee redistribution for IsCourseLvl=1 courses =====
                var processedCourseIds = new HashSet<int>();
                foreach (var kvp in subjectToCourseMap)
                {
                    int courseId = kvp.Value;

                    if (!processedCourseIds.Add(courseId))
                        continue;

                    var isCourseLvl = await db.QueryFirstOrDefaultAsync<int>(
                        SubjectQueries.CheckCourseIsCourseLvl,
                        new { CourseId = courseId },
                        transaction);

                    if (isCourseLvl == 1)
                    {
                        var newCourseIdForRedist = await db.QueryFirstOrDefaultAsync<int>(
                            "SELECT courseID FROM tbl_course WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId) AND branchid = @BranchId",
                            new { SourceCourseId = courseId, BranchId = request.BranchId },
                            transaction);

                        if (newCourseIdForRedist > 0)
                        {
                            await RedistributeCourseFeesAsync(newCourseIdForRedist, db, transaction);
                        }
                    }
                }

                transaction.Commit();

                // ===== FIX #4: Correct message using correct counts =====
                string message;
                if (submittedCount == 0)
                {
                    //message = $"No subjects imported. All {expandedTotalCount} subject(s) already exist in the branch or could not be imported.";
                    return (false, $"No subjects imported. All {expandedTotalCount} subject(s) already exist in the branch or could not be imported.", 0, 0);
                }
                else if (submittedCount == expandedTotalCount)
                {
                    if (expandedTotalCount > originalTotalCount)
                    {
                        message = $"{submittedCount} Subject(s) added successfully (including {expandedTotalCount - originalTotalCount} additional subject(s) from course-level import).";
                    }
                    else
                    {
                        message = $"{submittedCount} Subject(s) added successfully.";
                    }
                }
                else
                {
                    int skipped = expandedTotalCount - submittedCount;
                    message = $"{submittedCount} out of {expandedTotalCount} subjects added successfully. {skipped} subject(s) already exist in the branch.";
                }

                return (true, message, submittedCount, expandedTotalCount);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error importing subjects: {ex.Message}", 0, 0);
            }
        }

        public async Task<(bool Success, string Message)> ExportSubjectAsync(List<int> subjectIds, int instituteId, List<int> branchIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                bool isNewSubject = false;
                int totalExportedCount = 0;
                List<int> exportedCurriculumIds = new List<int>();
                List<int> exportedCourseIds = new List<int>();
                List<int> fullCourseExportIds = new List<int>(); // Track courses where all subjects were exported
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

                // Collect all subjects to export (handling IsCourseLvl = 1)
                HashSet<int> allSubjectsToExport = new HashSet<int>();
                Dictionary<int, List<int>> courseSubjectsMap = new Dictionary<int, List<int>>();

                foreach (int subjectId in subjectIds)
                {
                    // Get subject name and course ID
                    var subjectInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name, courseID FROM tbl_subject WHERE subID = @SubjectId",
                        new { SubjectId = subjectId },
                        transaction);

                    if (subjectInfo == null)
                    {
                        failureDetails.Add($"Subject ID {subjectId} not found");
                        continue;
                    }

                    int courseId = (int)subjectInfo.courseID;

                    // Check if course is IsCourseLvl = 1
                    var isCourseLvl = await db.QueryFirstOrDefaultAsync<int>(
                        SubjectQueries.CheckCourseIsCourseLvl,
                        new { CourseId = courseId },
                        transaction);

                    if (isCourseLvl == 1)
                    {
                        // Get all subjects for this course
                        var allCourseSubjects = await db.QueryAsync<dynamic>(
                            SubjectQueries.GetAllSubjectsForCourse,
                            new { CourseId = courseId },
                            transaction);

                        foreach (var courseSubject in allCourseSubjects)
                        {
                            int subId = (int)courseSubject.subID;
                            allSubjectsToExport.Add(subId);

                            if (!courseSubjectsMap.ContainsKey(courseId))
                            {
                                courseSubjectsMap[courseId] = new List<int>();
                            }
                            courseSubjectsMap[courseId].Add(subId);
                        }

                        if (!fullCourseExportIds.Contains(courseId))
                        {
                            fullCourseExportIds.Add(courseId);
                        }
                    }
                    else
                    {
                        // Just export the selected subject
                        allSubjectsToExport.Add(subjectId);
                    }
                }

                // Export all collected subjects
                foreach (int subjectId in allSubjectsToExport)
                {
                    // Get subject name and course ID
                    var subjectInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name, courseID FROM tbl_subject WHERE subID = @SubjectId",
                        new { SubjectId = subjectId },
                        transaction);

                    if (subjectInfo == null)
                    {
                        failureDetails.Add($"Subject ID {subjectId} not found");
                        continue;
                    }

                    string subjectName = subjectInfo.sub_Name;
                    int courseId = (int)subjectInfo.courseID;

                    // Get course info including curriculum ID
                    var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT course_Name, crclmId FROM tbl_course WHERE courseID = @CourseId",
                        new { CourseId = courseId },
                        transaction);

                    if (courseInfo == null)
                    {
                        failureDetails.Add($"Course for subject '{subjectName}' not found");
                        continue;
                    }

                    string courseName = courseInfo.course_Name;
                    int? curriculumId = (int?)(courseInfo.crclmId ?? 0);

                    foreach (int branchId in branchIds)
                    {
                        int? newCrclmId = null;
                        int? newCourseId = null;

                        // If subject has curriculum, handle curriculum export
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

                                if (!exportedCurriculumIds.Contains(curriculumId.Value))
                                {
                                    exportedCurriculumIds.Add(curriculumId.Value);
                                }
                            }
                        }

                        // Check if course already exists in branch
                        var courseExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckCourseExistsInBranch,
                            new { SourceCourseId = courseId, BranchId = branchId },
                            transaction);

                        if (courseExists > 0)
                        {
                            // Get existing course ID in branch
                            newCourseId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT courseID FROM tbl_course WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId) AND branchid = @BranchId",
                                new { SourceCourseId = courseId, BranchId = branchId },
                                transaction);

                            // Fee redistribution for IsCourseLvl = 1 courses (existing course)
                            var isCourseLvl = await db.QueryFirstOrDefaultAsync<int>(
                                SubjectQueries.CheckCourseIsCourseLvl,
                                new { CourseId = courseId },
                                transaction);

                            if (isCourseLvl == 1)
                            {
                                // Get all subjects for the existing course
                                var existingCourseSubjects = await db.QueryAsync<dynamic>(
                                    SubjectQueries.GetCourseSubjectsForFeeRedistribution,
                                    new { CourseId = newCourseId },
                                    transaction);

                                int activeSubjectCount = 0;
                                List<int> inactiveSubjectIds = new List<int>();
                                List<int> activeSubjectIds = new List<int>();
                                double courseFees = 0;

                                foreach (var subject in existingCourseSubjects)
                                {
                                    int statusFlag = (int)subject.StatusFlag;
                                    int subId = (int)subject.subID;
                                    courseFees = (double)subject.courseFees;

                                    if (statusFlag == 1)
                                    {
                                        activeSubjectCount++;
                                        activeSubjectIds.Add(subId);
                                    }
                                    else
                                    {
                                        inactiveSubjectIds.Add(subId);
                                    }
                                }

                                // Set inactive subjects' fees to 0
                                foreach (int inactiveSubId in inactiveSubjectIds)
                                {
                                    await db.ExecuteAsync(
                                        "UPDATE tbl_subject SET Fees = 0 WHERE subID = @SubId",
                                        new { SubId = inactiveSubId },
                                        transaction);
                                }

                                // Distribute course fees among active subjects
                                if (activeSubjectCount > 0 && courseFees > 0)
                                {
                                    double distributedFee = courseFees / activeSubjectCount;

                                    foreach (int activeSubId in activeSubjectIds)
                                    {
                                        await db.ExecuteAsync(
                                            "UPDATE tbl_subject SET Fees = @Fees WHERE subID = @SubId",
                                            new { Fees = distributedFee, SubId = activeSubId },
                                            transaction);
                                    }
                                }
                            }
                        }
                        else
                        {
                            // Import course
                            var courseParams = new
                            {
                                InstituteId = instituteId,
                                BranchId = branchId,
                                NewCrclmId = newCrclmId,
                                SourceCourseId = courseId
                            };

                            newCourseId = await db.QuerySingleAsync<int>(
                                CurriculumQueries.ImportSingleCourse,
                                courseParams,
                                transaction);

                            if (!exportedCourseIds.Contains(courseId))
                            {
                                exportedCourseIds.Add(courseId);
                            }

                            // Copy payment templates for course
                            var paymentTemplates = await db.QueryAsync<dynamic>(
                                "SELECT paymenttemplateid FROM paymenttemplatecourses WHERE courseid = @CourseId",
                                new { CourseId = courseId },
                                transaction);

                            foreach (var template in paymentTemplates)
                            {
                                int templateId = Convert.ToInt32(template.paymenttemplateid);

                                int newTemplateId = await db.QuerySingleAsync<int>(
                                    "INSERT INTO paymenttemplates (templatetype,templatename,templatedurationtype, noofdays, statusflag, branchid, instituteid) SELECT templatetype,templatename,templatedurationtype, noofdays, statusflag, @BranchId, instituteid FROM paymenttemplates WHERE paymenttemplateid = @PaymentTemplateId; SELECT LAST_INSERT_ID();",
                                    new { PaymentTemplateId = templateId, BranchId = branchId },
                                    transaction);

                                await db.ExecuteAsync(
                                    "INSERT INTO paymenttemplatecourses (paymenttemplateid, courseid) VALUES (@PaymentTemplateId, @CourseId)",
                                    new { PaymentTemplateId = newTemplateId, CourseId = newCourseId },
                                    transaction);

                                await db.ExecuteAsync(
                                    "INSERT INTO paymenttemplatedetails (paymenttemplateid, noofday, amount) SELECT @NewPaymentTemplateId, noofday, amount FROM paymenttemplatedetails WHERE paymenttemplateid = @SourcePaymentTemplateId",
                                    new { NewPaymentTemplateId = newTemplateId, SourcePaymentTemplateId = templateId },
                                    transaction);
                            }

                            // Fee redistribution for IsCourseLvl = 1 courses
                            var isCourseLvl = await db.QueryFirstOrDefaultAsync<int>(
                                SubjectQueries.CheckCourseIsCourseLvl,
                                new { CourseId = courseId },
                                transaction);

                            if (isCourseLvl == 1)
                            {
                                // Get all subjects for the newly imported course
                                var newCourseSubjects = await db.QueryAsync<dynamic>(
                                    SubjectQueries.GetCourseSubjectsForFeeRedistribution,
                                    new { CourseId = newCourseId },
                                    transaction);

                                int activeSubjectCount = 0;
                                List<int> inactiveSubjectIds = new List<int>();
                                List<int> activeSubjectIds = new List<int>();
                                double courseFees = 0;

                                foreach (var subject in newCourseSubjects)
                                {
                                    int statusFlag = (int)subject.StatusFlag;
                                    int subId = (int)subject.subID;
                                    courseFees = (double)subject.courseFees;

                                    if (statusFlag == 1)
                                    {
                                        activeSubjectCount++;
                                        activeSubjectIds.Add(subId);
                                    }
                                    else
                                    {
                                        inactiveSubjectIds.Add(subId);
                                    }
                                }

                                // Set inactive subjects' fees to 0
                                foreach (int inactiveSubId in inactiveSubjectIds)
                                {
                                    await db.ExecuteAsync(
                                        "UPDATE tbl_subject SET Fees = 0 WHERE subID = @SubId",
                                        new { SubId = inactiveSubId },
                                        transaction);
                                }

                                // Distribute course fees among active subjects
                                if (activeSubjectCount > 0 && courseFees > 0)
                                {
                                    double distributedFee = courseFees / activeSubjectCount;

                                    foreach (int activeSubId in activeSubjectIds)
                                    {
                                        await db.ExecuteAsync(
                                            "UPDATE tbl_subject SET Fees = @Fees WHERE subID = @SubId",
                                            new { Fees = distributedFee, SubId = activeSubId },
                                            transaction);
                                    }
                                }
                            }
                        }

                        // Check if subject already exists in branch
                        var subjectExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckSubjectExistsInBranch,
                            new { SourceSubjectId = subjectId, BranchId = branchId },
                            transaction);

                        if (subjectExists > 0)
                        {
                            failureDetails.Add($"Subject '{subjectName}' already exists in branch '{branchNames[branchId]}'");
                            continue;
                        }

                        // Import subject
                        var subjectParams = new
                        {
                            NewCourseId = newCourseId,
                            SourceCourseId = courseId,
                            SourceSubjectId = subjectId
                        };

                        await db.ExecuteAsync(CurriculumQueries.ImportSubjects, subjectParams, transaction);

                        isNewSubject = true;

                        // Get the new subject ID
                        int newSubjectId = await db.QuerySingleAsync<int>(
                            "SELECT LAST_INSERT_ID()",
                            transaction);

                        // Copy subject payment templates
                        var subjectTemplates = await db.QueryAsync<dynamic>(
                            "SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubId",
                            new { SubId = subjectId },
                            transaction);

                        foreach (var subjectTemplate in subjectTemplates)
                        {
                            int templateId = Convert.ToInt32(subjectTemplate.paymenttemplateid);

                            int newTemplateId = await db.QuerySingleAsync<int>(
                                "INSERT INTO paymenttemplates (templatetype,templatename,templatedurationtype, noofdays, statusflag, branchid, instituteid) SELECT templatetype,templatename,templatedurationtype, noofdays, statusflag, @BranchId, instituteid FROM paymenttemplates WHERE paymenttemplateid = @PaymentTemplateId; SELECT LAST_INSERT_ID();",
                                new { PaymentTemplateId = templateId, BranchId = branchId },
                                transaction);

                            await db.ExecuteAsync(
                                "INSERT INTO paymenttemplatesubject (paymenttemplateid, subjectid) VALUES (@PaymentTemplateId, @SubId)",
                                new { PaymentTemplateId = newTemplateId, SubId = newSubjectId },
                                transaction);

                            await db.ExecuteAsync(
                                "INSERT INTO paymenttemplatedetails (paymenttemplateid, noofday, amount) SELECT @NewPaymentTemplateId, noofday, amount FROM paymenttemplatedetails WHERE paymenttemplateid = @SourcePaymentTemplateId",
                                new { NewPaymentTemplateId = newTemplateId, SourcePaymentTemplateId = templateId },
                                transaction);
                        }

                        // Get all topics for the source subject
                        var sourceTopics = await db.QueryAsync<dynamic>(
                            "SELECT TopicID FROM subject_topics WHERE SubjectID = @SourceSubjectId AND IsActive = 1",
                            new { SourceSubjectId = subjectId },
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
                                    SourceSubjectId = subjectId
                                };

                                await db.ExecuteAsync(CurriculumQueries.ImportTopics, topicParams, transaction);

                                // Get the new topic ID
                                newTopicId = await db.QuerySingleAsync<int>(
                                    "SELECT LAST_INSERT_ID()",
                                    transaction);
                            }

                            // Import study materials for this topic
                            //var sourceStudyMaterials = await db.QueryAsync<dynamic>(
                            //    "SELECT studymaterialId FROM tblstudymaterial WHERE courseId = @SourceCourseId AND subjectId = @SourceSubjectId AND topicId = @SourceTopicId",
                            //    new { SourceCourseId = courseId, SourceSubjectId = subjectId, SourceTopicId = sourceTopicId },
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
                            //            SourceSubjectId = subjectId,
                            //            SourceTopicId = sourceTopicId
                            //        };

                            //        await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);
                            //    }
                            //}
                        }

                        totalExportedCount++;
                        if (isNewSubject)
                        {
                            totalExportedCount++;
                            successDetails.Add($"Subject '{subjectName}' exported to branch '{branchNames[branchId]}' successfully");
                        }
                        else
                        {
                            return (false, "No subjects exported. Subjects may already exist in target branches.");
                        }
                    }
                }

                transaction.Commit();

                // Build detailed message
                string message = "";
                if (totalExportedCount > 0)
                {
                    message += $"Export Summary: {totalExportedCount} subject export(s) successful\n";
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
                        message += $"\nNote: {exportedCurriculumIds.Count} curriculum{(exportedCurriculumIds.Count > 1 ? "s" : "")} also exported due to subject-curriculum relationship\n";
                    }
                    if (exportedCourseIds.Count > 0)
                    {
                        message += $"\nNote: {exportedCourseIds.Count} course{(exportedCourseIds.Count > 1 ? "s" : "")} also exported due to subject-course relationship\n";
                    }
                    if (fullCourseExportIds.Count > 0)
                    {
                        message += $"\nNote: {fullCourseExportIds.Count} course{(fullCourseExportIds.Count > 1 ? "s" : "")} with IsCourseLvl=1 - all subjects exported to maintain fee calculation integrity\n";
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
                    return (false, message.Trim() != "" ? message.Trim() : "No subjects exported. Subjects may already exist in target branches.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error exporting subject: {ex.Message}");
            }
        }
    }
}
