namespace IM_backend.SqlQueries
{
    public static class StudentQueries
    {
        public const string CheckDuplicateStudent = @"
            SELECT COUNT(*) 
            FROM registration 
            WHERE fname = @FirstName 
            AND lname = @LastName 
            AND pcontact = @Mobile 
            AND branchid = @BranchId 
            AND RegNo <> @StudentId";

        public const string CheckDuplicateRegNo = @"
            SELECT COUNT(*) 
            FROM registration 
            WHERE RegNo_Manual = @RegNo 
            AND branchid = @BranchId 
            AND RegNo <> @RegId";

        public const string CheckDuplicateBiometricId = @"
            SELECT RegNo AS ACount 
            FROM registration r 
            WHERE biometricattendanceid = @BiometricAttendanceId 
            AND branchid = @BranchId
            {0}
            UNION
            SELECT trainnerId AS ACount 
            FROM trainner t 
            WHERE biometricattendanceid = @BiometricAttendanceId 
            AND branchid = @BranchId
            {1}";

        public const string CheckDuplicateRollNo = @"
            SELECT COUNT(*) 
            FROM registration 
            WHERE rollno = @RollNo 
            AND branchid = @BranchId
            AND regno <> @StudentId";

        public const string CheckUser = @"
            SELECT COUNT(*) 
            FROM registration 
            WHERE Username = @Username";

        public const string InsertStudentCourse = @"
            INSERT INTO student_course (studid, courseid)
            VALUES (@StudentId, @CourseId)";

        public const string InsertMonthlyFeesInstallment = @"
            INSERT INTO monthlyfeesinstallment (studentid, subjectid, feemonth, feeyear, basicamount, basicfees)
            VALUES (@StudentId, @SubjectId, @FeeMonth, @FeeYear, @BasicAmount, @BasicFees)";

        public const string InsertStudentOtherFees = @"
            INSERT INTO student_otherfees (RegNo, of_code, amount, istaxable, isincluding)
            VALUES (@StudentId, @OfCode, @Amount, @IsTaxable, @IsIncluding)";

        public const string UpdateStudentImage = @"
            UPDATE registration 
            SET image = @Photo 
            WHERE regno = @StudentId";

        public const string GetSubjectDetails = @"
            SELECT DurationSubType, NoofMonths, CourseEndDate, Allow_prorated, Fees 
            FROM tbl_subject 
            WHERE subID = @SubjectId";

        public const string GetOtherFeesDetails = @"
            SELECT of_Frequency, amount, istaxable, isincluding 
            FROM otherfees 
            WHERE of_code = @OfCode";

        public const string GetStudentRegDate = @"
            SELECT RegDate 
            FROM registration 
            WHERE RegNo = @StudentId";

        public const string CheckExistingOtherFees = @"
            SELECT of_code 
            FROM student_otherfees 
            WHERE RegNo = @StudentId";

        // Notification configuration queries
        public const string GetEmailConfig = @"
            SELECT Email_User, Email_Pwd, Smtp_Server, EnableSsl, Portno 
            FROM emailsettings 
            WHERE Smtp_Server IS NOT NULL 
              AND institute_id = @InstId 
              AND branch_id = @BranchId";

        public const string GetSMSConfig = @"
            SELECT SMS_Server, Msg_Encode 
            FROM smssettings 
            WHERE defaultsms = 1 
              AND SMS_Server IS NOT NULL 
              AND institute_id = @InstId 
              AND branch_id = @BranchId";
        public const string GetWhatsAppConfig = @"
            SELECT * 
            FROM whatsappsettings 
            WHERE IsDefault = 1 
              AND instituteid = @InstId 
              AND (@BranchId = 0 OR branchid = @BranchId)";

        public const string GetRegNoFormat = @"
            SELECT counter AS autoregno, prefix AS regprefix, regformat AS regformattype, reglevel 
            FROM regnoformat 
            WHERE instid = @InstituteId 
              AND (branchid = @BranchId OR branchid = 0)
            ORDER BY branchid DESC 
            LIMIT 1";

        public const string UpdateAutoRegCounter = @"
            UPDATE regnoformat 
            SET autoregno = @NewCounter 
            WHERE instid = @InstituteId 
              AND (branchid = @BranchId OR branchid = 0)
            ORDER BY branchid DESC 
            LIMIT 1";

        public const string GetRegistrationAnnouncement = @"
            SELECT registrationsetting, registrationtemplate, registrationmobileno, registrationtemplateno 
            FROM annoucementsetting 
            WHERE instituteid = @InstId 
              AND branchid = @BranchId";

        public const string GetBranchMobile = @"
            SELECT Branchname, Phone 
            FROM branch 
            WHERE Branchid = @BranchId 
              AND Instituteid = @InstId";

        public const string GetEmailAnnouncement = @"
            SELECT registrationemailids, registrationtemplate, registrationsetting, 
                   userpasswordtemplate, userpasswordsetting 
            FROM emailannoucementsetting 
            WHERE instituteid = @InstId 
              AND branchid = @BranchId";

        public const string GetSMSAnnouncement = @"
            SELECT registrationmobileno, registrationtemplate, registrationsetting, 
                   registrationtemplateno, usernamepasswordtemplate, usernamepasswordsetting, 
                   usernamepasswordtemplateno 
            FROM annoucementsetting 
            WHERE instituteid = @InstId 
              AND branchid = @BranchId";

        public const string GetWhatsAppAnnouncement = @"
            SELECT templateBody, wabaTemplateName, status 
            FROM autowhatsapp 
            WHERE status = 1 
              AND instituteid = @InstId 
              AND (branchid = @BranchId OR branchid = 0)
              AND templateName = @SettingType
            ORDER BY branchid DESC
            LIMIT 1";

        public const string InsertSMSLog = @"
            INSERT INTO smslog (mobileno, msgdate, message, instituteid, branchid)
            VALUES (@MobileNo, @MsgDate, @Message, @InstituteId, @BranchId)";

        public const string InsertEmailLog = @"
            INSERT INTO emaillog (emailid, subject, emaildate, emailtext, instituteid, branchid)
            VALUES (@EmailId, @Subject, @EmailDate, @EmailText, @InstituteId, @BranchId)";

        public const string CheckAllowStudModule = @"
            SELECT allowstudmodule 
            FROM institute 
            WHERE instituteid = @InstituteId";

        public const string GetCourseNamesBySubjects = @"
            SELECT DISTINCT tc.courseID, course_Name 
            FROM tbl_course tc 
            JOIN tbl_subject ts ON ts.courseID = tc.courseID 
            WHERE ts.subID IN @SubjectIds";

        public const string GetEnquiryForEdit = @"
            SELECT RegNo, regdate, enquirydate, walkindate, walkin, gender, salutation, fname, mname, lname,
                   pcontact, emailid, biometricattendanceid, corraddress, permanentadd, city, state, cityc, statec,
                   pincode, pincodec, homeno, dob, age, stud_category, image, working, occupation, orgname, salary,
                   source, comments, fatherfname, fathermname, fatherlname, fmobile, mmobile, company, gstnumber,
                   motherfname, mothermname, motherlname, newremarks, enqstatus, countryid, stateid, cityid, othercity,
                   countryidc, stateidc, cityidc, othercityc, branchid
            FROM registration 
            WHERE RegNo = @StudentId AND BranchId = @BranchId";
        public const string GetEnquiryBatches = @"
    SELECT batchid 
    FROM studentbatch 
    WHERE studentid = @StudentId";

