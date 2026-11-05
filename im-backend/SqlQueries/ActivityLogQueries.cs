namespace IM_backend.SqlQueries
{
    public class ActivityLogQueries
    {
        // Insert activity log
        public const string InsertActivityLog = @"
            INSERT INTO activity_log 
            (moduleName, userId, action, recordId, oldData, newData, tableName, instituteId, branchId, ipAddress, activityDateTime, description)
            VALUES 
            (@ModuleName, @UserId, @Action, @RecordId, @OldData, @NewData, @TableName, @InstituteId, @BranchId, @IpAddress, @ActivityDateTime, @Description);
            SELECT LAST_INSERT_ID();";

        // Get activity logs by user
        public const string GetActivityLogsByUser = @"
            SELECT 
                activityLogId, moduleName, userId, action, recordId, oldData, newData, 
                tableName, instituteId, branchId, ipAddress, activityDateTime, description
            FROM activity_log
            WHERE userId = @UserId
            ORDER BY activityDateTime DESC
            LIMIT @PageSize OFFSET @Offset";

        // Get activity logs by module
        public const string GetActivityLogsByModule = @"
            SELECT 
                activityLogId, moduleName, userId, action, recordId, oldData, newData, 
                tableName, instituteId, branchId, ipAddress, activityDateTime, description
            FROM activity_log
            WHERE moduleName = @ModuleName
            ORDER BY activityDateTime DESC
            LIMIT @PageSize OFFSET @Offset";

        // Get activity logs by institute
        public const string GetActivityLogsByInstitute = @"
            SELECT 
                activityLogId, moduleName, userId, action, recordId, oldData, newData, 
                tableName, instituteId, branchId, ipAddress, activityDateTime, description
            FROM activity_log
            WHERE instituteId = @InstituteId
            ORDER BY activityDateTime DESC
            LIMIT @PageSize OFFSET @Offset";

        // Get activity logs by record
        public const string GetActivityLogsByRecord = @"
            SELECT 
                activityLogId, moduleName, userId, action, recordId, oldData, newData, 
                tableName, instituteId, branchId, ipAddress, activityDateTime, description
            FROM activity_log
            WHERE recordId = @RecordId
            ORDER BY activityDateTime DESC";

        // Get activity logs count by user
        public const string GetActivityLogsCountByUser = @"
            SELECT COUNT(*)
            FROM activity_log
            WHERE userId = @UserId";

        // Get activity logs count by module
        public const string GetActivityLogsCountByModule = @"
            SELECT COUNT(*)
            FROM activity_log
            WHERE moduleName = @ModuleName";

        // Get activity logs count by institute
        public const string GetActivityLogsCountByInstitute = @"
            SELECT COUNT(*)
            FROM activity_log
            WHERE instituteId = @InstituteId";

        // Get record data as JSON from any table
        public const string GetRecordData = @"
            SELECT * FROM {0} WHERE {1} = @RecordId";

        // Get activity logs count by user
        public const string GetActivityLogsCountByUserForCleanup = @"
            SELECT COUNT(*)
            FROM activity_log
            WHERE userId = @UserId";

        // Delete activity logs older than 1 year for a user
        public const string DeleteActivityLogsOlderThanOneYear = @"
            DELETE FROM activity_log
            WHERE userId = @UserId
                AND activityDateTime < DATE_SUB(NOW(), INTERVAL 1 YEAR)";

        // Delete oldest activity logs for a user (keep only latest N records)
        public const string DeleteOldestActivityLogsForUser = @"
            DELETE FROM activity_log
            WHERE userId = @UserId
                AND activityLogId NOT IN (
                    SELECT activityLogId
                    FROM (
                        SELECT activityLogId
                        FROM activity_log
                        WHERE userId = @UserId
                        ORDER BY activityDateTime DESC
                        LIMIT @KeepCount
                    ) AS temp
                )";
    }
}
