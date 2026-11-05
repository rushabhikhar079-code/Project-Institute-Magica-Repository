using NPOI.SS.Formula.Functions;
using SkiaSharp;

namespace IM_backend.SqlQueries
{
    public static class CommonQueries
    {
        public const string GetCountries = @"
            SELECT countryid as id, countryname as name 
            FROM country ORDER BY countryname";

        public const string GetStatesByCountryId = @"
            SELECT stateid as id, statename as name
            FROM countrystate 
            WHERE countryid = @CountryId;";

        public const string GetCitiesByStateId = @"
            SELECT cityid as id, cityname as name
            FROM countrycity 
            WHERE stateid = @StateId;";

        public const string GetEmailSettings = @"
            SELECT
            Email_User AS EmailUser,
            Email_Pwd AS EmailPassword,
            Smtp_Server AS SmtpServer,
            EnableSsl,Smtp_Server AS MailHost,
            Portno AS PortNo,
            Email_User AS MailFrom
            FROM emailsettings
            WHERE Smtp_Server IS NOT NULL
            AND institute_id = @InstituteId
            AND EnableSSL = 1";

        public const string GetUserLocationByNames = @"
            SELECT 
            c.countryid as CountryId, c.countryname as CountryName,
            s.stateid AS StateId, s.statename AS StateName,
            ci.cityid AS CityId, ci.cityname AS CityName
            FROM country c
            LEFT JOIN countrystate s ON s.countryId = c.countryid AND LOWER(s.statename) = LOWER(@StateName)
            LEFT JOIN countrycity ci ON ci.stateid = s.stateid AND LOWER(ci.cityname) = LOWER(@CityName)
            WHERE LOWER(c.countryname) = LOWER(@CountryName)";

        public const string GetInstitutePlans = @"
            SELECT Planid as id, planName as name 
            FROM plans WHERE IsActive = 1 ORDER BY Planid";

        public const string GetAllStaff = @"
            SELECT CONCAT(t.t_firstname, ' ', t.t_lastname, ' (', rd.name, ')') AS Name, u.User_id AS TrainerId
            FROM trainner t
            INNER JOIN users u ON t.trainnerid = u.StaffID
            INNER JOIN roledetails rd ON rd.RoleId = u.Role_id
            WHERE t.instid = @InstituteId AND t.branchid = @BranchId AND t.statusflag = 1
            UNION
            SELECT CONCAT(u.Username, ' (', rd.name, ')') AS Name, u.User_id AS TrainerId
            FROM users u
            INNER JOIN roledetails rd ON rd.RoleId = u.Role_id
            WHERE u.Institute_id = @InstituteId AND u.Branch_id = @BranchId
            AND u.StaffID NOT IN (SELECT t.trainnerid FROM trainner t WHERE t.Branchid = @BranchId)
            ORDER BY Name";

        public const string GetCounselors = @"
            SELECT CONCAT(t.t_firstname, ' ', t.t_lastname) AS Name, u.User_id AS TrainerId
            FROM trainner t
            INNER JOIN users u ON t.trainnerid = u.StaffID
            INNER JOIN roledetails rd ON rd.RoleId = u.Role_id AND rd.name = 'Counsellor'
            WHERE t.instid = @InstituteId AND t.branchid = @BranchId AND t.stafftype = 2
            AND t.statusflag = 1
            ORDER BY Name";

        public const string GetCurriculums = @"
            SELECT crclmId AS Id, crclmName AS Name
            FROM tbl_curriculum
            WHERE branchid = @BranchId AND instituteid = @InstituteId
            ORDER BY Name";

        public const string GetCoursesByCurriculum = @"
            SELECT c.courseID AS Id,
                IF(cu.crclmName <> '', CONCAT(cu.crclmName, '-', c.course_Name), c.course_Name) AS Name
            FROM tbl_course c
            LEFT JOIN tbl_curriculum cu ON c.crclmId = cu.crclmId
            LEFT JOIN branch b ON c.BranchID = b.Branchid
            WHERE c.instituteID = @InstituteId
                AND (b.branch_status <> 0 OR b.branch_status IS NULL)
                AND c.StatusFlag = 1
                AND c.branchid = @BranchId
                AND cu.crclmId = @CurriculumId
                AND c.courseFeeWise <> 2
            ORDER BY Name";

        public const string GetCourses = @"
        SELECT c.courseID AS Id,IF(cu.crclmName <>'',CONCAT(cu.crclmName,'-',c.course_Name),c.course_Name) AS 'Name',
        c.course_Name AS newname,branchname 
        FROM tbl_course c 
        LEFT JOIN tbl_curriculum cu ON c.crclmID = cu.crclmId 
        LEFT JOIN branch b ON c.BranchID = b.Branchid
        where c.instituteID=@InstituteId and (b.branch_status <> 0 or b.branch_status is null) 
        and c.StatusFlag=1 and c.branchid=@BranchId order by Name";