        public const string GetStudentForEdit = @"
            SELECT RegNo, regdate, rollno, statusFlag, inactivestatus, registered, enquirydate, walkindate, walkin, gender, salutation, fname, mname, lname,
                   pcontact, emailid, biometricattendanceid, corraddress, permanentadd, city, state, cityc, statec,
                   pincode, pincodec, homeno, dob, age, stud_category, image, working, occupation, orgname, salary,
                   source, comments, fatherfname, fathermname, fatherlname, fmobile, mmobile, company, gstnumber,
                   motherfname, mothermname, motherlname, newremarks, enqstatus, countryid, stateid, cityid, othercity,
                   countryidc, stateidc, cityidc, othercityc, branchid, followdate
            FROM registration
            WHERE RegNo = @StudentId AND BranchId = @BranchId";

        public const string GetStudSchedSubject = @"
            SELECT c.courseid, ss.subjectid
            FROM registration s 
            JOIN student_subjects ss ON ss.StudID = s.regno 
            JOIN tbl_subject ts ON ss.SubjectID = ts.subID 
            JOIN tbl_course c ON ts.courseID = c.courseID 
            LEFT JOIN tbl_curriculum cu ON c.crclmId = cu.crclmId 
            LEFT JOIN branch b ON c.BranchID = b.Branchid
            JOIN institute i ON b.Instituteid = i.Instituteid 
            WHERE c.statusflag = 1 AND ts.statusflag = 1 AND studid = @StudentId AND isscheduled = 'Y'";

        public const string GetStudRegCourses_Without_Subject = @"
            SELECT c.courseid
            FROM registration s
            LEFT JOIN student_course sc ON sc.studid = s.regno
            LEFT JOIN student_subjects ss ON ss.StudID = s.regno
            LEFT JOIN tbl_subject ts ON ss.SubjectID = ts.subID
            LEFT JOIN tbl_course c ON sc.courseID = c.courseID
            LEFT JOIN tbl_curriculum cu ON c.crclmId = cu.crclmId
            LEFT JOIN branch b ON c.BranchID = b.Branchid
            LEFT JOIN institute i ON b.Instituteid = i.Instituteid 
            WHERE sc.studid = @StudentId";

        public const string GetOtherFeesForStudent = @"
            SELECT so.* 
            FROM student_otherfees so 
            INNER JOIN registration r ON so.RegNo = r.RegNo 
            WHERE r.RegNo = @StudentId";

        public const string InsertStudent = @"
           INSERT INTO registration (
    RegDate,
    EnquiryDate,
    Fname,
    Mname,
    Lname,
    CorrAddress,
    PermanentAdd,
    FatherFname,
    FatherMname,
    FatherLname,
    Occupation,
    OrgName,
    PContact,
    FMobile,
    MMobile,
    EmailId,
    DOB,
    Working,
    Company,
    Comments,
    Source,
    HomeNo,
    Salary,
    FollowDate,
    Registered,
    BranchID,
    city,
    state,
    cityc,
    statec,
    pincode,
    pincodec,
    RegNo_Manual,
    Stud_Category,
    Username,
    Password,
    District,
    DistrictC,
    walkIn,
    walkInDate,
    countryidc,
    stateidc,
    cityidc,
    othercityc,
    countryid,
    stateid,
    cityid,
    othercity,
    biometricattendanceid,
    newremarks,
    EnqStatus,
    Gender,
    Salutation,
    ParentCompanyName,
    GSTNumber,
    userid,
    Rollno,
    Age
)
VALUES (
    @RegDate,
    @EnquiryDate,
    @FirstName,
    @MiddleName,
    @LastName,
    @Address,
    @PermanentAddress,
    @FatherFirstName,
    @FatherMiddleName,
    @FatherLastName,
    @Occupation,
    @Organization,
    @PContact,
    @Mobile1,
    @Mobile2,
    @Email,
    @DOB,
    @WorkStatus,
    @Company,
    @Comments,
    @Source,
    @HomePhone,
    @Salary,
    @FollowUpDate,
    @Registered,
    @BranchId,
    @City,
    @State,
    @CityC,
    @StateC,
    @PinCode,
    @PinCodeC,
    @RegNo,
    @Category,
    @Username,
    @Password,
    @District,
    @DistrictC,
    @WalkIn,
    @WalkInDate,
    @CountryIdC,
    @StateIdC,
    @CityIdC,
    @OtherCityC,
    @CountryId,
    @StateId,
    @CityId,
    @OtherCity,
    @BiometricAttendanceId,
    @Remarks,
    @EnqStatus,
    @Gender,
    @Salutation,
    @ParentCompanyName,
    @ParentGSTNo,
    @UserId,
    @RollNo,
    @Age
);

SELECT LAST_INSERT_ID();";
        public const string InsertStudentSubjects = @"
            INSERT INTO student_subjects (studid, subjectid, FeesType, SubRegDate)
            VALUES (@StudentId, @SubjectId, @FeesType, @SubRegDate)";

        public const string CheckExistingSubject = @"
            SELECT Subjectid 
            FROM student_subjects 
            WHERE StudId = @StudentId";

        public const string InsertStudentBatch = @"
            INSERT INTO studentbatch (studentid, batchid, instituteid, stdnme, branchid)
            VALUES (@StudentId, @BatchId, @InstId, @StudentName, @BranchId)";

        public const string InsertEducation = @"
            INSERT INTO educationdetail (Degree, collegename, Stream, Percentage, Year1, RegNo)
            VALUES (@Degree, @College, @Stream, @Percentage, @Year, @StudentId)";

        public const string DeleteTempEducation = @"
            DELETE FROM temp_education";

        public const string GetAutoRegNo = @"
        SELECT
        counter AS CurrentRegNo,
        Automated,
        prefix AS Prefix,
        regformat AS RegFormat,
        reglevel AS RegLevel
        FROM regnoformat
        WHERE instid = @InstId
        AND branchid = @BranchId";

        public const string UpdateAutoRegCounterOld = @"
            UPDATE regnoformat 
            SET counter = @Counter
            WHERE instid = @InstId AND branchid = @BranchId AND counter <> 0";

        public const string GetStudentById = @"
            SELECT regid, RegNo, regdate, rollno, salutation, fname, mname, lname, gender, dob, age,
                   pcontact, email, mob1, mob2, homephone, address, paddress,
                   countryid, stateid, cityid, othercity, pincode,
                   countryidc, stateidc, cityidc, othercityc, pincodec,
                   fatherfname, fathermname, fatherlname, occupation, organization, parentcompanyname, parentgstno, salary,
                   category, source, comments, remarks, BiometricAttendanceId, status, InactiveStatus,
                   workstatus, instid, branchid, image
            FROM registration 
            WHERE regid = @StudentId";

        public const string GetStudentSubjects = @"
            SELECT SubjectId 
            FROM student_subjects 
            WHERE StudId = @StudentId AND isScheduled = 'Y'";

        public const string GetSubjectsForStudents = @"
            SELECT c.courseid, ss.subjectid, ss.isscheduled, c.course_name, ts.sub_name, ss.SubRegDate, ss.FeesType, CONCAT(c.courseID,'#',c.IscourseLvl) AS DcourseID, COALESCE(c.crclmId,0) AS crclmId,c.IscourseLvl
            FROM registration s
            JOIN student_subjects ss ON ss.StudID = s.regno
            JOIN tbl_subject ts ON ss.SubjectID = ts.subID
            JOIN tbl_course c ON ts.courseID = c.courseID
            LEFT JOIN tbl_curriculum cu ON c.crclmId = cu.crclmId
            LEFT JOIN branch b ON c.BranchID = b.Branchid
            JOIN institute i ON b.Instituteid = i.Instituteid
            WHERE ss.studId = @StudentId";

