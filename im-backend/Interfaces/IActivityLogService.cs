using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface IActivityLogService
    {
        Task LogActivityAsync(string moduleName, string action, long? recordId, string? oldData, string? newData, string tableName, int? instituteId, string? branchId, string? ipAddress, string? description, int userId);
        Task LogActivityAsync(ActivityLogDto.ActivityLogCreateDto log);
    }
}
