using Dapper;
using IM_backend.Common;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;
using static IM_backend.Dtos.CurriculumDto;

namespace IM_backend.Repositories
{
    public class CurriculumRepository : ICurriculumRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public CurriculumRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<PagedResponse<CurriculumListDto>> GetCurriculumsAsync(int instituteId, CurriculumSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Build SQL condition dynamically
            string sqlCondition = string.Empty;

            if (!string.IsNullOrEmpty(search.CurriculumName))
                sqlCondition += " AND crclmName LIKE '" + search.CurriculumName.Replace("'", "''") + "%'";

            //Active 1|Inactive 0| All 2
            if (search.Status != 2)
                sqlCondition += " AND crclmStatus = " + search.Status;
            else
                sqlCondition += " AND crclmStatus <> " + search.Status;

            #region Sorting

            string direction =
                search.SortDirection?.ToLower() == "desc"
                    ? "DESC"
                    : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "CurriculumName":
                    orderByColumn = "crclmName";
                    break;

                default:
                    orderByColumn = "crclmId";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, crclmId {direction}";
            }
            else
            {
                // Preserve existing default behaviour
                orderByClause =
                    "ORDER BY crclmName DESC, crclmId DESC";
            }

            #endregion
            //string query = string.Format(CurriculumQueries.GetCurriculums, sqlCondition, "ASC");
            string query = string.Format(CurriculumQueries.GetCurriculums, sqlCondition, orderByClause);
            string countQuery = string.Format(CurriculumQueries.GetCurriculumsCount, sqlCondition);

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
            var curriculums = await db.QueryAsync<CurriculumListDto>(query, parameters);

            return new PagedResponse<CurriculumListDto>
            {
                Items = curriculums.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<CurriculumListDto?> GetCurriculumByIdAsync(int crclmId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<CurriculumListDto>(CurriculumQueries.GetCurriculumById, new { CrclmId = crclmId });
        }

        public async Task<(bool Success, string Message, int CurriculumId)> CreateCurriculumAsync(CurriculumSubmitDto request, int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check duplicate curriculum name
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    CurriculumQueries.CheckDuplicateCurriculum,
                    new { CrclmName = request.CrclmName, BranchId = request.BranchId, InstituteId = instituteId, CrclmId = 0 },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Curriculum name already exists.", 0);

                // Insert new curriculum
                var parameters = new
                {
                    CrclmName = request.CrclmName.Replace("'", "''"),
                    CrclmDesc = request.CrclmDesc.Replace("'", "''"),
                    CrclmStatus = request.CrclmStatus,
                    BranchId = request.BranchId,
                    InstituteId = instituteId
                };

                int curriculumId = await db.QuerySingleAsync<int>(CurriculumQueries.InsertCurriculum, parameters, transaction);
                transaction.Commit();

                return (true, "Curriculum saved successfully.", curriculumId);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error saving curriculum: {ex.Message}", 0);
            }
        }

        public async Task<(bool Success, string Message)> UpdateCurriculumAsync(CurriculumEditDto request, int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check duplicate curriculum name
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    CurriculumQueries.CheckDuplicateCurriculum,
                    new { CrclmName = request.CrclmName, InstituteId = instituteId, BranchId = request.BranchId, CrclmId = request.CrclmId },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Curriculum name already exists.");

                // Update existing curriculum
                var parameters = new
                {
                    CrclmName = request.CrclmName.Replace("'", "''"),
                    CrclmDesc = request.CrclmDesc.Replace("'", "''"),
                    CrclmStatus = request.CrclmStatus,
                    CrclmId = request.CrclmId
                };

                await db.ExecuteAsync(CurriculumQueries.UpdateCurriculum, parameters, transaction);
                transaction.Commit();

                return (true, "Curriculum updated successfully.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error updating curriculum: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> DeleteCurriculumAsync(int crclmId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check if curriculum has related records
                var relationCount = await db.QueryFirstOrDefaultAsync<int>(
                    CurriculumQueries.CheckCurriculumHasRelations,
                    new { CrclmId = crclmId },
                    transaction);

                if (relationCount > 0)
                    return (false, "Unable to delete curriculum. The curriculum has records related to course/class.");

                await db.ExecuteAsync(CurriculumQueries.DeleteCurriculum, new { CrclmId = crclmId }, transaction);
                transaction.Commit();

                return (true, "Curriculum deleted successfully.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error deleting curriculum: {ex.Message}");
            }
        }

