namespace IM_backend.SqlQueries
{
    public class SubjectQueries
    {
        public const string GetSubjects = @"
            SELECT s.subID AS SubId, s.sub_Name AS SubName,
                c.course_name AS CourseName,
                cu.crclmName AS CurriculumName,
                IF(s.CourseEndDate <> '0001-01-01','',
                    IF(s.feestype='M',CONCAT(s.NoOfMonths,' ',IF(s.NoofMonths > 1,'Months','Month')),
                    CONCAT(s.Duration,' ',
                        IF((s.Duration_Type = 0),'',
                        IF((s.Duration_Type = 1),'Year',
                        IF((s.Duration_Type = 2),'Month',
                        IF((s.Duration_Type = 3),'Days',
                        IF((s.Duration_Type = 4),'Hours','Sessions')))))))) AS DurationFull,
                IF(c.IscourseLvl=0,Round(s.fees,2),0) AS ActualFees,
             CASE
    WHEN c.courseFeeWise = 2 THEN 'Sessionwise'
    WHEN c.IscourseLvl <> 0 THEN 'Coursewise'
    WHEN s.feestype IN ('S', 'Full Subject Fees') THEN 'Subjectwise'
    WHEN s.feestype IN ('M', 'Monthly') THEN 'Monthly'
    WHEN s.feestype IN ('H', 'Hourly') THEN 'Hourly'
    ELSE ''
END AS SubjectType,     IF(s.statusflag='1','Active','Inactive') AS Status,
                s.refsubid, c.branchid, s.description,
                IF(s.Taxable=1,'Yes','No') AS Taxable,
                IF(s.Taxable=1,IF(s.Including_Tax,'Including','Excluding'),'') AS TaxType,
                c.courseFeeWise, s.adhocSub AS AdhocSub
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            LEFT JOIN tbl_curriculum cu ON cu.crclmId = c.crclmId
            LEFT JOIN branch b ON c.BranchID = b.branchid
            WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
                AND c.instituteid = @InstituteId
                AND c.branchid = @BranchId {0}
                AND c.StatusFlag=1
            {1}
            LIMIT @PageSize OFFSET @Offset";

        // Search subjects count
        public const string GetSubjectsCount = @"
            SELECT COUNT(*)
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            LEFT JOIN tbl_curriculum cu ON cu.crclmId = c.crclmId
            LEFT JOIN branch b ON c.BranchID = b.branchid
            WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
                AND c.instituteid = @InstituteId
                AND c.branchid = @BranchId {0}
                AND c.StatusFlag=1";

        // Count branch references for institute subjects
        public const string CountBranchReferences = @"
            SELECT COUNT(c.branchid)
            FROM tbl_subject s
            JOIN tbl_course c ON s.courseId = c.courseId
            WHERE s.refsubid = @RefSubId";

        // Get subject by ID with all details
        public const string GetSubjectById = @"
    SELECT 
        s.subID AS SubId,
        s.courseID AS CourseId,
        s.sub_Name AS SubName,
        s.Description,
        s.Duration,
        s.Duration_Type AS DurationType,
        s.Fees,
        s.Taxable,
        s.Including_Tax AS IncludingTax,
        s.Allow_Installment AS AllowInstallment,
        s.Max_Installment AS MaxInstallment,
        s.Allow_Prorated AS AllowProrated,
        s.FeesType,
        s.StatusFlag AS Status,
        s.RefSubId AS RefSubId,
        c.crclmId AS CrclmId,
      CAST(s.DurationSubType AS SIGNED) AS SubFeesType,
        s.NoofMonths,
         DATE_FORMAT(s.CourseEndDate, '%Y-%m-%d') AS CourseEndDate,

        c.StatusFlag AS CourseStatus,
        c.IscourseLvl AS IsCourseLevel,
        s.adhocSub AS AdhocSub,

        pt.PaymentTemplateId AS PaymentTemplateId,
        COALESCE(pt.templatedurationtype, 0) AS TemplateType,
        COALESCE(pt.noofdays, 0) AS NoofDays,
        COALESCE(pt.statusflag, 0) AS TemplateStatus,

        CASE 
            WHEN pt.PaymentTemplateId IS NOT NULL
            THEN TRUE
            ELSE FALSE
        END AS IsCreateTemplate