        public const string GetStudentBatches = @"
            SELECT batchid 
            FROM studentbatch 
            WHERE studentid = @StudentId";

        public const string GetStudentEducation = @"
    SELECT
        Degree AS degree,
        CollegeName AS college,
        Stream AS stream,
        Percentage AS percentage,
        Year1 AS year
    FROM educationdetail
    WHERE RegNo = @StudentId";
        // Check institute student limit
        public const string CheckInstituteStudentLimit = @"
            SELECT paytype, total, enq, reg, noofstudents, noofreg, noofenq, COUNT(regno) as totalcount,
                IFNULL((SELECT COUNT(regno) FROM institute i 
                        JOIN branch b ON i.instituteid = b.instituteid 
                        LEFT JOIN registration r ON b.branchid = r.branchid 
                        WHERE r.registered = 'yes' AND i.instituteid = @InstituteId 
                        GROUP BY b.instituteid), 0) as regcount,
                IFNULL((SELECT COUNT(regno) FROM institute i 
                        JOIN branch b ON i.instituteid = b.instituteid 
                        LEFT JOIN registration r ON b.branchid = r.branchid 
                        WHERE r.registered = 'no' AND i.instituteid = @InstituteId 
                        GROUP BY b.instituteid), 0) as enqcount,
                i.regtype, IsBranchwise
            FROM institute i
            JOIN branch b ON i.instituteid = b.instituteid
            LEFT JOIN registration r ON b.branchid = r.branchid
            WHERE i.instituteid = @InstituteId
            GROUP BY b.instituteid";

        // Check current plan expiry
        public const string CheckCurrentPlanExpiry = @"
            SELECT paymenthistoryid,user_id,purchasedate,startdate,enddate,
            isactive,totalamount,noofstudents,noofmonths,noofenquiry
            FROM onlinepaymenthistory 
            WHERE instid = @InstituteId
              AND startdate <= @CurrentDate
              AND enddate >= @CurrentDate
            ORDER BY paymenthistoryid DESC LIMIT 1";

        public const string SearchStudentsBasic = @"
            SELECT DISTINCT v.RegNo,
                CONCAT(IF(v.Salutation IS NOT NULL, CONCAT(v.Salutation, ' '), ''), v.Fname, ' ', v.Mname, ' ', v.Lname) AS NAME,
                PContact, fmobile, mmobile, EmailId,
                IF(v.StatusFlag = 1, 'Active', 'Inactive') AS STATUS,
                Registered,
                IF(Registered = 'Yes', IF(ISNULL(RegNo_Manual), v.RegNo, RegNo_Manual), '') AS RegNo_Manual,
                IF(Registered = 'Yes', DATE_FORMAT(v.regdate, '%d/%m/%Y'), DATE_FORMAT(enquirydate, '%d/%m/%Y')) AS regdate,
                v.branchid, AllowStudModule,
                IF(Registered = 'Yes', v.regdate, enquirydate) AS RDate,
                IFNULL(es.enquiryStatus, '-') AS EnqStatus,
                u.username,
                IFNULL(
                 (
                     SELECT GROUP_CONCAT(
                         DISTINCT tc2.course_Name
                         ORDER BY tc2.course_Name
                         SEPARATOR ', '
                     )
                     FROM student_course sc2
                     INNER JOIN tbl_course tc2
                         ON tc2.courseID = sc2.CourseID
                     WHERE sc2.StudID = v.RegNo
                 ),
                  '-'
                     ) AS CourseNames,
                     IFNULL(
                         (
                             SELECT GROUP_CONCAT(
                                 DISTINCT ts2.sub_Name
                                 ORDER BY ts2.sub_Name
                                 SEPARATOR ', '
                             )
                             FROM student_subjects ss2
                             INNER JOIN tbl_subject ts2
                                 ON ts2.subID = ss2.SubjectID
                             WHERE ss2.StudID = v.RegNo
                         ),
                         '-'
                     ) AS SubjectNames,
                     IFNULL(
                         (
                             SELECT GROUP_CONCAT(
                                 DISTINCT b2.batchname
                                 ORDER BY b2.batchname
                                 SEPARATOR ', '
                             )
                             FROM studentbatch sb2
                             INNER JOIN batch b2
                                 ON b2.batchid = sb2.batchid
                             WHERE sb2.studentid = v.RegNo
                         ),
                         '-'
                     ) AS BatchNames
                         FROM registration v
                         JOIN branch br ON v.BranchID = br.branchid
                         JOIN institute i ON br.Instituteid = i.Instituteid
                         LEFT JOIN enquiryallocate ea ON ea.regno = v.RegNo
                         LEFT JOIN users u ON u.user_id = v.userid
                         LEFT JOIN tblenquirystatus es ON (es.statusId = v.EnqStatus)
                         WHERE br.branch_status = 1
                           AND v.branchid = @BranchId
                           {0}
                           {1}
                         LIMIT @PageSize OFFSET @Offset";

        // Advanced search query (with course/subject/batch filters)
        public const string SearchStudentsAdvanced = @"
            SELECT DISTINCT v.RegNo,
    v.EnquiryDate,
    CONCAT(IF(v.Salutation IS NOT NULL, CONCAT(v.Salutation, ' '), ''), v.Fname, ' ', v.Mname, ' ', v.Lname) AS NAME, PContact, fmobile, mmobile, EmailId,
                IF(v.StatusFlag = 1, 'Active', 'Inactive') AS STATUS,
                Registered,
                IF(Registered = 'Yes', IF(ISNULL(RegNo_Manual), v.RegNo, RegNo_Manual), '') AS RegNo_Manual,
                IF(Registered = 'Yes', DATE_FORMAT(v.regdate, '%d/%m/%Y'), DATE_FORMAT(enquirydate, '%d/%m/%Y')) AS regdate,
                v.branchid, AllowStudModule,
                IF(Registered = 'Yes', v.regdate, enquirydate) AS RDate,
                IFNULL(es.enquiryStatus, '-') AS EnqStatus,
                enquirydate AS EnqDate,
                u.username,
                IFNULL(
                 (
                     SELECT GROUP_CONCAT(
                         DISTINCT tc2.course_Name
                         ORDER BY tc2.course_Name
                         SEPARATOR ', '
                     )
                     FROM student_course sc2
                     INNER JOIN tbl_course tc2
                         ON tc2.courseID = sc2.CourseID
                     WHERE sc2.StudID = v.RegNo
                 ),
                 '-'
             ) AS CourseNames,
             IFNULL(
                 (
                     SELECT GROUP_CONCAT(
                         DISTINCT ts2.sub_Name
                         ORDER BY ts2.sub_Name
                         SEPARATOR ', '
                     )
                     FROM student_subjects ss2
                     INNER JOIN tbl_subject ts2
                         ON ts2.subID = ss2.SubjectID
                     WHERE ss2.StudID = v.RegNo
                 ),
                 '-'
             ) AS SubjectNames,
             IFNULL(
                 (
                     SELECT GROUP_CONCAT(
                         DISTINCT b2.batchname
                         ORDER BY b2.batchname
                         SEPARATOR ', '
                     )
                     FROM studentbatch sb2
                     INNER JOIN batch b2
                         ON b2.batchid = sb2.batchid
                     WHERE sb2.studentid = v.RegNo
                 ),
                 '-'
             ) AS BatchNames
            FROM registration v
            JOIN branch br ON v.BranchID = br.branchid
            JOIN institute i ON br.Instituteid = i.Instituteid
            LEFT JOIN student_subjects s ON v.RegNo = s.StudID
            LEFT JOIN tbl_subject ts ON s.SubjectID = ts.subID
            LEFT JOIN tbl_course tc ON ts.courseID = tc.courseID
            LEFT JOIN studentbatch sb ON v.RegNo = sb.studentid
            LEFT JOIN batch b ON b.batchid = sb.batchid
            LEFT JOIN enquiryallocate ea ON ea.regno = v.RegNo
            LEFT JOIN users u ON u.user_id = v.userid
            LEFT JOIN tblenquirystatus es ON (es.statusId = v.EnqStatus)
            WHERE br.branch_status = 1
              AND v.branchid = @BranchId
              {0}
              {1}
            LIMIT @PageSize OFFSET @Offset";

