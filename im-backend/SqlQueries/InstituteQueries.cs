namespace IM_backend.SqlQueries
{
    public static class InstituteQueries
    {
        public const string CheckUsernameAvailability = @"
            SELECT COUNT(*) 
            FROM users 
            WHERE LoginID = @Username";

        public const string CreateInstitute = @"
            INSERT INTO Institute (
                Institutename, Contactperson, Phone, Email, Address, CpMobile, CpEmail, 
                RegDate, RegType, ExpiryDate, NoOfStudents, NoOfReg, NoOfEnq, PayType, 
                Total, Enq, Reg, NoOfBranches, AllowStudModule, countryid, stateid, 
                cityid, othercity, pincode, NoofRegAllowed, NoofEnqAllowed, 
                InstituteNoofStudents, InstituteProCoachingFor, IsBranchwise
            ) VALUES (
                @Name, @Person, @Phone, @Email, @Address, @CpMobile, @CpEmail,
                @RegDate, 0, @ExpiryDate, @NoOfStudents, @NoOfReg, @NoOfEnq, 2,
                1, 0, 0, 1, 0, @CountryId, @StateId,
                @CityId, @OtherCity, @PinCode, @NoOfReg, @NoOfEnq,
                @InstNoofStuds, @InstProCoachingFor, @IsBranchWise
            );
            SELECT LAST_INSERT_ID();";

        public const string CreateInstUser = @"
            INSERT INTO users (
                Username, Email, LoginID, Role_id, Institute_id, Branch_id, address, 
                address2, mobile, contact, loginstatus, countryid, stateid, cityid, 
                othercity, countryidc, stateidc, cityidc, othercityc, pincodeC
            ) VALUES (
                @UserName, @Email, @LoginId, @UserType, @InstituteId, 0, @Address,
                @Address2, @Mobile, @Contact, 1, @CountryId, @StateId, @CityId,
                @OtherCity, @CountryIdc, @StateIdc, @CityIdc, @OtherCityc, @PinCodeC
            );
            SELECT LAST_INSERT_ID();";

        public const string UpdateUserPassword = @"
            UPDATE users 
            SET Passwd = @Password 
            WHERE User_id = @UserId";

        public const string UpdateInstituteMetadata = @"
            UPDATE Institute 
            SET CreateDateTime = @CreateDateTime, 
                CreateByUserId = @CreateByUserId, 
                IpAddress = @IpAddress 
            WHERE Instituteid = @InstituteId";

        public const string CreateBranch = @"
            INSERT INTO branch (
                Branchname, Contactperson, Instituteid, Phone, Email, Address, City, 
                BranchCode, CpMobile, CpEmail, pincode, state, tax_rate, regdate, 
                expirydate, countryid, stateid, cityid, othercity
            ) VALUES (
                'HQ', @Person, @InstituteId, @Phone, @Email, @Address, '',
                '', @CpMobile, @CpEmail, @PinCode, '', 0, @RegDate,
                @ExpiryDate, @CountryId, @StateId, @CityId, @OtherCity
            );
            SELECT LAST_INSERT_ID();";

        public const string CreateConfig = @"
            INSERT INTO config (Branch_Id, Institute_Id, IsShowAllBatchesToTrainer)
            VALUES (@BranchId, @InstituteId, 1);
            SELECT LAST_INSERT_ID();";

        public const string CreateRegNoFormat = @"
            INSERT INTO regnoformat (instid, branchid, prefix, regformat, counter, reglevel, automated)
            VALUES (@InstituteId, '0', '', '0', '0', '0', 0)";

        public const string CreateReceiptNoFormat = @"
            INSERT INTO receiptnoformat (instid, branchid, prefix, regformat, counter, reglevel, automated)
            VALUES (@InstituteId, '0', '', '0', '0', '0', 0)";

        public const string GetUserIdByUsername = @"
            SELECT User_id 
            FROM users 
            WHERE LoginID = @Username";

        public const string GetInstituteIdByUserId = @"
            SELECT Institute_id 
            FROM users 
            WHERE User_id = @UserId";

        public const string GetBranchIdByUserId = @"
            SELECT Branch_id 
            FROM users 
            WHERE User_id = @UserId";

        //public const string GetInstitutes = @"
        //    SELECT DISTINCT Institutename, Instituteid, Contactperson, Address, City, CpMobile, CpEmail, state,
        //           IF(institute_status=1,'Active','Inactive') status,
        //           tax_rate,
        //           IF(RegDate='0000-00-00','',regdate) AS RegDate,
        //           PayType,
        //           IF(RegType=1,'Premium','Trial') AS RegType,
        //           IF(IF((oph.isactive = 0 OR oph.isactive IS NULL),Expirydate,oph.enddate)='0000-00-00','',IF((oph.isactive = 0 OR oph.isactive IS NULL),Expirydate,oph.enddate)) AS Expirydate,
        //           p.PlanName AS institutePlan
        //    FROM institute i
        //    LEFT JOIN onlinepaymenthistory oph ON oph.instid = i.instituteid AND oph.isactive=1 
        //    INNER JOIN plans p ON (p.planid=i.institutePlan)
        //    WHERE 1=1 
        //        {0}
        //    {1}
        //    LIMIT @PageSize OFFSET @Offset";

        public const string GetInstitutes = @"
    SELECT
        i.Institutename,
        i.Instituteid,
        i.Contactperson,
        i.Address,
        i.City,
        i.CpMobile,
        i.CpEmail,
        i.state,

        IF(
            i.institute_status = 1,
            'Active',
            'Inactive'
        ) AS status,

        i.tax_rate,

        IF(
            i.RegDate = '0000-00-00',
            '',
            i.RegDate
        ) AS RegDate,

        i.PayType,

        IF(
            i.RegType = 1,
            'Premium',
            'Trial'
        ) AS RegType,

        IF(
            oph.instid IS NULL,
            IF(i.Expirydate = '0000-00-00', '', i.Expirydate),
            IF(oph.enddate = '0000-00-00', '', oph.enddate)
        ) AS Expirydate,

        p.PlanName AS institutePlan

    FROM
    (
        SELECT
            i.*
        FROM institute i
        WHERE 1 = 1
            {0}
        {1}
        LIMIT @PageSize OFFSET @Offset
    ) i

    INNER JOIN plans p
        ON p.planid = i.institutePlan

    LEFT JOIN onlinepaymenthistory oph
        ON oph.instid = i.Instituteid
        AND oph.isactive = 1";

        //public const string GetInstitutesCount = @"
        //    SELECT COUNT(DISTINCT Instituteid)
        //    FROM institute i
        //    LEFT JOIN onlinepaymenthistory oph ON oph.instid = i.instituteid AND oph.isactive=1
        //    WHERE 1=1 {0}";
        public const string GetInstitutesCount = @"
        SELECT COUNT(*)
        FROM institute i
        WHERE 1=1 {0}";
        public const string GetInstituteById = @"
            SELECT Instituteid, Institutename, ContactPerson, Phone, Email, Address, City, Logo, CpMobile, CpEmail, state, pincode, institute_STATUS,
            DATE_FORMAT(RegDate,'%d/%m/%Y') AS RegDate, RegType, DATE_FORMAT(ExpiryDate,'%d/%m/%Y') AS ExpiryDate, NoOfStudents, IFNULL(NoOfReg,0) NoOfReg, IFNULL(NoOfEnq,0) NoOfEnq, PayType, Total, 
            IFNULL(Enq,0) Enq, IFNULL(Reg,0) Reg, IFNULL(NoOfBranches,0) NoOfBranches,
            District, AllowStudModule, LogoPath, countryid, stateid, cityid, othercity, IsAllowedAndroidApp, IsAllowTestEngine,
            InstituteNoofStudents, InstituteProCoachingFor, salespersonname, InstituteShortCode, ParentCompanyName , contactPerson,
            institutePlan,isinternal
            FROM institute 
            WHERE Instituteid = @InstituteId";

        //public const string GetAccountHistory = @"
        //    SELECT oph.paymenthistoryid, oph.user_id, DATE_FORMAT(oph.purchasedate,'%d/%m/%Y') AS purchasedate, oph.amount,
        //           DATE_FORMAT(oph.startdate,'%Y/%m/%d') AS startdate, DATE_FORMAT(oph.enddate,'%Y/%m/%d') AS enddate, oph.isactive,
        //           oph.totalamount, noofstudents,
        //           IF(ordertype = 2, DATEDIFF(DATE_FORMAT(oph.enddate,'%Y/%m/%d'), DATE_FORMAT(oph.startdate,'%Y/%m/%d')), 0) AS Days,
        //           IF(ordertype = 1, TIMESTAMPDIFF(MONTH, DATE_FORMAT(oph.startdate,'%Y/%m/%d'), DATE_FORMAT(oph.enddate,'%Y/%m/%d')), 0) AS Months,
        //           noofenquiry, IF(oph.IsBranchWise,'Branch Wise','Student Wise') AS Type, oph.NoofBranches
        //    FROM onlinepaymenthistory oph
        //    WHERE oph.instid = @InstId";
        public const string GetAccountHistory = @"
            SELECT 
    CAST(oph.paymenthistoryid AS SIGNED) AS paymenthistoryid, 
    CAST(oph.user_id AS SIGNED) AS user_id, 
    DATE_FORMAT(oph.purchasedate, '%d/%m/%Y') AS purchasedate, 
    oph.amount,
    DATE_FORMAT(oph.startdate, '%d/%m/%Y') AS startdate, 
    DATE_FORMAT(oph.enddate, '%d/%m/%Y') AS enddate, 
    CAST(oph.isactive AS SIGNED) AS isactive,               
    oph.totalamount, 
    CAST(oph.noofstudents AS SIGNED) AS noofstudents,
    CAST(IF(ordertype = 2, DATEDIFF(oph.enddate, oph.startdate), 0) AS SIGNED) AS Days,
    CAST(IF(ordertype = 1, TIMESTAMPDIFF(MONTH, oph.startdate, oph.enddate), 0) AS SIGNED) AS Months,
    CAST(oph.noofenquiry AS SIGNED) AS noofenquiry, 
    CASE
    WHEN oph.IsBranchWise = 2 THEN 'Trial'
    WHEN oph.IsBranchWise = 1 THEN 'Branch Wise'
    ELSE 'Student Wise'
    END AS 'Type',
    CAST(oph.NoofBranches AS SIGNED) AS NoofBranches
    FROM onlinepaymenthistory oph
    WHERE oph.instid = @InstId;";

        public const string GetAccountHistoryCount = @"
            SELECT COUNT(*)
            FROM onlinepaymenthistory oph
            WHERE oph.instid = @InstId";

        // Soft delete - update institute status
        public const string SoftDeleteInstitute = @"
            UPDATE institute 
            SET institute_status = @Status 
            WHERE instituteid = @InstituteId";

        // Hard delete - cascade delete all related data
        public const string DeleteInstUser = @"
            DELETE FROM users WHERE Institute_id = @InstituteId";

        public const string DeleteInstTest = @"
            DELETE tc 
            FROM testcourse tc
            JOIN test t ON tc.testid = t.testid
            WHERE t.instid = @InstituteId;
            DELETE ts 
            FROM testsubject ts
            JOIN test t ON ts.testid = t.testid
            WHERE t.instid = @InstituteId;
            DELETE FROM testresult_student WHERE instid = @InstituteId;
            DELETE ssm 
            FROM studsubmarks ssm
            JOIN test t ON ssm.testid = t.testid
            WHERE t.instid= @InstituteId;
            DELETE FROM testresultid WHERE instid = @InstituteId;
            DELETE FROM test WHERE instid = @InstituteId;";
        public const string DeleteInstTrainer = @"
            DELETE FROM instattendet WHERE attainid IN(select attainId from instructorattendence where instid = @InstituteId);
            DELETE FROM instructorattendence WHERE instid = @InstituteId;
            DELETE FROM trainerbatch WHERE instid = @InstituteId;
            DELETE FROM trainercourse WHERE instid = @InstituteId;
            DELETE FROM trainersubject WHERE instid = @InstituteId;
            DELETE FROM staffcommision WHERE paymentid in(select paymentid from staffpayment where trainerid in(select distinct trainnerid from trainner where instid = @InstituteId));
            DELETE FROM staffpayment WHERE trainerid in(select distinct trainnerid from trainner where instid = @InstituteId);
            DELETE FROM staffsalary WHERE trainerid in(select distinct trainnerid from trainner where instid = @InstituteId);
            DELETE FROM trainner WHERE instid = @InstituteId;";

        public const string DeleteInstPayment = @"
            DELETE FROM otherfees WHERE institute_id = @InstituteId;
            DELETE FROM discount WHERE payment_id IN(SELECT payment_id FROM payment p inner join branch b on b.BranchId= p.BranchId where Instituteid = @InstituteId);
            DELETE FROM payments_received WHERE payment_ID IN(SELECT payment_id FROM payment p inner join branch b on b.BranchId= p.BranchId where Instituteid = @InstituteId);
            DELETE FROM paymentprocess WHERE Payment_id IN (SELECT payment_id FROM payment p inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM direct_payment WHERE payment_id IN (SELECT payment_id FROM payment p inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM installments_received WHERE installment_id IN (select installment_ID FROM payment_installments pi inner join payment p on pi.payment_id=p.payment_id inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM installments_subject WHERE installment_id IN (select installment_ID FROM payment_installments pi inner join payment p on pi.payment_id=p.payment_id inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM payment_installments WHERE payment_ID IN(SELECT payment_id FROM payment p inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM payment WHERE BranchId IN(SELECT BranchId FROM branch where Instituteid = @InstituteId);";

        public const string DeleteInstBatch = @"
            DELETE FROM batchattendence WHERE attendid in (select attendid FROM attendence where branchid in(select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM attendence WHERE batchid in(select batchid from batch where instituteid = @InstituteId);
            DELETE FROM batchcourse WHERE instid = @InstituteId;
            DELETE FROM batchsubject WHERE instid = @InstituteId;
            DELETE FROM trainerbatch WHERE instid = @InstituteId;
            DELETE FROM batchdays WHERE branchid in (select distinct branchid from branch where instituteid = @InstituteId);
            DELETE FROM batchtopic WHERE batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM assignmentallocation WHERE batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM assignmentresult WHERE evalid in (select distinct evalid from evaluateassignment where batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId)));
            DELETE FROM evaluateassignment WHERE batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM batch WHERE instituteid = @InstituteId;";

        public const string DeleteInstInventory = @"
            DELETE FROM inventoryunittype WHERE instid = @InstituteId;
            DELETE FROM inventory_issuedreturn WHERE itemcode in (select itemcode from inventoryitems where instid = @InstituteId);
            DELETE FROM inventory_goodsissued WHERE itemcode in (select itemcode from inventoryitems where instid = @InstituteId);
            DELETE FROM inventory_goodsreceived WHERE itemcode in (select itemcode from inventoryitems where instid = @InstituteId);
            DELETE FROM inventoryitems WHERE instid = @InstituteId;";

        public const string DeleteInstLibrary = @"
            DELETE FROM lib_bookallotted WHERE rtnbkId in (Select rtnbkId from lib_returnbook where branchId in (select branchid from branch where instituteid = @InstituteId)) or issuebkId in (select issuebkId from lib_issuebook where instituteid = @InstituteId);
            DELETE FROM lib_returnbook WHERE branchId in (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM lib_issuebook WHERE instituteid = @InstituteId;
            DELETE FROM lib_books WHERE branchId in (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM lib_subcategory WHERE CategoryID in (Select CategoryId from lib_category where InstituteId = @InstituteId);
            DELETE FROM lib_category WHERE InstituteId = @InstituteId;";

        public const string DeleteInstituteHostel = @"
            DELETE FROM studentroom WHERE hostelid in (select hostelid from hosteldetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM roomdetails WHERE hostelid in (select hostelid from hosteldetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM hosteldetails WHERE BranchId IN(select branchid from branch where instituteid = @InstituteId);";

        public const string DeleteInstituteTransport = @"
            DELETE FROM studentbus WHERE StopId in (select StopId from busstops where BranchId in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM busstops WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM studentbus WHERE busid IN (select busid from busdetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM busroute WHERE busid IN (select busid from busdetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM busdetails WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);";

        public const string DeleteInstituteHealth = @"
            DELETE FROM checkupdetails WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM doctors WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);";

        public const string DeleteInstFranchisee = @"
            DELETE FROM franchisee_certification_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_exam_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_fixed_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_course_comm WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_course_fee WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_stud_commall WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_stud_commsub WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_sub_fixed_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_details WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_payment WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchisee_course_fee WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchisee_course_comm WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchiseerecitems WHERE orderid in (select orderid from franchiseeorderitems where franchiseeId=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchiseeorderitems WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchisee WHERE branchid in (select branchid from branch where instituteid = @InstituteId);";

        public const string DeleteInstStudent = @"
            DELETE FROM studentbatch WHERE Instituteid = @InstituteId;
            DELETE FROM studsubmarks WHERE studid IN(select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM student_subjects WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM student_course WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM educationdetail WHERE RegNo IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM registration WHERE BranchId IN(select branchid from branch where instituteid = @InstituteId);";

        public const string DeleteInstStudentCourse = @"
            DELETE FROM student_subjects WHERE SubjectId IN (select subid from tbl_subject where courseID IN(select courseID from tbl_course where InstituteID = @InstituteId));
            DELETE FROM student_course WHERE CourseId IN (select courseID from tbl_course where InstituteID = @InstituteId);
            DELETE FROM tbl_subject WHERE courseID IN(select courseID from tbl_course where InstituteID = @InstituteId);
            DELETE FROM tbl_course WHERE InstituteID = @InstituteId;";

        public const string DeleteInstConfig = @"
            DELETE FROM config WHERE institute_id = @InstituteId";

        public const string DeleteInstNotification = @"
            DELETE FROM tblnotification WHERE BranchId in (select branchid from branch where instituteid = @InstituteId)";

        public const string DeleteInstBranch = @"
            DELETE FROM branch WHERE Instituteid = @InstituteId";

        public const string DeleteInstitute = @"
            DELETE FROM institute WHERE InstituteID = @InstituteId";

        public const string UpdateInstitute = @"
            UPDATE institute SET
                InstituteShortCode = @InstituteShortCode,
                ParentCompanyName = @ParentCompanyName,
                Institutename = @Institutename,
                Contactperson = @Contactperson,
                Phone = @Phone,
                Email = @Email,
                Address = @Address,
                Logo = @Logo,
                CpMobile = @CpMobile,
                CpEmail = @CpEmail,
                pincode = @pincode,
                stateid = @stateid,
                RegDate = @RegDate,
                NoOfStudents = @NoOfStudents,
                NoOfReg = @NoOfReg,
                NoOfEnq = @NoOfEnq,
                ExpiryDate = @ExpiryDate,
                RegType = @RegType,
                NoOfBranches = @NoOfBranches,
                cityid = @cityid,
                AllowStudModule = @AllowStudModule,
                LogoPath = @LogoPath,
                countryid = @countryid,
                othercity = @othercity,
                institute_status = @InstituteStatus,
                IsAllowedAndroidApp = @IsAllowedAndroidApp,
                IsAllowTestEngine = @IsAllowTestEngine,
                InstituteNoofStudents = @NoOfStudents,
                InstituteProCoachingFor = @InstProCoachingFor,
                salespersonname = @SalesPersonName,
                isinternal = @IsInternalUse,
                IsBranchWise = @IsBranchWise,
                LastModfiedTimestamp = @LastModfiedTimestamp,
                LastModifiedByUserID = @LastModifiedByUserID,
                IpAddress = @IpAddress,
                institutePlan=@institutePlan 
            WHERE instituteid = @instituteid";

        // Add Account History (Subscription)
        public const string AddAccount = @"
            UPDATE onlinepaymenthistory 
            SET isactive = 0 
            WHERE instid = @instid AND isactive = 1;
            
            INSERT INTO onlinepaymenthistory (user_id, purchasedate, startdate, enddate, amount, discountcode, discountamount, netamount, taxpercent, totalamount, remark, isactive, instid, branchid, noofmonths, noofstudents, noofenquiry, IsBranchWise, NoofBranches)
            VALUES (@userId, @purchasedate, @startdate, @enddate, @amount, @discountcode, @discountamount, @netamount, @taxpercent, @totalamount, @remark, @isactive, @instid, @branchid, @noofmonths, @noofstudents, @noofenquiry, @IsBranchWise, @NoofBranches);
            SELECT LAST_INSERT_ID();";

        // Validation Queries
        public const string CheckDuplicateInstituteShortCode = @"
            SELECT Instituteid FROM institute WHERE InstituteShortCode = @ShortCode AND InstituteId <> @InstituteId";

        public const string CheckCurrentPlanExpiry = @"
            SELECT paymenthistoryid, user_id, purchasedate, startdate, enddate, isactive, totalamount, noofstudents, noofmonths, noofenquiry
            FROM onlinepaymenthistory o
            WHERE o.instid = @InstId AND @TodaysDate BETWEEN startdate AND o.enddate AND o.isactive = 1
            ORDER BY paymenthistoryid DESC LIMIT 1";

        public const string GetBranchCount = @"
            SELECT i.paytype, IF(ISNULL(i.noofbranches),0,i.noofbranches) AS noofbranches, COUNT(branchid), i.expirydate
            FROM institute i
            LEFT JOIN branch b ON i.instituteid = b.instituteid
            WHERE i.instituteid = @InstId
            GROUP BY b.instituteid";

        public const string CheckInstStatus = @"
            SELECT paytype, total, enq, reg, noofstudents, noofreg, noofenq, COUNT(regno) as totalcount,
                IF((SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid = b.instituteid LEFT JOIN registration r ON b.branchid = r.branchid WHERE r.registered = 'yes' AND i.instituteid = @InstId GROUP BY b.instituteid) IS NULL, 0,
                    (SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid = b.instituteid LEFT JOIN registration r ON b.branchid = r.branchid WHERE r.registered = 'yes' AND i.instituteid = @InstId GROUP BY b.instituteid)) AS regcount,
                IF((SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid = b.instituteid LEFT JOIN registration r ON b.branchid = r.branchid WHERE r.registered = 'no' AND i.instituteid = @InstId GROUP BY b.instituteid) IS NULL, 0,
                    (SELECT COUNT(regno) FROM institute i JOIN branch b ON i.instituteid = b.instituteid LEFT JOIN registration r ON b.branchid = r.branchid WHERE r.registered = 'no' AND i.instituteid = @InstId GROUP BY b.instituteid)) AS enqcount,
                i.regtype, IsBranchwise
            FROM institute i
            JOIN branch b ON i.instituteid = b.instituteid
            LEFT JOIN registration r ON b.branchid = r.branchid
            WHERE i.instituteid = @InstId
            GROUP BY b.instituteid";

        public const string GetUserIdByInstituteId = @"
            SELECT User_id FROM users WHERE Institute_id = @InstituteId";

        public const string UpdatePlanStatus = @"
            UPDATE onlinepaymenthistory SET isactive = 2 WHERE paymenthistoryid = @PaymentHistoryId AND user_id = @UserId";

        public const string CheckCurrentPlanHold = @"
            SELECT o.paymenthistoryid, o.user_id, o.purchasedate, startdate, o.enddate, o.isactive, o.totalamount, o.amount
            FROM onlinepaymenthistory o
            WHERE o.instid = @InstId AND @TodaysDate BETWEEN startdate AND o.enddate AND o.isactive = 2
            ORDER BY paymenthistoryid DESC LIMIT 1";

        public const string CheckFutureDatePlan = @"
            SELECT o.paymenthistoryid, o.user_id, o.purchasedate, startdate, o.enddate, o.isactive, o.totalamount, o.amount
            FROM onlinepaymenthistory o
            WHERE o.instid = @InstId AND @TodaysDate < startdate AND (o.isactive = 1 OR o.isactive = 2)
            ORDER BY paymenthistoryid";

        public const string UpdateHoldPlanStatus = @"
            UPDATE onlinepaymenthistory SET isactive = 2 WHERE paymenthistoryid = @PaymentHistoryId AND user_id = @UserId";

        public const string FillActiveUserofInstitute = @"
            SELECT User_id FROM users u WHERE u.Institute_id = @InstId";

        public const string UpdateRemindMe = @"
            UPDATE users SET remindme = @RemindMe WHERE user_id = @UserId";

        public const string CreateInstituteFull = @"
            INSERT INTO Institute (
                InstituteShortCode, ParentCompanyName, Institutename, Contactperson, Phone, Email, Address,
                City, Logo, CpMobile, CpEmail, pincode, state, RegDate, NoOfStudents, NoOfReg, NoOfEnq,
                PayType, Total, Enq, Reg, NoOfBranches, ExpiryDate, RegType, District, AllowStudModule,
                LogoPath, countryid, stateid, cityid, othercity, IsAllowedAndroidApp, IsAllowTestEngine,
                InstituteNoofStudents, InstituteProCoachingFor, salespersonname, isinternal, IsBranchwise,
                CreateDateTime,CreateByUserId,IpAddress,institute_status,institutePlan
            ) VALUES (
                @InstituteShortCode, @ParentCompanyName, @Institutename, @Contactperson, @Phone, @Email, @Address,
                @othercity, @Logo, @CpMobile, @CpEmail, @pincode, @stateid, @RegDate, @NoOfStudents, @NoOfReg, @NoOfEnq,
                0, 0, @NoOfEnq, @NoOfReg, @NoOfBranches, @ExpiryDate, @RegType, @cityid, @AllowStudModule,
                @LogoPath, @countryid, @stateid, @cityid, @othercity, @IsAllowedAndroidApp, @IsAllowTestEngine,
                @NoOfStudents, @InstProCoachingFor, @SalesPersonName, @IsInternalUse, IsBranchwise,
                NOW(), @userId, ipAddress, @institute_status,@institutePlan
            );
            SELECT LAST_INSERT_ID();";

        public const string CreateTempModuleList = @"
            INSERT INTO institutemodules
            (
                instituteId,
                planId,
                moduleId,
                subModuleId
            )
            SELECT
                @InstituteId,
                im.planId,
                im.moduleId,
                im.subModuleId
            FROM institutemodules im
            WHERE im.instituteId = 1207
            AND NOT EXISTS
            (
                SELECT 1
                FROM institutemodules existing
                WHERE existing.instituteId = @InstituteId
                  AND existing.planId = im.planId
                  AND existing.moduleId = im.moduleId
                  AND (
                      existing.subModuleId = im.subModuleId
                      OR (existing.subModuleId IS NULL AND im.subModuleId IS NULL)
                  )
            );";
        public const string GetAccountHistoryById = @"SELECT 
        h.paymenthistoryid,h.user_id,DATE_FORMAT(h.purchasedate, '%d/%m/%Y %H:%i:%s') AS purchasedate,
        DATE_FORMAT(h.startdate, '%d/%m/%Y') AS startdate,
        DATE_FORMAT(h.enddate, '%d/%m/%Y') AS enddate,
        h.amount,h.discountcode,h.discountamount,h.netamount,h.taxpercent,h.totalamount,h.remark,h.isactive,h.instid,
        h.branchid,h.ordertype,h.lastupdatedate,h.noofstudents,h.noofmonths,h.payorderid,h.noofenquiry,h.IsBranchWise,
        h.NoofBranches,
        i.Contactperson,
        i.CpEmail,
        i.CpMobile,
        i.Address,
        DATEDIFF(h.enddate, h.startdate) AS noofDays
        FROM onlinepaymenthistory h 
        INNER JOIN institute i ON h.instid = i.Instituteid 
        WHERE h.paymenthistoryid = @PaymentHistoryId";

        public const string UpdateAccountHistory = @"
        update onlinepaymenthistory set startdate=@startdate,
        enddate=@enddate,
        isactive=@isactive,
        remark=@remark,
        noofmonths=@days
        where paymenthistoryid=@paymenthistoryid";

        //Added by Nikhil L. on 22-09-2026 as deletion of institute takes too much time due to executing query separately.
        #region Delete Institute
        public const string DeleteInstituteCascade = @"
        DELETE FROM users WHERE Institute_id = @InstituteId;

        DELETE tc 
            FROM testcourse tc
            JOIN test t ON tc.testid = t.testid
            WHERE t.instid = @InstituteId;
            DELETE ts 
            FROM testsubject ts
            JOIN test t ON ts.testid = t.testid
            WHERE t.instid = @InstituteId;
            DELETE FROM testresult_student WHERE instid = @InstituteId;
            DELETE ssm 
            FROM studsubmarks ssm
            JOIN test t ON ssm.testid = t.testid
            WHERE t.instid= @InstituteId;
            DELETE FROM testresultid WHERE instid = @InstituteId;
            DELETE FROM test WHERE instid = @InstituteId;

            DELETE FROM instattendet WHERE attainid IN(select attainId from instructorattendence where instid = @InstituteId);
            DELETE FROM instructorattendence WHERE instid = @InstituteId;
            DELETE FROM trainerbatch WHERE instid = @InstituteId;
            DELETE FROM trainercourse WHERE instid = @InstituteId;
            DELETE FROM trainersubject WHERE instid = @InstituteId;
            DELETE FROM staffcommision WHERE paymentid in(select paymentid from staffpayment where trainerid in(select distinct trainnerid from trainner where instid = @InstituteId));
            DELETE FROM staffpayment WHERE trainerid in(select distinct trainnerid from trainner where instid = @InstituteId);
            DELETE FROM staffsalary WHERE trainerid in(select distinct trainnerid from trainner where instid = @InstituteId);
            DELETE FROM trainner WHERE instid = @InstituteId;

            DELETE FROM otherfees WHERE institute_id = @InstituteId;
            DELETE FROM discount WHERE payment_id IN(SELECT payment_id FROM payment p inner join branch b on b.BranchId= p.BranchId where Instituteid = @InstituteId);
            DELETE FROM payments_received WHERE payment_ID IN(SELECT payment_id FROM payment p inner join branch b on b.BranchId= p.BranchId where Instituteid = @InstituteId);
            DELETE FROM paymentprocess WHERE Payment_id IN (SELECT payment_id FROM payment p inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM direct_payment WHERE payment_id IN (SELECT payment_id FROM payment p inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM installments_received WHERE installment_id IN (select installment_ID FROM payment_installments pi inner join payment p on pi.payment_id=p.payment_id inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM installments_subject WHERE installment_id IN (select installment_ID FROM payment_installments pi inner join payment p on pi.payment_id=p.payment_id inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM payment_installments WHERE payment_ID IN(SELECT payment_id FROM payment p inner join branch b on b.BranchId=p.BranchId where Instituteid = @InstituteId);
            DELETE FROM payment WHERE BranchId IN(SELECT BranchId FROM branch where Instituteid = @InstituteId);

            DELETE FROM batchattendence WHERE attendid in (select attendid FROM attendence where branchid in(select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM attendence WHERE batchid in(select batchid from batch where instituteid = @InstituteId);
            DELETE FROM batchcourse WHERE instid = @InstituteId;
            DELETE FROM batchsubject WHERE instid = @InstituteId;
            DELETE FROM trainerbatch WHERE instid = @InstituteId;
            DELETE FROM batchdays WHERE branchid in (select distinct branchid from branch where instituteid = @InstituteId);
            DELETE FROM batchtopic WHERE batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM assignmentallocation WHERE batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM assignmentresult WHERE evalid in (select distinct evalid from evaluateassignment where batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId)));
            DELETE FROM evaluateassignment WHERE batchid in (select batchid from batch where branchid in (select distinct branchid from branch where instituteid = @InstituteId));
            DELETE FROM batch WHERE instituteid = @InstituteId;

            DELETE FROM inventoryunittype WHERE instid = @InstituteId;
            DELETE FROM inventory_issuedreturn WHERE itemcode in (select itemcode from inventoryitems where instid = @InstituteId);
            DELETE FROM inventory_goodsissued WHERE itemcode in (select itemcode from inventoryitems where instid = @InstituteId);
            DELETE FROM inventory_goodsreceived WHERE itemcode in (select itemcode from inventoryitems where instid = @InstituteId);
            DELETE FROM inventoryitems WHERE instid = @InstituteId;

            DELETE FROM lib_bookallotted WHERE rtnbkId in (Select rtnbkId from lib_returnbook where branchId in (select branchid from branch where instituteid = @InstituteId)) or issuebkId in (select issuebkId from lib_issuebook where instituteid = @InstituteId);
            DELETE FROM lib_returnbook WHERE branchId in (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM lib_issuebook WHERE instituteid = @InstituteId;
            DELETE FROM lib_books WHERE branchId in (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM lib_subcategory WHERE CategoryID in (Select CategoryId from lib_category where InstituteId = @InstituteId);
            DELETE FROM lib_category WHERE InstituteId = @InstituteId;

            DELETE FROM studentroom WHERE hostelid in (select hostelid from hosteldetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM roomdetails WHERE hostelid in (select hostelid from hosteldetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM hosteldetails WHERE BranchId IN(select branchid from branch where instituteid = @InstituteId);

            DELETE FROM studentbus WHERE StopId in (select StopId from busstops where BranchId in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM busstops WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM studentbus WHERE busid IN (select busid from busdetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM busroute WHERE busid IN (select busid from busdetails where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM busdetails WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);

            DELETE FROM checkupdetails WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM doctors WHERE BranchId IN (select branchid from branch where instituteid = @InstituteId);

            DELETE FROM franchisee_certification_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_exam_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_fixed_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_course_comm WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_course_fee WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_stud_commall WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_stud_commsub WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_sub_fixed_pay WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_details WHERE paymentid in (select paymentid from franchisee_payment where franchiseeid in (select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchisee_payment WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchisee_course_fee WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchisee_course_comm WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchiseerecitems WHERE orderid in (select orderid from franchiseeorderitems where franchiseeId=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId)));
            DELETE FROM franchiseeorderitems WHERE franchiseeid=(select franchiseeid from franchisee where branchid in (select branchid from branch where instituteid = @InstituteId));
            DELETE FROM franchisee WHERE branchid in (select branchid from branch where instituteid = @InstituteId);

            DELETE FROM studentbatch WHERE Instituteid = @InstituteId;
            DELETE FROM studsubmarks WHERE studid IN(select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM student_subjects WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM student_course WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM educationdetail WHERE RegNo IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where i.instituteid = @InstituteId);
            DELETE FROM registration WHERE BranchId IN(select branchid from branch where instituteid = @InstituteId);

            DELETE FROM student_subjects WHERE SubjectId IN (select subid from tbl_subject where courseID IN(select courseID from tbl_course where InstituteID = @InstituteId));
            DELETE FROM student_course WHERE CourseId IN (select courseID from tbl_course where InstituteID = @InstituteId);
            DELETE FROM tbl_subject WHERE courseID IN(select courseID from tbl_course where InstituteID = @InstituteId);
            DELETE FROM tbl_course WHERE InstituteID = @InstituteId;

            DELETE FROM config WHERE institute_id = @InstituteId;
            DELETE FROM tblnotification WHERE BranchId in (select branchid from branch where instituteid = @InstituteId);
            DELETE FROM branch WHERE Instituteid = @InstituteId;
            DELETE FROM institute WHERE InstituteID = @InstituteId;

        ";
        #endregion
    }
}