    FROM tbl_subject s

    LEFT JOIN tbl_course c 
        ON s.courseId = c.courseId

    LEFT JOIN paymenttemplatesubject pts
        ON pts.SubjectId = s.subID

    LEFT JOIN paymenttemplates pt
        ON pt.PaymentTemplateId = pts.PaymentTemplateId

    WHERE s.subID = @SubjectId";

        public const string GetPaymentTemplateDetailsBySubjectId = @"
    SELECT
        ptd.noofday AS NoOfDay,
        ptd.amount AS Amount
    FROM paymenttemplatedetails ptd
    INNER JOIN paymenttemplatesubject pts
        ON pts.PaymentTemplateId = ptd.PaymentTemplateId
    WHERE pts.SubjectId = @SubjectId
    ORDER BY ptd.noofday";
        // Check if adhoc subject has students assigned
        public const string CheckAdhocSubjectHasStudents = @"
            SELECT COUNT(ss.studid) AS studCount
            FROM student_subjects ss
            INNER JOIN tbl_subject ts ON ss.SubjectId = ts.subID
            WHERE ts.adhocSub = 1 AND ss.SubjectID = @SubjectId";

        // Get payment template details for subject
        public const string GetTemplateDetailsSubject = @"
            SELECT pt.paymenttemplateid AS PaymentTemplateId, pt.templatedurationtype AS TemplateDurationType, pt.noofdays AS NoofDays, pt.statusflag AS StatusFlag,branchid,instituteid,ptc.subjectid 
            FROM paymenttemplates pt
            INNER JOIN paymenttemplatesubject ptc ON pt.PaymentTemplateId = ptc.PaymentTemplateId
            WHERE ptc.SubjectId = @SubjectId";

        // Get template installments
        public const string GetTemplateInstallments = @"
            SELECT noofday AS NoOfDay, amount AS Amount
            FROM paymenttemplatedetails
            WHERE paymenttemplateid = @PaymentTemplateId";

        // Check duplicate subject
        public const string CheckDuplicateSubject = @"
            SELECT COUNT(*)
            FROM tbl_subject
            WHERE sub_Name = @SubName
                AND courseID = @CourseId
                AND subID <> COALESCE(@SubjectId, 0)";

        // Insert new subject
        public const string InsertSubject = @"
            INSERT INTO tbl_subject(courseID,sub_Name,Description,Duration,Duration_Type,Fees,Taxable,Including_Tax,Allow_Installment,Max_Installment,allow_prorated,FeesType,DurationSubType,NoofMonths,CourseEndDate,adhocSub)
            VALUES(@CourseId,@SubName,@Description,@Duration,@DurationType,@Fees,@Taxable,@IncludingTax,@AllowInstallment,@MaxInstallment,@AllowProrated,@FeesType,@SubFeesType,@NoofMonths,@CourseEndDate,@AdhocSub);
            SELECT LAST_INSERT_ID();";

        // Update subject
        public const string UpdateSubject = @"
            UPDATE tbl_subject
            SET 
courseID = @CourseId,
sub_Name = @SubName,
                Description = @Description,
                Duration = @Duration,
                Duration_Type = @DurationType,
                Fees = @Fees,
                Taxable = @Taxable,
                Including_Tax = @IncludingTax,
                Allow_Installment = @AllowInstallment,
                Max_Installment = @MaxInstallment,
                Allow_Prorated = @AllowProrated,
                FeesType = @FeesType,
                StatusFlag = @Status,
                DurationSubType = @SubFeesType,
                NoofMonths = @NoofMonths,
                CourseEndDate = @CourseEndDate,
                adhocSub = @AdhocSub
            WHERE subID = @SubjectId";

        // Soft delete subject
        public const string SoftDeleteSubject = @"
            UPDATE tbl_subject
            SET StatusFlag = 0
            WHERE subID = @SubjectId";

        // Hard delete subject
        public const string HardDeleteSubject = @"
            DELETE FROM tbl_subject WHERE subID = @SubjectId";

