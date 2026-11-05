using IM_backend.Common;
using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface IBranchRepository
    {
        Task<PagedResponse<BranchListItemDto>> GetBranchesAsync(int instituteId, BranchSearchDto search, int userRole, int userId);
        Task<(BranchEditDto? Branch, string? ErrorMessage)> GetBranchByIdAsync(int instituteId, int branchId);
        Task<(bool Success, string Message, int? BranchId)> CreateBranchAsync(int instituteId, int userId, BranchSubmitDto branch);
        Task<(bool Success, string Message)> UpdateBranchAsync(int instituteId, int userId, BranchEditDto branch);
        Task<(bool Success, string Message)> DeleteBranchAsync(int instituteId, int branchId, bool status);
    }
}
