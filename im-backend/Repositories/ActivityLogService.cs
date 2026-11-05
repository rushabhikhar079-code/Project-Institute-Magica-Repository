using IM_backend.Dtos;
using IM_backend.Interfaces;

namespace IM_backend.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly IActivityLogRepository _activityLogRepository;

        public ActivityLogService(IActivityLogRepository activityLogRepository)
        {
            _activityLogRepository = activityLogRepository;
        }

        public async Task LogActivityAsync(string moduleName, string action, long? recordId, string? oldData, string? newData, string tableName, int? instituteId, string? branchId, string? ipAddress, string? description, int userId)
        {
            var log = new ActivityLogDto.ActivityLogCreateDto
            {
                ModuleName = moduleName,
                Action = action,
                RecordId = recordId,
                OldData = oldData,
                NewData = newData,
                TableName = tableName,
                InstituteId = instituteId,
                BranchId = branchId,
                IpAddress = ipAddress,
                ActivityDateTime = DateTime.Now,
                Description = description,
                UserId = userId
            };

            await LogActivityAsync(log);
        }

        public async Task LogActivityAsync(ActivityLogDto.ActivityLogCreateDto log)
        {
            // Cleanup old activity logs before adding new one. This ensures we keep only last 1 year of data per user. And max 500 records per user
            //if (log.UserId > 0)
            //{
            //    await _activityLogRepository.CleanupOldActivityLogsAsync(log.UserId);
            //}

            await _activityLogRepository.AddActivityLogAsync(log);
        }
    }
}
