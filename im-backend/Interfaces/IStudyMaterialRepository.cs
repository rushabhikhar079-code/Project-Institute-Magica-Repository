using IM_backend.Common;
using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface IStudyMaterialRepository
    {
        Task<PagedResponse<StudyMaterialDto>> GetStudyMaterialsAsync(int instituteId, StudyMaterialSearchDto search);
        Task<StudyMaterialDto> GetStudyMaterialByIdAsync(int studyMaterialId);
        //Task<(bool Success, string Message)> SaveStudyMaterialAsync(int instituteId, int userId, string ipAddress, SaveStudyMaterialDto request, IWebHostEnvironment env);
        Task<bool> SaveStudyMaterialAsync(int instituteId, int userId, string ipAddress, SaveStudyMaterialDto dto, IWebHostEnvironment env);
        Task<bool> DeleteStudyMaterialAsync(int studyMaterialId);
        Task<(bool Success, string Message)> ExportStudyMaterialAsync(List<int> studyMaterialIds, int instituteId, List<int> branchIds);
        Task<PagedResponse<StudyMaterialDto>> GetInstituteStudyMaterialsForImportAsync(int instituteId, int branchId, StudyMaterialImportDto search);
        Task<(bool Success, string Message)> ImportStudyMaterialAsync(int branchId, int instituteId, List<int> studyMaterialIds);
    }
}
