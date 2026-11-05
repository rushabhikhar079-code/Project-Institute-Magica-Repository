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
    public class StudyMaterialController : Controller
    {
        private readonly IStudyMaterialRepository _studyMaterialRepository;
        private readonly ILogger<StudyMaterialController> _logger;

        public StudyMaterialController(IStudyMaterialRepository studyMaterialRepository, ILogger<StudyMaterialController> logger)
        {
            _studyMaterialRepository = studyMaterialRepository;
            _logger = logger;
        }

        [Authorize]
        [HttpGet("study-materials")]
        public async Task<ActionResult<ApiResponse>> GetStudyMaterials([FromQuery] StudyMaterialSearchDto search)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var studyMaterials = await _studyMaterialRepository.GetStudyMaterialsAsync(instituteId, search);
                return Ok(ApiResponse.Success("Study materials retrieved successfully", studyMaterials));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching study materials");
                return StatusCode(500, ApiResponse.Fail("An error occurred while searching study materials"));
            }
        }

        [Permission("Manage Study Material", "Add")]
        [HttpPost("save")]
        public async Task<ActionResult<ApiResponse>> Save([FromForm] SaveStudyMaterialDto dto, [FromServices] IWebHostEnvironment env)
        {
            if (string.IsNullOrWhiteSpace(dto.Heading))
                return BadRequest(ApiResponse.Fail("Please Enter Study Material Heading."));

            var instIdClaim = User.FindFirst("instid")?.Value;
            var userIdClaim = User.FindFirst("userid")?.Value;

            if (!int.TryParse(instIdClaim, out int instituteId) || !int.TryParse(userIdClaim, out int userId))
                return BadRequest(ApiResponse.Fail("Invalid session information."));

            string clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

            try
            {
                bool success = await _studyMaterialRepository.SaveStudyMaterialAsync(instituteId, userId, clientIp, dto, env);

                string message = dto.StudymaterialId > 0
                    ? "Study Material Updated Successfully."
                    : "Study Material Added Successfully.";

                return Ok(ApiResponse.Success(message, success));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.Fail(ex.Message));
            }
        }

        [Authorize]
        [HttpGet("study-materials/{id}")]
        public async Task<ActionResult<ApiResponse>> GetStudyMaterialsById(string id)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var studyMaterials = await _studyMaterialRepository.GetStudyMaterialByIdAsync(Convert.ToInt32(id));
                return Ok(ApiResponse.Success("Study material retrieved successfully", studyMaterials));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving study material by ID");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving study material by ID"));
            }
        }

        [Permission("Manage Study Material", "Delete")]
        [HttpDelete("delete-study-material/{studyMaterialId}")]
        public async Task<ActionResult<ApiResponse>> DeleteStudyMaterial(int studyMaterialId)
        {
            try
            {
                var success = await _studyMaterialRepository.DeleteStudyMaterialAsync(studyMaterialId);

                if (success)
                    return Ok(ApiResponse.Success("Study material deleted successfully."));
                else
                    return BadRequest(ApiResponse.Fail("Failed to delete study material."));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting curriculum");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting curriculum"));
            }
        }

        [Authorize]
        [HttpPost("institute-study-materials-for-import")]
        public async Task<ActionResult<ApiResponse>> GetInstituteStudyMaterialsForImport([FromBody] StudyMaterialImportDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var studyMaterials = await _studyMaterialRepository
                    .GetInstituteStudyMaterialsForImportAsync(instituteId, request.BranchId, request);

                return Ok(ApiResponse.Success(
                    "Institute study materials retrieved successfully",
                    studyMaterials));
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error retrieving institute study materials for import");

                return StatusCode(
                    500,
                    ApiResponse.Fail(
                        "An error occurred while retrieving institute study materials"));
            }
        }

        [Permission("Manage Study Material", "Import")]
        [HttpPost("import-study-material")]
        public async Task<ActionResult<ApiResponse>> ImportStudyMaterial([FromBody] StudyMaterialImportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.StudyMaterialIds == null || request.StudyMaterialIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select study material"));

                var (success, message) = await _studyMaterialRepository
                    .ImportStudyMaterialAsync(request.BranchId, instituteId, request.StudyMaterialIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing study material");
                return StatusCode(500, ApiResponse.Fail("An error occurred while importing study material"));
            }
        }

        [Permission("Manage Study Material", "Export")]
        [HttpPost("export-study-material")]
        public async Task<ActionResult<ApiResponse>> ExportStudyMaterial([FromBody] StudyMaterialExportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.StudyMaterialIds == null || request.StudyMaterialIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one study material"));

                if (request.BranchIds == null || request.BranchIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one branch"));

                var (success, message) = await _studyMaterialRepository.ExportStudyMaterialAsync(request.StudyMaterialIds, instituteId, request.BranchIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting study material");
                return StatusCode(500, ApiResponse.Fail("An error occurred while exporting study material"));
            }
        }
    }
}