        public const string GetSubjectsByCourseId = @"
        SELECT subID AS Id,sub_Name AS 'Name' FROM tbl_subject s WHERE s.courseid=@CourseId and s.StatusFlag=1 ORDER BY Name";

        public const string GetTopicsByCourseId = @"
        SELECT DISTINCT TopicID as Id,TopicName as 'Name' FROM subject_topics 
        WHERE courseid=@CourseId AND SubjectID=@SubjectId and isActive=1 ORDER BY Name";

        public const string GetSubjectsByCourse = @"
       SELECT s.subID AS Id, s.sub_Name AS Name
       FROM tbl_subject s
       WHERE s.courseID = @CourseId
           AND s.StatusFlag = 1";

        public const string GetCoursesForRegistration = @"
            SELECT c.courseID,
                   IF(c.IscourseLvl=1,
                      IF(c.cTaxable=1,
                         CONCAT(c.course_name, ' (', IF(c.cIncluding_Tax=1, 'Inc. Tax ', 'Excl. Tax '), c.courseFees, ')'),
                         CONCAT(c.course_Name, ' (', 'No Tax ', c.courseFees, ')')),
                      c.course_Name) AS course_Name,
                   c.IscourseLvl,
                   c.courseFeeWise
            FROM tbl_course c
            LEFT JOIN tbl_curriculum cu ON c.crclmId = cu.crclmId
            LEFT JOIN branch b ON c.BranchID = b.Branchid
            WHERE c.instituteID = @InstID
              AND (b.branch_status <> 0 OR b.branch_status IS NULL)
              AND c.StatusFlag = 1
              AND c.branchid = @BranchID
            ORDER BY course_Name ASC";

        public const string GetSubjectsByCourseMulti = @"
            SELECT CONCAT(subID, '#', feesType) AS subID,
                   IF(c.IscourseLvl=0,
                      IF(taxable=1,
                         CONCAT(sub_Name, ' (', IF(Including_Tax=1, 'Inc. Tax ', 'Excl. Tax '), s.Fees, ')'),
                         CONCAT(sub_Name, ' (', 'No Tax ', s.Fees, ')')),
                      sub_Name) AS sub_name,
                   c.IscourseLvl
            FROM tbl_subject s
            JOIN tbl_course c ON s.courseID = c.courseID
            WHERE s.courseid IN (@CourseID)
              AND s.StatusFlag = 1
              AND c.StatusFlag = 1
            ORDER BY sub_name";

        public const string GetBatchesBySubjects = @"
            SELECT DISTINCT b.batchid AS Id, b.batchname AS Name
            FROM batch b
            INNER JOIN batchcourse bc ON bc.batchid = b.batchid
            INNER JOIN tbl_course tc ON bc.courseid = tc.courseID
            INNER JOIN tbl_subject ts ON tc.courseID = ts.courseID
            WHERE ts.subID IN ({0})
              AND bc.instid = @InstituteId
              AND bc.branchid = @BranchId";
        public const string GetAllBatches = @"
    SELECT DISTINCT 
        b.batchid AS Id,
        b.batchname AS Name
    FROM batch b
    INNER JOIN batchcourse bc ON bc.batchid = b.batchid
    WHERE bc.instid = @InstituteId
      AND bc.branchid = @BranchId";
        public const string GetFollowUpStatus = @"
            SELECT CONCAT(statusid, '#', reminder) AS StatusId,
                   sname AS SName,
                   sflag AS SFlag,
                   IF(sflag = 0, 'YES', 'NO') AS Productive,
                    reminder,
                   instid AS InstId
            FROM enquiryfollowupstatus
            WHERE (instid = @InstituteId OR instid = 0)
              AND (branchid = @BranchId OR branchid = 0)
            ORDER BY sname";

        public const string GetUsernamebyRole = @"
            SELECT DISTINCT u.User_id AS Id, u.Username AS Name
            FROM users u INNER JOIN roledetails r ON u.Role_id=r.RoleID
            WHERE u.Branch_id=@BranchId AND r.name=@RoleName
            Order by Username ASC";

        public const string GetSources = @"
            SELECT refid AS Id, reference AS Name
            FROM studreferences
            WHERE Instid=@InstituteId or instid = 0
            Order by reference";

        public const string GetOtherFees = @"
            SELECT of_code,of_name,ROUND(amount,2) AS amount,istaxable,isincluding,
            IF(of_Frequency=1,'One Time',IF(of_Frequency=2,'Monthly',
            IF(of_Frequency=3,'Adhoc',''))) AS Of_FrequencyName 
            FROM otherfees WHERE institute_id=@InstituteId AND branch_id=@BranchId AND StatusFlag=1 AND IsDynamicFee=0 ORDER BY of_name";
    }
}