        // Count query for basic search
        public const string SearchStudentsBasicCount = @"
            SELECT COUNT(DISTINCT v.RegNo)
            FROM registration v
            JOIN branch br ON v.BranchID = br.branchid
            JOIN institute i ON br.Instituteid = i.Instituteid
            LEFT JOIN enquiryallocate ea ON ea.regno = v.RegNo
            LEFT JOIN users u ON u.user_id = v.userid
            LEFT JOIN tblenquirystatus es ON (es.statusId = v.EnqStatus)
            WHERE br.branch_status = 1
              AND v.branchid = @BranchId
              {0}";

        // Count query for advanced search
        public const string SearchStudentsAdvancedCount = @"
            SELECT COUNT(DISTINCT v.RegNo)
            FROM registration v
            JOIN branch br ON v.BranchID = br.branchid
            JOIN institute i ON br.Instituteid = i.Instituteid
            LEFT JOIN student_subjects s ON v.RegNo = s.StudID
            LEFT JOIN tbl_subject ts ON s.SubjectID = ts.subID
            LEFT JOIN tbl_course tc ON ts.courseID = tc.courseID
            LEFT JOIN studentbatch sb ON v.RegNo = sb.studentid
            LEFT JOIN batch b ON b.batchid = sb.batchid
            LEFT JOIN enquiryallocate ea ON ea.regno = v.RegNo
            LEFT JOIN users u ON u.user_id = v.userid
            LEFT JOIN tblenquirystatus es ON (es.statusId = v.EnqStatus)
            WHERE br.branch_status = 1
              AND v.branchid = @BranchId
              {0}";

        // Enquiry-specific queries

        public const string InsertEnquiry = @"
           INSERT INTO registration (
    RegDate,
    EnquiryDate,
    Fname,
    Mname,
    Lname,
    CorrAddress,
    PermanentAdd,
    FatherFname,
    FatherMname,
    FatherLname,
    MotherFname,
    MotherMname,
    MotherLname,
    Occupation,
    OrgName,
    PContact,
    FMobile,
    MMobile,
    EmailId,
    DOB,
    Working,
    Company,
    Comments,
    Source,
    HomeNo,
    Salary,
    FollowDate,
    Registered,
    BranchID,
    city,
    state,
    cityc,
    statec,
    pincode,
    pincodec,
    RegNo_Manual,
    Stud_Category,
    Username,
    Password,
    District,
    DistrictC,
    walkIn,
    walkInDate,
    countryidc,
    stateidc,
    cityidc,
    othercityc,
    countryid,
    stateid,
    cityid,
    othercity,
    biometricattendanceid,
    newremarks,
    EnqStatus,
    Gender,
    Salutation,
    ParentCompanyName,
    GSTNumber,
    userid,
    Rollno,
    Age
) VALUES (
    @RegDate,
    @EnquiryDate,
    @Fname,
    @Mname,
    @Lname,
    @CorrAddress,
    @PermanentAdd,
    @FatherFname,
    @FatherMname,
    @FatherLname,
    @MotherFname,
    @MotherMname,
    @MotherLname,
    @Occupation,
    @OrgName,
    @PContact,
    @FMobile,
    @MMobile,
    @EmailId,
    @DOB,
    @Working,
    @Company,
    @Comments,
    @Source,
    @HomeNo,
    @Salary,
    @FollowDate,
    'No',
    @BranchId,
    @City,
    @State,
    @CityC,
    @StateC,
    @PinCode,
    @PinCodeC,
    @RegNo_Manual,
    @Stud_Category,
    @Username,
    @Password,
    @District,
    @DistrictC,
    @WalkIn,
    @WalkInDate,
    @CountryIdC,
    @StateIdC,
    @CityIdC,
    @OtherCityC,
    @CountryId,
    @StateId,
    @CityId,
    @OtherCity,
    @BiometricAttendanceId,
    @NewRemarks,
    @EnqStatus,
    @Gender,
    @Salutation,
    @ParentCompanyName,
    @GSTNumber,
    @UserId,
    @RollNo,
    @Age
);
SELECT LAST_INSERT_ID();";

        public const string InsertBatchDetails = @"
            INSERT INTO studentbatch (studentid, batchid, instituteid, branchid)
            VALUES (@StudId, @BatchId, @InstId, @BranchId)";

        public const string DeleteBatchDetails = @"
            DELETE FROM studentbatch WHERE studentid = @StudId";

        public const string InsertFollowUpRemarks = @"
            INSERT INTO followupremarks_detail (studid, statusid, callDate, remarks, called_by, interested, instid, branchid, callbackdate, user_id, time)
            VALUES (@StudId, @StatusId, @CallDate, @Remarks, @CalledBy, @Interested, @InstId, @BranchId, @CallbackDate, @UserId, @Time)";

        public const string UpdateFollowUpDate = @"
            UPDATE registration 
            SET FollowDate = @FollowDate, remark = @Remark 
            WHERE regno = @StudId AND branchid = @BranchId";

        public const string GetUserID = @"
            SELECT user_id FROM users WHERE loginid = @LoginId AND institute_id = @InstId";

        public const string GetDirectorAnnouncement = @"
            SELECT directortemplate, directorsetting, directortemplateno 
            FROM annoucementsetting 
            WHERE instituteid = @InstId AND branchid = @BranchId";

        public const string GetEnquiryAnnouncement = @"
            SELECT enquirysetting, enquirytemplate, enquirytemplateno 
            FROM annoucementsetting 
            WHERE instituteid = @InstId AND branchid = @BranchId";

        public const string GetEmailEnquiryAnnouncement = @"
            SELECT enquiryemailids, enquirytemplate, enquirysetting 
            FROM emailannoucementsetting 
            WHERE instituteid = @InstId AND branchid = @BranchId";

        public const string InsertTempEducation = @"
    INSERT INTO temp_education (Degree, CollegeName, Stream, Percentage, Year1)
    VALUES (@Degree, @CollegeName, @Stream, @Percentage, @Year1)";
        public const string InsertEducationFromTemp = @"
    INSERT INTO educationdetail (Degree, collegename, Stream, Percentage, Year1, RegNo)
    SELECT Degree, CollegeName, Stream, Percentage, Year1, @RegNo
    FROM temp_education";

        public const string CheckUsername = @"
            SELECT COUNT(*) FROM registration WHERE Username = @Username";

        public const string InsertStudentSubject = @"
            INSERT INTO student_subjects (studid, subjectid, FeesType, SubRegDate)
            VALUES (@StudId, @SubjectId, @FeesType, @SubRegDate)";

