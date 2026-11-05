using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class CommonController : ControllerBase
    {
        private readonly ICommonRepository _commonRepository;
        public CommonController(ICommonRepository commonRepository)
        {
            _commonRepository = commonRepository;
        }
        [HttpGet("countries")]
        public async Task<IActionResult> GetCountries()
        {
            //throw new Exception("Testing Institute Magica Global Exception Middleware!");
            var result = await _commonRepository.GetCountriesAsync();
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Countries retrieved successfully", result, 200));
        }

        [HttpGet("states/{countryId:int}")]
        public async Task<IActionResult> GetStates(int countryId)
        {
            var result = await _commonRepository.GetStatesByCountryIdAsync(countryId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("States retrieved successfully", result, 200));
        }
        [HttpGet("cities/{stateId:int}")]
        public async Task<IActionResult> GetCities(int stateId)
        {
            var result = await _commonRepository.GetCitiesByStateIdAsync(stateId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Cities retrieved successfully", result, 200));
        }
        [HttpGet("emailsettings/{instituteId:int}")]
        public async Task<IActionResult> GetEmailSettings(int instituteId)
        {
            var result = await _commonRepository.GetEmailSettingsAsync(instituteId);
            if (result == null)
            {
                return NotFound(ApiResponse<EmailSettings>.Fail("Email settings not found", 404));
            }
            return Ok(ApiResponse<EmailSettings>.Success("Email settings retrieved successfully", result, 200));
        }
        [HttpGet("ip-location")]
        public async Task<IActionResult> GetUserIpLocation([FromQuery] string? ip = null)
        {
            string clientIp = ip;
            if (string.IsNullOrWhiteSpace(clientIp))
            {
                clientIp = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                          ?? HttpContext.Connection.RemoteIpAddress?.ToString()
                          ?? "";

                if (!string.IsNullOrEmpty(clientIp) && clientIp.Contains(","))
                {
                    clientIp = clientIp.Split(',')[0].Trim();
                }
            }
            var result = await _commonRepository.GetUserLocationByIpAsync(clientIp);
            return Ok(ApiResponse<UserIpLocationDto>.Success("IP Location retreived successfully", result, 200));
        }
        [HttpGet("institutePlans")]
        public async Task<IActionResult> GetInstitutePlans()
        {
            var result = await _commonRepository.GetInstitutePlansAsync();
            if (result == null)
            {
                return NotFound(ApiResponse<EmailSettings>.Fail("Institute plans not found", 404));
            }
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Institute plans retrieved successfully", result, 200));
        }
        [HttpGet("allstaff/{instituteId:int}/{branchId:int}")]
        public async Task<IActionResult> GetAllStaff(int instituteId, int branchId)
        {
            var result = await _commonRepository.GetAllStaffAsync(instituteId, branchId);
            return Ok(ApiResponse<IEnumerable<StaffDto>>.Success("All staff retrieved successfully", result, 200));
        }

        [HttpGet("counselors/{instituteId:int}/{branchId:int}")]
        public async Task<IActionResult> GetCounselors(int instituteId, int branchId)
        {
            var result = await _commonRepository.GetCounselorsAsync(instituteId, branchId);
            return Ok(ApiResponse<IEnumerable<StaffDto>>.Success("Counselors retrieved successfully", result, 200));
        }

        [HttpGet("curriculums/{instituteId:int}/{branchId:int}")]
        public async Task<IActionResult> GetCurriculums(int instituteId, int branchId)
        {
            var result = await _commonRepository.GetCurriculumsAsync(instituteId, branchId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Curriculums retrieved successfully", result, 200));
        }

        [HttpGet("courses-by-curriculum/{instituteId:int}/{branchId:int}/{curriculumId:int}")]
        public async Task<IActionResult> GetCoursesByCurriculum(int instituteId, int branchId, int curriculumId)
        {
            var result = await _commonRepository.GetCoursesByCurriculumAsync(instituteId, branchId, curriculumId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Courses retrieved successfully", result, 200));
        }
        [HttpGet("courses/{instituteId:int}/{branchId:int}")]
        public async Task<IActionResult> GetCourses(int instituteId, int branchId)
        {
            var result = await _commonRepository.GetCoursesAsync(instituteId, branchId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Courses retrieved successfully", result, 200));
        }
        [HttpGet("subjects/{courseId:int}")]
        public async Task<IActionResult> GetSubjectsByCourseId(int courseId)
        {
            var result = await _commonRepository.GetSubjectsByCourseIdAsync(courseId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Subjects retrieved successfully", result, 200));
        }
        [HttpGet("topics/{courseId:int}/{subjectId:int}")]
        public async Task<IActionResult> GetTopicsByCourseId(int courseId, int subjectId)
        {
            var result = await _commonRepository.GetTopicsByCourseIdAsync(courseId, subjectId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Topics retrieved successfully", result, 200));
        }

        [Authorize]
        [HttpGet("get_courses_with_subjects")]
        public async Task<ActionResult<ApiResponse<List<CourseWithSubjectsDto>>>> GetCoursesWithSubjects(int BranchId)
        {
            var instIdClaim = User.FindFirst("instid")?.Value;

            if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                return BadRequest(ApiResponse<List<CourseWithSubjectsDto>>.Fail("Invalid institute information"));

            var coursesWithSubjects = await _commonRepository.GetCoursesWithSubjectsAsync(instituteId, BranchId);

            return Ok(ApiResponse<List<CourseWithSubjectsDto>>.Success("Courses with subjects retrieved successfully", coursesWithSubjects));
        }

        [HttpGet("get_batches-by-subjects/{instituteId:int}/{branchId:int}")]
        public async Task<IActionResult> GetBatchesBySubjects(
    int instituteId,
    int branchId,
    [FromQuery] string? subjectIds)
        {
            var result = await _commonRepository.GetBatchesBySubjectsAsync(
                subjectIds ?? "",
                instituteId,
                branchId
            );

            return Ok(
                ApiResponse<IEnumerable<DropdownItemDto>>.Success(
                    "Batches retrieved successfully",
                    result,
                    200
                )
            );
        }

        [HttpGet("get_followup-status/{instituteId:int}/{branchId:int}")]
        public async Task<IActionResult> GetFollowUpStatus(int instituteId, int branchId)
        {
            var result = await _commonRepository.GetFollowUpStatusAsync(instituteId, branchId);
            return Ok(ApiResponse<IEnumerable<FollowUpStatusDto>>.Success("Follow-up status retrieved successfully", result, 200));
        }

        [HttpGet("get_username")]
        public async Task<IActionResult> GetUsername(string roleName, int branchId)
        {
            var result = await _commonRepository.GetUsernamesAsync(roleName, branchId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Usernames retrieved successfully", result, 200));
        }

        [HttpGet("get_sources")]
        public async Task<IActionResult> GetSources()
        {
            var instIdClaim = User.FindFirst("instid")?.Value;

            if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                return BadRequest(ApiResponse<List<CourseWithSubjectsDto>>.Fail("Invalid institute information"));

            var result = await _commonRepository.GetSourcesAsync(instituteId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Sources retrieved successfully", result, 200));
        }
        [HttpGet("other-fees")]
        public async Task<IActionResult> GetOtherFees(
        [FromQuery] int instituteId, int branchId)
        {
            var result = await _commonRepository.GetOtherFeesAsync(instituteId, branchId);
            return Ok(ApiResponse<IEnumerable<OtherFeesDto>>.Success("Other Fees retrieved successfully.", result, 200));
        }
    }
}