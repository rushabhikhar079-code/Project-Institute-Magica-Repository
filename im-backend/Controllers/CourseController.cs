using IM_backend.Authorization;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ILogger<CourseController> _logger;

        public CourseController(ICourseRepository courseRepository, ILogger<CourseController> logger)
        {
            _courseRepository = courseRepository;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("course-search")]
        public async Task<ActionResult<ApiResponse>> SearchCourses([FromBody] CourseSearchDto search)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var courses = await _courseRepository.GetCoursesAsync(instituteId, search);

                return Ok(ApiResponse.Success("Courses retrieved successfully", courses));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching courses");
                return StatusCode(500, ApiResponse.Fail("An error occurred while searching courses"));
            }
        }

        [Authorize]
        [HttpGet("get-course/{courseId}")]
        public async Task<ActionResult<ApiResponse>> GetCourseById(int courseId)
        {
            try
            {
                var course = await _courseRepository.GetCourseByIdAsync(courseId);

                if (course == null)
                    return BadRequest(ApiResponse.Fail("Course not found"));

                return Ok(ApiResponse.Success("Course retrieved successfully", course));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving course"));
            }
        }

        [Permission("Manage Courses", "Add")]
        [HttpPost("create-course")]
        public async Task<ActionResult<ApiResponse>> CreateCourse([FromBody] CourseSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                var (success, message, courseId) = await _courseRepository.CreateCourseAsync(request, instituteId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message, new { CourseId = courseId }));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course");
                return StatusCode(500, ApiResponse.Fail("An error occurred while creating course"));
            }
        }

        [Permission("Manage Courses", "Edit")]
        [HttpPut("update-course")]
        public async Task<ActionResult<ApiResponse>> UpdateCourse([FromBody] CourseEditDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                var (success, message) = await _courseRepository.UpdateCourseAsync(request, instituteId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course");
                return StatusCode(500, ApiResponse.Fail("An error occurred while updating course"));
            }
        }

        [Permission("Manage Courses", "Delete")]
        [HttpDelete("{courseId}")]
        public async Task<ActionResult<ApiResponse>> DeleteCourse(int courseId)
        {
            try
            {
                var userIdClaim = User.FindFirst("userid")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                var (success, message) = await _courseRepository.DeleteCourseAsync(courseId, true, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting course");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting course"));
            }
        }

        [HttpPost("get-institute-courses-by-CrclmIds")]
        public async Task<ActionResult<ApiResponse>> GetInstituteCoursesbyCrclId([FromBody] CourseInstituteDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var courses = await _courseRepository.GetInstituteCoursesbyCrclmIdsAsync(request, instituteId, request.CrclmIds);

                return Ok(ApiResponse.Success("Institute courses retrieved successfully", courses));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving institute courses for import");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving institute courses"));
            }
        }

        [Authorize]
        [HttpPost("courses-institute")]
        public async Task<ActionResult<ApiResponse>> GetInstituteCourses([FromBody] CourseInstituteDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var courses = await _courseRepository.GetInstituteCoursesAsync(request, instituteId);

                return Ok(ApiResponse.Success("Institute courses retrieved successfully", courses));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving institute courses for import");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving institute courses"));
            }
        }

        [Authorize]
        [HttpPost("course-subjects-institute")]
        public async Task<ActionResult<ApiResponse>> GetCourseSubjects([FromBody] CourseSubjectsDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.CourseIds == null || request.CourseIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one course"));

                var subjects = await _courseRepository.GetCourseSubjectsAsync(request.CourseIds, instituteId, request);

                return Ok(ApiResponse.Success("Subjects retrieved successfully", subjects));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course subjects");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving course subjects"));
            }
        }

        [Permission("Manage Courses", "Import")]
        [HttpPost("add-courses-institute")]
        public async Task<ActionResult<ApiResponse>> SubmitInstituteCourses([FromBody] CourseImportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.CourseIds == null || request.CourseIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select course"));

                var (success, message) = await _courseRepository.SubmitInstituteCoursesAsync(request.BranchId, instituteId, request.CourseIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing course");
                return StatusCode(500, ApiResponse.Fail("An error occurred while importing course"));
            }
        }

        [Authorize]
        [HttpPost("set-interval-days")]
        public async Task<ActionResult<ApiResponse>> SetIntervalDays([FromBody] InstallmentIntervalRequestDto request)
        {
            try
            {
                if (request.CourseFee <= 0)
                    return BadRequest(ApiResponse.Fail("Course fees amount must be greater than 0"));

                if (request.MaxInstallment <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter no. of installment"));

                if (request.Day <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter interval days"));

                var result = await _courseRepository.CreateInstallmentTemplateAsync(1, request.Day, request.MaxInstallment, request.CourseFee, request.BranchId);

                return Ok(ApiResponse.Success("Interval days template created successfully", result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting interval days");
                return StatusCode(500, ApiResponse.Fail("An error occurred while setting interval days"));
            }
        }

        [Authorize]
        [HttpPost("set-monthly-interval")]
        public async Task<ActionResult<ApiResponse>> SetMonthlyInterval([FromBody] InstallmentIntervalRequestDto request)
        {
            try
            {
                if (request.CourseFee <= 0)
                    return BadRequest(ApiResponse.Fail("Course fees amount must be greater than 0"));

                if (request.MaxInstallment <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter no. of installment"));

                if (request.Day < 1 || request.Day > 28)
                    return BadRequest(ApiResponse.Fail("Please enter a day of start between 1-28"));

                var result = await _courseRepository.CreateInstallmentTemplateAsync(2, request.Day, request.MaxInstallment, request.CourseFee, request.BranchId);

                return Ok(ApiResponse.Success("Monthly interval template created successfully", result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting monthly interval");
                return StatusCode(500, ApiResponse.Fail("An error occurred while setting monthly interval"));
            }
        }

        [Authorize]
        [HttpPost("set-quarterly-interval")]
        public async Task<ActionResult<ApiResponse>> SetQuarterlyInterval([FromBody] InstallmentIntervalRequestDto request)
        {
            try
            {
                if (request.CourseFee <= 0)
                    return BadRequest(ApiResponse.Fail("Course fees amount must be greater than 0"));

                if (request.MaxInstallment <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter no. of installment"));

                if (request.Day < 1 || request.Day > 28)
                    return BadRequest(ApiResponse.Fail("Please enter a day of start between 1-28"));

                var result = await _courseRepository.CreateInstallmentTemplateAsync(3, request.Day, request.MaxInstallment, request.CourseFee, request.BranchId);

                return Ok(ApiResponse.Success("Quarterly interval template created successfully", result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting quarterly interval");
                return StatusCode(500, ApiResponse.Fail("An error occurred while setting quarterly interval"));
            }
        }

        [Permission("Manage Courses", "Export")]
        [HttpPost("export-course")]
        public async Task<ActionResult<ApiResponse>> ExportCourse([FromBody] CourseExportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.CourseIds == null || request.CourseIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select courses"));

                if (request.BranchIds == null || request.BranchIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select branches"));

                var (success, message) = await _courseRepository.ExportCourseAsync(request.CourseIds, instituteId, request.BranchIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting course");
                return StatusCode(500, ApiResponse.Fail("An error occurred while exporting course"));
            }
        }
    }
}
