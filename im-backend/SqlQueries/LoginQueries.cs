namespace IM_backend.SqlQueries
{
    public class LoginQueries
    {
        public const string GetLoginByUsername_SuperAdmin = @"
            SELECT 
                u.user_id, u.role_id, u.branch_id, u.institute_id, u.passwd, u.username, u.email,NULL AS ExpiryDate,0 as 'regType', u.loginstatus, date_format(u.lastlogin,'%d/%m/%Y %h:%i %p'),u.staffid
            FROM 
                users u 
            WHERE u.loginid = @Username and u.role_id= 1";

        public const string GetLoginByUserId_SuperAdmin = @"
            SELECT 
                u.user_id, u.role_id, u.branch_id, u.institute_id, u.passwd, u.username, u.email,'ExpiryDate','regType', u.loginstatus, date_format(u.lastlogin,'%d/%m/%Y %h:%i %p'),u.staffid
            FROM 
                users u 
            WHERE u.user_id = @User_Id and u.role_id= 1";

        public const string GetLoginByUsername = @"
            SELECT
                u.user_id,
                u.role_id,
                u.branch_id,
                u.institute_id,
                u.passwd,
                u.username,
                u.email,
                i.ExpiryDate,
                i.regType,
                u.loginstatus,
                DATE_FORMAT(u.lastlogin,'%d/%m/%Y %h:%i %p'),
                u.staffid,
                i.Institutename
            FROM users u
            INNER JOIN institute i
                ON u.institute_id = i.instituteid
            WHERE u.loginid = @Username;";

        public const string GetLoginByUserId = @"
            SELECT
                u.user_id,
                u.role_id,
                u.branch_id,
                u.institute_id,
                u.passwd,
                u.username,
                u.email,
                i.ExpiryDate,
                i.regType,
                u.loginstatus,
                DATE_FORMAT(u.lastlogin,'%d/%m/%Y %h:%i %p'),
                u.staffid,
                i.Institutename
            FROM users u
            INNER JOIN institute i
                ON u.institute_id = i.instituteid
            WHERE u.user_id = @User_Id;";

        public const string GetLoginByUsername_Trainer = @"
            SELECT 
                t2.*
            FROM
            (
                SELECT 
                    t1.*
                FROM
                (
                    SELECT
                        u.user_id,
                        u.role_id,
                        u.branch_id,
                        u.institute_id,
                        u.passwd,
                        u.username,
                        u.email,
                        i.ExpiryDate,
                        i.regType,
                        u.loginstatus,
                        DATE_FORMAT(u.lastlogin, '%d/%m/%Y %h:%i %p') AS lastlogin,
                        u.staffid,
                        i.Institutename
                    FROM users u
                    INNER JOIN institute i
                        ON u.institute_id = i.instituteid
                    WHERE u.loginid = @Username
                ) AS t1
                LEFT JOIN trainner t
                    ON t.trainnerid = t1.staffid
                   AND t.statusflag = 1
            ) AS t2;";

        public const string GetLoginByUserId_Trainer = @"
            SELECT 
                t2.*
            FROM
            (
                SELECT 
                    t1.*
                FROM
                (
                    SELECT
                        u.user_id,
                        u.role_id,
                        u.branch_id,
                        u.institute_id,
                        u.passwd,
                        u.username,
                        u.email,
                        i.ExpiryDate,
                        i.regType,
                        u.loginstatus,
                        DATE_FORMAT(u.lastlogin, '%d/%m/%Y %h:%i %p') AS lastlogin,
                        u.staffid,
                        i.Institutename
                    FROM users u
                    INNER JOIN institute i
                        ON u.institute_id = i.instituteid
                    WHERE u.user_id = @User_Id
                ) AS t1
                LEFT JOIN trainner t
                    ON t.trainnerid = t1.staffid
                   AND t.statusflag = 1
            ) AS t2;";

        public const string UpdateLastLoginDate = @"
            UPDATE users 
            SET lastlogin = @LogDate 
            WHERE loginid = @Username";

        public const string GetRoleInfo = @"
            SELECT name
            FROM roledetails 
            WHERE RoleId = @RoleId";

        public const string GetStatus = @"
            SELECT branch_status 
            FROM branch 
            WHERE instituteid = @InstituteId AND branchid = @BranchId";

        public const string CheckStatusBranchwise = @"
            SELECT branch_status 
            FROM branch 
            WHERE instituteid = @InstituteId AND branchid = @BranchId";

        public const string CheckInstituteStatus = @"
            SELECT institute_status 
            FROM institute 
            WHERE instituteid = @InstituteId";

        public const string UsersActivity = @"
            INSERT INTO usersactivity (
                logindate, 
                instituteid, 
                branchid, 
                userid, 
                type, 
                fromwhere, 
                activity, 
                ipaddress
            ) VALUES (
                @ActivityDate, 
                @InstituteId, 
                @BranchId, 
                @UserId, 
                @UserType, 
                @DeviceType, 
                @ActivityType, 
                @IpAddress
            )";

        public const string GetAdminBranches = @"
            SELECT 
                branch_id AS BranchId,
                institute_id AS InstituteId,
                isfranchisee AS IsFranchisee
            FROM branchadmin 
            WHERE userid = @UserId";

        public const string GetRoleAccessWithPlan = @"
            SELECT r.RoleId, r.ModuleId, r.AllowView, r.AllowAdd, r.AllowModify, r.AllowDelete, r.AllowReports, m.module
            FROM roleaccess r join modules m on r.moduleId= m.moduleId LEFT JOIN onlineplanmodules op ON op.moduleid = m.ModuleId 
            WHERE r.RoleId= @RoleId AND op.planid= @PlanId
            Order By m.moduleId";

        public const string GetRoleAccess = @"
            SELECT r.RoleId,r.ModuleId,r.AllowView,r.AllowAdd,r.AllowModify,r.AllowDelete,r.AllowReports,m.module 
            FROM roleaccess r join modules m on r.moduleId=m.moduleId 
            WHERE r.RoleId=@RoleId 
            Order By m.moduleId";

        public const string GetTax = @"
            SELECT taxpercent 
            FROM tax 
            WHERE institute_id = @InstituteId 
            AND branch_id = @BranchId";

        public const string CheckCurrentPlanExpiry = @"
            SELECT paymenthistoryid, user_id, purchasedate, startdate, enddate, isactive, totalamount, noofstudents, noofmonths, noofenquiry 
            FROM onlinepaymenthistory 
            WHERE instid = @InstituteId 
            AND @CurrentDate BETWEEN startdate AND enddate 
            AND isactive = 1 
            ORDER BY paymenthistoryid DESC 
            LIMIT 1";

        public const string CheckCurrentPlanHold = @"
            SELECT paymenthistoryid, user_id, purchasedate, startdate, enddate, isactive, totalamount, amount 
            FROM onlinepaymenthistory 
            WHERE instid = @InstituteId 
            AND @CurrentDate BETWEEN startdate AND enddate 
            AND isactive = 2 
            ORDER BY paymenthistoryid DESC 
            LIMIT 1";

        public const string CheckFutureDatePlanExists = @"
            SELECT paymenthistoryid, user_id, purchasedate, startdate, enddate, isactive, totalamount 
            FROM onlinepaymenthistory 
            WHERE instid = @InstituteId 
            AND @CurrentDate < startdate 
            AND isactive = 2 
            ORDER BY paymenthistoryid ASC 
            LIMIT 1";

        public const string CheckBackDatePlanExists = @"
            SELECT paymenthistoryid, user_id, purchasedate, startdate, enddate, isactive 
            FROM onlinepaymenthistory 
            WHERE instid = @InstituteId 
            AND @CurrentDate > enddate 
            AND isactive = 1 
            ORDER BY paymenthistoryid ASC 
            LIMIT 1";

        public const string AllFutureDatePlanExists = @"
            SELECT paymenthistoryid, user_id, purchasedate, startdate, enddate, isactive 
            FROM onlinepaymenthistory 
            WHERE instid = @InstituteId 
            AND @CurrentDate < startdate 
            AND isactive = 1 
            ORDER BY paymenthistoryid ASC";

        public const string UpdatePlanStatus = @"
            UPDATE onlinepaymenthistory 
            SET isactive = 2 
            WHERE paymenthistoryid = @PaymentHistoryId 
            AND user_id = @UserId";

        public const string UpdateInstituteStatus = @"
            UPDATE institute 
            SET institute_status = @InstituteStatus, 
                RegType = @RegType 
            WHERE Instituteid = @InstituteId";

        public const string GetRegionalInfo = @"
            SELECT Regional_Id, TimeZone, TimeZone_Id, DateFormat, Country_Curr, Curr_Code, Curr_Name, Curr_Fractional_Unit 
            FROM RegionalSettings 
            WHERE BranchId = @BranchId";

        public const string GetInstituteBranchName = @"
            SELECT Institutename 
            FROM institute 
            WHERE instituteid = @InstituteId";

        public const string GetBranchContactNo = @"
            SELECT Phone 
            FROM branch 
            WHERE BranchId = @BranchId";

        public const string GetIsRedirectToNewTab = @"
            SELECT IsRedirectToNewTab 
            FROM config 
            WHERE Branch_Id = @BranchId 
            AND Institute_Id = @InstituteId";

        public const string GetStudentModuleAllowed = @"
            SELECT AllowStudModule, IsAllowTestEngine 
            FROM institute 
            WHERE instituteid = @InstituteId";

        public const string GetActTraiBranch = @"
            SELECT DISTINCT *
            FROM Branch b
            WHERE b.BranchId IN
            (
                SELECT DISTINCT tr.Branchid
                FROM trainner tr
                INNER JOIN users us
                    ON tr.trainnerid = us.staffid
                INNER JOIN userbranches ub
                    ON us.user_id = ub.UserId
                INNER JOIN branch b
                    ON ub.branchid = b.branchid
                WHERE tr.instid = @InstituteId
                    AND tr.statusflag = 1
                    AND us.user_id = @UserId
                    AND b.InstituteId = @InstituteId

                UNION ALL

                SELECT DISTINCT tr.Branchid
                FROM users us
                INNER JOIN trainner tr
                    ON us.StaffID = tr.reftrainerid
                INNER JOIN userbranches ub
                    ON us.user_id = ub.UserId
                INNER JOIN branch b
                    ON ub.branchid = b.branchid
                WHERE tr.reftrainerid <> 0
                    AND tr.instid = @InstituteId
                    AND tr.statusflag = 1
                    AND us.user_id = @UserId
                    AND b.InstituteId = @InstituteId

                UNION ALL

                SELECT DISTINCT ub.branchid
                FROM users us
                INNER JOIN userbranches ub
                    ON us.user_id = ub.UserId
                INNER JOIN branch b
                    ON ub.branchid = b.branchid
                WHERE us.user_id = @UserId
                    AND b.InstituteId = @InstituteId
                    AND us.StaffID = 0
            )";

        public const string CheckUserLoginTimeRecord = @"
            select count(userid) 
            from usertime u join users v on u.userid=v.user_id 
            where loginid=@Username";

        public const string ConfigCheckUserLoginTimeRecord = @"
            select count(Branchid) 
            from usersecuritysetting 
            where Branchid=@BranchId";

        public const string UserIPAddress = @"
            SELECT ipaddress,username 
            FROM users 
            WHERE loginid=@Username";

        public const string ConfigUserIPAddress = @"
            SELECT if(Ip=1,IpAddress,'') As IpAddress,Branchid  
            FROM usersecuritysetting 
            WHERE Branchid=@BranchId limit 1";

        public const string CompUserLoginTime = @"
            select date_format(starttime,'%h:%i %p') as starttime,date_format(endtime,'%h:%i %p') as endtime,starttime,endtime 
            from usertime u join users v on u.userid=v.user_id 
            where loginid=@Username and days=@Day";

        public const string FunCompUserLoginTime = @"
            select count(Days) 
            from usertime 
            where userid=@UserId";

        public const string FunConfigCompUserLoginTime = @"
            select date_format(starttime,'%h:%i %p') as starttime,date_format(endtime,'%h:%i %p') as endtime,starttime,endtime 
            from usersecurity 
            where Branchid=@BranchId and days=@Day";

        public const string FunCountBranchSecurityRecord = @"
            select Count(days) 
            from usersecurity 
            where Branchid=@BranchId";

        public const string LoginFailed = @"
            INSERT INTO loginfailed (LoginType, IPAddress, FromTime, ToTime, loginid, FailedDate) 
            VALUES (@LoginType, @IPAddress, @FromTime, @ToTime, @Username, @FailedDate)";

        // Refresh token queries
        public const string SaveRefreshToken = @"
            INSERT INTO tbl_refreshtokens (user_id, token, expires_at, created_at) 
            VALUES (@UserId, @Token, @ExpiresAt, @CreatedAt);
            SELECT LAST_INSERT_ID();";

        public const string GetRefreshToken = @"
            SELECT id, user_id AS UserId, token, expires_at AS ExpiresAt, created_at AS CreatedAt, 
                   DATE_FORMAT(revoked_at, '%Y-%m-%d %H:%i:%s') AS RevokedAt, replaced_by_token AS ReplacedByToken, reason_revoked AS ReasonRevoked 
            FROM tbl_refreshtokens 
            WHERE token = @Token";

        public const string RevokeRefreshToken = @"
            UPDATE tbl_refreshtokens 
            SET revoked_at = @RevokedAt, 
                reason_revoked = @ReasonRevoked 
            WHERE token = @Token";

        public const string RevokeDescendantRefreshTokens = @"
            UPDATE tbl_refreshtokens 
            SET revoked_at = @RevokedAt, 
                reason_revoked = @ReasonRevoked 
            WHERE replaced_by_token = @Token";

        public const string DeleteExpiredRefreshTokens = @"
            DELETE FROM tbl_refreshtokens 
            WHERE expires_at < @CurrentDate";

        // Notification config queries
        public const string GetUserDetailForExcel = @"
            SELECT null as Date, username as Username, branchname as Branchname, rd.name as Role, null as Login, null as Logout, v.ipaddress as IPAddress 
            FROM users v JOIN roledetails rd ON v.Role_id = rd.RoleID JOIN institute i ON v.Institute_id = i.Instituteid LEFT JOIN branch b ON b.Instituteid = i.Instituteid 
            WHERE rd.name not in ('instituteadmin','branchadmin') and loginstatus=1 and loginid=@Username";

        public const string GetEmailConfig = @"
            select * from emailsettings where institute_id=@InstituteId and branch_id=@BranchId";

        public const string GetSMSConfig = @"
            SELECT if(Sms=1,Mobile,'') As MobileNo,Log,if(EmailLog=1,Emailid,'') As Emailid,Branchid  FROM usersecuritysetting where Branchid=@BranchId limit 1";

        public const string GetAnnouncementUnauthorised = @"
            SELECT unauthorisedsetting as IsEnabled, unauthorisedtemplate as Template, unauthorisedtemplateno as TemplateNo FROM annoucementsetting WHERE instituteid=@InstituteId and branchid=@BranchId";

        public const string GetAnnouncementLoginTime = @"
            SELECT logintimeslotsetting as IsEnabled, logintimeslottemplate as Template, logintimeslottemplateno as TemplateNo FROM annoucementsetting WHERE instituteid=@InstituteId and branchid=@BranchId";

        public const string GetAnnouncementNoTimeSlot = @"
            SELECT logintimenotsetsetting as IsEnabled, logintimenotsettemplate as Template, logintimenotsettemplateno as TemplateNo FROM annoucementsetting WHERE instituteid=@InstituteId and branchid=@BranchId";

        public const string GetModuleList = @"
            SELECT DISTINCT 
            m.ModuleId,
            m.Module,
            ra.AllowView,
            ra.AllowAdd,
            ra.AllowModify,
            ra.AllowDelete,
            ra.AllowReports,
            CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM submodules sm
                    WHERE sm.ModuleId = m.ModuleId
                      AND sm.IsActive = 1
                )
                THEN 1
                ELSE 0
            END AS IsSubModule
        FROM modules m
        INNER JOIN roleaccess ra 
            ON m.ModuleId = ra.ModuleId
        INNER JOIN institutemodules im ON (im.moduleId=m.ModuleId AND instituteId=@InstituteId)
        WHERE ra.RoleId = @RoleId
          AND m.IsActive = 1
          AND ra.AllowView = 1
        AND (
                (@BranchId = 0 AND m.IsBranchSpecific = 0)
                OR
        (@BranchId > 0 AND m.IsBranchSpecific = 1)
        )
        ORDER BY m.ModuleId;";

        public const string GetSubModules = @"
            SELECT SubModuleId, SubModuleName, ModuleId, IsActive
            FROM submodules
            WHERE ModuleId = @ModuleId AND IsActive = 1
            ORDER BY SubModuleId";

        public const string GetModuleHierarchyForAuth = @"
            SELECT 
                moduleId,
                moduleCode AS module_code,
                NAME AS name,
                levelNo AS level,
                sequence,
                masterModuleId,
                canView,
                canAdd,
                canEdit,
                canDelete,
                canImport,
                canExport,
                selfOperation
            FROM m_modules
            WHERE isActive = 1
            ORDER BY 
                CASE WHEN masterModuleId = 0 THEN 0 ELSE 1 END,
                levelNo ASC,
                sequence ASC,
                NAME ASC";

        public const string GetModuleHierarchyForAuthWithBranchSpecific = @"
            SELECT
        m.moduleId,
        m.moduleCode AS module_code,
        m.NAME AS name,
        m.levelNo AS level,
        m.sequence,
        m.masterModuleId,
        m.canView,
        m.canAdd,
        m.canEdit,
        m.canDelete,
        m.canImport,
        m.canExport,
        m.selfOperation,
        m.BranchSpecific
        FROM m_modules m
        WHERE m.isActive = 1

        -- Institute Level = common modules only
        -- Branch Level = common + branch-specific modules
        AND (
        (@BranchSpecific = 0 AND m.BranchSpecific = 0)
        OR
        (@BranchSpecific = 1 AND m.BranchSpecific IN (0, 1)) AND m.moduleId<>1
        )

        -- Check the active plan of the institute
        AND EXISTS
        (
            SELECT 1
            FROM onlinepaymenthistory oph
            INNER JOIN planmodule pm
                ON pm.planId = oph.planId
            WHERE oph.instid = @InstituteId
              AND oph.isactive = 1
              AND (
                  pm.moduleId = m.moduleId
                  OR pm.moduleId = m.masterModuleId
              )
        )

        ORDER BY
        CASE WHEN m.masterModuleId = 0 THEN 0 ELSE 1 END,
        m.levelNo ASC,
        m.sequence ASC,
        m.NAME ASC;";

        public const string GetModuleListForSuperAdmin = @"
            SELECT DISTINCT 
            m.ModuleId,
            m.Module,
            ra.AllowView,
            ra.AllowAdd,
            ra.AllowModify,
            ra.AllowDelete,
            ra.AllowReports,
            CASE 
                WHEN EXISTS (
                    SELECT 1
                    FROM submodules sm
                    WHERE sm.ModuleId = m.ModuleId
                      AND sm.IsActive = 1
                )
                THEN 1
                ELSE 0
            END AS IsSubModule
        FROM modules m
        INNER JOIN roleaccess ra 
            ON m.ModuleId = ra.ModuleId        
        WHERE ra.RoleId = @RoleId
          AND m.IsActive = 1
          AND ra.AllowView = 1
        AND IsSuperAdminSpecific=1;";

        public const string HeaderDetails = @"SELECT i.Instituteid,i.ParentCompanyName,i.Institutename,i.Contactperson,
        i.Phone,i.Email,i.Address,i.Logo,i.CpMobile,i.CpEmail,
        c.countryname AS country,statename AS state,cityname AS city,i.othercity,i.pincode,
        oph.paymenthistoryid,oph.purchasedate,oph.startdate,DATE_FORMAT(oph.enddate,'%d/%m/%Y') AS expiryDate,oph.isactive,
        oph.totalamount,oph.noofstudents,oph.noofmonths,oph.noofenquiry,
        u.user_id AS UserId,u.role_id,u.branch_id,u.institute_id,u.username,
        u.email,i.ExpiryDate AS instExpiryDate,i.regType,u.loginstatus,DATE_FORMAT(u.lastlogin,'%d/%m/%Y %h:%i %p') AS lastlogin,
        u.staffid,GREATEST(DATEDIFF(oph.enddate, CURRENT_DATE()), 0) AS remainingDays,rd.Name AS roleName
        FROM institute i
        INNER JOIN country c ON c.countryid=i.countryid
        INNER JOIN countrystate cs ON cs.stateid=i.stateid
        INNER JOIN countrycity cc ON cc.cityid=i.cityid
        INNER JOIN users u ON u.institute_id=i.instituteid
        LEFT JOIN onlinepaymenthistory oph ON oph.instid=i.Instituteid
        INNER JOIN roledetails rd ON rd.RoleID=u.Role_id
        WHERE i.instituteid=@InstituteId AND i.institute_status=1
        AND CURRENT_DATE()
        BETWEEN  oph.startdate AND oph.enddate 
        AND oph.isactive=1 AND u.user_id=@UserId
        ORDER BY oph.paymenthistoryid DESC LIMIT 1";

        public const string HeaderDetails_SuperAdmin = @"SELECT u.user_id,u.role_id,u.branch_id,u.institute_id,u.passwd,u.username,
        u.email,'' as expiryDate,'' as regType,u.loginstatus,DATE_FORMAT(u.lastlogin,'%d/%m/%Y %h:%i %p') AS lastlogin,
        u.staffid,rd.Name AS roleName FROM users u INNER JOIN roledetails rd ON rd.RoleID=u.Role_id
        WHERE u.user_id=@UserId AND u.role_id=1";

        public const string BranchList = @"SELECT Branchid,Branchname FROM branch
        WHERE instituteid=@InstituteId AND branch_status=1 
        ORDER BY Branchname";

        public const string CheckModulePermission = @"
            SELECT
                CASE
                    WHEN @Action = 'View' THEN
                        CASE
                            WHEN m.canView = 1 THEN 1
                            WHEN parent.canView = 1 THEN 1
                            WHEN grandparent.canView = 1 THEN 1
                            ELSE 0
                        END

                    WHEN @Action = 'Add' THEN
                        CASE
                            WHEN m.canAdd = 1 THEN 1
                            WHEN parent.canAdd = 1 THEN 1
                            WHEN grandparent.canAdd = 1 THEN 1
                            ELSE 0
                        END

                    WHEN @Action = 'Edit' THEN
                        CASE
                            WHEN m.canEdit = 1 THEN 1
                            WHEN parent.canEdit = 1 THEN 1
                            WHEN grandparent.canEdit = 1 THEN 1
                            ELSE 0
                        END

                    WHEN @Action = 'Delete' THEN
                        CASE
                            WHEN m.canDelete = 1 THEN 1
                            WHEN parent.canDelete = 1 THEN 1
                            WHEN grandparent.canDelete = 1 THEN 1
                            ELSE 0
                        END

                    WHEN @Action = 'Import' THEN
                        CASE
                            WHEN m.canImport = 1 THEN 1
                            WHEN parent.canImport = 1 THEN 1
                            WHEN grandparent.canImport = 1 THEN 1
                            ELSE 0
                        END

                    WHEN @Action = 'Export' THEN
                        CASE
                            WHEN m.canExport = 1 THEN 1
                            WHEN parent.canExport = 1 THEN 1
                            WHEN grandparent.canExport = 1 THEN 1
                            ELSE 0
                        END

                    ELSE 0
                END AS HasPermission

            FROM m_modules m

            LEFT JOIN m_modules parent
                ON parent.moduleId = m.masterModuleId

            LEFT JOIN m_modules grandparent
                ON grandparent.moduleId = parent.masterModuleId

            WHERE m.name = @ModuleName
              AND m.isActive = 1

            LIMIT 1";
    }
}