        public async Task<PagedResponse<CurriculumListDto>> GetInstituteCurriculumsForImportAsync(int instituteId, int branchId, CurriculumImportDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var parameters = new
            {
                InstituteId = instituteId,
                branchId = branchId,
                PageSize = search.PageSize,
                Offset = search.Offset
            };
            string direction =
    search.SortDirection?.ToLower() == "desc"
        ? "DESC"
        : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "CurriculumName":
                    orderByColumn = "crclmName";
                    break;

                default:
                    orderByColumn = "crclmId";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, crclmId {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY crclmName ASC, crclmId ASC";
            }
            // Get total count
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(CurriculumQueries.GetInstituteCurriculumsForImportCount, parameters);

            // Get paginated data
            string query = string.Format(
            CurriculumQueries.GetInstituteCurriculumsForImport,
            orderByClause);

            var curriculums = await db.QueryAsync<CurriculumListDto>(
                query,
                parameters);

            return new PagedResponse<CurriculumListDto>
            {
                Items = curriculums.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<(bool Success, string Message)> ImportCurriculumAsync(int branchId, int instituteId, List<int> curriculumIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int importedCount = 0;

                foreach (int sourceCrclmId in curriculumIds)
                {
                    // Check if curriculum already exists in branch
                    var existsCount = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckCurriculumExistsInBranch,
                        new { SourceCrclmId = sourceCrclmId, BranchId = branchId },
                        transaction);

                    if (existsCount > 0)
                    {
                        transaction.Rollback();
                        return (false, "Curriculum with same name already exists in branch!");
                    }

                    // Import curriculum
                    var curriculumParams = new
                    {
                        BranchId = branchId,
                        InstituteId = instituteId,
                        SourceCrclmId = sourceCrclmId
                    };

                    int newCrclmId = await db.QuerySingleAsync<int>(CurriculumQueries.ImportCurriculum, curriculumParams, transaction);

                    // Get all courses for the source curriculum
                    var sourceCourses = await db.QueryAsync<dynamic>(
                         "SELECT courseID FROM tbl_course WHERE crclmId = @SourceCrclmId AND StatusFlag = 1",
                         new { SourceCrclmId = sourceCrclmId },
                         transaction);

                    foreach (var sourceCourse in sourceCourses)
                    {
                        int sourceCourseId = (int)sourceCourse.courseID;

                        // Check if course already exists in branch
                        var courseExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckCourseExistsInBranch,
                            new { SourceCourseId = sourceCourseId, BranchId = branchId },
                            transaction);

                        int newCourseId;
                        if (courseExists > 0)
                        {
                            // Get existing course ID in branch
                            newCourseId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT courseID FROM tbl_course WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId) AND branchid = @BranchId",
                                new { SourceCourseId = sourceCourseId, BranchId = branchId },
                                transaction);
                        }
                        else
                        {
                            // Import course
                            var courseParams = new
                            {
                                InstituteId = instituteId,
                                BranchId = branchId,
                                NewCrclmId = newCrclmId,
                                SourceCrclmId = sourceCrclmId,
                                SourceCourseId = sourceCourseId
                            };

                            await db.ExecuteAsync(CurriculumQueries.ImportCourses, courseParams, transaction);

                            // Get the new course ID
                            newCourseId = await db.QuerySingleAsync<int>(
                                "SELECT LAST_INSERT_ID()",
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
                                    "SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubId",
                                    new { SubId = sourceSubjectId },
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
                                //            SourceTopicId = sourceTopicId
                                //        };

                                //        await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);
                                //    }
                                //}
                            }
                        }
                    }
                    importedCount++;
                }

                transaction.Commit();

                if (importedCount > 0)
                    return (true, $"Curriculum{(importedCount > 1 ? "s" : "")} with courses, subjects, topics, and study materials added successfully.");
                else
                    return (false, "Please select curriculum");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error importing curriculum: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> ExportCurriculumAsync(List<int> curriculumIds, int instituteId, List<int> branchIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int totalExportedCount = 0;
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

                foreach (int curriculumId in curriculumIds)
                {
                    // Get curriculum name
                    var curriculumInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT crclmName, crclmStatus FROM tbl_curriculum WHERE crclmId = @CrclmId",
                        new { CrclmId = curriculumId },
                        transaction);

                    if (curriculumInfo == null)
                    {
                        failureDetails.Add($"Curriculum ID {curriculumId} not found");
                        continue;
                    }

                    // Only export active curriculums
                    if (curriculumInfo.crclmStatus != true)
                    {
                        failureDetails.Add($"Curriculum ID {curriculumId} is inactive and will not be exported");
                        continue;
                    }

                    string curriculumName = curriculumInfo.crclmName;

                    foreach (int branchId in branchIds)
                    {
                        // Check if curriculum already exists in branch
                        var existsCount = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckCurriculumExistsInBranch,
                        new { SourceCrclmId = curriculumId, BranchId = branchId },
                        transaction);

                        if (existsCount > 0)
                        {
                            failureDetails.Add($"Curriculum '{curriculumName}' already exists in branch '{branchNames[branchId]}'");
                            continue;
                        }

                        // Import curriculum and get new curriculum ID
                        var curriculumParams = new
                        {
                            BranchId = branchId,
                            InstituteId = instituteId,
                            SourceCrclmId = curriculumId
                        };

                        int newCrclmId = await db.QuerySingleAsync<int>(CurriculumQueries.ImportCurriculum, curriculumParams, transaction);

                        // Get all courses for the source curriculum
                        var sourceCourses = await db.QueryAsync<dynamic>(
                             "SELECT courseID FROM tbl_course WHERE crclmId = @SourceCrclmId AND StatusFlag = 1",
                             new { SourceCrclmId = curriculumId },
                             transaction);

                        foreach (var sourceCourse in sourceCourses)
                        {
                            int sourceCourseId = (int)sourceCourse.courseID;

                            // Check if course already exists in branch
                            var courseExists = await db.QueryFirstOrDefaultAsync<int>(
                                CurriculumQueries.CheckCourseExistsInBranch,
                                new { SourceCourseId = sourceCourseId, BranchId = branchId },
                                transaction);

                            int newCourseId;
                            if (courseExists > 0)
                            {
                                // Get existing course ID in branch
                                newCourseId = await db.QueryFirstOrDefaultAsync<int>(
                                    "SELECT courseID FROM tbl_course WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId) AND branchid = @BranchId",
                                    new { SourceCourseId = sourceCourseId, BranchId = branchId },
                                    transaction);
                            }
                            else
                            {
                                // Import course
                                var courseParams = new
                                {
                                    InstituteId = instituteId,
                                    BranchId = branchId,
                                    NewCrclmId = newCrclmId,
                                    SourceCrclmId = curriculumId,
                                    SourceCourseId = sourceCourseId
                                };

                                await db.ExecuteAsync(CurriculumQueries.ImportCourses, courseParams, transaction);

                                // Get the new course ID
                                newCourseId = await db.QuerySingleAsync<int>(
                                    "SELECT LAST_INSERT_ID()",
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
                                        "SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubId",
                                        new { SubId = sourceSubjectId },
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
                                    //            SourceTopicId = sourceTopicId
                                    //        };

                                    //        await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);
                                    //    }
                                    //}
                                }
                            }
                        }

                        totalExportedCount++;
                        successDetails.Add($"Curriculum '{curriculumName}' exported to branch '{branchNames[branchId]}' successfully");
                    }
                }

                transaction.Commit();

                // Build detailed message
                string message = "";
                if (totalExportedCount > 0)
                {
                    message += $"Export Summary: {totalExportedCount} curriculum export(s) successful\n";
                    if (successDetails.Count > 0)
                    {
                        message += "\nSuccessful Exports:\n";
                        foreach (var detail in successDetails)
                        {
                            message += $"- {detail}\n";
                        }
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
                    return (false, message.Trim() != "" ? message.Trim() : "No curriculums exported. Curriculums may already exist in target branches.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error exporting curriculum: {ex.Message}");
            }
        }
    }
}