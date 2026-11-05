using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface IActivityLogRepository
    {
        Task<long> AddActivityLogAsync(ActivityLogDto.ActivityLogCreateDto log);
        Task<string?> GetRecordDataAsync(string tableName, long recordId);
        Task<int> CleanupOldActivityLogsAsync(int userId);
    }
}