        public const string InsertStudentOtherFeesMonthly = @"
            INSERT INTO student_otherfees (RegNo, of_code, amount, istaxable, isincluding, Months)
            VALUES (@RegNo, @OfCode, @Amount, @IsTaxable, @IsIncluding, @Months)";

        public const string AllocateEnquiry = @"
            UPDATE registration SET userid = @UserId WHERE regno = @RegNo";

        public const string GetCourseEnrollAnnouncement = @"
            SELECT courseenrollsetting, courseenrolltemplate, courseenrolltemplateno, registrationmobileno 
            FROM annoucementsetting 
            WHERE instituteid = @InstId AND branchid = @BranchId";

        public const string GetUsernamePasswordAnnouncement = @"
            SELECT usernamepasswordsetting, usernamepasswordtemplate, usernamepasswordtemplateno 
            FROM annoucementsetting 
            WHERE instituteid = @InstId AND branchid = @BranchId";

        public const string GetUsernamePasswordEmailAnnouncement = @"
            SELECT userpasswordsetting, userpasswordtemplate 
            FROM emailannoucementsetting 
            WHERE instituteid = @InstId AND branchid = @BranchId";

        public const string CheckUsernameExists = @"
            SELECT username, password FROM registration WHERE RegNo = @RegNo";

        public const string CheckBiometricDuplicate = @"
            SELECT COUNT(*) FROM registration WHERE biometricattendanceid = @BiometricAttendanceId AND RegNo <> @RegNo";

        public const string CheckRollNoDuplicate = @"
            SELECT COUNT(*) FROM registration WHERE Rollno = @RollNo AND RegNo <> @RegNo";

        public const string UpdateRegistration = @"
            UPDATE registration SET
                RegDate = @RegDate,
                Image = @Image,
                Gender = @Gender,
                Salutation = @Salutation,
                Fname = @Fname,
                Mname = @Mname,
                Lname = @Lname,
                CorrAddress = @CorrAddress,
                PermanentAdd = @PermanentAdd,
                FatherFname = @FatherFname,
                FatherMname = @FatherMname,
                FatherLname = @FatherLname,
                Occupation = @Occupation,
                OrgName = @OrgName,
                PContact = @PContact,
                FMobile = @FMobile,
                MMobile = @MMobile,
                EmailId = @EmailId,
                Working = @Working,
                city = @City,
                state = @State,
                cityc = @CityC,
                statec = @StateC,
                pincode = @PinCode,
                pincodec = @PinCodeC,
                Company = @Company,
                Comments = @Comments,
                Source = @Source,
                HomeNo = @HomeNo,
                DOB = @DOB,
                Registered = @Registered,
                enquirydate = @EnquiryDate,
                salary = @Salary,
                followdate = @FollowDate,
                branchid = @BranchId,
                RegNo_Manual = @RegNo_Manual,
                StatusFlag = @StatusFlag,
                stud_category = @Stud_Category,
                InactiveStatus = @InactiveStatus,
                District = @District,
                DistrictC = @DistrictC,
                walkIn = @WalkIn,
                walkInDate = @WalkInDate,
                countryidc = @CountryIdC,
                stateidc = @StateIdC,
                cityidc = @CityIdC,
                othercityc = @OtherCityC,
                countryid = @CountryId,
                stateid = @StateId,
                cityid = @CityId,
                othercity = @OtherCity,
                newremarks = @NewRemarks,
                Username = @Username,
                Password = @Password,
                biometricattendanceid = @BiometricAttendanceId,
                ParentCompanyName = @ParentCompanyName,
                GSTNumber = @GSTNumber,
                Age = @Age,
                Rollno = @RollNo
            WHERE RegNo = @RegNo";

        public const string DeleteStudentCourse = @"
            DELETE FROM student_course WHERE StudID = @StudId";

        public const string DeleteStudentSubject = @"
            DELETE FROM student_subjects WHERE StudID = @StudId AND isscheduled <> 'Y'";

        public const string GetStudentSubjectsForFees = @"
            SELECT SubjectId FROM student_subjects WHERE StudID = @StudId AND isscheduled <> 'Y'";

        public const string DeleteMonthlyFeesInstallment = @"
            DELETE FROM monthlyfeesinstallment WHERE studentid = @StudentId AND subjectid IN (@SubjectIds)";

        public const string DeleteStudentOtherFees = @"
            DELETE FROM student_otherfees WHERE RegNo = @RegNo";

        public const string DeleteStudentOtherFeesUnpaid = @"
            DELETE FROM student_otherfees WHERE RegNo = @RegNo AND of_code = @OfCode AND ispaid = 0";

        public const string GetStudentOtherFees = @"
            SELECT DISTINCT of_code FROM student_otherfees WHERE RegNo = @RegNo";

        public const string GetOtherFeesByCode = @"
            SELECT * FROM otherfees WHERE of_code = @OfCode";

        public const string GetStudentOtherFeesByCode = @"
            SELECT * FROM student_otherfees WHERE RegNo = @RegNo AND of_code = @OfCode";

        public const string DeleteEducation = @"
            DELETE FROM educationdetail WHERE RegNo = @RegNo";

        public const string UpdateAutoRegCounterWithPrefix = @"
            UPDATE regnoformat SET counter = @Counter, prefix = @Prefix WHERE instid = @InstId AND branchid = @BranchId AND counter <> 0";

        public const string RegisterBatchDetails = @"
            INSERT INTO studentbatch (studentid, batchid, instituteid, stdnme, branchid)
            VALUES (@GetRegID, @batchid, @instid, @studentname, @branchid)";

        public const string GetLastRegNo = @"
            SELECT MAX(RegNo)
            FROM Registration;";

        public const string GetRegNoManual = @"
            SELECT regno as id,regno_manual as name FROM registration where Branchid=@BranchId and regno_manual<>''order by regno desc limit 10;";

        // Enquiry update queries
        public const string CheckDuplicateEnquiryUpdate = @"
            SELECT COUNT(*)
            FROM registration
            WHERE fname = @FirstName
            AND lname = @LastName
            AND pcontact = @Mobile
            AND branchid = @BranchId
            AND RegNo <> @RegNo";

        public const string UpdateEnquiryRegistration = @"
            UPDATE registration SET
                RegDate = @RegDate,
                Image = @Photo,
                Gender = @Gender,
                Salutation = @Salutation,
                Fname = @FirstName,
                Mname = @MiddleName,
                Lname = @LastName,
                CorrAddress = @Address,
                PermanentAdd = @PermanentAddress,
                FatherFname = @FatherFirstName,
                FatherMname = @FatherMiddleName,
                FatherLname = @FatherLastName,
                MotherFname = @MotherFirstName,
                MotherMname = @MotherMiddleName,
                MotherLname = @MotherLastName,
                Occupation = @Occupation,
                OrgName = @Organization,
                Income = @Salary,
                PContact = @Mobile,
                FMobile = @Mobile1,
                MMobile = @Mobile2,
                EmailId = @Email,
                Working = @WorkStatus,
                city = @City,
                state = @State,
                cityc = @CityC,
                statec = @StateC,
                pincode = @PinCode,
                pincodec = @PinCodeC,
                Company = @Comments,
                Comments = @Source,
                Source = @Source,
                HomeNo = @HomePhone,
                DOB = @DateOfBirth,
                Registered = 'No',
                enquirydate = @EnquiryDate,
                salary = @Salary,
                followdate = @FollowUpDate,
                branchid = @BranchId,
                RegNo_Manual = @RegNo,
                StatusFlag = 1,
                stud_category = @Category,
                InactiveStatus = 'Active',
                District = @State,
                DistrictC = @StateC,
                walkIn = @WalkIn,
                walkInDate = @WalkInDate,
                countryidc = @CountryIdC,
                stateidc = @StateIdC,
                cityidc = @CityIdC,
                othercityc = @OtherCityC,
                countryid = @CountryId,
                stateid = @StateId,
                cityid = @CityId,
                othercity = @OtherCity,
                newremarks = @Remarks,
                EnqStatus = @EnqStatus,
                biometricattendanceid = @BiometricAttendanceId,
                ParentCompanyName = @ParentCompanyName,
                GSTNumber = @ParentGSTNo,
                Age = @Age,
                Rollno = NULL
            WHERE RegNo = @RegNo";

