namespace IM_backend.SqlQueries
{
    public class StudyMaterialQueries
    {
        public static string GetStudyMaterials = @"
        SELECT
            sm.studymaterialId AS StudymaterialId,
            sm.instituteId AS InstituteId,
            sm.branchId AS BranchId,
            sm.courseId AS CourseId,
            sm.subjectId AS SubjectId,
            sm.topicId AS TopicId,
            sm.heading AS Heading,
            sm.isActive AS IsActive,
            tc.course_Name AS CourseName,
            ts.sub_Name AS SubjectName,
            cur.crclmname AS CurriculumName,
            st.TopicName AS TopicName,
   sm.attachment_original_name AS AttachmentOriginalName,

            (CASE WHEN sm.isActive = 1 THEN 'Active' ELSE 'Inactive' END) AS ActiveStatus
        FROM tblStudyMaterial sm
        INNER JOIN tbl_course tc ON sm.courseId = tc.courseid
        INNER JOIN tbl_subject ts ON sm.subjectId = ts.subID
        INNER JOIN tbl_curriculum cur ON tc.crclmId = cur.crclmId
        LEFT JOIN subject_topics st ON sm.topicId = st.TopicID
        WHERE sm.instituteId = @InstituteId
          AND (@BranchId = 0 OR sm.branchId = @BranchId)
          AND (@CourseId IS NULL OR sm.courseId = @CourseId)
          AND (@SubjectId IS NULL OR sm.subjectId = @SubjectId)
          AND (@TopicId IS NULL OR st.TopicId = @TopicId)
          AND (@Heading IS NULL OR sm.heading LIKE @Heading)
          AND (@Status IS NULL OR sm.isActive = @Status)
       {0}
        LIMIT @PageSize OFFSET @Offset;";

        public static string GetStudyMaterialsCount = @"
        SELECT COUNT(1)
        FROM tblStudyMaterial sm
        INNER JOIN tbl_course tc ON sm.courseId = tc.courseid
        INNER JOIN tbl_subject ts ON sm.subjectId = ts.subID
        LEFT JOIN subject_topics st ON sm.topicId = st.TopicID
        WHERE sm.instituteId = @InstituteId
          AND (@BranchId = 0 OR sm.branchId = @BranchId)
          AND (@CourseId IS NULL OR sm.courseId = @CourseId)
          AND (@SubjectId IS NULL OR sm.subjectId = @SubjectId)
          AND (@TopicId IS NULL OR st.TopicId = @TopicId)
          AND (@Heading IS NULL OR sm.heading LIKE @Heading)
          AND (@Status IS NULL OR sm.isActive = @Status);";

        public static string CheckDuplicate = @"
        SELECT COUNT(1) 
        FROM tblStudyMaterial 
        WHERE instituteId = @InstituteId 
          AND heading = @Heading 
          AND (@StudyMaterialId = 0 OR studymaterialId <> @StudyMaterialId);";

        public static string InsertStudyMaterial = @"
        INSERT INTO tblStudyMaterial (
            instituteId, branchId, courseId, subjectId, topicId, heading, 
            studyMaterialHtml, isActive, addedIP, addedBy, addedDate, 
            attachment_original_name, 
            attachment_stored_name, attachment_path, attachment_extension, 
            attachment_size, attachment_mime_type, CrclmId
        ) VALUES (
            @InstituteId, @BranchId, @CourseId, @SubjectId, @TopicId, @Heading, 
            @StudyMaterialHtml, @IsActive, @IpAddress, @UserId, NOW(), 
            @AttachmentOriginalName, 
            @AttachmentStoredName, @AttachmentPath, @AttachmentExtension, 
            @AttachmentSize, @AttachmentMimeType, @CrclmId
        );";

        public static string UpdateStudyMaterial = @"
    UPDATE tblStudyMaterial SET
        courseId = @CourseId,
        subjectId = @SubjectId,
        topicId = @TopicId,
        heading = @Heading,
        studyMaterialHtml = @StudyMaterialHtml,
        isActive = @IsActive,
        updatedIP = @IpAddress,
        updatedBy = @UserId,
        updatedDate = NOW(),

