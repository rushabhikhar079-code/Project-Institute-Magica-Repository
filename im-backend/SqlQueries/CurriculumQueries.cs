namespace IM_backend.SqlQueries
{
    public class CurriculumQueries
    {
        public const string GetCurriculums = @"
            SELECT crclmId, crclmName, crclmDesc, crclmStatus, refcrclmId
            FROM tbl_curriculum
            WHERE branchid = @BranchId AND instituteId = @InstituteId {0}
            {1}
            LIMIT @PageSize OFFSET @Offset";

        public const string GetCurriculumsCount = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE branchid = @BranchId AND instituteId = @InstituteId {0}";

        // Get curriculum details by ID
        public const string GetCurriculumById = @"
            SELECT crclmId, crclmName, crclmDesc, crclmStatus, refcrclmId, branchid, InstituteId
            FROM tbl_curriculum
            WHERE crclmId = @CrclmId";

        // Check duplicate curriculum name
        public const string CheckDuplicateCurriculum = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE crclmName = @CrclmName
            AND branchid = @BranchId
            AND instituteid = @InstituteId
            AND (crclmId <> @CrclmId OR @CrclmId = 0)";

        // Check if curriculum can be deleted (has related records)
        public const string CheckCurriculumHasRelations = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE crclmId = @CrclmId";

        // Insert new curriculum
        public const string InsertCurriculum = @"
            INSERT INTO tbl_curriculum (crclmName, crclmDesc, crclmStatus, branchid, instituteId, refcrclmId)
            VALUES (@CrclmName, @CrclmDesc, @CrclmStatus, @BranchId, @InstituteId, 0);
            SELECT LAST_INSERT_ID();";

        // Update existing curriculum
        public const string UpdateCurriculum = @"
            UPDATE tbl_curriculum
            SET crclmName = @CrclmName,
                crclmDesc = @CrclmDesc,
                crclmStatus = @CrclmStatus
            WHERE crclmId = @CrclmId";

        // Delete curriculum
        public const string DeleteCurriculum = @"
            DELETE FROM tbl_curriculum WHERE crclmId = @CrclmId";

        // Get institute curriculums for import
        public const string GetInstituteCurriculumsForImport = @"
            SELECT crclmId, crclmName, crclmDesc, crclmStatus
            FROM tbl_curriculum
            WHERE instituteId = @InstituteId 
            AND branchid = 0
            AND crclmId not in(Select refcrclmId from tbl_curriculum where branchId=@branchId)
            {0}
            LIMIT @PageSize OFFSET @Offset";

        public const string GetInstituteCurriculumsForImportCount = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE instituteId = @InstituteId 
            AND branchid = 0
            AND crclmId not in(Select refcrclmId from tbl_curriculum where branchId=@branchId);";

        // Check if curriculum already exists in branch (for import)
        public const string CheckCurriculumExistsInBranch = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId)
            AND branchid = @BranchId";

        // Import curriculum from institute to branch
        public const string ImportCurriculum = @"
            INSERT INTO tbl_curriculum (crclmName, crclmDesc, crclmStatus, branchid, instituteId, refcrclmId)
            SELECT crclmName, crclmDesc, crclmStatus, @BranchId, @InstituteId, @SourceCrclmId
            FROM tbl_curriculum
            WHERE crclmId = @SourceCrclmId;
            SELECT LAST_INSERT_ID();";

        // Import courses for a curriculum
        public const string ImportCourses = @"
            INSERT INTO tbl_course (course_Name, Duration, Duration_Type, Description, InstituteID, BranchID, refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse)
            SELECT course_Name, Duration, Duration_Type, Description, @InstituteId, @BranchId, courseID, StatusFlag, IscourseLvl, courseFees, @NewCrclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse
            FROM tbl_course
            WHERE courseID = @SourceCourseId AND StatusFlag = 1;
            SELECT LAST_INSERT_ID();";

        // Import subjects for courses
        public const string ImportSubjects = @"
            INSERT INTO tbl_subject (courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax, Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType, NoofMonths, CourseEndDate, adhocSub)
            SELECT @NewCourseId, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax, Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, subID, DurationSubType, NoofMonths, CourseEndDate, adhocSub
            FROM tbl_subject
            WHERE courseID = @SourceCourseId AND StatusFlag = 1
            AND (@SourceSubjectId IS NULL OR @SourceSubjectId = 0 OR subID = @SourceSubjectId);
            SELECT LAST_INSERT_ID();";

        // Import topics for subjects
        public const string ImportTopics = @"
            INSERT INTO subject_topics (SubjectID, TopicName, TopicDuration, TopicDurID, Remark, InstituteId, Branchid, ModifiedDt, CourseID, refTopicID, TopicSeqNum, IsActive)
            SELECT @NewSubjectId, TopicName, TopicDuration, TopicDurID, Remark, @InstituteId, @BranchId, ModifiedDt, @NewCourseId, TopicID, TopicSeqNum, IsActive
            FROM subject_topics
            WHERE SubjectID = @SourceSubjectId AND IsActive = 1;
            SELECT LAST_INSERT_ID();";

        // Import study materials for topics
        public const string ImportStudyMaterials = @"
            INSERT INTO tblstudymaterial (instituteId, branchId, courseId, subjectId, topicId, heading, isActive, addedBy, addedIP, addedDate, updatedBy, updatedIP, updatedDate, studymaterialHtml, attachment_original_name, attachment_stored_name, attachment_path, attachment_extension, attachment_size, attachment_mime_type)
            SELECT @InstituteId, @BranchId, @NewCourseId, @NewSubjectId, @NewTopicId, heading, isActive, addedBy, addedIP, addedDate, updatedBy, updatedIP, updatedDate, studymaterialHtml, attachment_original_name, attachment_stored_name, attachment_path, attachment_extension, attachment_size, attachment_mime_type
            FROM tblstudymaterial
            WHERE courseId = @SourceCourseId AND subjectId = @SourceSubjectId AND topicId = @SourceTopicId;
            SELECT LAST_INSERT_ID();";

        // Check if course already exists in branch (for import/export)
        public const string CheckCourseExistsInBranch = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId)
            AND branchid = @BranchId";

        // Check if subject already exists in branch (for import/export)
        public const string CheckSubjectExistsInBranch = @"
            SELECT COUNT(*)
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE s.sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId)
            AND c.branchid = @BranchId";

        // Check if topic already exists in branch (for import/export)
        public const string CheckTopicExistsInBranch = @"
            SELECT COUNT(*)
            FROM subject_topics st
            INNER JOIN tbl_subject s ON st.SubjectID = s.subID
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE st.TopicName = (SELECT TopicName FROM subject_topics WHERE TopicID = @SourceTopicId)
            AND c.branchid = @BranchId";

        // Check if study material already exists in branch (for import/export)
        public const string CheckStudyMaterialExistsInBranch = @"
            SELECT COUNT(*)
            FROM tblstudymaterial sm
            INNER JOIN tbl_course c ON sm.courseId = c.courseid
            WHERE sm.heading = (SELECT heading FROM tblstudymaterial WHERE studymaterialId = @SourceStudyMaterialId)
            AND c.branchid = @BranchId";

        public const string ImportSingleCourse = @"
            INSERT INTO tbl_course (course_Name, Duration, Duration_Type, Description, InstituteID, BranchID, refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse)
            SELECT course_Name, Duration, Duration_Type, Description, @InstituteId, @BranchId, courseID, StatusFlag, IscourseLvl, courseFees, @NewCrclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse
            FROM tbl_course
            WHERE courseID = @SourceCourseId AND StatusFlag = 1;
            SELECT LAST_INSERT_ID();";
    }
}
