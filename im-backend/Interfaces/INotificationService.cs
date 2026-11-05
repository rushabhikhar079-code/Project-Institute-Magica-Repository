namespace IM_backend.Interfaces
{
    public interface INotificationService
    {
        Task SendLoginFailedNotificationAsync(string reason, string username, string ipAddress, string instituteId, string branchId, string? startTime = null, string? endTime = null);
    }
}