        // Deactivate online tests for subject
        public const string DeactivateOnlineTestsForSubject = @"
            UPDATE onlinetests SET IsActive = 0
            WHERE OnlineTestID IN (SELECT DISTINCT OnlineTestID FROM testsquestions WHERE SubjectId = @SubjectId)";

        // Delete student subjects without payment
        public const string DeleteStudentSubjectsNoPayment = @"
            DELETE FROM student_subjects WHERE subjectID = @SubjectId AND payment_id = 0";

        // Delete test subjects
        public const string DeleteTestSubjects = @"
            DELETE FROM testsubject WHERE subjectID = @SubjectId";

        // Delete trainer subjects
        public const string DeleteTrainerSubjects = @"
            DELETE FROM trainersubject WHERE subjectID = @SubjectId";

        // Delete batch subjects
        public const string DeleteBatchSubjects = @"
            DELETE FROM batchsubject WHERE subjectID = @SubjectId";

        // Delete payment template details for subject
        public const string DeletePaymentTemplateDetailsForSubject = @"
            DELETE FROM paymenttemplatedetails
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubjectId)";

        // Delete payment templates for subject
        public const string DeletePaymentTemplatesForSubject = @"
            DELETE FROM paymenttemplates
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubjectId)";

        // Delete payment template subject links
        public const string DeletePaymentTemplateSubjectLinks = @"
            DELETE FROM paymenttemplatesubject WHERE subjectid = @SubjectId";

        // Get course subjects info after delete
        public const string GetCourseSubjectsInfo = @"
            SELECT tc.IscourseLvl, ts.subID, ts.StatusFlag, ts.Fees, tc.courseFees
            FROM tbl_subject ts
            INNER JOIN tbl_course tc ON ts.courseID = tc.courseID
            WHERE ts.courseid = @CourseId";

        // Update subject fee to zero
        public const string UpdateSubjectFeeToZero = @"
            UPDATE tbl_subject SET Fees = 0 WHERE subID = @SubId";

        // Update subject fee
        public const string UpdateSubjectFee = @"
            UPDATE tbl_subject SET Fees = @Fees WHERE subID = @SubId";

        // Check subject has related records
        public const string CheckSubjectRecords = @"
            SELECT COUNT(*) FROM (
                SELECT 1 FROM testsquestions qt WHERE qt.subjectId = @SubjectId
                UNION
                SELECT 1 FROM student_subjects ss WHERE ss.subjectId = @SubjectId AND ss.FeesType <> 'Other' AND ss.isScheduled = 'Y'
                UNION
                SELECT 1 FROM payment p
                JOIN direct_payment dp ON p.Payment_Id = dp.Payment_Id
                WHERE dp.Subject_Id = @SubjectId AND dp.FeesType <> 'Other'
                UNION
                SELECT 1 FROM payment p
                JOIN payment_installments pi ON p.Payment_Id = pi.Payment_Id
                JOIN installments_subject isub ON pi.Installment_id = isub.Installment_Id
                WHERE isub.Subject_Id = @SubjectId
                UNION
                SELECT 1 FROM testsubject ts
                JOIN test t ON ts.testid = t.testid
                JOIN tbl_subject tsub ON ts.subjectid = tsub.subID
                WHERE ts.subjectid = @SubjectId AND tsub.StatusFlag = 1
                UNION
                SELECT 1 FROM testresultid tri
                JOIN test t ON tri.testid = t.testid
                JOIN studsubmarks ssm ON tri.ID = ssm.ResID
                JOIN testsubject tes ON ssm.subjectid = tes.subjectid AND ssm.testid = tes.testid
                JOIN tbl_subject ts ON ssm.subjectid = ts.subID
                WHERE tes.subjectid = @SubjectId AND ts.StatusFlag = 1
            ) AS records";

        // Get course info for subject
        public const string GetCourseInfoSubwise = @"
            SELECT c.courseid, c.IscourseLvl, c.courseFees,
                (SELECT COUNT(*) FROM tbl_subject WHERE courseid = c.courseid) AS subcount,
                (SELECT GROUP_CONCAT(subId) FROM tbl_subject WHERE courseid = c.courseid AND subId <> @SubjectId) AS subIds,
                c.cTaxable, c.cIncluding_Tax, c.cAllow_Installment, c.cMax_Installment
            FROM tbl_course c
            WHERE c.courseid = (SELECT courseID FROM tbl_subject WHERE subID = @SubjectId)";

        // Update subject fee by ID
        public const string UpdateSubFeeBySubId = @"
            UPDATE tbl_subject
            SET Fees = @Fees,
                Taxable = @Taxable,
                Including_Tax = @IncludingTax,
                Allow_Installment = @AllowInstallment,
                Max_Installment = @MaxInstallment,
                StatusFlag = @Status
            WHERE subID = @SubId";

        // Update subject fees for other subjects in course
        public const string UpdateSubjectFeesForCourse = @"
            UPDATE tbl_subject
            SET Fees = @Fees
            WHERE courseID = @CourseId
                AND subID <> @SubjectId";

        // Get courses for session-wise subjects
        public const string SQLCourseSession = @"
            SELECT c.courseID, c.course_Name
            FROM tbl_course c
            WHERE c.instituteid = @InstituteId
                AND c.branchid = @BranchId
                AND c.StatusFlag = 1
                AND c.courseFeeWise = 2";

        // Get courses
        public const string SQLCourse = @"
            SELECT c.courseID, c.course_Name
            FROM tbl_course c
            WHERE c.instituteid = @InstituteId
                AND c.branchid = @BranchId
                AND c.StatusFlag = 1";

        // Get institute courses for import
        public const string SqlInstCourse = @"
            SELECT c.courseID, c.course_Name, c.courseID AS RefCourseId
            FROM tbl_course c
            WHERE c.instituteid = @InstituteId
                AND c.branchid = 0
                AND c.StatusFlag = 1";

        // Insert institute subjects to branch
        public const string InsertInstituteSubject = @"
            INSERT INTO tbl_subject (courseID, sub_Name, Description, Duration, Duration_Type,
                Fees, Taxable, Including_Tax, Allow_Installment, Max_Installment,
                Allow_Prorated, FeesType, StatusFlag, SubFeesType, NoofMonths, CourseEndDate,
                instituteid, branchid, adhocSub, RefSubId)
            SELECT @CourseId, sub_Name, Description, Duration, Duration_Type,
                Fees, Taxable, Including_Tax, Allow_Installment, Max_Installment,
                Allow_Prorated, FeesType, StatusFlag, SubFeesType, NoofMonths, CourseEndDate,
                @InstituteId, @BranchId, adhocSub, subID
            FROM tbl_subject
            WHERE subID IN ({0})";

        // Check if course is adhoc
        public const string CheckAdhocCourse = @"
            SELECT adhocCourse
            FROM tbl_course
            WHERE courseID = @CourseId";

        // Get reference subjects for branch update
        public const string GetReferenceSubjects = @"
            SELECT subid, BranchID, courseID, Fees
            FROM tbl_subject
            WHERE refSubId = @SubjectId";

        // Update reference subject
        public const string UpdateReferenceSubject = @"
            UPDATE tbl_subject
            SET sub_Name = @SubName,
                Description = @Description,
                Duration = @Duration,
                Duration_Type = @DurationType,
                Fees = @Fees,
                Taxable = @Taxable,
                Including_Tax = @IncludingTax,
                Allow_Installment = @AllowInstallment,
                Max_Installment = @MaxInstallment,
                Allow_Prorated = @AllowProrated,
                FeesType = @FeesType,
                StatusFlag = @Status,
                adhocSub = @AdhocSub
            WHERE refSubId = @SubjectId";

        // Insert subject audit log
        public const string InsertSubjectAuditUpdate = @"
            INSERT INTO tbl_subject_audit
            (subID, courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax,
             Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
             NoofMonths, CourseEndDate, updateBy, updateDate, updateIpAddress, ActionType)
            SELECT subID, courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax,
                   Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
                   NoofMonths, CourseEndDate, @UserId, @UpdateDate, @IpAddress, 'Update'
            FROM tbl_subject
            WHERE subID IN ({0})";

        // Insert subject audit log for delete
        public const string InsertSubjectAuditDelete = @"
            INSERT INTO tbl_subject_audit
            (subID, courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax,
             Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
             NoofMonths, CourseEndDate, delBy, delDate, ipAddress, ActionType)
            SELECT subID, courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax,
                   Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
                   NoofMonths, CourseEndDate, @UserId, @DeleteDate, @IpAddress, 'Delete'
            FROM tbl_subject
            WHERE subID = @SubjectId";

        // Get course subjects with course level info for fee redistribution
        public const string GetCourseSubjectsForFeeRedistribution = @"
            SELECT tc.IscourseLvl, ts.subID, ts.StatusFlag, ts.Fees, tc.courseFees
            FROM tbl_subject ts
            INNER JOIN tbl_course tc ON ts.courseID = tc.courseID
            WHERE ts.courseid = @CourseId";

        // Insert payment template
        public const string InsertPaymentTemplate = @"
            INSERT INTO paymenttemplates (templatetype, templatename, templatedurationtype, noofdays, statusflag, branchid, instituteid)
            VALUES (1, 'Plan 1', @TemplateType, @NoofDays, @TemplateStatus, @BranchId, @InstituteId);
            SELECT LAST_INSERT_ID();";

        // Link payment template to subject
        public const string LinkPaymentTemplateToSubject = @"
            INSERT INTO paymenttemplatesubject (paymenttemplateid, subjectid)
            VALUES (@PaymentTemplateId, @SubjectId)";

        // Insert payment template details
        public const string InsertPaymentTemplateDetails = @"
            INSERT INTO paymenttemplatedetails (paymenttemplateid, noofday, amount)
            VALUES (@PaymentTemplateId, @NoOfDay, @Amount)";

        // Delete payment template details by template id
        public const string DeletePaymentTemplateDetails = @"
            DELETE FROM paymenttemplatedetails WHERE paymenttemplateid = @PaymentTemplateId";

        // Delete payment template course links by template id
        public const string DeletePaymentTemplateCourses = @"
            DELETE FROM paymenttemplatecourses WHERE paymenttemplateid = @PaymentTemplateId";

        // Delete payment template subject links by template id
        public const string DeletePaymentTemplateSubjectLinksById = @"
            DELETE FROM paymenttemplatesubject WHERE paymenttemplateid = @PaymentTemplateId";

        // Get payment template for subject
        public const string GetPaymentTemplateForSubject = @"
            SELECT pt.paymenttemplateid AS PaymentTemplateId, pt.templatedurationtype AS TemplateDurationType,
                pt.noofdays AS NoofDays, pt.statusflag AS StatusFlag, pt.branchid AS BranchId, pt.instituteid AS InstituteId
            FROM paymenttemplates pt
            INNER JOIN paymenttemplatesubject pts ON pt.paymenttemplateid = pts.paymenttemplateid
            WHERE pts.subjectid = @SubjectId";

        // Get reference subjects with branch info
        public const string GetReferenceSubjectsWithBranch = @"
            SELECT *
            FROM tbl_subject 
            WHERE refsubid = @SubjectId";

        // Delete payment template by id
        public const string DeletePaymentTemplateById = @"
            DELETE FROM paymenttemplates WHERE paymenttemplateid = @PaymentTemplateId";

        public const string GetInstituteSubjects = @"
            SELECT s.subID AS SubId, s.sub_Name AS SubName, c.course_Name AS CourseName,
                CONCAT(s.Duration, ' ',
                    IF((s.Duration_Type = 0), '',
                    IF((s.Duration_Type = 1), 'Year',
                    IF((s.Duration_Type = 2), 'Month',
                    IF((s.Duration_Type = 3), 'Days',
                    IF((s.Duration_Type = 4), 'Hours', 'Sessions')))))) AS DurationFull,
                s.Fees AS ActualFees,
                IF(s.FeesType='S','Subjectwise',IF(s.FeesType='M','Monthly','Hourly')) AS SubjectType
            FROM tbl_subject s
            JOIN tbl_course c ON s.courseID = c.courseID
            WHERE c.instituteid = @InstituteId
                AND s.StatusFlag = 1
                AND c.branchid = 0
            AND (
    @CourseId = 0
    OR c.courseid = IF(@RefCourseId = 0, @CourseId, @RefCourseId)
)
AND (@CrclmId = 0 OR c.crclmId = @CrclmId)
AND (
    @CourseId = 0
    OR s.subID NOT IN (
        SELECT RefSubId
        FROM tbl_subject
        WHERE courseId = @CourseId
    )
)
                {0}
                LIMIT @PageSize OFFSET @Offset";
        //ORDER BY c.course_name, s.sub_name";

        public const string GetInstituteSubjectsCount = @"
    SELECT COUNT(*)
    FROM tbl_subject s
    JOIN tbl_course c ON s.courseID = c.courseID
    WHERE c.instituteid = @InstituteId
        AND s.StatusFlag = 1
        AND c.branchid = 0
        AND (
            @CourseId = 0
            OR c.courseid = IF(@RefCourseId = 0, @CourseId, @RefCourseId)
        )
        AND (@CrclmId = 0 OR c.crclmId = @CrclmId)
        AND (
            @CourseId = 0
            OR s.subID NOT IN (
                SELECT RefSubId
                FROM tbl_subject
                WHERE courseId = @CourseId
            )
        )";
        // Check duplicate subject for import (by name and course only)
        public const string CheckDuplicateInstituteSubjects = @"
            SELECT COUNT(sub_name)
            FROM tbl_subject
            WHERE sub_Name = @SubName
                AND subid NOT IN (@SubjectId)
                AND courseid = @CourseId";

        // Insert institute subject by copying from reference
        public const string InsertInstituteSubjectCopy = @"
            INSERT INTO tbl_subject(courseid,sub_name,description,duration,duration_type,fees,taxable,including_tax,allow_installment,max_installment,allow_prorated,FeesType,StatusFlag,refsubid,DurationSubType,NoofMonths,CourseEndDate,adhocSub)
            SELECT @CourseId as courseid,sub_name,description,duration,duration_type,fees,taxable,including_tax,allow_installment,max_installment,allow_prorated,FeesType,StatusFlag,subid,DurationSubType,NoofMonths,CourseEndDate,adhocSub
            FROM tbl_subject
            WHERE courseid = @RefCourseId and subid = @InstSubId;
            SELECT LAST_INSERT_ID();";

        // Get payment templates for source subjects
        public const string GetPaymentTemplatesForSourceSubjects = @"
            SELECT pt.*
            FROM paymenttemplates pt
            WHERE pt.paymenttemplateid IN (SELECT ptc.paymenttemplateid FROM paymenttemplatesubject ptc WHERE ptc.subjectid IN ({0}))";

        // Copy payment template
        public const string CopyPaymentTemplate = @"
            INSERT INTO paymenttemplates(templatetype,templatename,templatedurationtype,noofdays,statusflag,branchid,instituteid)
            SELECT templatetype,templatename,templatedurationtype,noofdays,statusflag,@BranchId,instituteid
            FROM paymenttemplates
            WHERE paymenttemplateid = @SourceTemplateId;
            SELECT LAST_INSERT_ID();";

        // Link payment template to new subject
        public const string LinkPaymentTemplateToNewSubject = @"
            INSERT INTO paymenttemplatesubject(paymenttemplateid,subjectid)
            VALUES (@NewTemplateId, @NewSubjectId)";

        // Copy payment template details
        public const string CopyPaymentTemplateDetails = @"
            INSERT INTO paymenttemplatedetails(paymenttemplateid,noofday,amount)
            SELECT @NewTemplateId,noofday,amount
            FROM paymenttemplatedetails
            WHERE paymenttemplateid = @SourceTemplateId";

        // Subject export queries
        public const string GetSubjectCourseId = @"
            SELECT courseID
            FROM tbl_subject
            WHERE subID = @SubjectId";

        public const string CheckSubjectExistsInBranchForExport = @"
            SELECT COUNT(*)
            FROM tbl_subject s
            INNER JOIN tbl_course c ON s.courseID = c.courseID
            WHERE s.sub_Name = (SELECT sub_Name FROM tbl_subject WHERE subID = @SourceSubjectId)
            AND c.branchid = @BranchId";

        public const string CheckCourseExistsInBranchForSubjectExport = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId)
            AND branchid = @BranchId";

        public const string CheckCurriculumExistsInBranchForSubjectExport = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId)
            AND branchid = @BranchId";

        public const string ImportSubjectForExport = @"
            INSERT INTO tbl_subject (courseID, sub_Name, Description, Duration, Duration_Type, Fees,
                                    Taxable, Including_Tax, Allow_Installment, Max_Installment,
                                    Allow_Prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
                                    NoofMonths, CourseEndDate, adhocSub)
            SELECT @NewCourseId, sub_Name, Description, Duration, Duration_Type, Fees,
                   Taxable, Including_Tax, Allow_Installment, Max_Installment,
                   Allow_Prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
                   NoofMonths, CourseEndDate, adhocSub
            FROM tbl_subject
            WHERE subID = @SourceSubjectId;
            SELECT LAST_INSERT_ID();";

        public const string ImportTopicsForSubjectExport = @"
            INSERT INTO subject_topics (SubjectID, TopicName, Remark, TopicDuration, TopicDurId,
                                       IsActive, InstituteId, BranchId, CourseId, RefTopicId,CrclmId)
            SELECT @NewSubjectId, TopicName, Remark, TopicDuration, TopicDurId,
                   IsActive, @InstituteId, @BranchId, @NewCourseId, TopicID,CrclmId
            FROM subject_topics
            WHERE SubjectID = @SourceSubjectId;
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

        public const string CheckCourseIsCourseLvl = @"
            SELECT IscourseLvl
            FROM tbl_course
            WHERE courseID = @CourseId";

        public const string GetAllSubjectsForCourse = @"
            SELECT subID, sub_Name
            FROM tbl_subject
            WHERE courseID = @CourseId AND StatusFlag = 1";

        public const string ImportSingleCourse = @"
            INSERT INTO tbl_course (course_Name, Duration, Duration_Type, Description, InstituteID, BranchID, refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse)
            SELECT course_Name, Duration, Duration_Type, Description, @InstituteId, @BranchId, courseID, StatusFlag, IscourseLvl, courseFees, @NewCrclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse
            FROM tbl_course
            WHERE courseID = @SourceCourseId;
            SELECT LAST_INSERT_ID();";

        public const string GetInstituteSubjectsByCourseCrclm = @"
            SELECT s.subID AS SubId, s.sub_Name AS SubName, c.course_Name AS CourseName,
                CONCAT(s.Duration, ' ',
                    IF((s.Duration_Type = 0), '',
                    IF((s.Duration_Type = 1), 'Year',
                    IF((s.Duration_Type = 2), 'Month',
                    IF((s.Duration_Type = 3), 'Days',
                    IF((s.Duration_Type = 4), 'Hours', 'Sessions')))))) AS DurationFull,
                s.Fees AS ActualFees,
                IF(s.FeesType='S','Subjectwise',IF(s.FeesType='M','Monthly','Hourly')) AS SubjectType,
                cu.CrclmName as CurriculumName
            FROM tbl_subject s
            JOIN tbl_course c ON s.courseID = c.courseID
            LEFT JOIN tbl_curriculum cu ON cu.crclmId = c.crclmId
            WHERE c.instituteid = @InstituteId
              -- AND s.StatusFlag = 1 
              AND c.StatusFlag=1
              AND c.branchid = 0
              AND (@BindAllCourses = 1 OR c.courseid IN @CourseIds)
              AND (@BindAllCrclm = 1 OR c.crclmId IN @CrclmId)
              -- AND s.subID NOT IN (SELECT RefSubId FROM tbl_subject WHERE c.branchid = @BranchId)
              {0}
              LIMIT @PageSize OFFSET @Offset";

        public const string GetInstituteSubjectsByCourseCrclmCount = @"
            SELECT COUNT(*)
            FROM tbl_subject s
            JOIN tbl_course c ON s.courseID = c.courseID
            LEFT JOIN tbl_curriculum cu ON cu.crclmId = c.crclmId
            WHERE c.instituteid = @InstituteId
              -- AND s.StatusFlag = 1 
              AND c.StatusFlag=1
              AND c.branchid = 0
              AND (@BindAllCourses = 1 OR c.courseid IN @CourseIds)
              AND (@BindAllCrclm = 1 OR c.crclmId IN @CrclmId)
              -- AND s.subID NOT IN (SELECT RefSubId FROM tbl_subject WHERE c.branchid = @BranchId)";
    }
}