        attachment_original_name =
            CASE
                WHEN @AttachmentRemoved = 1 THEN NULL
                WHEN @AttachmentOriginalName IS NOT NULL THEN @AttachmentOriginalName
                ELSE attachment_original_name
            END,

        attachment_stored_name =
            CASE
                WHEN @AttachmentRemoved = 1 THEN NULL
                WHEN @AttachmentStoredName IS NOT NULL THEN @AttachmentStoredName
                ELSE attachment_stored_name
            END,

        attachment_path =
            CASE
                WHEN @AttachmentRemoved = 1 THEN NULL
                WHEN @AttachmentPath IS NOT NULL THEN @AttachmentPath
                ELSE attachment_path
            END,

        attachment_extension =
            CASE
                WHEN @AttachmentRemoved = 1 THEN NULL
                WHEN @AttachmentExtension IS NOT NULL THEN @AttachmentExtension
                ELSE attachment_extension
            END,

        attachment_size =
            CASE
                WHEN @AttachmentRemoved = 1 THEN NULL
                WHEN @AttachmentSize IS NOT NULL THEN @AttachmentSize
                ELSE attachment_size
            END,

        attachment_mime_type =
            CASE
                WHEN @AttachmentRemoved = 1 THEN NULL
                WHEN @AttachmentMimeType IS NOT NULL THEN @AttachmentMimeType
                ELSE attachment_mime_type
            END,

        CrclmId = @CrclmId

    WHERE studymaterialId = @StudyMaterialId
      AND instituteId = @InstituteId;";
        public static string GetStudyMaterialById = @"
        SELECT 
            sm.studymaterialId AS StudymaterialId,
            sm.instituteId AS InstituteId,
            sm.branchId AS BranchId,
            sm.courseId AS CourseId,
            sm.subjectId AS SubjectId,
sm.CrclmId AS CrclmId,
            sm.topicId AS TopicId,
            sm.heading AS Heading,
            sm.studyMaterialHtml AS StudyMaterialHtml,
     sm.isActive AS IsActive,

     sm.attachment_original_name AS AttachmentOriginalName,
     sm.attachment_stored_name AS AttachmentStoredName,
     sm.attachment_path AS AttachmentPath,
     sm.attachment_extension AS AttachmentExtension,
     sm.attachment_size AS AttachmentSize,
     sm.attachment_mime_type AS AttachmentMimeType

        FROM tblStudyMaterial sm
        WHERE sm.studymaterialId = @StudyMaterialId;";
        public static string GetStudyMaterialAttachmentPath = @"
    SELECT attachment_path
    FROM tblStudyMaterial
    WHERE studymaterialId = @StudyMaterialId
      AND instituteId = @InstituteId;";
        public static string DeleteStudyMaterial = @"
        DELETE FROM tblStudyMaterial 
        WHERE studymaterialId=@StudyMaterialId";

        // Study material export queries
        public static string GetStudyMaterialTopicInfo = @"
            SELECT topicId, subjectId, courseId, crclmId
            FROM tblStudyMaterial
            WHERE studymaterialId = @StudyMaterialId";

        public static string CheckStudyMaterialExistsInBranchForExport = @"
            SELECT COUNT(*)
            FROM tblStudyMaterial sm
            INNER JOIN tbl_course c ON sm.courseId = c.courseid
            WHERE sm.heading = (SELECT heading FROM tblStudyMaterial WHERE studymaterialId = @SourceStudyMaterialId)
            AND c.branchid = @BranchId";

        public static string CheckTopicExistsInBranchForStudyMaterialExport = @"
            SELECT COUNT(*)
            FROM subject_topics st
            INNER JOIN tbl_subject s ON st.SubjectID = s.subID
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE st.TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId)
            AND c.branchid = @BranchId";

