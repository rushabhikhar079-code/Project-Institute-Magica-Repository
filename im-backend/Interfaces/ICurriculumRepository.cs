using IM_backend.Common;
using static IM_backend.Dtos.CurriculumDto;

namespace IM_backend.Interfaces
{
    public interface ICurriculumRepository
    {
        Task<PagedResponse<CurriculumListDto>> GetCurriculumsAsync(int instituteId, CurriculumSearchDto search);
        Task<CurriculumListDto?> GetCurriculumByIdAsync(int crclmId);
        Task<(bool Success, string Message, int CurriculumId)> CreateCurriculumAsync(CurriculumSubmitDto request, int instituteId, int userId, string ipAddress);
        Task<(bool Success, string Message)> UpdateCurriculumAsync(CurriculumEditDto request, int instituteId, int userId, string ipAddress); Task<(bool Success, string Message)> DeleteCurriculumAsync(int crclmId);
        Task<PagedResponse<CurriculumListDto>> GetInstituteCurriculumsForImportAsync(int instituteId, int branchId, CurriculumImportDto request);
        Task<(bool Success, string Message)> ImportCurriculumAsync(int branchId, int instituteId, List<int> curriculumIds);
        Task<(bool Success, string Message)> ExportCurriculumAsync(List<int> curriculumIds, int instituteId, List<int> branchIds);
    }
}
