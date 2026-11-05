using IM_backend.Common;
using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface ICourseRepository
    {
        Task<PagedResponse<CourseListDto>> GetCoursesAsync(int instituteId, CourseSearchDto search);
        Task<CourseListDto?> GetCourseByIdAsync(int courseId);
        Task<(bool Success, string Message, int CourseId)> CreateCourseAsync(CourseSubmitDto request, int instituteId, int userId, string ipAddress);
        Task<(bool Success, string Message)> UpdateCourseAsync(CourseEditDto request, int instituteId, int userId, string ipAddress);
        Task<(bool Success, string Message)> DeleteCourseAsync(int courseId, bool deleteStatus, int userId, string ipAddress);
        Task<PagedResponse<CourseInstituteListDto>> GetInstituteCoursesAsync(CourseInstituteDto course_institute, int instituteId);
        Task<PagedResponse<CourseInstituteListDto>> GetInstituteCoursesbyCrclmIdsAsync(CourseInstituteDto course_institute, int instituteId, int[] CrclmIds);
        Task<PagedResponse<CourseSubjectListDto>> GetCourseSubjectsAsync(List<int> courseIds, int instituteId, CourseSubjectsDto request);
        Task<(bool Success, string Message)> SubmitInstituteCoursesAsync(int branchId, int instituteId, List<int> courseIds);
        Task<InstallmentIntervalResponseDto> CreateInstallmentTemplateAsync(int templateType, int day, int maxInstallment, double courseFee, int branchId);
        Task<(bool Success, string Message)> ExportCourseAsync(List<int> courseIds, int instituteId, List<int> branchIds);
    }
}
