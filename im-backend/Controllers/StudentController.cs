using IM_backend.Authorization;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentRepository _studentRepository;
        private readonly ILogger<CourseController> _logger;
        public StudentController(IStudentRepository studentRepository, ILogger<CourseController> logger)
        {
            _studentRepository = studentRepository;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("search_students")]
        public async Task<ActionResult<ApiResponse>> SearchStudents([FromBody] StudentSearchDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var students = await _studentRepository.SearchStudentsAsync(request, instituteId);

                return Ok(ApiResponse.Success("Students retrieved successfully", students));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching students");
                return StatusCode(500, ApiResponse.Fail("An error occurred while searching students"));
            }
        }

        [Authorize]
        [HttpGet("get_student_for_edit/{studentId}")]
        public async Task<ActionResult<ApiResponse<StudentForEditDto>>> GetStudentForEdit(int studentId, int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<StudentForEditDto>.Fail("Invalid institute information"));

                var (success, message, data) = await _studentRepository.GetStudentForEditAsync(studentId, instituteId, branchId);

                if (success)
                    return Ok(ApiResponse<StudentForEditDto>.Success(message, data));
                else
                    return BadRequest(ApiResponse<StudentForEditDto>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student for edit");
                return StatusCode(500, ApiResponse<StudentForEditDto>.Fail("An error occurred while retrieving student"));
            }
        }

        [Authorize]
        [HttpDelete("delete_student")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteStudent([FromBody] DeleteStudentDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                var (success, message) = await _studentRepository.DeleteStudentAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting student");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while deleting student"));
            }
        }

        [Permission("Admission", "Delete")]
        [HttpPut("bulk_update_student_status")]
        public async Task<ActionResult<ApiResponse<string>>> BulkUpdateStudentStatus([FromBody] BulkStudentStatusDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                var (success, message) = await _studentRepository.BulkUpdateStudentStatusAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk updating student status");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while updating student status"));
            }
        }

        [Permission("Admission", "Delete")]
        [HttpDelete("bulk_delete_students")]
        public async Task<ActionResult<ApiResponse<string>>> BulkDeleteStudents([FromBody] BulkStudentDeleteDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));                

                var (success, message) = await _studentRepository.BulkDeleteStudentsAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting students");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while deleting students"));
            }
        }

        [Permission("Admission", "Add")]
        [HttpPost("register_students")]
        public async Task<ActionResult<ApiResponse<StudentRegistrationResponseDto>>> RegisterStudent([FromBody] StudentRegistrationDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail("Invalid request data"));

                var (success, message, studentId, regNo) = await _studentRepository.RegisterStudentAsync(request, instituteId, request.BranchId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse<StudentRegistrationResponseDto>.Success(message, new StudentRegistrationResponseDto { Success = true, Message = message, StudentId = studentId, RegNo = regNo }));
                else
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering student");
                return StatusCode(500, ApiResponse<StudentRegistrationResponseDto>.Fail("An error occurred while registering student"));
            }
        }

        [Permission("Admission", "Edit")]
        [HttpPut("update_registration/{studentId}")]
        public async Task<ActionResult<ApiResponse<StudentRegistrationResponseDto>>> UpdateRegistration(int studentId, [FromBody] StudentRegistrationDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail("Invalid request data"));

                var (success, message, updatedStudentId) = await _studentRepository.UpdateRegistrationAsync(request, studentId, instituteId, request.BranchId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse<StudentRegistrationResponseDto>.Success(message, new StudentRegistrationResponseDto { Success = true, Message = message, StudentId = updatedStudentId }));
                else
                    return BadRequest(ApiResponse<StudentRegistrationResponseDto>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating student");
                return StatusCode(500, ApiResponse<StudentRegistrationResponseDto>.Fail("An error occurred while updating student"));
            }
        }

        [Permission("Enquiry", "Add")]
        [HttpPost("enquiry_student")]
        public async Task<ActionResult<ApiResponse<EnquiryStudentResponseDto>>> RegisterEnquiry([FromBody] StudentEnquiryDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;
                var userRoleClaim = User.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid user information"));

                string userRole = userRoleClaim ?? string.Empty;

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid request data"));

                var (success, message, studentId) = await _studentRepository.RegisterEnquiryAsync(request, instituteId, request.BranchId, userId, ipAddress, userRole);

                if (success)
                    return Ok(ApiResponse<EnquiryStudentResponseDto>.Success(message, new EnquiryStudentResponseDto { Success = true, Message = message, StudentId = studentId }));
                else
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering enquiry");
                return StatusCode(500, ApiResponse<EnquiryStudentResponseDto>.Fail("An error occurred while registering enquiry"));
            }
        }

        // Step-wise Enquiry Registration Endpoints
        [Authorize]
        [HttpPost("enquiry_step1")]
        public async Task<ActionResult<ApiResponse<EnquiryStudentResponseDto>>> RegisterEnquiryStep1([FromBody] EnquiryStep1Dto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;
                var userRoleClaim = User.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid user information"));

                string userRole = userRoleClaim ?? string.Empty;
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid request data"));

                var (success, message, studentId) = await _studentRepository.RegisterEnquiryStep1Async(request, instituteId, request.BranchId, userId, ipAddress, userRole);

                if (success)
                    return Ok(ApiResponse<EnquiryStudentResponseDto>.Success(message, new EnquiryStudentResponseDto { Success = true, Message = message, StudentId = studentId }));
                else
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering enquiry step 1");
                return StatusCode(500, ApiResponse<EnquiryStudentResponseDto>.Fail("An error occurred while registering enquiry step 1"));
            }
        }

        [Authorize]
        [HttpPut("enquiry_step2")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateEnquiryStep2([FromBody] EnquiryStep2Dto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var branchIdClaim = User.FindFirst("branchid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(branchIdClaim) || !int.TryParse(branchIdClaim, out int branchId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid branch information"));

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<string>.Fail("Invalid request data"));

                var (success, message) = await _studentRepository.UpdateEnquiryStep2Async(request, instituteId, branchId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating enquiry step 2");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while updating enquiry step 2"));
            }
        }

        [Authorize]
        [HttpPut("enquiry_step3")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateEnquiryStep3([FromBody] EnquiryStep3Dto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var branchIdClaim = User.FindFirst("branchid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(branchIdClaim) || !int.TryParse(branchIdClaim, out int branchId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid branch information"));

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<string>.Fail("Invalid request data"));

                var (success, message) = await _studentRepository.UpdateEnquiryStep3Async(request, instituteId, branchId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating enquiry step 3");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while updating enquiry step 3"));
            }
        }

        [Authorize]
        [HttpPut("enquiry_step4")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateEnquiryStep4([FromBody] EnquiryStep4Dto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var branchIdClaim = User.FindFirst("branchid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(branchIdClaim) || !int.TryParse(branchIdClaim, out int branchId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid branch information"));

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<string>.Fail("Invalid request data"));

                var (success, message) = await _studentRepository.UpdateEnquiryStep4Async(request, instituteId, branchId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating enquiry step 4");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while updating enquiry step 4"));
            }
        }

        [Authorize]
        [HttpPut("enquiry_step5")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateEnquiryStep5([FromBody] EnquiryStep5Dto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var branchIdClaim = User.FindFirst("branchid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(branchIdClaim) || !int.TryParse(branchIdClaim, out int branchId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid branch information"));

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<string>.Fail("Invalid request data"));

                var (success, message) = await _studentRepository.UpdateEnquiryStep5Async(request, instituteId, branchId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating enquiry step 5");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while updating enquiry step 5"));
            }
        }

        [HttpGet("auto-reg-no")]
        public async Task<IActionResult> GetAutoRegNo([FromQuery] int instituteId, [FromQuery] int branchId)
        {
            if (instituteId <= 0 || branchId < 0)
            {
                return BadRequest(new
                {
                    status = "error",
                    statusCode = 400,
                    message = "Invalid institute or branch ID."
                });
            }

            try
            {
                var result = await _studentRepository.GetAutoRegNoAsync(
                    instituteId,
                    branchId);

                return Ok(new
                {
                    status = "success",
                    statusCode = 200,
                    message = "Registration number retrieved successfully.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error retrieving registration number for InstituteId {InstituteId} and BranchId {BranchId}",
                    instituteId,
                    branchId);

                return StatusCode(500, new
                {
                    status = "error",
                    statusCode = 500,
                    message = "An error occurred while retrieving registration number."
                });
            }
        }

        [Permission("Enquiry", "Edit")]
        [HttpPut("update_enquiry/{studentId}")]
        public async Task<ActionResult<ApiResponse<EnquiryStudentResponseDto>>> UpdateEnquiry(int studentId, [FromBody] StudentEnquiryDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail("Invalid request data"));

                var (success, message, updatedStudentId) = await _studentRepository.UpdateEnquiryAsync(studentId, request, instituteId, request.BranchId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse<EnquiryStudentResponseDto>.Success(message, new EnquiryStudentResponseDto { Success = true, Message = message, StudentId = updatedStudentId }));
                else
                    return BadRequest(ApiResponse<EnquiryStudentResponseDto>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating enquiry");
                return StatusCode(500, ApiResponse<EnquiryStudentResponseDto>.Fail("An error occurred while updating enquiry"));
            }
        }

        [Authorize]
        [HttpPost("search_enquiry_followup")]
        public async Task<ActionResult<ApiResponse<PagedResponse<EnquiryFollowUpListDto>>>> SearchEnquiryFollowUp([FromBody] EnquiryFollowUpSearchDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;
                var userRoleClaim = User.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<PagedResponse<EnquiryFollowUpListDto>>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<PagedResponse<EnquiryFollowUpListDto>>.Fail("Invalid user information"));

                // Only pass userId if user is not admin
                string? userIdParam = null;
                if (userRoleClaim != null && userRoleClaim.ToLower() != "branchadmin" && userRoleClaim.ToLower() != "instituteadmin" && userRoleClaim.ToLower() != "superadmin")
                {
                    userIdParam = userIdClaim;
                }

                var results = await _studentRepository.SearchEnquiryFollowUpAsync(request, instituteId, request.BranchId, userIdParam);

                return Ok(ApiResponse<PagedResponse<EnquiryFollowUpListDto>>.Success("Enquiry follow-up search completed successfully", results));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching enquiry follow-up");
                return StatusCode(500, ApiResponse<PagedResponse<EnquiryFollowUpListDto>>.Fail("An error occurred while searching enquiry follow-up"));
            }
        }

        [Permission("Follow-up", "Add")]
        [HttpPost("save_followup_remark")]
        public async Task<ActionResult<ApiResponse>> SaveFollowUpRemark([FromBody] FollowUpRemarkSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                var (success, message) = await _studentRepository.SaveFollowUpRemarkAsync(request, instituteId, request.BranchId, userId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving follow-up remark");
                return StatusCode(500, ApiResponse.Fail("An error occurred while saving follow-up remark"));
            }
        }

        [Authorize]
        [HttpGet("get_followUp_by_StudId/{studentId}/{branchId}")]
        public async Task<ActionResult<ApiResponse<EnquiryFollowUpListDto>>> GetFollowUpByStudId([FromRoute] int studentId, [FromRoute] int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;
                var userRoleClaim = User.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<EnquiryFollowUpListDto>.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse<EnquiryFollowUpListDto>.Fail("Invalid user information"));

                // Only pass userId if user is not admin
                string? userIdParam = null;
                if (userRoleClaim != null && userRoleClaim.ToLower() != "branchadmin" && userRoleClaim.ToLower() != "instituteadmin" && userRoleClaim.ToLower() != "superadmin")
                {
                    userIdParam = userIdClaim;
                }

                var student = await _studentRepository.GetFollowUpByStudIdAsync(studentId, instituteId, branchId, userIdParam);

                if (student == null)
                    return NotFound(ApiResponse<EnquiryFollowUpListDto>.Fail("Student not found"));

                return Ok(ApiResponse<EnquiryFollowUpListDto>.Success("Student retrieved successfully", student));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting student by ID");
                return StatusCode(500, ApiResponse<EnquiryFollowUpListDto>.Fail("An error occurred while getting student"));
            }
        }

        [Authorize]
        [HttpGet("get_last_remarks/{studentId}/{branchId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<FollowUpRemarkHistoryDto>>>> GetLastRemarks([FromRoute] int studentId, [FromRoute] int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<IEnumerable<FollowUpRemarkHistoryDto>>.Fail("Invalid institute information"));

                var remarks = await _studentRepository.GetLastRemarksAsync(studentId, instituteId, branchId);

                return Ok(ApiResponse<IEnumerable<FollowUpRemarkHistoryDto>>.Success("Last remarks retrieved successfully", remarks));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting last remarks");
                return StatusCode(500, ApiResponse<IEnumerable<FollowUpRemarkHistoryDto>>.Fail("An error occurred while getting last remarks"));
            }
        }


        [Permission("Follow-up", "Delete")]
        [HttpDelete("delete_followup_remark/{callId}")]
        public async Task<ActionResult<ApiResponse>> DeleteFollowUpRemark([FromRoute] int callId)
        {
            try
            {
                var (success, message) = await _studentRepository.DeleteFollowUpRemarkAsync(callId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting follow-up remark");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting follow-up remark"));
            }
        }

        [Authorize]
        [HttpGet("get_followup_status/{branchId}")]
        public async Task<ActionResult<ApiResponse<PagedResponse<FollowUpStatusListDto>>>> GetFollowUpStatusList([FromRoute] int branchId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<PagedResponse<FollowUpStatusListDto>>.Fail("Invalid institute information"));

                var pagination = new PaginationRequest { PageNumber = pageNumber, PageSize = pageSize };
                var statusList = await _studentRepository.GetFollowUpStatusListAsync(instituteId, branchId, pagination);

                return Ok(ApiResponse<PagedResponse<FollowUpStatusListDto>>.Success("Follow-up status list retrieved successfully", statusList));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting follow-up status list");
                return StatusCode(500, ApiResponse<PagedResponse<FollowUpStatusListDto>>.Fail("An error occurred while getting follow-up status list"));
            }
        }

        [Permission("Follow-up", "Add")]
        [HttpPost("add_followup_status")]
        public async Task<ActionResult<ApiResponse<int>>> AddFollowUpStatus([FromBody] FollowUpStatusSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<int>.Fail("Invalid institute information"));

                var (success, message, statusId) = await _studentRepository.AddFollowUpStatusAsync(request, instituteId);

                if (success && statusId.HasValue)
                    return Ok(ApiResponse<int>.Success(message, statusId.Value));
                else
                    return BadRequest(ApiResponse<int>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding follow-up status");
                return StatusCode(500, ApiResponse<int>.Fail("An error occurred while adding follow-up status"));
            }
        }

        [Permission("Follow-up", "Edit")]
        [HttpPut("update_followup_status/{statusId}")]
        public async Task<ActionResult<ApiResponse>> UpdateFollowUpStatus([FromRoute] int statusId, [FromBody] FollowUpStatusSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (success, message) = await _studentRepository.UpdateFollowUpStatusAsync(request, instituteId, statusId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating follow-up status");
                return StatusCode(500, ApiResponse.Fail("An error occurred while updating follow-up status"));
            }
        }

        [Authorize]
        [HttpGet("get_followup_status/{statusId}/{branchId}")]
        public async Task<ActionResult<ApiResponse<FollowUpStatusListDto>>> GetFollowUpStatusById([FromRoute] int statusId, [FromRoute] int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<FollowUpStatusListDto>.Fail("Invalid institute information"));

                var status = await _studentRepository.GetFollowUpStatusByIdAsync(statusId, instituteId, branchId);

                if (status == null)
                    return NotFound(ApiResponse<FollowUpStatusListDto>.Fail("Follow-up status not found"));

                return Ok(ApiResponse<FollowUpStatusListDto>.Success("Follow-up status retrieved successfully", status));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting follow-up status by ID");
                return StatusCode(500, ApiResponse<FollowUpStatusListDto>.Fail("An error occurred while getting follow-up status"));
            }
        }

        [Permission("Follow-up", "Delete")]
        [HttpDelete("delete_followup_status/{statusId}/{branchId}")]
        public async Task<ActionResult<ApiResponse>> DeleteFollowUpStatus([FromRoute] int statusId, [FromRoute] int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (success, message) = await _studentRepository.DeleteFollowUpStatusAsync(statusId, instituteId, branchId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting follow-up status");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting follow-up status"));
            }
        }

        [Authorize]
        [HttpPost("search_enquiry_allocation")]
        public async Task<ActionResult<ApiResponse<PagedResponse<EnquiryAllocationListDto>>>> SearchEnquiryAllocation([FromBody] EnquiryAllocationSearchDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<PagedResponse<EnquiryAllocationListDto>>.Fail("Invalid institute information"));

                var userRoleClaim = User.FindFirst("userrole")?.Value?.ToLower();
                string? userId = null;

                // Non-admin users get filtered by their own userId
                if (userRoleClaim != "branchadmin" && userRoleClaim != "instituteadmin" && userRoleClaim != "superadmin")
                {
                    var userIdClaim = User.FindFirst("userid")?.Value;
                    userId = userIdClaim;
                }

                var result = await _studentRepository.SearchEnquiryAllocationAsync(request, instituteId, userId);

                return Ok(ApiResponse<PagedResponse<EnquiryAllocationListDto>>.Success("Enquiry allocation search completed successfully", result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching enquiry allocation");
                return StatusCode(500, ApiResponse<PagedResponse<EnquiryAllocationListDto>>.Fail("An error occurred while searching enquiry allocation"));
            }
        }        
        [HttpGet("get-reg-no-manual")]
        public async Task<IActionResult> GetRegNoManualAsync([FromQuery] int branchId)
        {
            //throw new Exception("Testing Institute Magica Global Exception Middleware!");
            var result = await _studentRepository.GetRegNoManualAsync(branchId);
            return Ok(ApiResponse<IEnumerable<DropdownItemDto>>.Success("Registration numbers retrieved successfully", result, 200));
        }

        [Authorize]
        [HttpPost("allocate_enquiry")]
        public async Task<ActionResult<ApiResponse<string>>> AllocateEnquiry([FromBody] EnquiryAllocationSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse<string>.Fail("Invalid institute information"));

                var (success, message) = await _studentRepository.AllocateEnquiryAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse<string>.Success(message, string.Empty));
                else
                    return BadRequest(ApiResponse<string>.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error allocating enquiry");
                return StatusCode(500, ApiResponse<string>.Fail("An error occurred while allocating enquiry"));
            }
        }
    }
}
