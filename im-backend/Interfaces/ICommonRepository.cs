using IM_backend.Dtos;
using IM_backend.Models;
namespace IM_backend.Interfaces
{
    public interface ICommonRepository
    {
        Task<IEnumerable<DropdownItemDto>> GetCountriesAsync();
        Task<IEnumerable<DropdownItemDto>> GetStatesByCountryIdAsync(int countryId);
        Task<IEnumerable<DropdownItemDto>> GetCitiesByStateIdAsync(int stateId);
        Task<EmailSettings?> GetEmailSettingsAsync(int instituteId);
        Task<UserIpLocationDto> GetUserLocationByIpAsync(string clientIp);
        Task<IEnumerable<DropdownItemDto>> GetInstitutePlansAsync();
        Task<IEnumerable<StaffDto>> GetAllStaffAsync(int instituteId, int branchId);
        Task<IEnumerable<StaffDto>> GetCounselorsAsync(int instituteId, int branchId);
        Task<IEnumerable<DropdownItemDto>> GetCurriculumsAsync(int instituteId, int branchId);
        Task<IEnumerable<DropdownItemDto>> GetCoursesByCurriculumAsync(int instituteId, int branchId, int curriculumId);
        Task<IEnumerable<DropdownItemDto>> GetCoursesAsync(int instituteId, int branchId);
        Task<IEnumerable<DropdownItemDto>> GetSubjectsByCourseIdAsync(int courseId);
        Task<IEnumerable<DropdownItemDto>> GetTopicsByCourseIdAsync(int courseId, int subjectId);
        Task<IEnumerable<DropdownItemDto>> GetSubjectsByCourseAsync(int courseId, int instituteId, int branchId);
        Task<List<CourseWithSubjectsDto>> GetCoursesWithSubjectsAsync(int instituteId, int branchId);
        Task<IEnumerable<DropdownItemDto>> GetBatchesBySubjectsAsync(string subjectIds, int instituteId, int branchId);
        Task<IEnumerable<FollowUpStatusDto>> GetFollowUpStatusAsync(int instituteId, int branchId);
        Task<IEnumerable<DropdownItemDto>> GetUsernamesAsync(string roleName, int branchId);
        Task<IEnumerable<DropdownItemDto>> GetSourcesAsync(int instituteId);
        Task<IEnumerable<OtherFeesDto>> GetOtherFeesAsync(int instituteId, int branchId);
    }
}