        public static string CheckSubjectExistsInBranchForStudyMaterialExport = @"
            SELECT COUNT(*)
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE s.sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId)
            AND c.branchid = @BranchId";

        public static string CheckCourseExistsInBranchForStudyMaterialExport = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId)
            AND branchid = @BranchId";

        public static string CheckCurriculumExistsInBranchForStudyMaterialExport = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId)
            AND branchid = @BranchId";

        public static string ImportStudyMaterialForExport = @"
            INSERT INTO tblStudyMaterial (instituteId, branchId, courseId, subjectId, topicId, heading,
                                        studyMaterialHtml, isActive, addedIP, addedBy, addedDate,
                                        attachment_original_name, attachment_stored_name, attachment_path,
                                        attachment_extension, attachment_size, attachment_mime_type, CrclmId)
            SELECT @InstituteId, @BranchId, @NewCourseId, @NewSubjectId, @NewTopicId, heading,
                   studyMaterialHtml, isActive, @AddedIP, @AddedBy, NOW(),
                   attachment_original_name, attachment_stored_name, attachment_path,
                   attachment_extension, attachment_size, attachment_mime_type, @CrclmId
            FROM tblStudyMaterial
            WHERE studymaterialId = @SourceStudyMaterialId";

        // Study material import queries
        public static string GetStudyMaterialsForImport = @"
        SELECT
            sm.studymaterialId AS StudymaterialId,
            sm.instituteId AS InstituteId,
            sm.branchId AS BranchId,
            sm.courseId AS CourseId,
            sm.subjectId AS SubjectId,
            sm.topicId AS TopicId,
            sm.heading AS Heading,
            sm.isActive AS IsActive,
            tc.course_Name AS CourseName,
            ts.sub_Name AS SubjectName,
            cur.crclmname AS CurriculumName,
            st.TopicName AS TopicName,
            sm.attachment_original_name AS AttachmentOriginalName
        FROM tblStudyMaterial sm
        INNER JOIN tbl_course tc ON sm.courseId = tc.courseid
        INNER JOIN tbl_subject ts ON sm.subjectId = ts.subID
        INNER JOIN tbl_curriculum cur ON tc.crclmId = cur.crclmId
        LEFT JOIN subject_topics st ON sm.topicId = st.TopicID
        WHERE sm.instituteId = @InstituteId
          AND sm.branchId <> @BranchId
       {0}
        LIMIT @PageSize OFFSET @Offset";

        public static string GetStudyMaterialsForImportCount = @"
        SELECT COUNT(1)
        FROM tblStudyMaterial sm
        INNER JOIN tbl_course tc ON sm.courseId = tc.courseid
        INNER JOIN tbl_subject ts ON sm.subjectId = ts.subID
        LEFT JOIN subject_topics st ON sm.topicId = st.TopicID
        WHERE sm.instituteId = @InstituteId
          AND sm.branchId <> @BranchId";

        public static string CheckStudyMaterialExistsInBranch = @"
            SELECT COUNT(*)
            FROM tblStudyMaterial sm
            INNER JOIN tbl_course c ON sm.courseId = c.courseid
            WHERE sm.heading = (SELECT heading FROM tblStudyMaterial WHERE studymaterialId = @SourceStudyMaterialId)
            AND c.branchid = @BranchId";

        public static string ImportStudyMaterial = @"
            INSERT INTO tblStudyMaterial (instituteId, branchId, courseId, subjectId, topicId, heading,
                                        studyMaterialHtml, isActive, addedIP, addedBy, addedDate,
                                        attachment_original_name, attachment_stored_name, attachment_path,
                                        attachment_extension, attachment_size, attachment_mime_type, CrclmId)
            SELECT @InstituteId, @BranchId, courseId, subjectId, topicId, heading,
                   studyMaterialHtml, isActive, @AddedIP, @AddedBy, NOW(),
                   attachment_original_name, attachment_stored_name, attachment_path,
                   attachment_extension, attachment_size, attachment_mime_type, CrclmId
            FROM tblStudyMaterial
            WHERE studymaterialId = @SourceStudyMaterialId";
    }
}
