using IM_backend.Common;
using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface ISubjectRepository
    {
        Task<PagedResponse<SubjectListDto>> GetSubjectsAsync(int instituteId, SubjectSearchDto search);
        Task<SubjectSubmitDto?> GetSubjectByIdAsync(int subjectId);
        Task<SubjectPaymentTemplateDto?> GetPaymentTemplateAsync(int subjectId);
        Task<(bool Success, string Message)> AddSubjectAsync(SubjectSubmitDto request, int instituteId);
        Task<(bool Success, string Message)> UpdateSubjectAsync(SubjectSubmitDto request, int SubjectId, int instituteId, int userId, string ipAddress);
        Task<(bool Success, string Message)> DeleteSubjectAsync(int subjectId, bool deleteStatus, int userId, string ipAddress);
        Task<SubjectInstallmentIntervalResponseDto> CreateInstallmentTemplateAsync(int templateType, int day, int maxInstallment, double courseFee, int branchId);
        Task<PagedResponse<InstituteSubjectListDto>> GetInstituteSubjectsForAsync(InstituteSubjectSearchDto search, int instituteId);
        Task<PagedResponse<InstituteSubjectListDto>> GetInstituteSubjectsByCourseCrclmAsync(SubjectInstituteDto subject_institute, int instituteId);
        Task<(bool Success, string Message, int ImportedCount, int TotalCount)> SubmitInstituteSubjectsAsync(InstituteSubjectSubmitDto request, int instituteId);
        Task<(bool Success, string Message)> ExportSubjectAsync(List<int> subjectIds, int instituteId, List<int> branchIds);
    }
}
