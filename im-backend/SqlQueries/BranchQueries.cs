namespace IM_backend.SqlQueries
{
    public class BranchQueries
    {
        public const string GetBranchesForGrid = @"
            SELECT
                Branchid,
                Branchname,
                Contactperson,
                CpMobile,
                CpEmail,
                state,
                IF(branch_status = 1, branchid, 0) AS bid,
                branch_status AS BRANCH_STATUS,
                tax_rate,
                expirydate,
                franchiseeflag
            FROM branch
            WHERE 1=1
                 {0}
                 {1}
            LIMIT @PageSize OFFSET @Offset;";

        public const string GetBranchesForGridCount = @"
            SELECT COUNT(*) as TotalCount
            FROM branch
            WHERE 1=1
                {0};";

        public const string GetBranchesForBranchAdmin = @"
            SELECT
                Branchid,
                Branchname,
                Contactperson,
                CpMobile,
                CpEmail,
                state,
                IF(branch_status = 1, branchid, 0) AS bid,
                branch_status AS BRANCH_STATUS,
                tax_rate,
                expirydate,
                franchiseeflag
            FROM branch
            WHERE 1=1
                 {0}
                 {1}
            LIMIT @PageSize OFFSET @Offset;";

        public const string GetBranchesForBranchAdminCount = @"
            SELECT COUNT(*) as TotalCount
            FROM branch
            WHERE 1=1
                 {0}
            ORDER BY BranchName;";

        public const string GetBranchesForInstituteAdmin = @"
            SELECT
                Branchid,
                Branchname,
                Contactperson,
                CpMobile,
                CpEmail,
                state,
                IF(branch_status = 1, branchid, 0) AS bid,
                branch_status AS BRANCH_STATUS,
                tax_rate,
                expirydate,
                franchiseeflag
            FROM branch
            WHERE 1=1
                 {0}
                 {1}            
            LIMIT @PageSize OFFSET @Offset;";

        public const string GetBranchesForInstituteAdminCount = @"
            SELECT COUNT(*) as TotalCount
            FROM branch
            WHERE 1=1
                 {0};";

        public const string CheckUserMultiBranch = @"
            SELECT COUNT(DISTINCT tr.Branchid) as BranchCount
            FROM trainner tr
            INNER JOIN users us ON tr.trainnerid = us.staffid AND tr.instid = @InstituteId AND tr.statusflag = 1
            INNER JOIN userbranches ub ON us.user_id = ub.UserId
            INNER JOIN branch b ON ub.branchid = b.branchid
            WHERE us.user_id = @UserId AND b.InstituteId = @InstituteId AND tr.statusflag = 1
            UNION ALL
            SELECT COUNT(DISTINCT tr.Branchid)
            FROM users us
            INNER JOIN trainner tr ON us.StaffID = tr.reftrainerid AND tr.reftrainerid <> 0 AND tr.instid = @InstituteId AND tr.statusflag = 1
            INNER JOIN userbranches ub ON us.user_id = ub.UserId
            INNER JOIN branch b ON ub.branchid = b.branchid
            WHERE us.user_id = @UserId AND b.InstituteId = @InstituteId AND tr.statusflag = 1
            UNION ALL
            SELECT COUNT(DISTINCT ub.branchid)
            FROM users us
            INNER JOIN userbranches ub ON us.user_id = ub.UserId
            INNER JOIN branch b ON ub.branchid = b.branchid
            WHERE us.user_id = @UserId AND b.InstituteId = @InstituteId AND us.StaffID = 0";

        public const string GetBranchesForMultiBranch = @"
            Select Branchid,Branchname,Contactperson,CpMobile,CpEmail,state,if(branch_status=1,branchid,0) as bid,branch_status AS BRANCH_STATUS,tax_rate,date_format(expirydate,'%d/%m/%Y') as expirydate,franchiseeflag
            FROM branch
            WHERE 1=1
                AND Branchid IN (SELECT DISTINCT tr.Branchid
                FROM trainner tr
                INNER JOIN users us ON tr.trainnerid = us.staffid AND tr.instid=@InstituteId AND tr.statusflag = 1
                INNER JOIN userbranches ub ON us.user_id = ub.UserId
                INNER JOIN branch b ON ub.branchid = b.branchid
                WHERE us.user_id=@UserId AND b.InstituteId=@InstituteId AND tr.statusflag=1
                UNION ALL
                SELECT DISTINCT tr.Branchid
                FROM users us
                INNER JOIN trainner tr ON us.StaffID=tr.reftrainerid AND tr.reftrainerid<>0 AND tr.instid=@InstituteId AND tr.statusflag = 1
                INNER JOIN userbranches ub ON us.user_id = ub.UserId
                INNER JOIN branch b ON ub.branchid = b.branchid
                WHERE us.user_id=@UserId AND b.InstituteId=@InstituteId AND tr.statusflag=1
                UNION ALL
                SELECT DISTINCT ub.branchid
                FROM users us
                INNER JOIN userbranches ub ON us.user_id = ub.UserId
                INNER JOIN branch b ON ub.branchid = b.branchid
                WHERE us.user_id=@UserId AND b.InstituteId = @InstituteId AND us.StaffID=0)
            {0}
            {1}
            LIMIT @PageSize OFFSET @Offset;";

        public const string GetBranchesForMultiBranchCount = @"
            SELECT COUNT(*) as TotalCount
            FROM branch
            WHERE 1=1
                AND Branchid IN (SELECT DISTINCT tr.Branchid
                FROM trainner tr
                INNER JOIN users us ON tr.trainnerid = us.staffid AND tr.instid=@InstituteId AND tr.statusflag = 1
                INNER JOIN userbranches ub ON us.user_id = ub.UserId
                INNER JOIN branch b ON ub.branchid = b.branchid
                WHERE us.user_id=@UserId AND b.InstituteId=@InstituteId AND tr.statusflag=1
                UNION ALL
                SELECT DISTINCT tr.Branchid
                FROM users us
                INNER JOIN trainner tr ON us.StaffID=tr.reftrainerid AND tr.reftrainerid<>0 AND tr.instid=@InstituteId AND tr.statusflag = 1
                INNER JOIN userbranches ub ON us.user_id = ub.UserId
                INNER JOIN branch b ON ub.branchid = b.branchid
                WHERE us.user_id=@UserId AND b.InstituteId=@InstituteId AND tr.statusflag=1
                UNION ALL
                SELECT DISTINCT ub.branchid
                FROM users us
                INNER JOIN userbranches ub ON us.user_id = ub.UserId
                INNER JOIN branch b ON ub.branchid = b.branchid
                WHERE us.user_id=@UserId AND b.InstituteId = @InstituteId AND us.StaffID=0)
            {0};";

        public const string GetBranchTaxRate = @"
            SELECT taxrate FROM config WHERE institute_id = @InstituteId AND branch_id = @BranchId";

        public const string GetEmailConfig = @"
            SELECT Email_User, Email_Pwd, Smtp_Server, EnableSsl, Portno 
            FROM emailsettings 
            WHERE Smtp_Server IS NOT NULL 
            AND institute_id = @InstituteId 
            AND branch_id = @BranchId";

        public const string GetAdminEmail = @"
            SELECT Email, User_Id, Mobile 
            FROM Users 
            WHERE Role_Id IN (
                SELECT roleid FROM roles 
                WHERE (instituteid = @InstituteId OR instituteid = 0) 
                AND name = 'instituteadmin'
            ) 
            AND institute_id = @InstituteId";

        public const string GetBranchById = @"
             SELECT 
                 b.Branchid,
                 b.Branchname,
                 b.Contactperson,
                 b.cpMobile,
                 b.cpEmail,
                 b.email,
                 b.phone,
                 b.address,
                 b.CityId,
                 b.StateId,
                 b.CountryId,
                 b.pinCode,
                 b.branchcode,
                 b.branch_status AS Status,
                 b.tax_rate,
                 b.expirydate,
                 b.franchiseeflag,
                 b.othercity,
                 -- Franchisee details
               DATE_FORMAT(f.SignUp_Date, '%Y-%m-%dT%H:%i:%s') AS RegDate,
                 f.SignUp_Amt,
                 f.Monthly_Fee,
                 f.Exam_Fee,
                 f.Certification_Fee,
                 f.Commision_All,
                 f.Stud_Fixed_Fee,
                 f.FileName AS AgreementFileName,
                 f.Agreement AS Agreement
             FROM branch b
             LEFT JOIN franchisee f 
                 ON f.BranchId = b.Branchid
             WHERE b.Branchid = @BranchId 
               AND b.instituteid = @InstituteId";
        public const string CheckDuplicateBranchName = @"
            SELECT COUNT(*) FROM branch 
            WHERE branchname = @BranchName 
            AND branchid NOT IN (@BranchId) 
            AND instituteid = @InstituteId";

        public const string CreateBranch = @"
            INSERT INTO branch(Branchname, Contactperson, Instituteid, Phone, Email, Address, City, BranchCode, 
                             CpMobile, CpEmail, pincode, state, tax_rate, RegDate, ExpiryDate, franchiseeflag, 
                             countryid, stateid, cityid, othercity)
            VALUES(@BranchName, @ContactPerson, @InstituteId, @Phone, @Email, @Address, @City, @BranchCode,
                   @CpMobile, @CpEmail, @PinCode, @State, @TaxRate, @RegDate, @ExpDate, @MakeFranchisee,
                   @CountryId, @StateId, @CityId, @OtherCity);
            SELECT LAST_INSERT_ID() AS BranchId;";

        public const string CreateFranchisee = @"
            INSERT INTO franchisee(FranchiseeName, SignUp_Date, Agreement, SignUp_Amt, Monthly_Fee, 
                                   Commision_All, Exam_Fee, Certification_Fee, FileName, Stud_Fixed_Fee, BranchId)
            VALUES(@FranchiseeName, @SignUp_Date, @Agreement, @SignUp_Amt, @Monthly_Fee,
                   @Commision_All, @Exam_Fee, @Certification_Fee, @FileName, @Stud_Fixed_Fee, @BranchId);
            SELECT LAST_INSERT_ID();";

        public const string GetInstituteName = @"
            SELECT InstituteName FROM institute WHERE instituteid = @InstituteId";

        public const string CreateFranchiseeCourseFee = @"
            INSERT INTO franchisee_coursefee(FranchiseeId, CourseId, Amount)
            VALUES(@FranchiseeId, @CourseId, @Amount)";

        public const string CreateFranchiseeCourseComm = @"
            INSERT INTO franchisee_coursecomm(FranchiseeId, CourseId, Commission)
            VALUES(@FranchiseeId, @CourseId, @Commission)";

        public const string CheckInstituteStatus = @"
            SELECT paytype, total, enq, reg, noofstudents, noofreg, noofenq, count(regno) as totalcount,
                   if((select count(regno) FROM institute i join branch b on i.instituteid=b.instituteid left join registration r on b.branchid=r.branchid where r.registered='yes' and i.instituteid=@InstituteId group by b.instituteid) is null,0,
                     (select count(regno) FROM institute i join branch b on i.instituteid=b.instituteid left join registration r on b.branchid=r.branchid where r.registered='yes' and i.instituteid=@InstituteId group by b.instituteid)) as regcount,
                   if((select count(regno) FROM institute i join branch b on i.instituteid=b.instituteid left join registration r on b.branchid=r.branchid where r.registered='no' and i.instituteid=@InstituteId group by b.instituteid) is null,0,
                     (select count(regno) FROM institute i join branch b on i.instituteid=b.instituteid left join registration r on b.branchid=r.branchid where r.registered='no' and i.instituteid=@InstituteId group by b.instituteid)) as enqcount,
                   i.regtype, IsBranchwise
            FROM institute i
            JOIN branch b on i.instituteid=b.instituteid
            LEFT JOIN registration r on b.branchid=r.branchid
            WHERE i.instituteid=@InstituteId
            GROUP BY b.instituteid";

        public const string UpdateBranch = @"
            UPDATE branch 
            SET Branchname = @BranchName, 
                address = @Address, 
                City = @City, 
                CityId = @CityId, 
                State = @State, 
                StateId = @StateId, 
                CountryId = @CountryId, 
                pinCode = @PinCode, 
                phone = @Phone, 
                email = @Email, 
                Contactperson = @ContactPerson, 
                cpMobile = @CpMobile, 
                cpEmail = @CpEmail, 
                branchcode = @BranchCode, 
                branch_status = @Status, 
                tax_rate = @TaxRate, 
                othercity = @OtherCity,
                District = @District,
                franchiseeflag = @MakeFranchisee
            WHERE Branchid = @BranchId";

        public const string DeleteBranch = @"
            UPDATE branch 
            SET branch_status = @StatusId 
            WHERE Branchid = @BranchId";

        // Comprehensive delete queries for status = 1 (hard delete)
        public const string DeleteFranchisee = @"
            DELETE FROM franchisee_certification_pay WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_exam_pay WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_fixed_pay WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_course_comm WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_course_fee WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_stud_commall WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_stud_commsub WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_sub_fixed_pay WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_pay_details WHERE paymentid IN (SELECT paymentid FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchisee_payment WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId));
            DELETE FROM franchisee_course_fee WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId));
            DELETE FROM franchisee_course_comm WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId));
            DELETE FROM franchiseerecitems WHERE orderid IN (SELECT orderid FROM franchiseeorderitems WHERE franchiseeId IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)));
            DELETE FROM franchiseeorderitems WHERE franchiseeid IN (SELECT franchiseeid FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId));
            DELETE FROM franchisee WHERE branchid IN (SELECT branchid FROM branch WHERE instituteid = @InstituteId)";

        public const string DeleteBranchUser = @"
            DELETE FROM users WHERE branch_id = @BranchId";

        public const string DeleteBranchTest = @"
            DELETE FROM testcourse WHERE testid IN (SELECT testid FROM test WHERE branchid = @BranchId);
            DELETE FROM testsubject WHERE testid IN (SELECT testid FROM test WHERE branchid = @BranchId);
            DELETE FROM testresult_student WHERE branchid = @BranchId;
            DELETE FROM studsubmarks WHERE resid IN (SELECT id FROM testresultid WHERE branchid = @BranchId);
            DELETE FROM testresultid WHERE branchid = @BranchId;
            DELETE FROM test WHERE branchid = @BranchId";

        public const string DeleteBranchTrainer = @"
            DELETE FROM instattendet WHERE attainid IN (SELECT attainId FROM instructorattendence WHERE branchid = @BranchId);
            DELETE FROM instructorattendence WHERE branchid = @BranchId;
            DELETE FROM trainerbatch WHERE branchid = @BranchId;
            DELETE FROM trainercourse WHERE branchid = @BranchId;
            DELETE FROM trainersubject WHERE branchid = @BranchId;
            DELETE FROM staffcommision WHERE paymentid IN (SELECT paymentid FROM staffpayment WHERE trainerid IN (SELECT DISTINCT trainnerid FROM trainner WHERE branchid = @BranchId));
            DELETE FROM staffpayment WHERE trainerid IN (SELECT DISTINCT trainnerid FROM trainner WHERE branchid = @BranchId);
            DELETE FROM staffsalary WHERE trainerid IN (SELECT DISTINCT trainnerid FROM trainner WHERE branchid = @BranchId);
            DELETE FROM trainner WHERE branchid = @BranchId";

        public const string DeleteBranchPayments = @"
            DELETE FROM otherfees WHERE branch_id = @BranchId;
            DELETE FROM paymentreceived WHERE paymentid IN (SELECT payment_id FROM payment WHERE branchid = @BranchId);
            DELETE FROM payments_received WHERE payment_ID IN (SELECT payment_id FROM payment WHERE branchid = @BranchId);
            DELETE FROM paymentprocess WHERE Payment_id IN (SELECT payment_id FROM payment WHERE branchid = @BranchId);
            DELETE FROM direct_payment WHERE payment_id IN (SELECT payment_id FROM payment WHERE branchid = @BranchId);
            DELETE FROM discount WHERE payment_id IN (SELECT payment_id FROM payment WHERE branchid = @BranchId);
            DELETE FROM paymentreceived WHERE installmentid IN (SELECT installment_ID FROM payment_installments pi LEFT JOIN payment p ON pi.payment_id = p.payment_id WHERE branchid = @BranchId);
            DELETE FROM installments_received WHERE installment_id IN (SELECT installment_ID FROM payment_installments pi LEFT JOIN payment p ON pi.payment_id = p.payment_id WHERE branchid = @BranchId);
            DELETE FROM installments_subject WHERE installment_id IN (SELECT installment_ID FROM payment_installments pi LEFT JOIN payment p ON pi.payment_id = p.payment_id WHERE branchid = @BranchId);
            DELETE FROM payment_installments WHERE payment_ID IN (SELECT payment_id FROM payment WHERE branchid = @BranchId);
            DELETE FROM payment WHERE branchid = @BranchId";

        public const string DeleteBranchBatch = @"
            DELETE FROM batchattendence WHERE attendid IN (SELECT attendid FROM attendence WHERE branchid = @BranchId);
            DELETE FROM attendence WHERE batchid IN (SELECT batchid FROM batch WHERE branchid = @BranchId);
            DELETE FROM batchcourse WHERE branchid = @BranchId;
            DELETE FROM batchsubject WHERE branchid = @BranchId;
            DELETE FROM trainerbatch WHERE branchid = @BranchId;
            DELETE FROM studentbatch WHERE branchid = @BranchId;
            DELETE FROM studsubmarks WHERE resid IN (SELECT id FROM testresultid WHERE branchid = @BranchId);
            DELETE FROM testresult_student WHERE branchid = @BranchId;
            DELETE FROM testresultid WHERE branchid = @BranchId;
            DELETE FROM batchdays WHERE branchid = @BranchId;
            DELETE FROM batchtopic WHERE batchid IN (SELECT batchid FROM batch WHERE branchid = @BranchId);
            DELETE FROM assignmentallocation WHERE batchid IN (SELECT batchid FROM batch WHERE branchid = @BranchId);
            DELETE FROM assignmentresult WHERE evalid IN (SELECT DISTINCT evalid FROM evaluateassignment WHERE batchid IN (SELECT batchid FROM batch WHERE branchid = @BranchId));
            DELETE FROM evaluateassignment WHERE batchid IN (SELECT batchid FROM batch WHERE branchid = @BranchId);
            DELETE FROM batch WHERE branchid = @BranchId";

        public const string DeleteBranchInventory = @"
            DELETE FROM inventoryunittype WHERE branchid = @BranchId;
            DELETE FROM inventory_issuedreturn WHERE itemcode IN (SELECT itemcode FROM inventoryitems WHERE branchid = @BranchId);
            DELETE FROM inventory_goodsissued WHERE itemcode IN (SELECT itemcode FROM inventoryitems WHERE branchid = @BranchId);
            DELETE FROM inventory_goodsreceived WHERE itemcode IN (SELECT itemcode FROM inventoryitems WHERE branchid = @BranchId);
            DELETE FROM inventoryitems WHERE branchid = @BranchId";

        public const string DeleteBranchLibrary = @"
            DELETE FROM lib_bookallotted WHERE rtnbkId IN (SELECT rtnbkId FROM lib_returnbook WHERE branchId = @BranchId) OR issuebkId IN (SELECT issuebkId FROM lib_issuebook WHERE branchId = @BranchId);
            DELETE FROM lib_returnbook WHERE branchId = @BranchId;
            DELETE FROM lib_issuebook WHERE branchId = @BranchId;
            DELETE FROM lib_books WHERE branchId = @BranchId;
            DELETE FROM lib_subcategory WHERE CategoryID IN (SELECT CategoryId FROM lib_category WHERE BranchId = @BranchId);
            DELETE FROM lib_category WHERE BranchId = @BranchId";

        public const string DeleteBranchTransport = @"
            DELETE FROM studentbus WHERE StopId IN (SELECT StopId FROM busstops WHERE BranchId = @BranchId);
            DELETE FROM busstops WHERE BranchId = @BranchId;
            DELETE FROM studentbus WHERE busid IN (SELECT busid FROM busdetails WHERE branchid = @BranchId);
            DELETE FROM busroute WHERE busid IN (SELECT busid FROM busdetails WHERE branchid = @BranchId);
            DELETE FROM busdetails WHERE BranchId = @BranchId";

        public const string DeleteBranchHostel = @"
            DELETE FROM studentroom WHERE hostelid IN (SELECT hostelid FROM hosteldetails WHERE branchid = @BranchId);
            DELETE FROM roomdetails WHERE hostelid IN (SELECT hostelid FROM hosteldetails WHERE branchid = @BranchId);
            DELETE FROM hosteldetails WHERE BranchId = @BranchId";

        public const string DeleteBranchHealth = @"
            DELETE FROM checkupdetails WHERE BranchId = @BranchId;
            DELETE FROM doctors WHERE BranchId = @BranchId";

        public const string DeleteBranchStud = @"
            DELETE FROM studentbatch WHERE BranchId = @BranchId;
            DELETE FROM studsubmarks WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where b.branchid = @BranchId);
            DELETE FROM student_subjects WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where b.branchid = @BranchId);
            DELETE FROM student_course WHERE StudID IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where b.branchid = @BranchId);
            DELETE FROM educationdetail WHERE RegNo IN (select RegNo from registration s JOIN branch b ON s.BranchID = b.branchid JOIN institute i ON b.Instituteid = i.Instituteid where b.branchid = @BranchId);
            DELETE FROM registration WHERE branchid = @BranchId";

        public const string DeleteBranchCourse = @"
            DELETE FROM tbl_subject WHERE courseID IN (SELECT courseID FROM tbl_course WHERE Branchid = @BranchId);
            DELETE FROM tbl_course WHERE Branchid = @BranchId";

        public const string DeleteBranchSettings = @"
            DELETE FROM config WHERE branch_id = @BranchId";

        public const string DeleteBranchNotification = @"
            DELETE FROM tblnotification WHERE BranchId = @BranchId";

        public const string DeleteBranchFormats = @"
            DELETE FROM regnoformat WHERE branchid = @BranchId;
            DELETE FROM receiptnoformat WHERE branchid = @BranchId";

        public const string DeleteBranchFinal = @"
            DELETE FROM branch WHERE branchid = @BranchId";

        public const string UpdateFranchisee = @"
            UPDATE franchisee 
                SET 
                    SignUp_Date = @SignUp_Date,
                   Agreement = CASE
                WHEN @AgreementFileChanged = 1 THEN @Agreement
                ELSE Agreement
            END,
                    SignUp_Amt = @SignUp_Amt,
                    Monthly_Fee = @Monthly_Fee,
                    Exam_Fee = @Exam_Fee,
                    Certification_Fee = @Certification_Fee,
                    Commision_All = @Commision_All,
                    Stud_Fixed_Fee = @Stud_Fixed_Fee,
                    Course_Fixed_Fee = @Course_Fixed_Fee,
                    Coursewise_Commision = @Coursewise_Commision,
               FileName = CASE
                WHEN @AgreementFileChanged = 1 THEN @FileName
                ELSE FileName
            END
                WHERE FranchiseeId = @FranchiseeId";

        public const string GetFranchiseeByBranchId = @"
            SELECT FranchiseeId
            FROM franchisee
            WHERE Branchid = @BranchId";

        public const string DeleteFranchiseeCourseFees = @"
            DELETE FROM franchisee_course_fee WHERE FranchiseeId = @FranchiseeId";

        public const string InsertFranchiseeCourseFees = @"
            INSERT INTO franchisee_course_fee (FranchiseeId, SubjectId, SubAmount)
            VALUES (@FranchiseeId, @SubjectId, @SubAmount)";

        public const string DeleteFranchiseeCourseComm = @"
            DELETE FROM franchisee_course_comm WHERE FranchiseeId = @FranchiseeId";

        public const string InsertFranchiseeCourseComm = @"
            INSERT INTO franchisee_course_comm (FranchiseeId, SubjectId, Commision)
            VALUES (@FranchiseeId, @SubjectId, @Commision)";

        public const string GetCourses = @"
            SELECT courseid, course_name FROM tbl_course WHERE branchid = @BranchId ORDER BY course_name";

        public const string GetSubjects = @"
            SELECT subid, sub_name, Fees, 0 as StudCount, 0 as TotalFees, 0 as commission
            FROM tbl_subject WHERE courseid = @CourseId ORDER BY sub_name";

        public const string GetFranchiseeFee = @"
            SELECT subid, sub_name, Fees, 0 AS StudCount, IFNULL(SubAmount,0) AS TotalFees, IFNULL(Commision,0) AS commission
            FROM tbl_subject  s
            LEFT JOIN franchisee_course_fee fcf ON s.subid=fcf.SubjectId
            LEFT JOIN franchisee_course_comm fcc ON s.subid=fcc.SubjectId
            WHERE courseid = @CourseId";
        public const string DeleteFranchiseeById = @"
            DELETE FROM franchisee_certification_pay
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_exam_pay
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_fixed_pay
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_pay_course_comm
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_pay_course_fee
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_stud_commall
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_stud_commsub
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_sub_fixed_pay
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_pay_details
            WHERE paymentid IN (
                SELECT paymentid
                FROM franchisee_payment
                WHERE franchiseeid = @FranchiseeId
            );
        
            DELETE FROM franchisee_payment
            WHERE franchiseeid = @FranchiseeId;
        
            DELETE FROM franchisee_course_fee
            WHERE franchiseeid = @FranchiseeId;
        
            DELETE FROM franchisee_course_comm
            WHERE franchiseeid = @FranchiseeId;
        
            DELETE FROM franchiseerecitems
            WHERE orderid IN (
                SELECT orderid
                FROM franchiseeorderitems
                WHERE franchiseeId = @FranchiseeId
            );
        
            DELETE FROM franchiseeorderitems
            WHERE franchiseeid = @FranchiseeId;
        
            DELETE FROM franchisee
            WHERE franchiseeid = @FranchiseeId;
        ";
    }
}
