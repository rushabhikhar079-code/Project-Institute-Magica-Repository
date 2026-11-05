using Dapper;
using IM_backend.Configuration;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;
using System.Text.Json;

namespace IM_backend.Repositories
{
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public ActivityLogRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<long> AddActivityLogAsync(ActivityLogDto.ActivityLogCreateDto log)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var logId = await db.QuerySingleAsync<long>(ActivityLogQueries.InsertActivityLog, log);
            return logId;
        }

        public async Task<string?> GetRecordDataAsync(string tableName, long recordId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Get primary key column name for the table from centralized configuration
            var primaryKeyColumn = GetPrimaryKeyColumn(tableName);

            var query = string.Format(ActivityLogQueries.GetRecordData, tableName, primaryKeyColumn);

            var result = await db.QueryFirstOrDefaultAsync<dynamic>(query, new { RecordId = recordId });

            if (result == null)
                return null;

            // Serialize the result to JSON
            return JsonSerializer.Serialize(result, new JsonSerializerOptions
            {
                WriteIndented = false,
                ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
            });
        }

        private string GetPrimaryKeyColumn(string tableName)
        {
            // Use centralized configuration for primary key mappings
            if (ActivityLogConfiguration.TablePrimaryKeyMappings.TryGetValue(tableName, out var pkColumn))
                return pkColumn;

            // Fallback to default naming convention
            return "id";
        }

        public async Task<int> CleanupOldActivityLogsAsync(int userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Single query to check both conditions: count > 500 AND has records older than 1 year
            var shouldCleanup = await db.QuerySingleOrDefaultAsync<int>(
                @"SELECT COUNT(*)
                  FROM activity_log
                  WHERE userId = @UserId
                    AND activityDateTime < DATE_SUB(NOW(), INTERVAL 1 YEAR)
                  HAVING COUNT(*) > 0
                    AND (SELECT COUNT(*) FROM activity_log WHERE userId = @UserId) > 500",
                new { UserId = userId });

            if (shouldCleanup == 0)
            {
                // Either user has <= 500 records OR no records older than 1 year
                return 0;
            }

            // Delete records older than 1 year (only if both conditions are met)
            var deletedOlderThanOneYear = await db.ExecuteAsync(
                ActivityLogQueries.DeleteActivityLogsOlderThanOneYear,
                new { UserId = userId });

            return deletedOlderThanOneYear;
        }
    }
}
