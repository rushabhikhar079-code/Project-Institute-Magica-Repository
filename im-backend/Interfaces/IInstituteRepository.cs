using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Models;

namespace IM_backend.Interfaces
{
    public interface IInstituteRepository
    {
        Task<int> CheckUsernameAvailabilityAsync(string username);
        Task<int> CreateInstituteAsync(InstituteModels institute);
        Task<int> CreateInstUserAsync(InstUserModels instUser);
        Task<bool> UpdateUserPasswordAsync(int userId, byte[] password);
        Task<bool> UpdateInstituteMetadataAsync(int instituteId, int userId, string ipAddress);
        Task<int> CreateBranchAsync(InstituteModels institute, int instituteId);
        Task<int> CreateConfigAsync(int branchId, int instituteId);
        Task<bool> CreateRegNoFormatAsync(int instituteId);
        Task<bool> CreateReceiptNoFormatAsync(int instituteId);
        Task<int?> GetUserIdByUsernameAsync(string username);
        Task<int?> GetInstituteIdByUserIdAsync(int userId);
        Task<int?> GetBranchIdByUserIdAsync(int userId);

        Task<(bool Success, string Message)> RegisterInstituteAsync(InstituteRegistrationDto request, string ipAddress);
        Task<PagedResponse<InstituteListItemDto>> GetInstitutesAsync(InstituteSearchDto search);
        Task<InstituteEditDto?> GetInstituteByIdAsync(int instituteId);
        Task<PagedResponse<AccountHistoryDto>> GetAccountHistoryAsync(AccountHistorySearchDto search);
        Task<(bool Success, string Message)> DeleteInstituteAsync(int instituteId, bool status);
        Task<(bool Success, string Message)> SubmitInstituteAsync(InstituteSubmitDto request, int instituteId, int userId, string ipAddress);
        Task<(bool Success, string Message)> EditInstituteAsync(InstituteEditSubmitDto request, int userId, string ipAddress);
        Task<AccountHistoryDto?> GetAccountHistoryByIdAsync(int instituteId);
        Task<(bool Success, string Message)> UpdateAccountHistoryAsync(AccountHistoryDto request, int userId, string ipAddress);
    }
}
