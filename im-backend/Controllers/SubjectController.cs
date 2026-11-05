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
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectRepository _subjectRepository;
        private readonly ILogger<SubjectController> _logger;

        public SubjectController(ISubjectRepository subjectRepository, ILogger<SubjectController> logger)
        {
            _subjectRepository = subjectRepository;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("subject-search")]
        public async Task<ActionResult<ApiResponse>> SearchSubjects([FromBody] SubjectSearchDto search)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var subjects = await _subjectRepository.GetSubjectsAsync(instituteId, search);

                return Ok(ApiResponse.Success("Subjects retrieved successfully", subjects));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching subjects");
                return StatusCode(500, ApiResponse.Fail("An error occurred while searching subjects"));
            }
        }

        [Authorize]
        [HttpGet("get-subject/{subjectId}")]
        public async Task<ActionResult<ApiResponse>> GetSubjectById(int subjectId)
        {
            try
            {
                var subject = await _subjectRepository.GetSubjectByIdAsync(subjectId);

                if (subject == null)
                    return NotFound(ApiResponse.Fail("Subject not found"));

                return Ok(ApiResponse.Success("Subject retrieved successfully", subject));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subject");
                return StatusCode(500, ApiResponse.Fail("An error occurred while getting subject"));
            }
        }

        [Authorize]
        [HttpGet("get-payment-template/{subjectId}")]
        public async Task<ActionResult<ApiResponse>> GetPaymentTemplate(int subjectId)
        {
            try
            {
                var template = await _subjectRepository.GetPaymentTemplateAsync(subjectId);

                if (template == null)
                    return NotFound(ApiResponse.Fail("Payment template not found"));

                return Ok(ApiResponse.Success("Payment template retrieved successfully", template));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment template");
                return StatusCode(500, ApiResponse.Fail("An error occurred while getting payment template"));
            }
        }

        [Authorize]
        [HttpPost("set-interval-days")]
        public async Task<ActionResult<ApiResponse>> SetIntervalDays([FromBody] SubjectInstallmentIntervalRequestDto request)
        {
            try
            {
                if (request.CourseFee <= 0)
                    return BadRequest(ApiResponse.Fail("Subject fees amount must be greater than 0"));

                if (request.MaxInstallment <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter no. of installment"));

                if (request.Day <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter interval days"));

                var result = await _subjectRepository.CreateInstallmentTemplateAsync(1, request.Day, request.MaxInstallment, request.CourseFee, request.BranchId);

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
        public async Task<ActionResult<ApiResponse>> SetMonthlyInterval([FromBody] SubjectInstallmentIntervalRequestDto request)
        {
            try
            {
                if (request.CourseFee <= 0)
                    return BadRequest(ApiResponse.Fail("Subject fees amount must be greater than 0"));

                if (request.MaxInstallment <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter no. of installment"));

                if (request.Day < 1 || request.Day > 28)
                    return BadRequest(ApiResponse.Fail("Please enter a day of start between 1-28"));

                var result = await _subjectRepository.CreateInstallmentTemplateAsync(2, request.Day, request.MaxInstallment, request.CourseFee, request.BranchId);

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
        public async Task<ActionResult<ApiResponse>> SetQuarterlyInterval([FromBody] SubjectInstallmentIntervalRequestDto request)
        {
            try
            {
                if (request.CourseFee <= 0)
                    return BadRequest(ApiResponse.Fail("Subject fees amount must be greater than 0"));

                if (request.MaxInstallment <= 0)
                    return BadRequest(ApiResponse.Fail("Please enter no. of installment"));

                if (request.Day < 1 || request.Day > 28)
                    return BadRequest(ApiResponse.Fail("Please enter a day of start between 1-28"));

                var result = await _subjectRepository.CreateInstallmentTemplateAsync(3, request.Day, request.MaxInstallment, request.CourseFee, request.BranchId);

                return Ok(ApiResponse.Success("Quarterly interval template created successfully", result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting quarterly interval");
                return StatusCode(500, ApiResponse.Fail("An error occurred while setting quarterly interval"));
            }
        }

        [Permission("Manage Subjects", "Add")]
        [HttpPost("add-subject")]
        public async Task<ActionResult<ApiResponse>> AddSubject([FromBody] SubjectSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (success, message) = await _subjectRepository.AddSubjectAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding subject");
                return StatusCode(500, ApiResponse.Fail("An error occurred while adding subject"));
            }
        }

        [Permission("Manage Subjects", "Edit")]
        [HttpPut("update-subject")]
        public async Task<ActionResult<ApiResponse>> UpdateSubject(int subjectId, [FromBody] SubjectSubmitDto request)
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

                var (success, message) = await _subjectRepository.UpdateSubjectAsync(request, subjectId, instituteId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subject");
                return StatusCode(500, ApiResponse.Fail("An error occurred while updating subject"));
            }
        }

        [Permission("Manage Subjects", "Delete")]
        [HttpDelete("delete-subject/{subjectId}")]
        public async Task<ActionResult<ApiResponse>> DeleteSubject(int subjectId)
        {
            try
            {
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                var (success, message) = await _subjectRepository.DeleteSubjectAsync(subjectId, true, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting subject");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting subject"));
            }
        }

        [Authorize]
        [HttpPost("institute-subjects")]
        public async Task<ActionResult<ApiResponse>> GetInstituteSubjects([FromBody] InstituteSubjectSearchDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) ||
                    !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var subjects = await _subjectRepository
                    .GetInstituteSubjectsForAsync(request, instituteId);

                return Ok(ApiResponse.Success(
                    "Institute subjects retrieved successfully",
                    subjects));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving institute subjects");

                return StatusCode(
                    500,
                    ApiResponse.Fail(
                        "An error occurred while retrieving institute subjects"));
            }
        }

        [Authorize]
        [HttpPost("get-institute-subjects-by-course-crclm")]
        public async Task<ActionResult<ApiResponse>> GetInstituteSubjectsByCourseCrclm([FromBody] SubjectInstituteDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var subjects = await _subjectRepository.GetInstituteSubjectsByCourseCrclmAsync(request, instituteId);

                return Ok(ApiResponse.Success("Institute subjects retrieved successfully", subjects));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving institute subjects for import");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving institute subjects"));
            }
        }

        [Permission("Manage Subjects", "Import")]
        [HttpPost("submit-institute-subjects")]
        public async Task<ActionResult<ApiResponse>> SubmitInstituteSubjects([FromBody] InstituteSubjectSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (success, message, importedCount, totalCount) = await _subjectRepository.SubmitInstituteSubjectsAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse.Success(message, new { ImportedCount = importedCount, TotalCount = totalCount }));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting institute subjects");
                return StatusCode(500, ApiResponse.Fail("An error occurred while submitting institute subjects"));
            }
        }

        [Permission("Manage Subjects", "Export")]
        [HttpPost("export-subject")]
        public async Task<ActionResult<ApiResponse>> ExportSubject([FromBody] SubjectExportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.SubjectIds == null || request.SubjectIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one subject"));

                if (request.BranchIds == null || request.BranchIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one branch"));

                var (success, message) = await _subjectRepository.ExportSubjectAsync(request.SubjectIds, instituteId, request.BranchIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting subject");
                return StatusCode(500, ApiResponse.Fail("An error occurred while exporting subject"));
            }
        }
    }
}
