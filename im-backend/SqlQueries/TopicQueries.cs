namespace IM_backend.SqlQueries
{
    public class TopicQueries
    {
        // Search topics with filters
        public const string SearchTopics = @"
           SELECT
                s.SubjectID,
                s.TopicID,
                c.course_name AS CourseName,
                ts.sub_Name AS SubName,
                cur.crclmname AS CurriculumName,
                s.TopicSeqNum,
                s.TopicName AS TopicName,
                s.topicduration AS TopicDuration,
                s.ModifiedDt,
                s.refTopicID AS RefTopicID,
                s.IsActive
            FROM tbl_subject ts
            JOIN subject_topics s ON ts.subid = s.subjectid
            JOIN tbl_course c ON ts.courseID = c.courseID
            JOIN tbl_curriculum cur ON c.crclmId = cur.crclmId
            WHERE s.instituteid = @InstituteId
                AND s.branchid = @BranchId
                AND ts.statusflag = 1
                AND c.statusflag = 1
                {0}
            {1}
            LIMIT @PageSize OFFSET @Offset";

        // Search topics count
        public const string SearchTopicsCount = @"
            SELECT COUNT(*)
            FROM tbl_subject ts
            JOIN subject_topics s ON ts.subid = s.subjectid
            JOIN tbl_course c ON ts.courseID = c.courseID
            JOIN tbl_curriculum cur ON c.crclmId = cur.crclmId
            WHERE s.instituteid = @InstituteId
                AND s.branchid = @BranchId
                AND ts.statusflag = 1
                AND c.statusflag = 1
                {0};";

        // Get topic by ID
        public const string GetTopicById = @"
            SELECT
                s.*,
                c.crclmId AS CurriculumId
            FROM subject_topics s
            JOIN tbl_course c ON s.courseID = c.courseID
            WHERE s.TopicID = @TopicId";

        // Check if topic has reference topics (for institute level)
        public const string CheckReferenceTopics = @"
            SELECT COUNT(*)
            FROM subject_topics
            WHERE refTopicId = @TopicId AND instituteId = @InstituteId";

        // Check duplicate topic
        public const string CheckDuplicateTopic = @"
            SELECT COUNT(*)
            FROM subject_topics
            WHERE topicname = @TopicName
                AND SubjectID = @SubjectId
                AND (TopicID <> @TopicId OR @TopicId = 0);";

        // Check duplicate topic sequence number
        public const string CheckDuplicateTopicSeqNum = @"
            SELECT COUNT(TopicSeqNum)
            FROM subject_topics
            WHERE SubjectID = @SubjectId
                AND InstituteID = @InstituteId
                AND BranchID = @BranchId
             AND TopicSeqNum = @TopicSeqNum
                AND TopicID <> COALESCE(@TopicId, 0)";

        // Insert topic
        public const string InsertTopic = @"
            INSERT INTO subject_topics(SubjectID,CourseID,TopicName,TopicDuration,TopicDurID,Remark,TopicSeqNum,InstituteID,BranchID,IsActive,CrclmId)
            VALUES(@SubjectId,@CourseId,@TopicName,@TopicDuration,@TopicDurId,@Remark,@TopicSeqNum,@InstituteId,@BranchId,@IsActive,@CrclmId);
            SELECT LAST_INSERT_ID();";

        // Update topic
        public const string UpdateTopic = @"
            UPDATE subject_topics
            SET CourseID = @CourseId,
                SubjectID = @SubjectId,
                TopicSeqNum = @TopicSeqNum,
                topicname = @TopicName,
                topicduration = @TopicDuration,
                TopicDurID = @TopicDurId,
                Remark = @Remark,
                IsActive = @IsActive,
                ModifiedDt = @ModifiedDt,
                CrclmId = @CrclmId
            WHERE TopicID = @TopicId";

        // Delete topic
        public const string DeleteAssignmentTopic = @"
            DELETE FROM assignment WHERE asstopicid = @TopicId";

        public const string DeleteBatchTopic = @"
            DELETE FROM batchtopic WHERE topicid = @TopicId";

        public const string DeleteTopic = @"
            DELETE FROM subject_topics WHERE topicid = @TopicId";

        public const string DeleteAttendanceTopic = @"
            DELETE FROM attendancetopic WHERE TopicId = @TopicId";

        // Check if topic has attendance records
        public const string CheckTopicAttendance = @"
            SELECT COUNT(*)
            FROM attendancetopic
            WHERE TopicId = @TopicId";

        // Get institute level topics for import
        public const string GetInstituteTopicsForImport = @"
            SELECT st.TopicID, st.topicname AS TopicName, c.course_name AS CourseName,
                s.sub_Name AS SubName, st.TopicSeqNum, st.topicduration AS TopicDuration
            FROM subject_topics st
            INNER JOIN tbl_subject s ON st.SubjectID = s.subID
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE c.instituteid = @InstituteId
                AND st.IsActive = 1
                AND c.branchid = 0
                AND c.courseid = @RefCourseId
                AND st.TopicID NOT IN (SELECT RefTopicId FROM subject_topics WHERE CourseID = @CourseId)
            ORDER BY c.course_name, s.sub_name, st.TopicSeqNum";

        // Check duplicate topic for import
        public const string CheckDuplicateTopicForImport = @"
            SELECT COUNT(topicname)
            FROM subject_topics
            WHERE topicname = @TopicName
                AND TopicID NOT IN (@TopicId)
                AND SubjectID = @SubjectId";

        // Insert institute topic by copying from reference
        public const string InsertInstituteTopicCopy = @"
            INSERT INTO subject_topics(CourseID,SubjectID,TopicSeqNum,topicname,topicduration,UnitID,Remark,IsActive,InstituteID,BranchID,refTopicID)
            SELECT @CourseId as CourseID,SubjectID,TopicSeqNum,topicname,topicduration,UnitID,Remark,IsActive,@InstituteId,@BranchId,TopicID
            FROM subject_topics
            WHERE CourseID = @RefCourseId and TopicID = @InstTopicId;
            SELECT LAST_INSERT_ID();";

        // Update reference topics (reflect in all branches)
        public const string UpdateReferenceTopic = @"
            UPDATE subject_topics
            SET CourseID = @CourseId,
                SubjectID = @SubjectId,
                TopicSeqNum = @TopicSeqNum,
                topicname = @TopicName,
                topicduration = @TopicDuration,
                UnitID = @UnitId,
                Remark = @Remark,
                IsActive = @IsActive,
                ModifiedDt = @ModifiedDt
            WHERE refTopicID = @TopicId";

        // Check institute level subjects exist
        public const string CheckInstituteLevelSubjects = @"
            SELECT DISTINCT s.subID, s.sub_Name
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE c.instituteid = @InstituteId
                AND c.branchid = 0
                AND s.StatusFlag = 1
                AND EXISTS (SELECT 1 FROM subject_topics st WHERE st.SubjectID = s.subID)";

        // Fill institute level topics
        public const string FillInstituteLevelTopics = @"
            SELECT st.TopicId,
                ts.subID AS SubjectId,
                ts.CourseId,
                tc.course_Name AS CourseName,
                ts.sub_Name AS SubName,
                st.TopicSeqNum,
                st.TopicName,
                st.Remark,
                st.TopicDuration,
                tc.refcourseid AS RefCourseId,
                ts.refSUbId AS RefSubId,
                tc.BranchId
            FROM subject_topics st
            JOIN tbl_subject ts
                ON ts.subID = st.SubjectID
            LEFT JOIN tbl_course tc
                ON tc.courseID = ts.courseID
            LEFT JOIN subject_topics stt
                ON stt.refTopicId = st.TopicId
                AND stt.branchid = @BranchId
            WHERE st.InstituteId = @InstituteId
                AND st.Branchid = 0
                {0}
                {1}
                LIMIT @PageSize OFFSET @Offset";
        public const string FillInstituteLevelTopicsCount = @"
            SELECT COUNT(*)
            FROM subject_topics st
            JOIN tbl_subject ts
                ON ts.subID = st.SubjectID
            LEFT JOIN tbl_course tc
                ON tc.courseID = ts.courseID
            WHERE st.InstituteId = @InstituteId
                AND st.Branchid = 0
                AND st.Topicid NOT IN (
                    SELECT stt.refTopicId
                    FROM subject_topics stt
                    WHERE stt.branchid = @BranchId
        )
        {0}";
        // Check existing topic in branch
        public const string CheckExistingTopic = @"
            SELECT COUNT(TopicName) FROM subject_topics
            WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicId = @TopicId AND SubjectID = @SubjectId AND courseID = @CourseId)
                AND BranchId = @BranchId";

        // Check existing topic without subject/course
        public const string CheckExistingTopicSimple = @"
            SELECT COUNT(TopicName) FROM subject_topics
            WHERE TopicName = (SELECT TopicName FROM subject_topics WHERE TopicId = @TopicId)
                AND BranchId = @BranchId";

        // Fetch branch subject/course by ref subject id
        public const string FetchBranchSubjectCourse = @"
            SELECT ts.subId, tc.courseid FROM tbl_course tc
            INNER JOIN tbl_subject ts ON tc.CourseId = ts.courseid
            WHERE Refsubid = @RefSubjectId AND branchid = @BranchId";

        // Add existing topic to branch
        public const string AddExistingTopic = @"
            INSERT INTO subject_topics (SubjectID, TopicName, TopicDuration, TopicDurID, Remark, InstituteId, Branchid, CourseID, refTopicID, TopicSeqNum)
            SELECT @SubjectId, TopicName, TopicDuration, TopicDurID, Remark, InstituteId, @BranchId AS branchid, @CourseId, TopicID, TopicSeqNum
            FROM subject_topics WHERE TopicId = @TopicId;
            SELECT LAST_INSERT_ID()";

        // Get topic details by TopicId for institute level topics
        public const string GetTopicDetailsById = @"
            SELECT st.TopicId, ts.subID AS SubjectId, ts.CourseId, tc.course_Name AS CourseName,
                ts.sub_Name AS SubName, TopicSeqNum, TopicName, st.Remark, st.TopicDuration,
                tc.refcourseid AS RefCourseId, ts.refSUbId AS RefSubId, tc.BranchId
            FROM subject_topics st
            JOIN tbl_subject ts ON ts.subID = st.SubjectID
            LEFT JOIN tbl_course tc ON tc.courseID = ts.courseID
            WHERE st.TopicId = @TopicId";

        // Get max topic sequence number
        public const string GetMaxTopicSequence = @"
            SELECT COALESCE(MAX(TopicSeqNum), 0) AS MaxSeqNum
            FROM subject_topics
            WHERE SubjectID = @SubjectId";

        // Topic export queries
        public const string GetTopicSubjectId = @"
            SELECT SubjectID, CourseID
            FROM subject_topics
            WHERE TopicID = @TopicId";

        public const string CheckTopicExistsInBranchForExport = @"
            SELECT COUNT(*)
            FROM subject_topics st
            INNER JOIN tbl_subject s ON st.SubjectID = s.subID
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE st.TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId)
            AND c.branchid = @BranchId";

        public const string CheckSubjectExistsInBranchForTopicExport = @"
            SELECT COUNT(*)
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE s.sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId)
            AND c.branchid = @BranchId";

        public const string CheckCourseExistsInBranchForTopicExport = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId)
            AND branchid = @BranchId";

        public const string CheckCurriculumExistsInBranchForTopicExport = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId)
            AND branchid = @BranchId";

        public const string ImportTopicForExport = @"
            INSERT INTO subject_topics (SubjectID, TopicName, Remark, TopicDuration, TopicDurId,
                                       IsActive, InstituteId, BranchId, CourseId, RefTopicId,CrclmId)
            SELECT @NewSubjectId, TopicName, Remark, TopicDuration, TopicDurId,
                   IsActive, @InstituteId, @BranchId, @NewCourseId, TopicID,CrclmId
            FROM subject_topics
            WHERE TopicID = @SourceTopicId;
            SELECT LAST_INSERT_ID();";

        public const string ImportStudyMaterialsForTopicExport = @"
            INSERT INTO tblStudyMaterial (instituteId, branchId, courseId, subjectId, topicId, heading,
                                        studyMaterialHtml, isActive, addedIP, addedBy, addedDate,
                                        attachment_original_name, attachment_stored_name, attachment_path,
                                        attachment_extension, attachment_size, attachment_mime_type, CrclmId)
            SELECT @InstituteId, @BranchId, @NewCourseId, @NewSubjectId, @NewTopicId, heading,
                   studyMaterialHtml, isActive, @AddedIP, @AddedBy, NOW(),
                   attachment_original_name, attachment_stored_name, attachment_path,
                   attachment_extension, attachment_size, attachment_mime_type, @CrclmId
            FROM tblStudyMaterial
            WHERE topicId = @SourceTopicId AND courseId = @SourceCourseId AND subjectId = @SourceSubjectId";

        public const string GetInstituteTopicsByCourseCrclmSubject = @"
            SELECT st.TopicID, st.topicname AS TopicName, c.course_name AS CourseName,
                s.sub_Name AS SubName, st.TopicSeqNum, st.topicduration AS TopicDuration, cur.CrclmName as CurriculumName
            FROM subject_topics st
            INNER JOIN tbl_subject s ON st.SubjectID = s.subID
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            INNER JOIN tbl_curriculum cur ON c.crclmId = cur.crclmId
            WHERE c.instituteid = @InstituteId
              AND st.IsActive = 1
              AND c.branchid = 0
              AND s.statusflag = 1 AND c.statusflag = 1
              AND (@BindAllCourses = 1 OR c.courseid IN @CourseIds)
              AND (@BindAllSubjects = 1 OR st.SubjectID IN @SubjectIds)
              AND (@BindAllCrclm = 1 OR c.crclmId IN @CrclmId)
              AND st.TopicID NOT IN (SELECT RefTopicId FROM subject_topics WHERE branchid = @BranchId)
              {0}
              LIMIT @PageSize OFFSET @Offset";

        public const string GetInstituteTopicsByCourseCrclmSubjectCount = @"
            SELECT COUNT(*)
            FROM subject_topics st
            INNER JOIN tbl_subject s ON st.SubjectID = s.subID
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            INNER JOIN tbl_curriculum cur ON c.crclmId = cur.crclmId
            WHERE c.instituteid = @InstituteId
              AND st.IsActive = 1 AND s.statusflag = 1 AND c.statusflag = 1
              AND c.branchid = 0
              AND (@BindAllCourses = 1 OR c.courseid IN @CourseIds)
              AND (@BindAllSubjects = 1 OR st.SubjectID IN @SubjectIds)
              AND (@BindAllCrclm = 1 OR c.crclmId IN @CrclmId)
              AND st.TopicID NOT IN (SELECT RefTopicId FROM subject_topics WHERE branchid = @BranchId);";
    }
}
