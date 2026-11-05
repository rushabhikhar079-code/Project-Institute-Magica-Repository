using Dapper;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class TopicRepository : ITopicRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public TopicRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<PagedResponse<TopicListDto>> GetTopicsAsync(int instituteId, TopicSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            string sqlCondition = string.Empty;

            if (!string.IsNullOrEmpty(search.TopicName))
                sqlCondition += " AND s.topicname LIKE '" + search.TopicName.Replace("'", "''") + "%'";

            if (search.CrclmId.HasValue && search.CrclmId > 0)
                sqlCondition += " AND cur.CrclmId = " + search.CrclmId;

            if (search.SubjectId.HasValue && search.SubjectId > 0)
                sqlCondition += " AND s.subjectid = " + search.SubjectId;

            if (search.CourseId.HasValue && search.CourseId > 0)
                sqlCondition += " AND ts.courseid = " + search.CourseId;

            if (search.Status.HasValue && search.Status != 2)
                sqlCondition += " AND s.IsActive = " + search.Status;
            else if (search.Status.HasValue && search.Status == 2)
                sqlCondition += " AND s.IsActive <> " + search.Status;
            #region Sorting
            string direction =
    search.SortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true
        ? "DESC"
        : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "TopicName":
                    orderByColumn = "s.TopicName";
                    break;

                default:
                    orderByColumn = "s.TopicID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, s.TopicID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY course_name ASC, sub_name ASC, TopicSeqNum ASC, TopicName ASC";
            }
            #endregion Sorting
            string query = string.Format(TopicQueries.SearchTopics, sqlCondition, orderByClause);
            string countQuery = string.Format(TopicQueries.SearchTopicsCount, sqlCondition);

            var parameters = new { BranchId = search.BranchId, InstituteId = instituteId, PageSize = search.PageSize, Offset = search.Offset };
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(countQuery, parameters);
            var topics = await db.QueryAsync<TopicListDto>(query, parameters);

            return new PagedResponse<TopicListDto> { Items = topics.ToList(), TotalCount = totalCount, PageNumber = search.PageNumber, PageSize = search.PageSize };
        }

        public async Task<TopicSubmitDto?> GetTopicByIdAsync(int topicId, int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var topic = await db.QueryFirstOrDefaultAsync<TopicSubmitDto>(TopicQueries.GetTopicById, new { TopicId = topicId });

            if (topic != null && branchId == 0)
            {
                // Check if topic has reference topics (institute level)
                var refCount = await db.QueryFirstOrDefaultAsync<int>(
                    TopicQueries.CheckReferenceTopics,
                    new { TopicId = topicId, InstituteId = instituteId });
                topic.IsReflect = refCount > 0;
            }

            return topic;
        }

        public async Task<(bool Success, string Message)> AddTopicAsync(TopicSubmitDto request, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Validate topic sequence number not zero
                if (request.TopicSeqNum == 0)
                    return (false, "0 Topic Sequence Number Not Allowed!");

                // Check duplicate topic name
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    TopicQueries.CheckDuplicateTopic,
                    new
                    {
                        TopicName = request.TopicName.Replace("'", "''"),
                        SubjectId = request.SubjectId,
                        TopicId = 0
                    },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Topic name already exists!");

                // Check duplicate topic sequence number
                //var duplicateSeqCount = await db.QueryFirstOrDefaultAsync<int>(
                //    TopicQueries.CheckDuplicateTopicSeqNum,
                //    new
                //    {
                //        TopicSeqNum = request.TopicSeqNum,
                //        SubjectId = request.SubjectId,
                //        TopicId = 0,
                //        InstituteId = instituteId,
                //        BranchId = request.BranchId
                //    },
                //    transaction);

                //if (duplicateSeqCount > 0)
                //    return (false, "Topic Sequence Number already exists!");

                // Build duration string
                string unitText = request.TopicDurId == 1 ? "Hours" : request.TopicDurId == 2 ? "Days" : "Months";
                string topicDuration = request.TopicDuration + " " + unitText;

                var parameters = new
                {
                    CourseId = request.CourseId,
                    SubjectId = request.SubjectId,
                    TopicSeqNum = request.TopicSeqNum,
                    TopicName = request.TopicName.Replace("'", "''"),
                    TopicDuration = topicDuration,
                    TopicDurId = request.TopicDurId,
                    Remark = request.Remark?.Replace("'", "''") ?? string.Empty,
                    IsActive = request.IsActive,
                    InstituteId = instituteId,
                    BranchId = request.BranchId,
                    CrclmId = request.CrclmId
                };

                await db.ExecuteAsync(TopicQueries.InsertTopic, parameters, transaction);
                transaction.Commit();
                return (true, "Topic saved successfully.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error adding topic: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> UpdateTopicAsync(TopicSubmitDto request, int instituteId, int userId, int topicId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check duplicate topic name
                var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                    TopicQueries.CheckDuplicateTopic,
                    new
                    {
                        TopicName = request.TopicName,
                        SubjectId = request.SubjectId,
                        TopicId = topicId
                    },
                    transaction);

                if (duplicateCount > 0)
                    return (false, "Topic name already exists!");

                // Check duplicate topic sequence number
                //var duplicateSeqCount = await db.QueryFirstOrDefaultAsync<int>(
                //    TopicQueries.CheckDuplicateTopicSeqNum,
                //    new
                //    {
                //        TopicSeqNum = request.TopicSeqNum,
                //        SubjectId = request.SubjectId,
                //        TopicId = topicId,
                //        InstituteId = instituteId,
                //        BranchId = request.BranchId
                //    },
                //    transaction);

                //if (duplicateSeqCount > 0)
                //    return (false, "Topic Sequence Number already exists!");

                // Build duration string
                string unitText = request.TopicDurId == 1 ? "Hours" : request.TopicDurId == 2 ? "Days" : "Months";
                string topicDuration = request.TopicDuration + " " + unitText;

                var parameters = new
                {
                    TopicId = topicId,
                    CourseId = request.CourseId,
                    SubjectId = request.SubjectId,
                    TopicSeqNum = request.TopicSeqNum,
                    TopicName = request.TopicName.Replace("'", "''"),
                    TopicDuration = topicDuration,
                    TopicDurId = request.TopicDurId,
                    Remark = request.Remark?.Replace("'", "''") ?? string.Empty,
                    IsActive = request.IsActive,
                    ModifiedDt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                    CrclmId = request.CrclmId
                };

                await db.ExecuteAsync(TopicQueries.UpdateTopic, parameters, transaction);

                // Update reference topics if institute level and reflect in all branches
                if (request.BranchId == 0 && request.IsReflect)
                {
                    // Get all reference topics
                    var refTopics = await db.QueryAsync<dynamic>(
                        "SELECT TopicID, SubjectID, CourseID FROM subject_topics WHERE refTopicID = @TopicId",
                        new { TopicId = topicId },
                        transaction);

                    foreach (var refTopic in refTopics)
                    {
                        await db.ExecuteAsync(
                            "UPDATE subject_topics SET SubjectID = @SubjectID, CourseID = @CourseID, TopicName = @TopicName, TopicDuration = @TopicDuration, TopicDurID = @TopicDurId, Remark = @Remark, ModifiedDt = @ModifiedDt, TopicSeqNum = @TopicSeqNum, IsActive = @IsActive WHERE TopicID = @RefTopicID",
                            new
                            {
                                SubjectID = refTopic.SubjectID,
                                CourseID = refTopic.CourseID,
                                TopicName = request.TopicName.Replace("'", "''"),
                                TopicDuration = topicDuration,
                                TopicDurId = request.TopicDurId,
                                Remark = request.Remark?.Replace("'", "''") ?? string.Empty,
                                ModifiedDt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                                TopicSeqNum = request.TopicSeqNum,
                                IsActive = request.IsActive,
                                RefTopicID = refTopic.TopicID,
                            },
                            transaction);
                    }
                }

                transaction.Commit();
                return (true, "Topic updated successfully.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error updating topic: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> DeleteTopicAsync(int topicId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                // Check if topic has attendance records
                var attendanceCount = await db.QueryFirstOrDefaultAsync<int>(
                    TopicQueries.CheckTopicAttendance,
                    new { TopicId = topicId },
                    transaction);

                if (attendanceCount > 0)
                    return (false, "Datewise topics covered and tracking details are present with this topic hence it cannot be deleted. You can make it inactive.");

                // Delete from multiple tables in order
                await db.ExecuteAsync(TopicQueries.DeleteAssignmentTopic, new { TopicId = topicId }, transaction);
                await db.ExecuteAsync(TopicQueries.DeleteBatchTopic, new { TopicId = topicId }, transaction);
                await db.ExecuteAsync(TopicQueries.DeleteTopic, new { TopicId = topicId }, transaction);
                await db.ExecuteAsync(TopicQueries.DeleteAttendanceTopic, new { TopicId = topicId }, transaction);

                transaction.Commit();
                return (true, "Topic deleted successfully.");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error deleting topic: {ex.Message}");
            }
        }

        public async Task<TopicImportResultDto> ImportTopicsFromExcelAsync(TopicExcelImportDto request, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            var result = new TopicImportResultDto
            {
                TotalRows = request.Topics.Count,
                ImportedCount = 0,
                FailedCount = 0,
                ErrorLog = string.Empty
            };

            var errorLog = new System.Text.StringBuilder();

            // Add validation errors from ExcelService
            if (!string.IsNullOrEmpty(request.ErrorLog))
            {
                errorLog.Append(request.ErrorLog);
            }

            try
            {
                foreach (var row in request.Topics)
                {
                    if (!float.TryParse(row.TopicSequenceNumber, out float topicSeqNum))
                    {
                        row.IsValid = false;
                        row.ErrorMessage = "Row no. " + row.RowNumber + " Topic sequence no. is missing or invalid data";
                        errorLog.AppendLine(row.ErrorMessage);
                        continue;
                    }

                    string durationUnitLower = row.DurationUnit.TrimEnd().ToLower();

                    // Database duplicate check - Topic Name
                    var duplicateNameCount = await db.QueryFirstOrDefaultAsync<int>(
                        TopicQueries.CheckDuplicateTopic,
                        new
                        {
                            TopicName = row.TopicName.Replace("'", "''"),
                            SubjectId = request.SubjectId,
                            TopicId = 0
                        },
                        transaction);

                    if (duplicateNameCount > 0)
                    {
                        row.IsValid = false;
                        row.ErrorMessage = "Row no. " + row.RowNumber + " Topic name already exists";
                        errorLog.AppendLine(row.ErrorMessage);
                        continue;
                    }

                    // Database duplicate check - Topic Sequence Number
                    string sql = @"SELECT COUNT(*) FROM subject_topics WHERE SubjectID = @SubjectId
                                   AND TopicSeqNum = @TopicSeqNum AND instituteId = @InstituteId
                                   AND Branchid = @BranchId";

                    var duplicateSeqCount = await db.QueryFirstOrDefaultAsync<int>(
                        sql,
                        new
                        {
                            SubjectId = request.SubjectId,
                            TopicSeqNum = topicSeqNum,
                            InstituteId = instituteId,
                            BranchId = request.BranchId
                        },
                        transaction);

                    if (duplicateSeqCount > 0)
                    {
                        row.IsValid = false;
                        row.ErrorMessage = "Row no. " + row.RowNumber + " Topic Sequence Number already exists";
                        errorLog.AppendLine(row.ErrorMessage);
                        continue;
                    }

                    // Map Duration Unit to ID (Months=3, Days=2, Hours=1)
                    int unitId = 0;
                    string trimmedUnit = row.DurationUnit.TrimEnd();
                    if (trimmedUnit == "Months" || trimmedUnit == "MONTHS" || trimmedUnit == "months")
                        unitId = 3;
                    else if (trimmedUnit == "Days" || trimmedUnit == "DAYS" || trimmedUnit == "days")
                        unitId = 2;
                    else if (trimmedUnit == "Hours" || trimmedUnit == "HOURS" || trimmedUnit == "hours")
                        unitId = 1;

                    // Build duration string (Duration + " " + DurationUnit)
                    string topicDuration = row.Duration + " " + row.DurationUnit;

                    // Insert topic
                    string insertSql = @"INSERT INTO subject_topics(SubjectID, courseID, TopicName, TopicDuration, TopicDurID, Remark, TopicSeqNum, instituteid, branchid, IsActive)
                                        VALUES (@SubjectId, @CourseId, @TopicName, @TopicDuration, @UnitId, @Remark, @TopicSeqNum, @InstituteId, @BranchId, @IsActive)";

                    var parameters = new
                    {
                        CourseId = request.CourseId,
                        SubjectId = request.SubjectId,
                        TopicSeqNum = topicSeqNum,
                        TopicName = row.TopicName.Replace("'", "''"),
                        TopicDuration = topicDuration,
                        UnitId = unitId,
                        Remark = row.Remark?.Replace("'", " ") ?? string.Empty,
                        IsActive = 1,
                        InstituteId = instituteId,
                        BranchId = request.BranchId
                    };

                    await db.ExecuteAsync(insertSql, parameters, transaction);
                    result.ImportedCount++;
                }

                transaction.Commit();

                result.FailedCount = result.TotalRows - result.ImportedCount;
                result.ErrorLog = errorLog.ToString();
                result.FailedRecords = request.Topics.Where(t => !t.IsValid).ToList();

                return result;
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                result.ErrorLog += $"\nError importing topics: {ex.Message}";
                return result;
            }
        }

        //public async Task<List<InstituteLevelTopicsListDto>> GetInstituteLevelTopicsAsync(int instituteId, InstituteLevelTopicsSearchDto search)
        //{
        //    using IDbConnection db = _dbFactory.CreateConnection();
        //    string sqlCondition = string.Empty;

        //    if (search.CourseId.HasValue && search.CourseId > 0)
        //        sqlCondition += " AND ts.CourseId = " + search.CourseId;

        //    if (search.SubjectId.HasValue && search.SubjectId > 0)
        //        sqlCondition += " AND ts.subID = " + search.SubjectId;

        //    string query = string.Format(TopicQueries.FillInstituteLevelTopics, sqlCondition);

        //    var topics = await db.QueryAsync<InstituteLevelTopicsListDto>(
        //        query,
        //        new { InstituteId = instituteId, BranchId = search.BranchId });

        //    return topics.ToList();
        //}
        public async Task<PagedResponse<InstituteLevelTopicsListDto>> GetInstituteLevelTopicsAsync(
    int instituteId,
    InstituteLevelTopicsSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            string sqlCondition = string.Empty;
            if (search.CrclmId.HasValue && search.CrclmId > 0)
                sqlCondition += " AND tc.crclmId = @CrclmId";
            if (search.CourseId.HasValue && search.CourseId > 0)
                sqlCondition += " AND ts.CourseId = " + search.CourseId;

            if (search.SubjectId.HasValue && search.SubjectId > 0)
                sqlCondition += " AND ts.subID = " + search.SubjectId;

            string direction =
                search.SortDirection?.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase) == true
                    ? "DESC"
                    : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "TopicName":
                    orderByColumn = "st.TopicName";
                    break;

                default:
                    orderByColumn = "st.TopicId";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, st.TopicId {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY tc.course_Name ASC, ts.sub_Name ASC, st.TopicSeqNum ASC, st.TopicName ASC, st.TopicId ASC";
            }

            var parameters = new
            {
                InstituteId = instituteId,
                BranchId = search.BranchId,
                CrclmId = search.CrclmId,
                CourseId = search.CourseId,
                SubjectId = search.SubjectId,
                PageSize = search.PageSize,
                Offset = search.Offset
            };
            //var sw = Stopwatch.StartNew();
            var totalCount = await db.QueryFirstOrDefaultAsync<int>(
       string.Format(TopicQueries.FillInstituteLevelTopicsCount, sqlCondition),
       parameters);
            //Console.WriteLine($"COUNT TIME: {sw.ElapsedMilliseconds} ms");
            string query = string.Format(
                TopicQueries.FillInstituteLevelTopics,
                sqlCondition,
                orderByClause);
            //sw.Restart();
            var topics = await db.QueryAsync<InstituteLevelTopicsListDto>(
                query,
                parameters);
            //Console.WriteLine($"SELECT TIME: {sw.ElapsedMilliseconds} ms");
            return new PagedResponse<InstituteLevelTopicsListDto>
            {
                Items = topics.ToList(),
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<PagedResponse<InstituteTopicListDto>> GetInstituteTopicsByCourseCrclmSubjectAsync(TopicInstituteDto topic_institute, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            if (db == null)
                return new PagedResponse<InstituteTopicListDto> { Items = new List<InstituteTopicListDto>(), TotalCount = 0 };

            if (db.State == ConnectionState.Closed)
                db.Open();

            if (topic_institute == null)
                return new PagedResponse<InstituteTopicListDto> { Items = new List<InstituteTopicListDto>(), TotalCount = 0 };

            // If CrclmIds is null, empty, or contains only 0, pass dummy value to SQL
            bool bindAllCrclm = topic_institute.CrclmIds == null || topic_institute.CrclmIds.Length == 0 || (topic_institute.CrclmIds.Length == 1 && topic_institute.CrclmIds[0] == 0);

            // If CourseIds is null, empty, or contains only 0, pass dummy value to SQL
            bool bindAllCourses = topic_institute.CourseIds == null || topic_institute.CourseIds.Length == 0 || (topic_institute.CourseIds.Length == 1 && topic_institute.CourseIds[0] == 0);

            // If SubjectIds is null, empty, or contains only 0, pass dummy value to SQL
            bool bindAllSubjects = topic_institute.SubjectIds == null || topic_institute.SubjectIds.Length == 0 || (topic_institute.SubjectIds.Length == 1 && topic_institute.SubjectIds[0] == 0);

            var parameters = new
            {
                BranchId = topic_institute.BranchId,
                InstituteId = instituteId,
                CourseIds = bindAllCourses ? new int[] { -1 } : topic_institute.CourseIds,
                SubjectIds = bindAllSubjects ? new int[] { -1 } : topic_institute.SubjectIds,
                PageSize = topic_institute.PageSize > 0 ? topic_institute.PageSize : 10,
                Offset = topic_institute.Offset >= 0 ? topic_institute.Offset : 0,
                CrclmId = bindAllCrclm ? new int[] { -1 } : topic_institute.CrclmIds,
                BindAllCrclm = bindAllCrclm,
                BindAllCourses = bindAllCourses,
                BindAllSubjects = bindAllSubjects
            };

            if (parameters == null)
                return new PagedResponse<InstituteTopicListDto> { Items = new List<InstituteTopicListDto>(), TotalCount = 0 };

            #region Sorting
            string direction = "ASC";
            if (topic_institute.SortDirection != null)
            {
                direction = topic_institute.SortDirection.Equals(
                    "desc",
                    StringComparison.OrdinalIgnoreCase) == true
                    ? "DESC"
                    : "ASC";
            }

            string orderByColumn;

            switch (topic_institute.SortBy)
            {
                case "TopicName":
                    orderByColumn = "st.TopicName";
                    break;

                default:
                    orderByColumn = "st.TopicID";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(topic_institute.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, st.TopicID {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY c.course_name ASC, s.sub_Name ASC, st.TopicSeqNum ASC, st.TopicName ASC, st.TopicID ASC";
            }
            #endregion Sorting
            // Get total count
            int totalCount = 0;
            try
            {
                totalCount = await db.QueryFirstOrDefaultAsync<int>(TopicQueries.GetInstituteTopicsByCourseCrclmSubjectCount, parameters);
            }
            catch (NullReferenceException nre)
            {
                // Log or handle the specific null reference
                totalCount = 0;
            }

            // Get paginated data
            if (string.IsNullOrEmpty(orderByClause))
                orderByClause = "ORDER BY c.course_name ASC, s.sub_Name ASC, st.TopicSeqNum ASC, st.TopicName ASC, st.TopicID ASC";

            string query = string.Format(
       TopicQueries.GetInstituteTopicsByCourseCrclmSubject,
       orderByClause);

            IEnumerable<InstituteTopicListDto> topics = new List<InstituteTopicListDto>();
            try
            {
                topics = await db.QueryAsync<InstituteTopicListDto>(
                    query,
                    parameters);
            }
            catch (NullReferenceException nre)
            {
                // Log or handle the specific null reference
                topics = new List<InstituteTopicListDto>();
            }

            return new PagedResponse<InstituteTopicListDto>
            {
                Items = topics.ToList(),
                TotalCount = totalCount,
                PageNumber = topic_institute.PageNumber,
                PageSize = topic_institute.PageSize
            };
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

        public async Task<(bool Success, string Message, int AddedCount, int TotalCount)> AddInstituteTopicsAsync(InstituteTopicsSubmitDto request, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();
            
            bool isNewTopic = false;
            int addedCount = 0;
            int totalCount = request.TopicIds.Count;

            try
            {
                // ===== Collect all topics to import (handling IsCourseLvl = 1) =====
                HashSet<int> allTopicsToImport = new HashSet<int>();

                foreach (int topicId in request.TopicIds)
                {
                    // Get topic info
                    var topicInfo = await db.QueryFirstOrDefaultAsync<InstituteLevelTopicsListDto>(
                        TopicQueries.GetTopicDetailsById,
                        new { TopicId = topicId },
                        transaction);

                    if (topicInfo == null)
                        continue;

                    int courseId = topicInfo.CourseId;

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
                            int statusFlag = (int)courseSubject.StatusFlag;

                            // Only process active subjects
                            if (statusFlag != 1)
                                continue;

                            // Get all active topics for this subject
                            var subjectTopics = await db.QueryAsync<dynamic>(
                                "SELECT TopicID FROM subject_topics WHERE SubjectID = @SubjectId AND IsActive = 1",
                                new { SubjectId = subId },
                                transaction);

                            foreach (var topic in subjectTopics)
                            {
                                allTopicsToImport.Add((int)topic.TopicID);
                            }
                        }
                    }
                    else
                    {
                        // Just import the selected topic
                        allTopicsToImport.Add(topicId);
                    }
                }


                // ===== Import all collected topics =====
                foreach (int topicId in allTopicsToImport)
                {
                    // Get the institute level topic details by TopicId
                    var instituteTopic = await db.QueryFirstOrDefaultAsync<InstituteLevelTopicsListDto>(
                        TopicQueries.GetTopicDetailsById,
                        new { TopicId = topicId },
                        transaction);

                    if (instituteTopic == null)
                        continue;

                    int sourceSubjectId = instituteTopic.SubjectId;
                    int sourceCourseId = instituteTopic.CourseId;

                    // Get source subject info
                    var sourceSubjectInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name, courseID FROM tbl_subject WHERE subID = @SubId",
                        new { SubId = sourceSubjectId },
                        transaction);

                    if (sourceSubjectInfo == null)
                        continue;

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

                    // Check if subject already exists in branch
                    var subjectExists = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckSubjectExistsInBranch,
                        new { SourceSubjectId = sourceSubjectId, BranchId = request.BranchId },
                        transaction);

                    int newSubjectId;
                    if (subjectExists > 0)
                    {
                        newSubjectId = await db.QueryFirstOrDefaultAsync<int>(
                            "SELECT subID FROM tbl_subject WHERE sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId) AND courseID = @NewCourseId",
                            new { SourceSubjectId = sourceSubjectId, NewCourseId = newCourseId },
                            transaction);
                    }
                    else
                    {
                        var subjectParams = new
                        {
                            NewCourseId = newCourseId,
                            SourceCourseId = sourceCourseId,
                            SourceSubjectId = sourceSubjectId
                        };

                        await db.ExecuteAsync(CurriculumQueries.ImportSubjects, subjectParams, transaction);

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
                    }

                    // Check if topic already exists in branch
                    var topicExists = await db.QueryFirstOrDefaultAsync<int>(
                        CurriculumQueries.CheckTopicExistsInBranch,
                        new { SourceTopicId = topicId, BranchId = request.BranchId },
                        transaction);

                    int newTopicId;
                    if (topicExists > 0)
                    {
                        newTopicId = await db.QueryFirstOrDefaultAsync<int>(
                            "SELECT TopicID FROM subject_topics WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId) AND SubjectID = @NewSubjectId",
                            new { SourceTopicId = topicId, NewSubjectId = newSubjectId },
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
                            SourceSubjectId = sourceSubjectId
                        };

                        await db.ExecuteAsync(CurriculumQueries.ImportTopics, topicParams, transaction);

                        newTopicId = await db.QuerySingleAsync<int>(
                            "SELECT LAST_INSERT_ID()",
                            transaction);

                        addedCount++;
                        isNewTopic = true;
                    }

                    // Import study materials for this topic
                    //var sourceStudyMaterials = await db.QueryAsync<dynamic>(
                    //    "SELECT studymaterialId FROM tblstudymaterial WHERE courseId = @SourceCourseId AND subjectId = @SourceSubjectId AND topicId = @SourceTopicId",
                    //    new { SourceCourseId = sourceCourseId, SourceSubjectId = sourceSubjectId, SourceTopicId = topicId },
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
                    //            SourceSubjectId = sourceSubjectId,
                    //            SourceTopicId = topicId
                    //        };

                    //        await db.ExecuteAsync(CurriculumQueries.ImportStudyMaterials, studyMaterialParams, transaction);
                    //    }
                    //}

                    // Handle course-level fee redistribution for IsCourseLvl = 1 courses
                    var isCourseLvlCheck = await db.QueryFirstOrDefaultAsync<int>(
                        SubjectQueries.CheckCourseIsCourseLvl,
                        new { CourseId = sourceCourseId },
                        transaction);

                    if (isCourseLvlCheck == 1)
                    {
                        await RedistributeCourseFeesAsync((int)newCourseId, db, transaction);
                    }
                }

                transaction.Commit();

                if (addedCount == totalCount)
                {
                    return (true, "Topic(s) added successfully.", addedCount, totalCount);
                }
                else if(!isNewTopic)
                {
                    return (false, "Topics with same name already exist in branch.", addedCount, totalCount);
                }
                else
                {
                    return (true, "Topic(s) added successfully. Topics with same name already exist in branch.", addedCount, totalCount);
                }             
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error adding institute topics: {ex.Message}", 0, totalCount);
            }
        }

        public async Task<int> GetNextTopicSequenceAsync(int subjectId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryFirstOrDefaultAsync<int>(TopicQueries.GetMaxTopicSequence, new { SubjectId = subjectId });
            return result + 1;
        }

        public async Task<(bool Success, string Message)> ExportTopicAsync(List<int> topicIds, int instituteId, List<int> branchIds)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                bool isNewTopic = false;
                int totalExportedCount = 0;
                List<int> exportedCurriculumIds = new List<int>();
                List<int> exportedCourseIds = new List<int>();
                List<int> exportedSubjectIds = new List<int>();
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

                // Collect all topics to export (handling IsCourseLvl = 1)
                HashSet<int> allTopicsToExport = new HashSet<int>();
                Dictionary<int, List<int>> courseSubjectsMap = new Dictionary<int, List<int>>();

                foreach (int topicId in topicIds)
                {
                    // Get topic info
                    var topicInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        TopicQueries.GetTopicSubjectId,
                        new { TopicId = topicId },
                        transaction);

                    if (topicInfo == null)
                    {
                        failureDetails.Add($"Topic ID {topicId} not found");
                        continue;
                    }

                    int subjectId = (int)topicInfo.SubjectID;
                    int courseId = (int)topicInfo.CourseID;

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
                                allTopicsToExport.Add((int)topic.TopicID);
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
                        // Just export the selected topic
                        allTopicsToExport.Add(topicId);
                    }
                }

                // Export all collected topics
                foreach (int topicId in allTopicsToExport)
                {
                    // Get topic info
                    var topicInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        TopicQueries.GetTopicSubjectId,
                        new { TopicId = topicId },
                        transaction);

                    if (topicInfo == null)
                    {
                        failureDetails.Add($"Topic ID {topicId} not found");
                        continue;
                    }

                    int subjectId = (int)topicInfo.SubjectID;
                    int courseId = (int)topicInfo.CourseID;

                    // Get subject info
                    var subjectInfo = await db.QueryFirstOrDefaultAsync<dynamic>(
                        "SELECT sub_Name, courseID FROM tbl_subject WHERE subID = @SubjectId",
                        new { SubjectId = subjectId },
                        transaction);

                    if (subjectInfo == null)
                    {
                        failureDetails.Add($"Subject for topic not found");
                        continue;
                    }

                    string subjectName = subjectInfo.sub_Name;

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
                        int? newSubjectId = null;

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
                            // Get existing subject ID in branch
                            newSubjectId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT subID FROM tbl_subject WHERE sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId) AND courseID = @NewCourseId",
                                new { SourceSubjectId = subjectId, NewCourseId = newCourseId },
                                transaction);
                        }
                        else
                        {
                            // Import subject - always import specific subject for this topic (matching AddInstituteTopicsAsync pattern)
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

                        int newTopicId;
                        if (topicExists > 0)
                        {
                            newTopicId = await db.QueryFirstOrDefaultAsync<int>(
                                "SELECT TopicID FROM subject_topics WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId) AND SubjectID = @NewSubjectId",
                                new { SourceTopicId = topicId, NewSubjectId = newSubjectId },
                                transaction);
                        }
                        else
                        {
                            var topicParams = new
                            {
                                NewSubjectId = newSubjectId,
                                InstituteId = instituteId,
                                BranchId = branchId,
                                NewCourseId = newCourseId,
                                SourceSubjectId = subjectId
                            };

                            await db.ExecuteAsync(CurriculumQueries.ImportTopics, topicParams, transaction);

                            newTopicId = await db.QuerySingleAsync<int>(
                                "SELECT LAST_INSERT_ID()",
                                transaction);

                            isNewTopic = true;
                        }

                        // Import study materials for this topic
                        //                  var sourceStudyMaterials = await db.QueryAsync<dynamic>(
                        //                      @"SELECT studymaterialId
                        //FROM tblstudymaterial
                        //WHERE courseId = @SourceCourseId
                        //  AND subjectId = @SourceSubjectId
                        //  AND topicId = @SourceTopicId",
                        //                      new
                        //                      {
                        //                          SourceCourseId = courseId,
                        //                          SourceSubjectId = subjectId,
                        //                          SourceTopicId = topicId
                        //                      },
                        //                      transaction);

                        //                  foreach (var sourceStudyMaterial in sourceStudyMaterials)
                        //                  {
                        //                      int sourceStudyMaterialId = Convert.ToInt32(sourceStudyMaterial.studymaterialId);

                        //                      var studyMaterialExists = await db.QueryFirstOrDefaultAsync<int>(
                        //                          CurriculumQueries.CheckStudyMaterialExistsInBranch,
                        //                          new
                        //                          {
                        //                              SourceStudyMaterialId = sourceStudyMaterialId,
                        //                              BranchId = branchId
                        //                          },
                        //                          transaction);

                        //                      if (studyMaterialExists == 0)
                        //                      {
                        //                          var studyMaterialParams = new
                        //                          {
                        //                              InstituteId = instituteId,
                        //                              BranchId = branchId,
                        //                              NewCourseId = newCourseId,
                        //                              NewSubjectId = newSubjectId,
                        //                              NewTopicId = newTopicId,
                        //                              SourceCourseId = courseId,
                        //                              SourceSubjectId = subjectId,
                        //                              SourceTopicId = topicId
                        //                          };

                        //                          await db.ExecuteAsync(
                        //                              CurriculumQueries.ImportStudyMaterials,
                        //                              studyMaterialParams,
                        //                              transaction);
                        //                      }
                        //                  }

                        totalExportedCount++;
                        if (isNewTopic)
                        {
                            totalExportedCount++;
                            successDetails.Add($"Topic exported to branch '{branchNames[branchId]}' successfully");
                        }
                        else
                        {
                            return (false, "No topics exported. Topics may already exist in target branches.");
                        }
                    }
                }

                transaction.Commit();

                // Build detailed message
                string message = "";
                if (totalExportedCount > 0)
                {
                    message += $"Export Summary: {totalExportedCount} topic export(s) successful\n";
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
                        message += $"\nNote: {exportedCurriculumIds.Count} curriculum{(exportedCurriculumIds.Count > 1 ? "s" : "")} also exported due to topic-curriculum relationship\n";
                    }
                    if (exportedCourseIds.Count > 0)
                    {
                        message += $"\nNote: {exportedCourseIds.Count} course{(exportedCourseIds.Count > 1 ? "s" : "")} also exported due to topic-course relationship\n";
                    }
                    if (exportedSubjectIds.Count > 0)
                    {
                        message += $"\nNote: {exportedSubjectIds.Count} subject{(exportedSubjectIds.Count > 1 ? "s" : "")} also exported due to topic-subject relationship\n";
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
                    return (false, message.Trim() != "" ? message.Trim() : "No topics exported. Topics may already exist in target branches.");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error exporting topic: {ex.Message}");
            }
        }
    }
}