        public const string DeleteStudentCourses = @"
            DELETE FROM student_course WHERE StudID = @RegNo";

        public const string DeleteStudentSubjects = @"
            DELETE FROM monthlyfeesinstallment
            WHERE studentid = @RegNo
            AND subjectid IN (
                SELECT SubjectId FROM student_subjects
                WHERE StudID = @RegNo AND isscheduled <> 'Y'
            );

            DELETE FROM student_subjects
            WHERE StudID = @RegNo AND isscheduled <> 'Y'";

        public const string DeleteEnquiryBatchDetails = @"
            DELETE FROM enquirybatchdetails WHERE RegNo = @RegNo";

        public const string InsertEnquiryBatchDetails = @"
            INSERT INTO enquirybatchdetails(RegNo, batchid, instituteid, branchid)
            VALUES (@RegNo, @BatchId, @InstId, @BranchId)";

        public const string DeleteEducationDetails = @"
            DELETE FROM educationdetail WHERE RegNo = @RegNo";

        public const string InsertEducationDetail = @"
            INSERT INTO educationdetail(Degree, collegename, Stream, Percentage, Year1, RegNo)
            VALUES (@Degree, @CollegeName, @Stream, @Percentage, @Year, @RegNo)";

        public const string InsertFollowUpRemark = @"
            INSERT INTO followupremarks_detail(studid, statusid, callDate, remarks, called_by, interested, instid, branchid, callbackdate, user_id, time)
            VALUES (@StudId, @StatusId, @CallDate, @Remarks, @CalledBy, @Interested, @InstId, @BranchId, @CallbackDate, @UserId, @Time)";

        // Enquiry Follow-up Search Queries
        public const string GetStudentListBase = @"
            SELECT r.RegNo,
                   IF(Registered='Yes',DATE_FORMAT(r.regdate, '%d/%m/%Y'),DATE_FORMAT(r.enquirydate, '%d/%m/%Y')) As enquirydate,
                   CONCAT_WS(' ',r.Fname,r.Mname,r.Lname) AS NAME,
                   r.pcontact,
                   (SELECT GROUP_CONCAT(DISTINCT ts.Sub_Name) FROM tbl_Subject ts
                    LEFT JOIN student_subjects ss ON ts.SubId=ss.SubjectId AND ss.feestype <> 'Other'
                    WHERE ss.StudID=r.RegNo) As Subjects,
                   (SELECT IF(CallBackDate='0001-01-01 00:00:00','',DATE_FORMAT(CallBackDate,'%d/%m/%Y %r'))
                    FROM followupremarks_detail a WHERE a.studid = r.RegNo ORDER BY a.calldate DESC LIMIT 1) AS CallBackDate,
                   (SELECT a.time FROM followupremarks_detail a WHERE a.studid = r.RegNo ORDER BY a.calldate DESC LIMIT 1) AS callbacktime,
                   (SELECT IF(followdate='0001-01-01 00:00:00','',DATE_FORMAT(followdate,'%d/%m/%Y %r'))
                    FROM followupremarks_detail a WHERE a.studid = r.RegNo ORDER BY a.calldate DESC LIMIT 1) AS followdate,
                   r.remark,
                   IF(ISNULL(r.regno_manual),r.regno,r.regno_manual) AS regno_manual,
                   r.EnqStatus AS EnquiryStatus,
                   r.Registered,
                   IF(Registered = 'Yes', r.regdate,r.enquirydate) AS EDate,
                   IFNULL(es.enquiryStatus,'-') AS EnqStatus,
                   fd.interested As IsInterested
            FROM registration r
            INNER JOIN branch b ON r.BranchID = b.Branchid
            LEFT JOIN followupremarks_detail fd ON r.RegNo = fd.studid
            WHERE b.instituteid = @InstituteId
              AND r.branchid = @BranchId
              AND r.statusflag = 1
              {0}";

        public const string GetPendingCallBackListBase = @"
            SELECT r.RegNo,
                   DATE_FORMAT(r.enquirydate,'%d/%m/%Y') As enquirydate,
                   CONCAT_WS(' ',r.Fname,r.Mname,r.Lname) AS NAME,
                   r.pcontact,
                   (SELECT GROUP_CONCAT(DISTINCT ts.Sub_Name) FROM tbl_Subject ts
                    LEFT JOIN student_subjects ss ON ts.SubId=ss.SubjectId AND ss.feestype <> 'Other'
                    WHERE ss.StudID=r.RegNo) As Subjects,
                   (SELECT IF(CallBackDate='0001-01-01 00:00:00','',DATE_FORMAT(CallBackDate,'%d/%m/%Y %r'))
                    FROM followupremarks_detail a WHERE a.studid=r.RegNo {0} ORDER BY a.calldate DESC LIMIT 1) AS CallBackDate,
                   (SELECT a.time FROM followupremarks_detail a WHERE a.studid = r.RegNo {1} ORDER BY a.time DESC LIMIT 1) AS callbacktime,
                   (SELECT IF(followdate = '0001-01-01 00:00:00', '', DATE_FORMAT(followdate, '%d/%m/%Y %r'))
                    FROM followupremarks_detail a WHERE a.studid = r.RegNo {0} ORDER BY a.calldate DESC LIMIT 1) AS followdate,
                   r.remark,
                   IF(ISNULL(r.regno_manual), r.regno, r.regno_manual) AS regno_manual,
                   r.EnqStatus AS EnquiryStatus,
                   IF(r.EnqStatus IS NULL OR r.EnqStatus=0,'',IF(r.EnqStatus =1,'HOT',IF(r.EnqStatus=2,'WARM',IF(r.EnqStatus=3,'COLD','DEAD')))) AS EnqStatus,
                   r.Registered,
                   r.EnquiryDate as EDate,
                   fd.interested As IsInterested
            FROM registration r
            INNER JOIN branch b ON r.BranchID = b.Branchid
            LEFT JOIN followupremarks_detail fd ON r.RegNo = fd.studid
            {2}
            WHERE b.instituteid = @InstituteId
              AND r.branchid = @BranchId
              {3}";

        public const string GetStudentListCountBase = @"
            SELECT COUNT(DISTINCT r.RegNo)
            FROM registration r
            INNER JOIN branch b ON r.BranchID = b.Branchid
            WHERE b.instituteid = @InstituteId
              AND r.branchid = @BranchId
              AND r.statusflag = 1
              {0}";

        public const string GetPendingCallBackListCountBase = @"
            SELECT COUNT(DISTINCT r.RegNo)
            FROM registration r
            INNER JOIN branch b ON r.BranchID = b.Branchid
            {0}
            WHERE b.instituteid = @InstituteId
              AND r.branchid = @BranchId
              {1}";

