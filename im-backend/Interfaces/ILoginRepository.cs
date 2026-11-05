using IM_backend.Dtos;
using IM_backend.Models;

namespace IM_backend.Interfaces
{
    public interface ILoginRepository
    {
        Task<LoginModels?> GetLoginByUsernameAsync(string username);
        Task<LoginModels?> GetLoginByUserIdAsync(string username);
        Task<bool> UpdateLastLoginDateAsync(string username, string logDate);
        Task<string?> GetRoleInfoAsync(int roleId);
        Task<bool> CheckStatusAsync(int instituteId, int branchId);
        Task<int> UsersActivityAsync(UserActivityModels activity);
        Task<List<BranchAdminModels>> GetAdminBranchesAsync(int userId);
        Task<List<UserRoleAccessModels>> GetRoleAccessAsync(int roleId, int planId);
        Task<string?> GetTaxAsync(int instituteId, int branchId);

        // Plan expiry methods
        Task<PaymentHistoryModels?> CheckCurrentPlanExpiryAsync(int instituteId, string currentDate);
        Task<PaymentHistoryModels?> CheckCurrentPlanHoldAsync(int instituteId, string currentDate);
        Task<PaymentHistoryModels?> CheckFutureDatePlanExistsAsync(int instituteId, string currentDate);
        Task<PaymentHistoryModels?> CheckBackDatePlanExistsAsync(int instituteId, string currentDate);
        Task<List<PaymentHistoryModels>> AllFutureDatePlanExistsAsync(int instituteId, string currentDate);
        Task<bool> UpdatePlanStatusAsync(int paymentHistoryId, int userId);
        Task<bool> UpdateInstituteStatusAsync(int instituteId, int instituteStatus, int regType);

        // Regional and config methods
        Task<RegionalSettingsModels?> GetRegionalInfoAsync(int branchId);
        Task<string?> GetInstituteBranchNameAsync(int instituteId, int branchId);
        Task<string?> GetBranchContactNoAsync(int branchId);
        Task<int?> GetIsRedirectToNewTabAsync(int branchId, int instituteId);
        Task<(int? AllowStudModule, int? IsAllowTestEngine)> GetStudentModuleAllowedAsync(int instituteId);
        Task<List<int>> GetActTraiBranchAsync(int userId, int instituteId);

        // Security methods
        Task<int> CheckUserLoginTimeRecordAsync(string username);
        Task<int> ConfigCheckUserLoginTimeRecordAsync(int branchId);
        Task<string?> UserIPAddressAsync(string username);
        Task<string?> ConfigUserIPAddressAsync(int branchId);
        Task<LoginTimeModels?> CompUserLoginTimeAsync(string username, int day);
        Task<int> FunCompUserLoginTimeAsync(string userId);
        Task<LoginTimeModels?> FunConfigCompUserLoginTimeAsync(int branchId, int day);
        Task<int> FunCountBranchSecurityRecordAsync(int branchId);
        Task<int> LoginFailedAsync(string loginType, string ipAddress, string fromTime, string toTime, string username, string failedDate, string instituteId, string branchId);

        // Notification config methods
        Task<UserDetailForExcel?> GetUserDetailForExcelAsync(string username);
        Task<EmailConfig?> GetEmailConfigAsync(int instituteId, int branchId);
        Task<SMSConfig?> GetSMSConfigAsync(int instituteId, int branchId);
        Task<AnnouncementSettings?> GetAnnouncementSettingsAsync(int instituteId, int branchId, string type);

        // Refresh token methods
        Task<int> SaveRefreshTokenAsync(int userId, string token, DateTime expiresAt, DateTime createdAt);
        Task<RefreshTokenModels?> GetRefreshTokenAsync(string token);
        Task<bool> RevokeRefreshTokenAsync(string token, DateTime revokedAt, string reason);
        Task<bool> RevokeDescendantRefreshTokensAsync(string token, DateTime revokedAt, string reason);
        Task<int> DeleteExpiredRefreshTokensAsync(DateTime currentDate);

        Task<(bool Success, string Message, string RedirectUrl, Dictionary<string, string> SessionData, LoginFailureDetails? FailureDetails)> CheckLoginAsync(string username, string password, string ipAddress);

        Task<List<Modules>> GetModuleListAsync(int roleId, int instituteId, int branchId);
        Task<List<SubModules>> GetSubModulesAsync(int moduleId);
        Task<ModuleHierarchyResponseDto> GetModuleHierarchyAsync();
        Task<ModuleHierarchyResponseDto> GetModuleHierarchyAsync(int branchSpecific,int instituteId);
        Task<List<Modules>> GetModuleListForSuperAdminAsync(int roleId);
        Task<List<HeaderDetails>> HeaderDetailsAsync(int roleId, int instituteId, int userId);
        Task<List<BranchListItemDto>> BranchListAsync(int instituteId);
    }
}
