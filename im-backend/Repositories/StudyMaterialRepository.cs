using Dapper;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class StudyMaterialRepository : IStudyMaterialRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public StudyMaterialRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }
        public async Task<PagedResponse<StudyMaterialDto>> GetStudyMaterialsAsync(int instituteId, StudyMaterialSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var dynamicParams = new DynamicParameters();
            dynamicParams.Add("InstituteId", instituteId);
            dynamicParams.Add("BranchId", search.BranchId);
            dynamicParams.Add("CrclmId", (search.CrclmId.HasValue && search.CrclmId > 0) ? search.CrclmId : null);
            dynamicParams.Add("CourseId", (search.CourseId.HasValue && search.CourseId > 0) ? search.CourseId : null);
            dynamicParams.Add("SubjectId", (search.SubjectId.HasValue && search.SubjectId > 0) ? search.SubjectId : null);
            dynamicParams.Add("TopicId", (search.TopicId.HasValue && search.TopicId > 0) ? search.TopicId : null);
            dynamicParams.Add("Heading", string.IsNullOrWhiteSpace(search.StudyMaterialHeading) ? null : $"%{search.StudyMaterialHeading.Trim()}%");
            dynamicParams.Add("Status", search.Status == 2 ? null : (int?)search.Status);
            dynamicParams.Add("PageSize", search.PageSize);
            dynamicParams.Add("Offset", search.Offset);

            foreach (var name in dynamicParams.ParameterNames)
            {
                var value = dynamicParams.Get<object>(name);
                Console.WriteLine($"Parameter @{name} = {value ?? "NULL"} (Type: {value?.GetType().Name ?? "null"})");
            }
            #region Sorting
            string direction =
            search.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
        ? "DESC"
        : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "StudyMaterialHeading":
                    orderByColumn = "sm.heading";
                    break;

                default:
                    orderByColumn = "sm.studymaterialId";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, sm.studymaterialId {direction}";
            }
            else
            {
                orderByClause = "ORDER BY sm.studymaterialId DESC";
            }
            #endregion
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(
                StudyMaterialQueries.GetStudyMaterialsCount,
                dynamicParams
            );

            string query = string.Format(
            StudyMaterialQueries.GetStudyMaterials,
            orderByClause
            );

            var items = await db.QueryAsync<StudyMaterialDto>(
                query,
                dynamicParams
            );

            return new PagedResponse<StudyMaterialDto>
            {
                Items = items.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }
        public async Task<bool> SaveStudyMaterialAsync(int instituteId, int userId, string ipAddress, SaveStudyMaterialDto dto, IWebHostEnvironment env)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            string? oldAttachmentPath = null;

            if (dto.StudymaterialId > 0)
            {
                oldAttachmentPath = await db.ExecuteScalarAsync<string?>(
                    StudyMaterialQueries.GetStudyMaterialAttachmentPath,
                    new
                    {
                        StudyMaterialId = dto.StudymaterialId,
                        InstituteId = instituteId
                    }
                );
            }
            if (dto.AttachmentRemoved && !string.IsNullOrWhiteSpace(oldAttachmentPath))
            {
                var oldFilePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    oldAttachmentPath.TrimStart('/').Replace(
                        "/",
                        Path.DirectorySeparatorChar.ToString()
                    )
                );

                if (File.Exists(oldFilePath))
                {
                    File.Delete(oldFilePath);
                }
            }
            // 1. Check for Duplicates
            int duplicateCount = await db.ExecuteScalarAsync<int>(
                StudyMaterialQueries.CheckDuplicate,
                new { InstituteId = instituteId, Heading = dto.Heading.Trim(), StudyMaterialId = dto.StudymaterialId }
            );

            if (duplicateCount > 0)
                throw new InvalidOperationException($"Study Material '{dto.Heading}' already exists.");

            // 2. Handle File Attachment (if uploaded)
            string? originalName = null, storedName = null, relativePath = null, extension = null, mimeType = null;
            long? fileSize = null;
            if (dto.Attachment != null && dto.Attachment.Length > 0)
            {
                originalName = Path.GetFileName(dto.Attachment.FileName);
                extension = Path.GetExtension(originalName).ToLower();
                storedName = $"{Guid.NewGuid()}{extension}";

                // Gets the base directory of the running ASP.NET Core project
                string projectRootPath = Directory.GetCurrentDirectory();

                // Path: [ProjectRoot]/Uploads/StudyMaterial
                string uploadFolder = Path.Combine(projectRootPath, "Uploads", "StudyMaterial");

                // Creates the folder in your project root if it does not exist
                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                string filePath = Path.Combine(uploadFolder, storedName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Attachment.CopyToAsync(stream);
                }

                relativePath = $"/Uploads/StudyMaterial/{storedName}";
                fileSize = dto.Attachment.Length;
                mimeType = dto.Attachment.ContentType;
            }
            //if (dto.Attachment != null && dto.Attachment.Length > 0)
            //{
            //    originalName = Path.GetFileName(dto.Attachment.FileName);
            //    extension = Path.GetExtension(originalName).ToLower();
            //    storedName = $"{Guid.NewGuid()}{extension}";

            //    string uploadFolder = Path.Combine(env.WebRootPath ?? Directory.GetCurrentDirectory(), "Uploads", "StudyMaterial");
            //    Directory.CreateDirectory(uploadFolder);

            //    string filePath = Path.Combine(uploadFolder, storedName);
            //    using (var stream = new FileStream(filePath, FileMode.Create))
            //    {
            //        await dto.Attachment.CopyToAsync(stream);
            //    }

            //    relativePath = $"/Uploads/StudyMaterial/{storedName}";
            //    fileSize = dto.Attachment.Length;
            //    mimeType = dto.Attachment.ContentType;
            //}

            // 3. Prepare SQL Parameters (Dapper prevents SQL injection natively!)
            var parameters = new
            {
                InstituteId = instituteId,
                BranchId = dto.BranchId,
                CourseId = dto.CourseId,
                SubjectId = dto.SubjectId,
                TopicId = dto.TopicId,
                Heading = dto.Heading.Trim(),
                StudyMaterialHtml = string.IsNullOrWhiteSpace(dto.StudymaterialHtml) || dto.StudymaterialHtml == "<p><br></p>" ? "" : dto.StudymaterialHtml,
                IsActive = dto.IsActive,
                UserId = userId,
                IpAddress = ipAddress,
                StudyMaterialId = dto.StudymaterialId,
                AttachmentOriginalName = originalName,
                AttachmentStoredName = storedName,
                AttachmentPath = relativePath,
                AttachmentRemoved = dto.AttachmentRemoved,
                AttachmentExtension = extension,
                AttachmentSize = fileSize,
                AttachmentMimeType = mimeType,
                CrclmId = dto.CrclmId
            };

            // 4. Execute Insert or Update
            if (dto.StudymaterialId == 0)
            {
                int rows = await db.ExecuteAsync(StudyMaterialQueries.InsertStudyMaterial, parameters);
                return rows > 0;
            }
            else
            {
                Console.WriteLine($"AttachmentRemoved = {dto.AttachmentRemoved}");
                int rows = await db.ExecuteAsync(StudyMaterialQueries.UpdateStudyMaterial, parameters);
                return rows > 0;
            }
        }

        public async Task<StudyMaterialDto?> GetStudyMaterialByIdAsync(int studyMaterialId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<StudyMaterialDto>(
                StudyMaterialQueries.GetStudyMaterialById,
                new { StudyMaterialId = studyMaterialId }
            );
        }
        public async Task<bool> DeleteStudyMaterialAsync(int studyMaterialId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rows = await db.ExecuteAsync(StudyMaterialQueries.DeleteStudyMaterial, new { StudyMaterialId = studyMaterialId });
            return rows > 0;
        }

        public async Task<(bool Success, string Message)> ExportStudyMaterialAsync(List<int> studyMaterialIds, int instituteId, List<int> branchIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int totalExportedCount = 0;
                List<int> exportedCurriculumIds = new List<int>();
                List<int> exportedCourseIds = new List<int>();
                List<int> exportedSubjectIds = new List<int>();
                List<int> exportedTopicIds = new List<int>();
                List<int> fullCourseExportIds = new List<int>();
                List<string> successDetails = new List<string>();
                HashSet<string> failureDetails = new HashSet<string>();

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

                // Collect all study materials to export (handling IsCourseLvl = 1)
                HashSet<int> allStudyMaterialsToExport = new HashSet<int>();
                Dictionary<int, List<int>> courseSubjectsMap = new Dictionary<int, List<int>>();

                foreach (int studyMaterialId in studyMaterialIds)
                {
                    // Get study material info
                    var studyMaterialInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        StudyMaterialQueries.GetStudyMaterialTopicInfo,
                        new { StudyMaterialId = studyMaterialId },
                        transaction);

                    if (studyMaterialInfo == null)
                    {
                        failureDetails.Add($"Study Material ID {studyMaterialId} not found");
                        continue;
                    }

                    int? topicId = (int?)(studyMaterialInfo.topicId ?? 0);
                    int subjectId = studyMaterialInfo.subjectId;
                    int courseId = studyMaterialInfo.courseId;

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

                            // Get all topics for this subject
                            var subjectTopics = await db.QueryAsync<dynamic>(
                                "SELECT TopicID FROM subject_topics WHERE SubjectID = @SubjectId",
                                new { SubjectId = subId },
                                transaction);

                            foreach (var topic in subjectTopics)
                            {
                                int topicIdValue = (int)topic.TopicID;

                                // Get all study materials for this topic
                                var topicStudyMaterials = await db.QueryAsync<dynamic>(
                                    "SELECT studymaterialId FROM tblStudyMaterial WHERE topicId = @TopicId",
                                    new { TopicId = topicIdValue },
                                transaction);

                                foreach (var studyMaterial in topicStudyMaterials)
                                {
                                    allStudyMaterialsToExport.Add((int)studyMaterial.studymaterialId);
                                }
                            }

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
                        // Just export the selected study material
                        allStudyMaterialsToExport.Add(studyMaterialId);
                    }
                }

                // Export all collected study materials
                foreach (int studyMaterialId in allStudyMaterialsToExport)
                {
                    // Get study material info
                    var studyMaterialInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        StudyMaterialQueries.GetStudyMaterialTopicInfo,
                        new { StudyMaterialId = studyMaterialId },
                        transaction);

                    if (studyMaterialInfo == null)
                    {
                        failureDetails.Add($"Study Material ID {studyMaterialId} not found");
                        continue;
                    }

                    int? topicId = (int?)(studyMaterialInfo.topicId ?? 0);
                    int subjectId = (int)studyMaterialInfo.subjectId;
                    int courseId = (int)studyMaterialInfo.courseId;
                    int? curriculumId = (int?)(studyMaterialInfo.crclmId ?? 0);

                    // Get topic info
                    if (!topicId.HasValue)
                    {
                        failureDetails.Add($"Study Material not linked to a topic");
                        continue;
                    }

                    var topicInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT TopicName FROM subject_topics WHERE TopicID = @TopicId",
                        new { TopicId = topicId },
                        transaction);

                    if (topicInfo == null)
                    {
                        failureDetails.Add($"Topic for study material not found");
                        continue;
                    }

                    // Get subject info
                    var subjectInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name FROM tbl_subject WHERE subID = @SubjectId",
                        new { SubjectId = subjectId },
                        transaction);

                    if (subjectInfo == null)
                    {
                        failureDetails.Add($"Subject for study material not found");
                        continue;
                    }

                    string subjectName = subjectInfo.sub_Name;

                    // Get course info
                    var courseInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT course_Name FROM tbl_course WHERE courseID = @CourseId",
                        new { CourseId = courseId },
                        transaction);

                    if (courseInfo == null)
                    {
                        failureDetails.Add($"Course for subject '{subjectName}' not found");
                        continue;
                    }

                    string courseName = courseInfo.course_Name;

                    foreach (int branchId in branchIds)
                    {
                        int? newCrclmId = null;
                        int? newCourseId = null;
                        int? newSubjectId = null;
                        int? newTopicId = null;

                        // If study material has curriculum, handle curriculum export
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
                            // Get existing subject ID in branch
                            newSubjectId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT subID FROM tbl_subject WHERE sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId) AND courseID = @NewCourseId",
                                new { SourceSubjectId = subjectId, NewCourseId = newCourseId },
                                transaction);
                        }
                        else
                        {
                            // Import subject
                            var subjectParams = new
                            {
                                NewCourseId = newCourseId,
                                SourceCourseId = courseId,
                                SourceSubjectId = subjectId
                            };

                            await db.ExecuteAsync(CurriculumQueries.ImportSubjects, subjectParams, transaction);

                            // Get the new subject ID
                            newSubjectId = await db.QuerySingleAsync<int>(
                                "SELECT LAST_INSERT_ID()",
                                transaction);

                            if (!exportedSubjectIds.Contains(subjectId))
                            {
                                exportedSubjectIds.Add(subjectId);
                            }

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
                        }

                        // Check if topic already exists in branch
                        var topicExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckTopicExistsInBranch,
                            new { SourceTopicId = topicId, BranchId = branchId },
                            transaction);

                        if (topicExists > 0)
                        {
                            // Get existing topic ID in branch
                            newTopicId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT TopicID FROM subject_topics WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId) AND SubjectID = @NewSubjectId",
                                new { SourceTopicId = topicId, NewSubjectId = newSubjectId },
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

                            if (!exportedTopicIds.Contains(topicId.Value))
                            {
                                exportedTopicIds.Add(topicId.Value);
                            }
                        }

                        // Check if study material already exists in branch
                        var studyMaterialExists = await db.QueryFirstOrDefaultAsync<int>(
                            CurriculumQueries.CheckStudyMaterialExistsInBranch,
                            new { SourceStudyMaterialId = studyMaterialId, BranchId = branchId },
                            transaction);

                        if (studyMaterialExists > 0)
                        {
                            failureDetails.Add($"Study material already exists in branch '{branchNames[branchId]}'");
                            continue;
                        }

                        // Import study material
                        var studyMaterialParams = new
                        {
                            InstituteId = instituteId,
                            BranchId = branchId,
                            NewCourseId = newCourseId,
                            NewSubjectId = newSubjectId,
                            NewTopicId = newTopicId,
                            SourceStudyMaterialId = studyMaterialId,
                            CrclmId = newCrclmId,
                            AddedIP = "System",
                            AddedBy = 0
                        };

                        await db.ExecuteAsync(
                            StudyMaterialQueries.ImportStudyMaterialForExport,
                            studyMaterialParams,
                            transaction);

                        totalExportedCount++;
                        successDetails.Add($"Study material exported to branch '{branchNames[branchId]}' successfully");
                    }
                }

                transaction.Commit();

                // Build detailed message
                string message = "";
                if (totalExportedCount > 0)
                {
                    message += $"Export Summary: {totalExportedCount} study material export(s) successful\n";
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
                        message += $"\nNote: {exportedCurriculumIds.Count} curriculum{(exportedCurriculumIds.Count > 1 ? "s" : "")} also exported due to study material-curriculum relationship\n";
                    }
                    if (exportedCourseIds.Count > 0)
                    {
                        message += $"\nNote: {exportedCourseIds.Count} course{(exportedCourseIds.Count > 1 ? "s" : "")} also exported due to study material-course relationship\n";
                    }
                    if (exportedSubjectIds.Count > 0)
                    {
                        message += $"\nNote: {exportedSubjectIds.Count} subject{(exportedSubjectIds.Count > 1 ? "s" : "")} also exported due to study material-subject relationship\n";
                    }
                    if (exportedTopicIds.Count > 0)
                    {
                        message += $"\nNote: {exportedTopicIds.Count} topic{(exportedTopicIds.Count > 1 ? "s" : "")} also exported due to study material-topic relationship\n";
                    }
                    if (fullCourseExportIds.Count > 0)
                    {
                        message += $"\nNote: {fullCourseExportIds.Count} course{(fullCourseExportIds.Count > 1 ? "s" : "")} with IsCourseLvl=1 - all study materials exported to maintain fee calculation integrity\n";
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
                    return (false, message.Trim() != "" ? message.Trim() : "No study materials exported. Study materials may already exist in target branches.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error exporting study material: {ex.Message}");
            }
        }

        public async Task<PagedResponse<StudyMaterialDto>> GetInstituteStudyMaterialsForImportAsync(int instituteId, int branchId, StudyMaterialImportDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var parameters = new
            {
                InstituteId = instituteId,
                BranchId = branchId,
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
                case "Heading":
                    orderByColumn = "sm.heading";
                    break;

                default:
                    orderByColumn = "sm.studymaterialId";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, sm.studymaterialId {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY sm.heading ASC, sm.studymaterialId ASC";
            }

            // Get total count
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(StudyMaterialQueries.GetStudyMaterialsForImportCount, parameters);

            // Get paginated data
            string query = string.Format(
            StudyMaterialQueries.GetStudyMaterialsForImport,
            orderByClause);

            var studyMaterials = await db.QueryAsync<StudyMaterialDto>(
                query,
                parameters);

            return new PagedResponse<StudyMaterialDto>
            {
                Items = studyMaterials.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<(bool Success, string Message)> ImportStudyMaterialAsync(int branchId, int instituteId, List<int> studyMaterialIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int importedCount = 0;

                foreach (int sourceStudyMaterialId in studyMaterialIds)
                {
                    // Get study material info with hierarchy
                    var studyMaterialInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT courseId, subjectId, topicId FROM tblstudymaterial WHERE studymaterialId = @StudyMaterialId",
                        new { StudyMaterialId = sourceStudyMaterialId },
                        transaction);

                    if (studyMaterialInfo == null)
                    {
                        continue;
                    }

                    int sourceCourseId = (int)studyMaterialInfo.courseId;
                    int sourceSubjectId = (int)studyMaterialInfo.subjectId;
                    int sourceTopicId = (int)studyMaterialInfo.topicId;

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

                    // Check if study material already exists in branch
                    var studyMaterialExists = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckStudyMaterialExistsInBranch,
                        new { SourceStudyMaterialId = sourceStudyMaterialId, BranchId = branchId },
                        transaction);

                    if (studyMaterialExists > 0)
                    {
                        transaction.Rollback();
                        return (false, "Study Material with same name already exists in branch!");
                    }

                    // Import study material
                    var studyMaterialParams = new
                    {
                        InstituteId = instituteId,
                        BranchId = branchId,
                        NewCourseId = newCourseId,
                        NewSubjectId = newSubjectId,
                        NewTopicId = newTopicId,
                        SourceCourseId = sourceCourseId,
                        SourceSubjectId = sourceSubjectId,
                        SourceTopicId = sourceTopicId,
                        CrclmId = newCrclmId,
                        AddedIP = "System",
                        AddedBy = 0
                    };

                    await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);

                    importedCount++;
                }

                transaction.Commit();

                if (importedCount > 0)
                {
                    return (true, $"Study Material{(importedCount > 1 ? "s" : "")} with hierarchy added successfully.");
                }
                else
                {
                    return (false, "No Study Materials were imported.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error importing Study Materials: {ex.Message}");
            }
        }
    }
}