        public const string SaveLastRemarksWithCallback = @"
            INSERT INTO followupremarks_detail(studid, statusid, callDate, remarks, called_by, interested, instid, branchid, callbackdate, user_id, time)
            VALUES (@StudId, @StatusId, @CallDate, @Remarks, @CalledBy, @Interested, @InstId, @BranchId, @CallbackDate, @UserId, @Time)";

        public const string SaveLastRemarksWithoutCallback = @"
            INSERT INTO followupremarks_detail(studid, statusid, callDate, remarks, called_by, interested, instid, branchid, user_id)
            VALUES (@StudId, @StatusId, @CallDate, @Remarks, @CalledBy, @Interested, @InstId, @BranchId, @UserId)";

        public const string UpdateFollowupDt = @"
            UPDATE registration
            SET FollowDate = @FollowDate,
                remark = @Remark,
                EnqStatus = @EnqStatus
            WHERE regno = @RegNo AND branchid = @BranchId";

        public const string GetLastRemarks = @"
            SELECT DATE_FORMAT(calldate,'%d/%m/%Y %r') as calldate,
                   remarks,
                   called_by,
                   callid,
                   DATE_FORMAT(callbackdate,'%d/%m/%Y') As callbackdate,
                   TIME AS callbacktime
            FROM followupremarks_detail
            WHERE instid = @InstId
              AND branchid = @BranchId
              AND studid = @StudId
            ORDER BY callid DESC
            LIMIT 5";

        public const string DeleteFollowUpRemark = @"
            DELETE FROM followupremarks_detail WHERE callid = @CallId";

        public const string CheckFollowUpStatusExists = @"
            SELECT COUNT(*) FROM enquiryfollowupstatus
            WHERE sname = @StatusName
              AND (@StatusId = 0 OR statusid NOT IN (@StatusId))";

        public const string AddFollowUpStatus = @"
            INSERT INTO enquiryfollowupstatus(sname, sflag, instid, branchid, reminder)
            VALUES (@StatusName, @Flag, @InstId, @BranchId, @Reminder);
            SELECT LAST_INSERT_ID();";

        public const string UpdateFollowUpStatus = @"
            UPDATE enquiryfollowupstatus
            SET sname = @StatusName,
                sflag = @Flag,
                reminder = @Reminder
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
              AND statusid = @StatusId";

        public const string UpdateFollowUpRemarks = @"
            UPDATE followupremarks_detail
            SET remarks = @StatusName
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
              AND statusid = @StatusId";

        public const string GetFollowUpStatusById = @"
            SELECT statusid,
                   sname as statusname,
                   sflag as flag,
                   IF(sflag = 0, 'YES', 'NO') as productive,
                   reminder
            FROM enquiryfollowupstatus
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
              AND statusid = @StatusId";

        public const string GetFollowUpStatusListCount = @"
            SELECT COUNT(*)
            FROM enquiryfollowupstatus
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)";

        public const string GetFollowUpStatusList = @"
            SELECT statusid,
                   sname as statusname,
                   sflag as flag,
                   IF(sflag = 0, 'YES', 'NO') as productive,
                   instid,
                   reminder
            FROM enquiryfollowupstatus
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
            ORDER BY sname
            LIMIT @Limit OFFSET @Offset";

        public const string DeleteFollowUpRemarksByStatusId = @"
            DELETE FROM followupremarks_detail
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
              AND statusid = @StatusId";

