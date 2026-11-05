using IM_backend.Common;
using IM_backend.Dtos;
namespace IM_backend.Interfaces
{
    public interface IStudentRepository
    {
        Task<(bool Success, string Message, int? StudentId, string? RegNo)> RegisterStudentAsync(StudentRegistrationDto request, int instituteId, int branchId, int userId, string ipAddress);
        Task<PagedResponse<StudentListDto>> SearchStudentsAsync(StudentSearchDto search, int instituteId);
        Task<(bool Success, string Message, StudentForEditDto? Data)> GetStudentForEditAsync(int studentId, int instituteId, int branchId);
        Task<(bool Success, string Message)> BulkUpdateStudentStatusAsync(BulkStudentStatusDto request, int instituteId);
        Task<(bool Success, string Message)> DeleteStudentAsync(DeleteStudentDto request, int instituteId);
        Task<(bool Success, string Message)> BulkDeleteStudentsAsync(BulkStudentDeleteDto request, int instituteId);
        Task<(bool Success, string Message, int? StudentId)> RegisterEnquiryAsync(StudentEnquiryDto request, int instituteId, int branchId, int userId, string ipAddress, string userRole = "");
        Task<(bool Success, string Message, int? StudentId)> RegisterEnquiryStep1Async(EnquiryStep1Dto request, int instituteId, int branchId, int userId, string ipAddress, string userRole = "");
        Task<(bool Success, string Message)> UpdateEnquiryStep2Async(EnquiryStep2Dto request, int instituteId, int branchId);
        Task<(bool Success, string Message)> UpdateEnquiryStep3Async(EnquiryStep3Dto request, int instituteId, int branchId);
        Task<(bool Success, string Message)> UpdateEnquiryStep4Async(EnquiryStep4Dto request, int instituteId, int branchId);
        Task<(bool Success, string Message)> UpdateEnquiryStep5Async(EnquiryStep5Dto request, int instituteId, int branchId);
        Task<(bool Success, string Message, int? StudentId)> UpdateRegistrationAsync(StudentRegistrationDto request, int studentId, int instituteId, int branchId, int userId, string ipAddress);
        Task<(bool Success, string Message, int? StudentId)> UpdateEnquiryAsync(int studentId, StudentEnquiryDto request, int instituteId, int branchId, int userId, string ipAddress);
        Task<PagedResponse<EnquiryFollowUpListDto>> SearchEnquiryFollowUpAsync(EnquiryFollowUpSearchDto request, int instituteId, int branchId, string? userId = null, int? RegNo=0);
        Task<(bool Success, string Message)> SaveFollowUpRemarkAsync(FollowUpRemarkSubmitDto request, int instituteId, int branchId, int userId);
        Task<EnquiryFollowUpListDto?> GetFollowUpByStudIdAsync(int studentId, int instituteId, int branchId, string? userId = null);
        Task<IEnumerable<FollowUpRemarkHistoryDto>> GetLastRemarksAsync(int studentId, int instituteId, int branchId);
        Task<(bool Success, string Message)> DeleteFollowUpRemarkAsync(int callId);
        Task<(bool Success, string Message, int? StatusId)> AddFollowUpStatusAsync(FollowUpStatusSubmitDto request, int instituteId);
        Task<(bool Success, string Message)> UpdateFollowUpStatusAsync(FollowUpStatusSubmitDto request, int instituteId, int statusId);
        Task<FollowUpStatusListDto?> GetFollowUpStatusByIdAsync(int statusId, int instituteId, int branchId);
        Task<PagedResponse<FollowUpStatusListDto>> GetFollowUpStatusListAsync(int instituteId, int branchId, PaginationRequest pagination);
        Task<(bool Success, string Message)> DeleteFollowUpStatusAsync(int statusId, int instituteId, int branchId);
        Task<PagedResponse<EnquiryAllocationListDto>> SearchEnquiryAllocationAsync(EnquiryAllocationSearchDto request, int instituteId, string? userId = null);
        Task<AutoRegNoDto> GetAutoRegNoAsync(
            int instituteId,
            int branchId);
        Task<IEnumerable<DropdownItemDto>> GetRegNoManualAsync(int branchId);
        Task<(bool Success, string Message)> AllocateEnquiryAsync(EnquiryAllocationSubmitDto request, int instituteId);
    }
}
