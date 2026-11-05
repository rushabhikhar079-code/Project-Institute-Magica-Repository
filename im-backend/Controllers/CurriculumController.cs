using IM_backend.Authorization;
using IM_backend.Common;
using IM_backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static IM_backend.Dtos.CurriculumDto;

namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurriculumController : ControllerBase
    {
        private readonly ICurriculumRepository _curriculumRepository;
        private readonly ILogger<CurriculumController> _logger;

        public CurriculumController(ICurriculumRepository curriculumRepository, ILogger<CurriculumController> logger)
        {
            _curriculumRepository = curriculumRepository;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("curriculum-search")]
        public async Task<ActionResult<ApiResponse>> SearchCurriculums([FromBody] CurriculumSearchDto search)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var curriculums = await _curriculumRepository.GetCurriculumsAsync(instituteId, search);

                return Ok(ApiResponse.Success("Curriculums retrieved successfully", curriculums));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching curriculums");
                return StatusCode(500, ApiResponse.Fail("An error occurred while searching curriculums"));
            }
        }

        [Authorize]
        [HttpGet("get-curriculum/{crclmId}")]
        public async Task<ActionResult<ApiResponse>> GetCurriculumById(int crclmId)
        {
            try
            {
                var curriculum = await _curriculumRepository.GetCurriculumByIdAsync(crclmId);

                if (curriculum == null)
                    return BadRequest(ApiResponse.Fail("Curriculum not found"));

                return Ok(ApiResponse.Success("Curriculum retrieved successfully", curriculum));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving curriculum"));
            }
        }

        [Permission("Manage Curriculums", "Add")]
        [HttpPost("create-curriculum")]
        public async Task<ActionResult<ApiResponse>> CreateCurriculum([FromBody] CurriculumSubmitDto request)
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

                var (success, message, curriculumId) = await _curriculumRepository.CreateCurriculumAsync(request, instituteId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message, new { CurriculumId = curriculumId }));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while creating curriculum"));
            }
        }

        [Permission("Manage Curriculums", "Edit")]
        [HttpPut("update-curriculum")]
        public async Task<ActionResult<ApiResponse>> UpdateCurriculum([FromBody] CurriculumEditDto request)
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

                var (success, message) = await _curriculumRepository.UpdateCurriculumAsync(request, instituteId, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while updating curriculum"));
            }
        }

        [Permission("Manage Curriculums", "Delete")]
        [HttpDelete("delete-curriculum/{crclmId}")]
        public async Task<ActionResult<ApiResponse>> DeleteCurriculum(int crclmId)
        {
            try
            {
                var (success, message) = await _curriculumRepository.DeleteCurriculumAsync(crclmId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting curriculum"));
            }
        }

        [Authorize]
        [HttpPost("institute-curriculums-for-import")]
        public async Task<ActionResult<ApiResponse>> GetInstituteCurriculumsForImport([FromBody] CurriculumImportDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var curriculums = await _curriculumRepository
                    .GetInstituteCurriculumsForImportAsync(instituteId, request.BranchId, request);

                return Ok(ApiResponse.Success(
                    "Institute curriculums retrieved successfully",
                    curriculums));
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error retrieving institute curriculums for import");

                return StatusCode(
                    500,
                    ApiResponse.Fail(
                        "An error occurred while retrieving institute curriculums"));
            }
        }

        [Permission("Manage Curriculums", "Import")]
        [HttpPost("import-curriculum")]
        public async Task<ActionResult<ApiResponse>> ImportCurriculum([FromBody] CurriculumImportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.CurriculumIds == null || request.CurriculumIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select curriculum"));

                var (success, message) = await _curriculumRepository.ImportCurriculumAsync(request.BranchId, instituteId, request.CurriculumIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while importing curriculum"));
            }
        }

        [Permission("Manage Curriculums", "Export")]
        [HttpPost("export-curriculum")]
        public async Task<ActionResult<ApiResponse>> ExportCurriculum([FromBody] CurriculumExportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.CurriculumIds == null || request.CurriculumIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select curriculums"));

                if (request.BranchIds == null || request.BranchIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select branches"));

                var (success, message) = await _curriculumRepository.ExportCurriculumAsync(request.CurriculumIds, instituteId, request.BranchIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while exporting curriculum"));
            }
        }
    }
}