        public const string DeleteFollowUpStatus = @"
            DELETE FROM enquiryfollowupstatus
            WHERE (instid = @InstId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
              AND statusid = @StatusId";

        public const string SearchEnquiryAllocation = @"
            SELECT DISTINCT r.RegNo, Concat_WS(' ', r.Fname, r.Mname, r.Lname) AS StudName,
                    IF(r.registered= 'No','', IF(r.RegNo_Manual IS NULL, r.RegNo, IF(r.RegNo_Manual = '', r.RegNo, 
                    r.RegNo_Manual))) AS RegNo_Manual, 
                    IF(Registered = 'Yes', DATE_FORMAT(r.regdate, '%d/%m/%Y'), DATE_FORMAT(r.enquirydate, '%d/%m/%Y')) AS EnquiryDate,
                    r.registered,u.username, 
                    IFNULL(es.enquiryStatus,'-') AS EnqStatus, 
                    IF(Registered = 'Yes', r.regdate, r.enquirydate) AS EDate, DATE_FORMAT(alctdate,'%d/%m/%Y %h:%i %p') Allocatedate,UNIX_TIMESTAMP()
                    FROM registration r 
                    LEFT JOIN enquiryallocate ea on r.regno = ea.regno {0}
                    LEFT JOIN users u on u.user_Id = ea.user_Id 
                    LEFT JOIN student_subjects s on s.studId = r.RegNo 
                    LEFT JOIN tblenquirystatus es ON (es.statusId=r.EnqStatus) {1}  
                    UNION
                    SELECT DISTINCT r.RegNo, Concat_WS(' ', r.Fname, r.Mname, r.Lname) AS StudName,
                    IF(r.registered = 'No', '', IF(r.RegNo_Manual IS NULL, r.RegNo, IF(r.RegNo_Manual = '', r.RegNo,
                    r.RegNo_Manual))) AS RegNo_Manual,
                    IF(Registered = 'Yes', DATE_FORMAT(r.regdate, '%d/%m/%Y'), DATE_FORMAT(r.enquirydate, '%d/%m/%Y')) AS EnquiryDate,
                    r.registered,u.username, 
                    IFNULL(es.enquiryStatus,'-') AS EnqStatus,
                    IF(Registered = 'Yes', r.regdate, r.enquirydate) AS EDate, DATE_FORMAT(alctdate, '%d/%m/%Y %h:%i %p') Allocatedate,UNIX_TIMESTAMP()
                    FROM registration r 
                    LEFT JOIN enquiryallocate ea on r.regno = ea.regno {0}
                    LEFT JOIN users u on u.user_Id = ea.user_Id
                    LEFT JOIN student_subjects s on s.studId = r.RegNo 
                    LEFT JOIN tblenquirystatus es ON (es.statusId=r.EnqStatus) {2} 
                    ORDER BY Allocatedate DESC";

        public const string SearchEnquiryAllocationBase = @"
            SELECT DISTINCT r.RegNo, Concat_WS(' ', r.Fname, r.Mname, r.Lname) AS StudName,
                    IF(r.registered= 'No','', IF(r.RegNo_Manual IS NULL, r.RegNo, IF(r.RegNo_Manual = '', r.RegNo,
                    r.RegNo_Manual))) AS RegNo_Manual,
                    IF(Registered = 'Yes', DATE_FORMAT(r.regdate, '%d/%m/%Y'), DATE_FORMAT(r.enquirydate, '%d/%m/%Y')) AS EnquiryDate,
                    r.registered,u.username,
                    IFNULL(es.enquiryStatus,'-') AS EnqStatus,
                    IF(Registered = 'Yes', r.regdate, r.enquirydate) AS EDate, DATE_FORMAT(alctdate,'%d/%m/%Y %h:%i %p') Allocatedate,UNIX_TIMESTAMP()
            FROM registration r
            LEFT JOIN enquiryallocate ea on r.regno = ea.regno and r.registered=@Registered
            LEFT JOIN users u on u.user_Id = ea.user_Id
            LEFT JOIN student_subjects s on s.studId = r.RegNo
            LEFT JOIN tblenquirystatus es ON (es.statusId=r.EnqStatus)
            WHERE r.statusflag=1 and r.branchId=@BranchId{0}
            UNION
            SELECT DISTINCT r.RegNo, Concat_WS(' ', r.Fname, r.Mname, r.Lname) AS StudName,
                    IF(r.registered = 'No', '', IF(r.RegNo_Manual IS NULL, r.RegNo, IF(r.RegNo_Manual = '', r.RegNo,
                    r.RegNo_Manual))) AS RegNo_Manual,
                    IF(Registered = 'Yes', DATE_FORMAT(r.regdate, '%d/%m/%Y'), DATE_FORMAT(r.enquirydate, '%d/%m/%Y')) AS EnquiryDate,
                    r.registered,u.username,
                    IFNULL(es.enquiryStatus,'-') AS EnqStatus,
                    IF(Registered = 'Yes', r.regdate, r.enquirydate) AS EDate, DATE_FORMAT(alctdate, '%d/%m/%Y %h:%i %p') Allocatedate,UNIX_TIMESTAMP()
            FROM registration r
            LEFT JOIN enquiryallocate ea on r.regno = ea.regno and r.registered=@Registered
            LEFT JOIN users u on u.user_Id = ea.user_Id
            LEFT JOIN student_subjects s on s.studId = r.RegNo
            LEFT JOIN tblenquirystatus es ON (es.statusId=r.EnqStatus)
            WHERE r.statusflag=1 and r.branchId=@BranchId{0}{1}
            ORDER BY {2} {3}";

        public const string DeleteEnquiryAllocation = @"
            DELETE FROM enquiryallocate 
            WHERE regno IN ({0})";

        public const string InsertEnquiryAllocation = @"
            INSERT INTO enquiryallocate(regno, user_Id, alctdate) 
            VALUES({0}, {1}, '{2}')";

        public const string GetUserById = @"
            SELECT Username, Email 
            FROM users 
            WHERE Institute_Id = @InstituteId 
              AND Branch_Id = @BranchId 
              AND User_id = @UserId";

        public const string GetUserEmail = @"
            SELECT Email 
            FROM users 
            WHERE Institute_Id = @InstituteId 
              AND Branch_Id = @BranchId 
              AND User_id = @UserId";

        public const string UpdateStudentStatusActive = @"
            UPDATE registration
            SET StatusFlag = @Status, InactiveStatus = NULL
            WHERE RegNo = @StudentId";

        public const string UpdateStudentStatusInactive = @"
            UPDATE registration
            SET StatusFlag = @Status, InactiveStatus = @InactiveStatus
            WHERE RegNo = @StudentId";

        // Bulk delete queries - executed in order to maintain referential integrity
        public const string BulkDeleteBatchAttendance = "DELETE FROM batchattendence WHERE studentid IN @StudentIds";
        public const string BulkDeleteExternalExamScores = "DELETE FROM tbl_extexamscore WHERE regno IN @StudentIds";
        public const string BulkDeleteEducationDetails = "DELETE FROM educationdetail WHERE RegNo IN @StudentIds";
        public const string BulkDeleteStudentSubjects = "DELETE FROM student_subjects WHERE studID IN @StudentIds";
        public const string BulkDeleteStudentCourses = "DELETE FROM student_course WHERE studID IN @StudentIds";
        public const string BulkDeleteStudentBatches = "DELETE FROM studentbatch WHERE studentID IN @StudentIds";
        public const string BulkDeleteAssignmentResults = "DELETE FROM assignmentresult WHERE RegNo IN @StudentIds";
        public const string BulkDeleteInstallmentsSubject = "DELETE FROM installments_subject WHERE Installment_Id IN (SELECT DISTINCT Installment_id FROM payment_installments WHERE Payment_Id IN (SELECT DISTINCT Payment_Id FROM payment WHERE Stud_Id IN @StudentIds))";
        public const string BulkDeleteInstallmentsReceived = "DELETE FROM installments_received WHERE Installment_Id IN (SELECT DISTINCT Installment_id FROM payment_installments WHERE Payment_Id IN (SELECT DISTINCT Payment_Id FROM payment WHERE Stud_Id IN @StudentIds))";
        public const string BulkDeletePaymentInstallments = "DELETE FROM payment_installments WHERE Payment_Id IN (SELECT DISTINCT Payment_Id FROM payment WHERE stud_id IN @StudentIds)";
        public const string BulkDeletePaymentsReceived = "DELETE FROM payments_received WHERE Payment_Id IN (SELECT DISTINCT Payment_Id FROM payment WHERE Stud_Id IN @StudentIds)";
        public const string BulkDeletePaymentProcess = "DELETE FROM paymentprocess WHERE Payment_id IN (SELECT DISTINCT Payment_Id FROM payment WHERE Stud_Id IN @StudentIds)";
        public const string BulkDeleteDirectPayment = "DELETE FROM direct_payment WHERE Payment_Id IN (SELECT DISTINCT Payment_Id FROM payment WHERE Stud_Id IN @StudentIds)";
        public const string BulkDeleteDiscount = "DELETE FROM discount WHERE payment_id IN (SELECT DISTINCT Payment_Id FROM payment WHERE stud_id IN @StudentIds)";
        public const string BulkDeleteMonthlyFeesInstallment = "DELETE FROM monthlyfeesinstallment WHERE studentid IN @StudentIds";
        public const string BulkDeletePayment = "DELETE FROM payment WHERE stud_id IN @StudentIds";
        public const string BulkDeleteRefund = "DELETE FROM refund WHERE stud_id IN @StudentIds";
        public const string BulkDeleteMonthlyFeesInstallmentByPayment = "DELETE FROM monthlyfeesinstallment WHERE paymentid IN (SELECT DISTINCT Payment_Id FROM payment WHERE stud_id IN @StudentIds)";
        public const string BulkDeleteStudentRoom = "DELETE FROM studentroom WHERE RegNo IN @StudentIds";
        public const string BulkDeleteStudentBus = "DELETE FROM studentbus WHERE RegNo IN @StudentIds";
        public const string BulkDeleteCheckupDetails = "DELETE FROM checkupdetails WHERE RegNo IN @StudentIds";
        public const string BulkDeleteFollowUpRemarksDetail = "DELETE FROM followupremarks_detail WHERE studid IN @StudentIds";
        public const string BulkDeleteStudentSubjectMarks = "DELETE FROM studsubmarks WHERE studid IN @StudentIds";
        public const string BulkDeleteTestResultStudent = "DELETE FROM testresult_student WHERE studentid IN @StudentIds";
        public const string BulkDeleteRegistration = "DELETE FROM registration WHERE RegNo IN @StudentIds";

        // Single student delete queries
        public const string SoftDeleteStudent = "UPDATE registration SET StatusFlag = @Status WHERE RegNo = @StudentId";
        public const string DeleteSingleStudentBatchAttendance = "DELETE FROM batchattendence WHERE studentID = @StudentId";
        public const string DeleteSingleStudentExternalExamScores = "DELETE FROM tbl_extexamscore WHERE regno = @StudentId";
        public const string DeleteSingleStudentEducationDetails = "DELETE FROM educationdetail WHERE RegNo = @StudentId";
        public const string DeleteSingleStudentSubjects = "DELETE FROM student_subjects WHERE studID = @StudentId AND payment_id = 0";
        public const string DeleteSingleStudentCourses = "DELETE FROM student_course WHERE studID = @StudentId";
        public const string DeleteSingleStudentBatches = "DELETE FROM studentbatch WHERE studentID = @StudentId";
        public const string DeleteSingleStudentRegistration = "DELETE FROM registration WHERE RegNo = @StudentId";
    }
}
