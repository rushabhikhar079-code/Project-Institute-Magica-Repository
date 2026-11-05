namespace IM_backend.SqlQueries
{
    public class CourseQueries
    {
        public const string GetCourses = @"SELECT c.courseID,c.course_Name,IF(c.duration=0,'',CONCAT(c.Duration,' ',IF(c.Duration_Type=1,'Year',IF(c.Duration_Type=2,'Month',IF(c.Duration_Type=3,'Days',IF(c.Duration_Type=4,'Hours','Session')))))) AS Duration,
            IF(c.StatusFlag=1,'Active','Inactive') AS STATUS,c.refcourseid,c.branchid,c.description,c.crclmId,cu.crclmName AS curriculum_name,c.courseFees, c.cTaxable,
        c.cIncluding_Tax,coursetype,hsncode 
            FROM tbl_course c LEFT JOIN tbl_curriculum cu ON c.crclmId= cu.crclmId  
            WHERE c.instituteid = @InstituteId AND c.branchid = @BranchId {0}
            {1}
            LIMIT @PageSize OFFSET @Offset;";

        public const string GetCoursesCount = @"
            SELECT Count(*)
            FROM tbl_course c LEFT JOIN tbl_curriculum cu ON c.crclmId= cu.crclmId  
            WHERE c.instituteid = @InstituteId AND c.branchid = @BranchId {0};";

        // Get course details by ID
        public const string GetCourseById = @"
            SELECT   *,
           IF(StatusFlag = 1, 'Active', 'Inactive') AS Status
            FROM tbl_course 
            WHERE courseID = @CourseId";

        // Check duplicate course name
        public const string CheckDuplicateCourse = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = @CourseName 
            AND branchid = @BranchId 
            AND (courseID <> @CourseId OR @CourseId = 0)";

        // Check if course can be deleted (has related records)
        public const string CheckCourseHasRelations = @"
            SELECT COUNT(*)
            FROM tbl_studentcourse
            WHERE courseID = @CourseId";

        // Insert new course
        public const string InsertCourse = @"
            INSERT INTO tbl_course (
                course_name,
                Duration,
                Duration_Type,
                Description,
                InstituteID,
                BranchID,
                IscourseLvl,
                courseFees,
                crclmId,
                cTaxable,
                cIncluding_Tax,
                cAllow_Installment,
                cMax_Installment,
                coursetype,
                hsncode,
                courseFeeWise,
                adhocCourse
            )
            VALUES (
                @CourseName,
                @Duration,
                @DurationType,
                @Description,
                @InstId,
                @BranchId,
                @IsCourseLvl,
                @CourseFee,
                NULLIF(@CrclmId, 0),
                @Taxable,
                @IncludingTax,
                @AllowInstallment,
                @MaxInstallment,
                @Type,
                @Hsncode,
                @CourseFeeWise,
                @AdhocCourse
            );
            SELECT LAST_INSERT_ID();";

        // Update existing course
        public const string UpdateCourse = @"
            UPDATE tbl_course
            SET course_Name = @CourseName,
                Duration = @Duration,
                Duration_Type = @DurationType,
                Description = @Description,
                StatusFlag = @Status,
                IscourseLvl = @IsCourseLvl,
                courseFees = @CourseFee,
                crclmId = NULLIF(@CrclmId, 0),
                cTaxable = @Taxable,
                cIncluding_Tax = @IncludingTax,
                cAllow_Installment = @AllowInstallment,
                cMax_Installment = @MaxInstallment,
                coursetype = @Type,
                hsncode = @Hsncode,
                courseFeeWise = @CourseFeeWise,
                adhocCourse = @AdhocCourse
            WHERE courseID = @CourseId";

        // Delete course
        public const string DeleteCourse = @"
            DELETE FROM tbl_course WHERE courseID = @CourseId";

        // Get institute courses for import
        public const string GetInstituteCoursesForImport = @"
            SELECT 
                c.courseID,
                c.course_Name,
                c.DURATION,
                IF(c.StatusFlag = 1, 'Active', 'Inactive') AS Status,
                IF(ISNULL(tc.crclmName), '', tc.crclmName) AS curriculum_name
            FROM tbl_course c
            LEFT JOIN branch b 
                ON c.branchid = b.branchid
            LEFT JOIN tbl_curriculum tc 
                ON c.crclmId = tc.crclmId
            WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
              AND c.instituteid = @InstituteId
              AND c.branchid = 0
              AND c.courseid NOT IN
              (
                  SELECT refcourseid
                  FROM tbl_course
                  WHERE c.branchid = @BranchId
              )
            {0}
            LIMIT @PageSize OFFSET @Offset";

        public const string GetInstituteCoursesbyCrclmIdForImport = @"
            SELECT 
                c.courseID,
                c.course_Name,
                c.DURATION,
                IF(c.StatusFlag = 1, 'Active', 'Inactive') AS Status,
                IF(ISNULL(tc.crclmName), '', tc.crclmName) AS curriculum_name
            FROM tbl_course c
            LEFT JOIN branch b 
                ON c.branchid = b.branchid
            LEFT JOIN tbl_curriculum tc 
                ON c.crclmId = tc.crclmId
            WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
              AND c.instituteid = @InstituteId
              AND c.branchid = 0 AND c.StatusFlag=1
              AND (@BindAllCrclm = 1 OR c.CrclmId IN @CrclmId)
            {0}
            LIMIT @PageSize OFFSET @Offset";

        public const string GetInstituteCoursesForImportCount = @"
            SELECT COUNT(*)
            FROM tbl_course c
            LEFT JOIN branch b 
                ON c.branchid = b.branchid
            LEFT JOIN tbl_curriculum tc 
                ON c.crclmId = tc.crclmId
            WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
              AND c.instituteid = @InstituteId
              AND c.branchid = 0
              AND c.courseid NOT IN
              (
                  SELECT refcourseid
                  FROM tbl_course
                  WHERE c.branchid = @BranchId
              )";

        public const string GetInstituteCoursesbyCrclmIdForImportCount = @"
            SELECT COUNT(*)
            FROM tbl_course c
            LEFT JOIN branch b 
                ON c.branchid = b.branchid
            LEFT JOIN tbl_curriculum tc 
                ON c.crclmId = tc.crclmId
            WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
              AND c.instituteid = @InstituteId
              AND c.branchid = 0 AND c.StatusFlag=1
              AND (@BindAllCrclm = 1 OR c.CrclmId IN @CrclmId)";

        // Check if course already exists in branch (for import)
        public const string CheckCourseExistsInBranch = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId)
            AND branchid = @BranchId";

        // Import course from institute to branch
        public const string ImportCourse = @"
            INSERT INTO tbl_course (course_name, Description, Duration, duration_type, Status, 
                                    IsCourseLvl, courseFees, crclmId, cTaxable, cIncludingTax, 
                                    cAllow_Installment, cMax_Installment, Type, Hsncode, 
                                    AdhocCourse, courseFeeWise, branchid, instid, refcourseid)
            SELECT course_name, Description, Duration, duration_type, Status, 
                   IsCourseLvl, courseFees, crclmId, cTaxable, cIncludingTax, 
                   cAllow_Installment, cMax_Installment, Type, Hsncode, 
                   AdhocCourse, courseFeeWise, @BranchId, @InstId, @SourceCourseId
            FROM tbl_course
            WHERE courseID = @SourceCourseId;
            SELECT LAST_INSERT_ID();";

        public const string GetIsCalculationRoundOff = @"
            SELECT IsCalculationRoundOff
            FROM config
            WHERE Branch_Id = @BranchId";

        // Get payment template details for a course
        public const string GetPaymentTemplateDetails = @"
               SELECT 
        pt.paymenttemplateid AS PaymentTemplateId,
        pt.templatetype + 0 AS TemplateType,
        pt.templatedurationtype + 0 AS TemplateDurationType,
        pt.noofdays AS NoofDays,
        pt.statusflag AS StatusFlag,
        pt.branchid AS BranchId,
        pt.instituteid AS InstituteId,
        ptc.CourseId AS CourseId
    FROM paymenttemplates pt
    INNER JOIN paymenttemplatecourses ptc 
        ON pt.PaymentTemplateId = ptc.PaymentTemplateId
    WHERE ptc.CourseId = @CourseId;";

        // Get payment template installments
        public const string GetPaymentTemplateInstallments = @"
            SELECT noofday AS DayOfMonth, amount AS Amount
            FROM paymenttemplatedetails ptd
            WHERE ptd.paymenttemplateid = @PaymentTemplateId
            ORDER BY ptd.paymenttemplatedetailsid;";

        public const string CheckAdhocCourseHasStudents = @"
            SELECT COUNT(*)
            FROM tbl_course sc
            INNER JOIN tbl_course c ON sc.courseID = c.courseID
            WHERE c.courseID = @CourseId AND c.adhocCourse = 1";

        // Check if course can be deleted (comprehensive check)
        public const string CheckCourseRecords = @"
            SELECT COUNT(StudId) AS CourseCount
            FROM student_course
            WHERE courseid = @CourseId";

        public const string CheckCourseScheduledSubjects = @"
            SELECT COUNT(c.courseid)
            FROM student_course c
            JOIN tbl_subject s ON c.courseid = s.courseid
            JOIN student_subjects ss ON ss.subjectid = s.subid
            WHERE c.courseid = @CourseId AND ss.isscheduled = 'Y'";

        public const string GetCourseSubjects = @"
            SELECT subId
            FROM tbl_subject
            WHERE courseId = @CourseId";

        public const string CheckSubjectTestQuestions = @"
            SELECT COUNT(qt.QuestionId)
            FROM testsquestions qt
            WHERE qt.subjectId = @SubId";

        public const string CheckSubjectScheduledSubjects = @"
            SELECT COUNT(subjectId)
            FROM student_subjects
            WHERE subjectId = @SubId AND FeesType <> 'Other' AND isScheduled = 'Y'";

        public const string CheckSubjectPayments = @"
            SELECT 
              COUNT(subId) 
            FROM 
              (
                SELECT 
                  b.Instituteid AS instituteid, 
                  b.Branchid AS BranchID, 
                  IF(
                    (r.RegNo_Manual <> ''), 
                    r.RegNo_Manual, 
                    payment.Stud_Id
                  ) AS Student_Id, 
                  payment.Stud_Id AS Reg_No, 
                  payment.Payment_Id AS Payment_Id, 
                  IF(
                    payment.Payment_Id IN (
                      SELECT 
                        payments_received.Payment_Id AS installment_id 
                      FROM 
                        payments_received
                    ), 
                    1, 
                    0
                  ) AS paid, 
                  0 AS Installment_id, 
                  0 AS Installment_No, 
                  _utf8 '01/01/0001' AS Installment_Date, 
                  payment.Basic_Amt AS Basic_Amt, 
                  payment.Disc_Amt AS Disc_Amt, 
                  payment.Tax_Amt AS Tax_Amt, 
                  payment.Tax_Per AS TaxRate, 
                  payment.Remarks AS Remarks, 
                  IF(
                    (
                      payments_received.Manual_ReceiptNo <> _latin1 ''
                    ), 
                    CONVERT(
                      payments_received.Manual_ReceiptNo USING utf8
                    ), 
                    CAST(
                      payments_received.Receipt_No AS CHAR CHARSET utf8
                    )
                  ) AS Receipt_No, 
                  payments_received.Receipt_No AS Receipt_ID, 
                  payments_received.Cheque_No AS Cheque_No, 
                  payments_received.Cheque_Date AS Cheque_Date, 
                  payments_received.Bank AS Bank, 
                  payments_received.Branch_Addr AS Branch_Addr, 
                  payments_received.Pay_Date AS Pay_Date, 
                  direct_payment.Basic_Amt AS Fees, 
                  direct_payment.FeesType AS subjectType, 
                  r.Fname AS Fname, 
                  r.Mname AS Mname, 
                  r.Lname AS Lname, 
                  CONCAT_WS(' ', r.Fname, r.Mname, r.Lname) AS NAME, 
                  r.CorrAddress AS Address, 
                  r.cityC AS city, 
                  r.stateC AS state, 
                  r.RegDate AS regdate, 
                  b.Branchname AS branchname, 
                  b.branch_status AS branch_status, 
                  b.BranchCode AS branchcode, 
                  b.Contactperson AS brcperson, 
                  b.CpMobile AS brcpmobile, 
                  r.PContact AS PContact, 
                  IF(
                    (
                      direct_payment.FeesType = _latin1 'Other'
                    ), 
                    (
                      SELECT 
                        otherfees.of_code AS of_code 
                      FROM 
                        otherfees 
                      WHERE 
                        (
                          otherfees.of_code = direct_payment.Subject_Id
                        )
                    ), 
                    (
                      SELECT 
                        ts.subID AS subid 
                      FROM 
                        tbl_subject ts 
                      WHERE 
                        (
                          ts.subID = direct_payment.Subject_Id
                        )
                    )
                  ) AS subID, 
                  IF(
                    (
                      direct_payment.FeesType = _latin1 'Other'
                    ), 
                    (
                      SELECT 
                        otherfees.of_name AS of_name 
                      FROM 
                        otherfees 
                      WHERE 
                        (
                          otherfees.of_code = direct_payment.Subject_Id
                        )
                    ), 
                    (
                      SELECT 
                        ts.sub_Name AS sub_name 
                      FROM 
                        tbl_subject ts 
                      WHERE 
                        (
                          ts.subID = direct_payment.Subject_Id
                        )
                    )
                  ) AS sub_name, 
                  IF(
                    (
                      direct_payment.FeesType = _latin1 'Other'
                    ), 
                    0, 
                    (
                      SELECT 
                        ts.courseID AS courseid 
                      FROM 
                        tbl_subject ts 
                      WHERE 
                        (
                          ts.subID = direct_payment.Subject_Id
                        )
                    )
                  ) AS courseid, 
                  IF(
                    (
                      direct_payment.FeesType = _latin1 'Other'
                    ), 
                    'Other', 
                    (
                      SELECT 
                        tc.course_Name 
                      FROM 
                        tbl_course tc 
                      WHERE 
                        (
                          tc.courseID IN (
                            SELECT 
                              ts.courseID 
                            FROM 
                              tbl_subject ts 
                            WHERE 
                              (
                                ts.subID = direct_payment.Subject_Id
                              )
                          ) 
                          AND (tc.BranchID = r.BranchID)
                        ) 
                      LIMIT 
                        1
                    )
                  ) AS course_name, 
                  direct_payment.Basic_Amt AS subBasic, 
                  direct_payment.Disc_Amt AS subDisc, 
                  direct_payment.Tax_amt AS subTax, 
                  direct_payment.Tax_Per AS subTaxRate, 
                  direct_payment.Prorated_Amt AS subProratedAmt, 
                  r.StatusFlag AS StatusFlag, 
                  payment.Completed AS completed, 
                  refund.Refund_date AS Refund_Date, 
                  refund.Refund_amt AS Refund_Amt, 
                  refund.refund_id AS Refund_Id, 
                  refund.Remarks AS RefundRemarks, 
                  refund.Cheque_no AS RefCheque_no, 
                  refund.Cheque_date AS RefCheque_Date, 
                  refund.Bank_name AS RefBank, 
                  refund.Branch_Addr AS RefBranchAddr 
                FROM 
                  (
                    (
                      (
                        (
                          (
                            payment 
                            JOIN direct_payment ON(
                              (
                                payment.Payment_Id = direct_payment.Payment_Id
                              )
                            )
                          ) 
                          LEFT JOIN registration r ON(
                            (r.RegNo = payment.Stud_Id)
                          )
                        ) 
                        LEFT JOIN branch b ON(
                          (r.BranchID = b.Branchid)
                        )
                      ) 
                      LEFT JOIN payments_received ON(
                        (
                          payments_received.Payment_Id = payment.Payment_Id
                        )
                      )
                    ) 
                    LEFT JOIN refund ON(
                      (
                        (
                          refund.Receipt_No = payments_received.Receipt_No
                        ) 
                        OR (
                          (
                            payments_received.Manual_ReceiptNo <> NULL
                          ) 
                          AND (
                            payments_received.Manual_ReceiptNo <> ''
                          ) 
                          AND (
                            refund.Receipt_No = payments_received.Manual_ReceiptNo
                          ) 
                          AND (
                            refund.Stud_Id = payments_received.Manual_ReceiptNo
                          )
                        )
                      )
                    )
                  ) 
                UNION 
                SELECT 
                  b.Instituteid AS instituteid, 
                  b.Branchid AS BranchID, 
                  IF(
                    (r.RegNo_Manual <> ''), 
                    r.RegNo_Manual, 
                    payment.Stud_Id
                  ) AS Student_Id, 
                  payment.Stud_Id AS Reg_No, 
                  payment.Payment_Id AS Payment_Id, 
                  IF(
                    payment_installments.Installment_id IN (
                      SELECT 
                        installments_received.Installment_Id AS installment_id 
                      FROM 
                        installments_received
                    ), 
                    1, 
                    0
                  ) AS paid, 
                  payment_installments.Installment_id AS Installment_id, 
                  payment_installments.Installment_No AS Installment_No, 
                  payment_installments.Installment_Date AS Installment_Date, 
                  payment_installments.Basic_Amt AS Basic_Amt, 
                  payment_installments.Disc_Amt AS Disc_Amt, 
                  payment_installments.Tax_Amt AS Tax_Amt, 
                  payment_installments.Tax_Per AS TaxRate, 
                  payment_installments.Remarks AS Remarks, 
                  IF(
                    (
                      installments_received.Manual_ReceiptNo <> _latin1 ''
                    ), 
                    CONVERT(
                      installments_received.Manual_ReceiptNo USING utf8
                    ), 
                    CAST(
                      installments_received.Receipt_No AS CHAR CHARSET utf8
                    )
                  ) AS Receipt_No, 
                  installments_received.Receipt_No AS Receipt_ID, 
                  installments_received.Cheque_No AS Cheque_No, 
                  installments_received.Cheque_Date AS Cheque_Date, 
                  installments_received.Bank AS Bank, 
                  installments_received.Branch_Addr AS Branch_Addr, 
                  installments_received.Pay_Date AS Pay_Date, 
                  ts.Fees AS Fees, 
                  ts.FeesType AS subjectType, 
                  r.Fname AS Fname, 
                  r.Mname AS Mname, 
                  r.Lname AS Lname, 
                  CONCAT_WS(' ', r.Fname, r.Mname, r.Lname) AS NAME, 
                  r.CorrAddress AS Address, 
                  r.cityC AS city, 
                  r.stateC AS state, 
                  r.RegDate AS regdate, 
                  b.Branchname AS branchname, 
                  b.branch_status AS branch_status, 
                  b.BranchCode AS branchcode, 
                  b.Contactperson AS brcperson, 
                  b.CpMobile AS brcpmobile, 
                  r.PContact AS PContact, 
                  ts.subID AS subID, 
                  ts.sub_Name AS sub_name, 
                  ts.courseID AS courseid, 
                  tc.course_Name AS course_name, 
                  installments_subject.Basic_Amt AS subBasic, 
                  installments_subject.Disc_Amt AS subDisc, 
                  installments_subject.Tax_Amt AS subTax, 
                  installments_subject.Tax_Per AS subTaxRate, 
                  0 AS subProratedAmt, 
                  r.StatusFlag AS StatusFlag, 
                  payment.Completed AS completed, 
                  refund.Refund_date AS Refund_Date, 
                  refund.Refund_amt AS Refund_Amt, 
                  refund.refund_id AS Refund_Id, 
                  refund.Remarks AS RefundRemarks, 
                  refund.Cheque_no AS RefCheque_no, 
                  refund.Cheque_date AS RefCheque_Date, 
                  refund.Bank_name AS RefBank, 
                  refund.Branch_Addr AS RefBranchAddr 
                FROM 
                  (
                    (
                      (
                        (
                          (
                            (
                              (
                                (
                                  payment 
                                  JOIN payment_installments ON(
                                    (
                                      payment.Payment_Id = payment_installments.Payment_Id
                                    )
                                  )
                                ) 
                                JOIN installments_subject ON(
                                  (
                                    installments_subject.Installment_Id = payment_installments.Installment_id
                                  )
                                )
                              ) 
                              LEFT JOIN registration r ON(
                                (r.RegNo = payment.Stud_Id)
                              )
                            ) 
                            LEFT JOIN tbl_subject ts ON(
                              (
                                ts.subID = installments_subject.Subject_Id
                              )
                            )
                          ) 
                          LEFT JOIN tbl_course tc ON(
                            (tc.courseID = ts.courseID)
                          )
                        ) 
                        LEFT JOIN branch b ON(
                          (r.BranchID = b.Branchid)
                        )
                      ) 
                      LEFT JOIN installments_received ON(
                        (
                          installments_received.Installment_Id = payment_installments.Installment_id
                        )
                      )
                    ) 
                    LEFT JOIN refund ON(
                      (
                        (
                          installments_received.Receipt_No = refund.Receipt_No
                        ) 
                        OR (
                          installments_received.Manual_ReceiptNo = refund.Receipt_No
                        )
                      )
                    )
                  )
              ) AS a 
            WHERE 
              subId = @SubId 
              AND SubjectType <> 'Other';";


        public const string CheckSubjectTests = @"
            SELECT count(ts.subjectid) FROM test t
            JOIN testsubject ts ON t.testid = ts.testid JOIN tbl_subject tsub ON ts.subjectid = tsub.subID  
            JOIN tbl_course tc ON tc.courseID = tsub.CourseID LEFT JOIN tbl_curriculum tcur ON tcur.crclmId = tc.crclmId 
            LEFT JOIN branch b ON tc.BranchID = b.branchid JOIN institute i ON b.Instituteid= i.Instituteid  
            Where ts.subjectid= @SubId and tsub.StatusFlag= 1  
            UNION 
            SELECT count(tes.subjectid) FROM test t 
            JOIN testresultid tri ON t.testid = tri.testid 
            JOIN studsubmarks ssm ON tri.ID = ssm.ResID  
            JOIN testsubject tes ON ssm.subjectid = tes.subjectid AND ssm.testid = tes.testid 
            JOIN batch bt ON ssm.batchid = bt.batchid JOIN tbl_subject ts ON ssm.subjectid = ts.subID 
            JOIN tbl_course tc ON tc.courseID = ts.courseID JOIN registration r ON ssm.studid = r.RegNo  
            JOIN branch b ON b.branchid = r.BranchID JOIN institute i ON b.Instituteid = i.Instituteid 
            Where tes.subjectid= @SubId and ts.StatusFlag= 1";

        // Delete operations
        public const string DeleteStudentCourse = @"
            DELETE FROM student_course WHERE courseid = @CourseId";

        public const string DeleteTestCourse = @"
            DELETE FROM testcourse WHERE courseid = @CourseId";

        public const string DeleteTrainerCourse = @"
            DELETE FROM trainercourse WHERE courseid = @CourseId";

        public const string DeleteBatchCourse = @"
            DELETE FROM batchcourse WHERE courseid = @CourseId";

        public const string DeletePaymentTemplateDetails = @"
            DELETE FROM paymenttemplatedetails
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatecourses WHERE courseId = @CourseId)";

        public const string DeletePaymentTemplates = @"
            DELETE FROM paymenttemplates
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatecourses WHERE courseId = @CourseId)";

        public const string DeletePaymentTemplateCourses = @"
            DELETE FROM paymenttemplatecourses WHERE courseId = @CourseId";

        public const string SoftDeleteCourse = @"
            UPDATE tbl_course SET StatusFlag = 0 WHERE courseid = @CourseId";

        public const string HardDeleteCourse = @"
            DELETE FROM tbl_course WHERE courseid = @CourseId";

        public const string GetTrainersByCourseId = @"
            SELECT trainnerid AS TrainerId
            FROM tbl_allotcounsellcourse
            WHERE courseid = @CourseId";

        // Audit log queries
        public const string GetCourseSubjectIds = @"
            SELECT GROUP_CONCAT(subId) AS subIds
            FROM tbl_subject
            WHERE courseId = @CourseId";

        public const string InsertSubjectAudit = @"
            INSERT INTO tbl_subject_audit
            (subID, courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax,
             Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
             NoofMonths, CourseEndDate, delBy, delDate, ipAddress, ActionType)
            SELECT subID, courseID, sub_Name, Description, Duration, Duration_Type, Fees, Taxable, Including_Tax,
                   Allow_Installment, Max_Installment, Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType,
                   NoofMonths, CourseEndDate, @UserId, @DeleteDate, @IpAddress, 'Delete'
            FROM tbl_subject
            WHERE subID IN ({0})";

        public const string InsertCourseAudit = @"
            INSERT INTO tbl_course_audit
            (courseID, course_Name, Duration, Duration_Type, Description, InstituteID, BranchID,
             refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax,
             cAllow_Installment, cMax_Installment, coursetype, hsncode, delBy, delDate, ipAddress, ActionType)
            SELECT courseID, course_Name, Duration, Duration_Type, Description, InstituteID, BranchID,
                   refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax,
                   cAllow_Installment, cMax_Installment, coursetype, hsncode, @UserId, @DeleteDate, @IpAddress, 'Delete'
            FROM tbl_course
            WHERE courseID = @CourseId";

        // Payment template creation queries
        public const string InsertPaymentTemplate = @"
            INSERT INTO paymenttemplates(templatetype, templatename, templatedurationtype, noofdays, statusflag, branchid, instituteid)
            VALUES(@TemplateType,
        'Plan 1',
        1,
        @NoofDays,
        @TemplateStatus,
        @BranchId,
        @InstituteId);
            SELECT LAST_INSERT_ID();";

        public const string InsertPaymentTemplateCourse = @"
            INSERT INTO paymenttemplatecourses(paymenttemplateid, courseid)
            VALUES (@PaymentTemplateId, @CourseId)";

        public const string InsertPaymentTemplateDetail = @"
            INSERT INTO paymenttemplatedetails(paymenttemplateid, noofday, amount)
            VALUES (@PaymentTemplateId, @NoOfDay, @Amount)";

        // Trainer/counselor assignment queries
        public const string InsertTrainerCourseAssignment = @"
            INSERT INTO tbl_allotcounsellcourse(courseid, trainnerid, instituteid, branchid)
            VALUES (@CourseId, @TrainerId, @InstituteId, @BranchId)";

        public const string DeleteTrainerCourseAssignments = @"
            DELETE FROM tbl_allotcounsellcourse WHERE instituteid =@InstituteId AND branchid=@BranchId AND courseid = @CourseId";

        // Session wise fee subject creation
        public const string InsertSessionWiseSubject = @"
            INSERT INTO tbl_subject (courseID, sub_Name, Fees, Taxable, Including_Tax, Allow_Installment, Max_Installment, Duration, Allow_prorated, FeesType, CourseEndDate)
            VALUES (@CourseId, @SubName, @Fees, @Taxable, @IncludingTax, @AllowInstallment, @MaxInstallment, @Duration, 0, 'S', @CourseEndDate)";

        // Course type and subject count query
        public const string GetCourseTypeAndSubcount = @"
            SELECT IscourseLvl,
                   (SELECT COUNT(*) FROM tbl_subject WHERE courseid = @CourseId) AS subcount,
                   courseFees,
                   (SELECT GROUP_CONCAT(subId) FROM tbl_subject WHERE courseid = @CourseId) AS subIds,
                   cTaxable,
                   cIncluding_Tax,
                   cAllow_Installment,
                   cMax_Installment
            FROM tbl_course
            WHERE courseid = @CourseId";

        // Update subject fee by subject ID
        public const string UpdateSubFeeBySubId = @"
            UPDATE tbl_subject
            SET fees = @Fees,
                Taxable = @Taxable,
                Including_Tax = @IncludingTax,
                Allow_Installment = @AllowInstallment,
                Max_Installment = @MaxInstallment
            WHERE subId = @SubId";

        // Get subject details for fee update
        public const string GetSubjectDetailsForFeeUpdate = @"
            SELECT tc.IscourseLvl, ts.subID, ts.StatusFlag, ts.Fees, tc.courseFees
            FROM tbl_subject ts
            INNER JOIN tbl_course tc ON ts.courseID = tc.courseID
            WHERE ts.courseid = (SELECT DISTINCT courseid FROM tbl_subject WHERE subid IN ({0}))";

        // Get reference courses
        public const string GetReferenceCourses = @"
            SELECT courseid, BranchID, IscourseLvl, courseFees,
                   (SELECT GROUP_CONCAT(subId) FROM tbl_subject WHERE courseid = c.courseid) AS subIds,
                   (SELECT COUNT(*) FROM tbl_subject WHERE courseid = c.courseid) AS subcount
            FROM tbl_course c
            WHERE refcourseID = @CourseId";

        // Update reference course
        public const string UpdateReferenceCourse = @"
            UPDATE tbl_course
            SET course_Name = @CourseName,
                Duration = @Duration,
                Duration_Type = @DurationType,
                Description = @Description,
                StatusFlag = @Status,
                IscourseLvl = @IsCourseLvl,
                courseFees = @CourseFee,
                cTaxable = @Taxable,
                cIncluding_Tax = @IncludingTax,
                cAllow_Installment = @AllowInstallment,
                cMax_Installment = @MaxInstallment,
                adhocCourse = @AdhocCourse
            WHERE refcourseID = @CourseId";

        // Update audit log queries
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

        public const string InsertCourseAuditUpdate = @"
            INSERT INTO tbl_course_audit
            (courseID, course_Name, Duration, Duration_Type, Description, InstituteID, BranchID,
             refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax,
             cAllow_Installment, cMax_Installment, coursetype, hsncode, updateBy, updateDate, updateIpAddress, ActionType)
            SELECT courseID, course_Name, Duration, Duration_Type, Description, InstituteID, BranchID,
                   refCourseId, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax,
                   cAllow_Installment, cMax_Installment, coursetype, hsncode, @UserId, @UpdateDate, @IpAddress, 'Update'
            FROM tbl_course
            WHERE courseID = @CourseId";

        // Payment template deletion queries
        public const string DeletePaymentTemplateDetailsByTemplateId = @"
            DELETE FROM paymenttemplatedetails WHERE paymenttemplateid = @PaymentTemplateId";

        public const string DeletePaymentTemplateCoursesByTemplateId = @"
            DELETE FROM paymenttemplatecourses WHERE paymenttemplateid = @PaymentTemplateId";

        public const string DeletePaymentTemplateById = @"
            DELETE FROM paymenttemplates WHERE paymenttemplateid = @PaymentTemplateId";

        // Session-wise subject update
        public const string UpdateSessionWiseSubject = @"
            UPDATE tbl_subject
            SET courseID = @CourseId,
                sub_Name = @SubName,
                Fees = @Fees,
                Taxable = @Taxable,
                Including_Tax = @IncludingTax,
                Allow_Installment = @AllowInstallment,
                Max_Installment = @MaxInstallment,
                Duration = @Duration,
                Allow_prorated = 0,
                FeesType = 'S',
                CourseEndDate = @CourseEndDate
            WHERE courseID = @CourseId";

        // Online test deactivation
        public const string GetOnlineTestsBySubjectIds = @"
            SELECT DISTINCT ot.OnlineTestID
            FROM onlinetests ot
            INNER JOIN testsquestions tq ON ot.OnlineTestID = tq.OnlineTestId
            WHERE tq.SubjectId IN (SELECT SubId FROM tbl_Subject ts WHERE ts.courseID = @CourseId)";

        public const string DeactivateOnlineTest = @"
            UPDATE onlinetests SET IsActive = 0 WHERE OnlineTestId = @OnlineTestId";

        // Get subjects by course IDs
        public const string GetSubjectsByCourseIds = @"
    SELECT 
        subid,
        sub_Name,
        course_Name,
        CONCAT(
            s.Duration, ' ',
            CASE s.Duration_Type
                WHEN 0 THEN ''
                WHEN 1 THEN 'Year'
                WHEN 2 THEN 'Month'
                WHEN 3 THEN 'Days'
                WHEN 4 THEN 'Hours'
                ELSE 'Sessions'
            END
        ) AS durationfull,
        fees AS actualfees,
        CASE feestype
            WHEN 'S' THEN 'Subjectwise'
            WHEN 'M' THEN 'Monthly'
            ELSE 'Hourly'
        END AS subjecttype,
        branchname,
        IFNULL(tc.crclmName, '') AS curriculum_name
    FROM tbl_subject s
    JOIN tbl_course c 
        ON s.courseID = c.courseID
    LEFT JOIN tbl_curriculum tc 
        ON tc.crclmId = c.crclmId
    LEFT JOIN branch b 
        ON c.BranchID = b.Branchid
    WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
        AND c.instituteid = @InstituteId
        AND s.StatusFlag = 1
        AND (c.branchid = 0 OR c.branchid = @BranchId)
        AND c.courseid IN ({0})
    ORDER BY course_name, sub_name
    LIMIT @PageSize OFFSET @Offset";
        public const string GetSubjectsByCourseIdsCount = @"
    SELECT COUNT(*)
    FROM tbl_subject s
    JOIN tbl_course c 
        ON s.courseID = c.courseID
    LEFT JOIN tbl_curriculum tc 
        ON tc.crclmId = c.crclmId
    LEFT JOIN branch b 
        ON c.BranchID = b.Branchid
    WHERE (b.branch_status <> 0 OR b.branch_status IS NULL)
        AND c.instituteid = @InstituteId
        AND s.StatusFlag = 1
        AND (c.branchid = 0 OR c.branchid = @BranchId)
        AND c.courseid IN ({0})";
        // Check existing course in branch
        public const string CheckExistingCourseInBranch = @"
            SELECT COUNT(course_Name)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseId = @CourseId)
                AND BranchId = @BranchId";

        // Copy course with curriculum mapping
        public const string CopyCourseWithCurriculum = @"
            INSERT INTO tbl_course(course_name, description, duration, duration_type, instituteid, branchid, refcourseid, StatusFlag, IscourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse)
            SELECT course_name, description, duration, duration_type, instituteid, @BranchId, courseid, StatusFlag, IscourseLvl, courseFees,
                (SELECT c1.crclmId FROM tbl_curriculum c1 WHERE c1.refcrclmId = tbl_Course.crclmId AND c1.BranchId = @BranchId LIMIT 1) AS crclmId,
                cTaxable, cIncluding_Tax, cAllow_Installment, cMax_Installment, coursetype, hsncode, courseFeeWise, adhocCourse
            FROM tbl_course
            WHERE courseid = @CourseId;
            SELECT LAST_INSERT_ID();";

        // Get payment templates for course
        public const string GetPaymentTemplatesForCourse = @"
            SELECT * FROM paymenttemplates
            WHERE paymenttemplateid IN (SELECT ptc.paymenttemplateid FROM paymenttemplatecourses ptc WHERE ptc.courseid = @CourseId)";

        // Copy payment template for course
        public const string CopyPaymentTemplate = @"
            INSERT INTO paymenttemplates(templatetype, templatename, templatedurationtype, noofdays, statusflag, branchid, instituteid)
            SELECT templatetype, templatename, templatedurationtype, noofdays, statusflag, @BranchId, instituteid
            FROM paymenttemplates
            WHERE paymenttemplateid = @PaymentTemplateId;
            SELECT LAST_INSERT_ID();";

        // Copy payment template course link
        public const string CopyPaymentTemplateCourse = @"
            INSERT INTO paymenttemplatecourses(paymenttemplateid, courseid)
            VALUES (@PaymentTemplateId, @CourseId)";

        // Copy payment template details
        public const string CopyPaymentTemplateDetails = @"
            INSERT INTO paymenttemplatedetails(paymenttemplateid, noofday, amount)
            SELECT @PaymentTemplateId, noofday, amount
            FROM paymenttemplatedetails
            WHERE paymenttemplateid = @SourcePaymentTemplateId";

        // Get subjects for course
        public const string GetSubjectsForCourse = @"
            SELECT * FROM tbl_subject WHERE courseID = @CourseId";

        // Copy subject
        public const string CopySubject = @"
            INSERT INTO tbl_subject(courseid, sub_name, description, duration, duration_type, fees, taxable, including_tax, allow_installment, max_installment, allow_prorated, FeesType, StatusFlag, refsubid, DurationSubType, NoofMonths, CourseEndDate, adhocSub)
            SELECT @CourseId, sub_name, description, duration, duration_type, fees, taxable, including_tax, allow_installment, max_installment, allow_prorated, FeesType, StatusFlag, subid, DurationSubType, NoofMonths, CourseEndDate, adhocSub
            FROM tbl_subject
            WHERE subID = @SubId;
            SELECT LAST_INSERT_ID();";

        // Get payment templates for subject
        public const string GetPaymentTemplatesForSubject = @"
            SELECT * FROM paymenttemplates
            WHERE paymenttemplateid IN (SELECT ptc.paymenttemplateid FROM paymenttemplatesubject ptc WHERE ptc.subjectid = @SubId)";

        // Copy payment template subject link
        public const string CopyPaymentTemplateSubject = @"
            INSERT INTO paymenttemplatesubject(paymenttemplateid, subjectid)
            VALUES (@PaymentTemplateId, @SubId)";

        // Get payment templates for institute course
        public const string GetPaymentTemplatesForInstituteCourse = @"
            SELECT pt.paymenttemplateid, pt.templatedurationtype, pt.noofdays, pt.statusflag, pt.instituteid
            FROM paymenttemplates pt
            INNER JOIN paymenttemplatecourses ptc ON pt.paymenttemplateid = ptc.paymenttemplateid
            WHERE ptc.courseid = @CourseId";

        // Create payment template for branch course
        public const string CreatePaymentTemplateForBranch = @"
            INSERT INTO paymenttemplates(templatetype, templatename, templatedurationtype, noofdays, statusflag, branchid, instituteid)
            VALUES (1, 'Plan 1', @TemplateDurationType, @NoofDays, @StatusFlag, @BranchId, @InstituteId);
            SELECT LAST_INSERT_ID();";

        // Link payment template to branch course
        public const string LinkPaymentTemplateToBranchCourse = @"
            INSERT INTO paymenttemplatecourses(paymenttemplateid, courseid)
            VALUES (@PaymentTemplateId, @CourseId)";

        // Copy payment template details for branch course
        public const string CopyPaymentTemplateDetailsForBranch = @"
            INSERT INTO paymenttemplatedetails(paymenttemplateid, noofday, amount)
            VALUES (@PaymentTemplateId, @NoOfDay, @Amount)";

        // Course Delete Queries
        public const string GetSubjectIdsByCourseId = @"
            SELECT subId FROM tbl_subject WHERE courseId = @CourseId";

        public const string UpdateCourseStatus = @"
            UPDATE tbl_course SET StatusFlag = @Status WHERE courseid = @CourseId";

        public const string DeletePaymentTemplateDetailsByCourse = @"
            DELETE FROM paymenttemplatedetails 
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatecourses WHERE courseId = @CourseId)";

        public const string DeletePaymentTemplatesByCourse = @"
            DELETE FROM paymenttemplates 
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatecourses WHERE courseId = @CourseId)";

        // Subject Delete Queries
        public const string GetOnlineTestIdsBySubjectId = @"
            SELECT DISTINCT OnlineTestID FROM testsquestions WHERE SubjectId = @SubId";

        public const string UpdateOnlineTestStatus = @"
            UPDATE onlinetests SET IsActive = 0 WHERE OnlineTestID = @OnlineTestId";

        public const string UpdateSubjectStatus = @"
            UPDATE tbl_subject SET StatusFlag = @Status WHERE subID = @SubId";

        public const string DeleteStudentSubjects = @"
            DELETE FROM student_subjects WHERE subjectID = @SubId AND payment_id = 0";

        public const string DeleteTestSubject = @"
            DELETE FROM testsubject WHERE subjectID = @SubId";

        public const string DeleteTrainerSubject = @"
            DELETE FROM trainersubject WHERE subjectID = @SubId";

        public const string DeleteBatchSubject = @"
            DELETE FROM batchsubject WHERE subjectID = @SubId";

        public const string DeletePaymentTemplateDetailsBySubject = @"
            DELETE FROM paymenttemplatedetails 
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubId)";

        public const string DeletePaymentTemplatesBySubject = @"
            DELETE FROM paymenttemplates 
            WHERE paymenttemplateid IN (SELECT paymenttemplateid FROM paymenttemplatesubject WHERE subjectid = @SubId)";

        public const string DeletePaymentTemplateSubject = @"
            DELETE FROM paymenttemplatesubject WHERE subjectid = @SubId";

        public const string DeleteSubject = @"
            DELETE FROM tbl_subject WHERE subID = @SubId";

        public const string GetSubjectDetailsForFeeRecalculation = @"
            SELECT tc.IscourseLvl, ts.subID, ts.StatusFlag, ts.Fees, tc.courseFees 
            FROM tbl_subject ts 
            INNER JOIN tbl_course tc ON ts.courseID = tc.courseID 
            WHERE ts.courseid = @CourseId;";

        public const string GetCourseCurriculumId = @"
            SELECT crclmId
            FROM tbl_course
            WHERE courseID = @CourseId";

        public const string CheckCourseExistsInBranchForExport = @"
            SELECT COUNT(*)
            FROM tbl_course
            WHERE course_name = (SELECT course_name FROM tbl_course WHERE courseID = @SourceCourseId)
            AND branchid = @BranchId";

        public const string CheckCurriculumExistsInBranch = @"
            SELECT COUNT(*)
            FROM tbl_curriculum
            WHERE crclmName = (SELECT crclmName FROM tbl_curriculum WHERE crclmId = @SourceCrclmId)
            AND branchid = @BranchId";

        public const string ImportCourseForExport = @"
            INSERT INTO tbl_course (course_name, Description, Duration, duration_type, StatusFlag, 
                                    IsCourseLvl, courseFees, crclmId, cTaxable, cIncluding_Tax, 
                                    cAllow_Installment, cMax_Installment, coursetype, Hsncode, 
                                    AdhocCourse, courseFeeWise, branchid, InstituteId, refcourseid)
            SELECT course_name, Description, Duration, duration_type, StatusFlag, 
                   IsCourseLvl, courseFees, @NewCrclmId, cTaxable, cIncluding_Tax, 
                   cAllow_Installment, cMax_Installment, coursetype, Hsncode, 
                   AdhocCourse, courseFeeWise, @BranchId, @InstituteId, @SourceCourseId
            FROM tbl_course
            WHERE courseID = @SourceCourseId;
            SELECT LAST_INSERT_ID();";

        public const string ImportSubjectsForCourse = @"
            INSERT INTO tbl_subject (courseID, sub_Name, Description, Duration, Duration_Type, Fees, 
                                    Taxable, Including_Tax, Allow_Installment, Max_Installment, 
                                    Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType, 
                                    NoofMonths, CourseEndDate)
            SELECT @NewCourseId, sub_Name, Description, Duration, Duration_Type, Fees, 
                   Taxable, Including_Tax, Allow_Installment, Max_Installment, 
                   Allow_prorated, FeesType, StatusFlag, RefSubId, DurationSubType, 
                   NoofMonths, CourseEndDate
            FROM tbl_subject
            WHERE courseID = @SourceCourseId;
            SELECT LAST_INSERT_ID();";

        public const string ImportTopicsForSubject = @"
            INSERT INTO subject_topics (SubjectID, TopicName, Remark, TopicDuration, TopicDurId, 
                                       IsActive, InstituteId, BranchId, CourseId, RefTopicId,TopicSeqNum, CrclmId)
            SELECT @NewSubjectId, TopicName, Remark, TopicDuration, TopicDurId, 
                   IsActive, @InstituteId, @BranchId, @NewCourseId, TopicID, TopicSeqNum, CrclmId
            FROM subject_topics
            WHERE SubjectID = @SourceSubjectId;
            SELECT LAST_INSERT_ID();";

        public const string ImportStudyMaterialsForTopic = @"
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
    }
}
