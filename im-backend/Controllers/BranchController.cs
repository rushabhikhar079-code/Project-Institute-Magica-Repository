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
    public class BranchController : ControllerBase
    {
        private readonly IBranchRepository _branchRepository;
        private readonly ILogger<BranchController> _logger;

        public BranchController(IBranchRepository branchRepository, ILogger<BranchController> logger)
        {
            _branchRepository = branchRepository;
            _logger = logger;
        }

        [Permission("Manage Branches", "View")]
        [HttpPost("branch-search")]
        public async Task<ActionResult<ApiResponse>> SearchBranches([FromBody] BranchSearchDto search)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int tokenInstituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }
                int targetInstituteId = (search.InstituteId.HasValue && search.InstituteId.Value > 0)
                ? search.InstituteId.Value
                : tokenInstituteId;
                // Populate user role and ID from claims
                int userRole = 0; int userId = 0;
                int.TryParse(userRoleClaim, out userRole);
                int.TryParse(userIdClaim, out userId);

                var branches = await _branchRepository.GetBranchesAsync(targetInstituteId, search, userRole, userId);

                return Ok(ApiResponse.Success("Branches retrieved successfully", branches));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching branches");
                return StatusCode(500, ApiResponse.Fail(ex.Message));
            }
        }

        [Authorize]
        [HttpGet("get-branch/{branchId}")]
        public async Task<ActionResult<ApiResponse>> GetBranchById(int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (branch, errorMessage) = await _branchRepository.GetBranchByIdAsync(instituteId, branchId);

                if (branch == null)
                    return BadRequest(ApiResponse.Fail(errorMessage ?? "Branch not found"));

                return Ok(ApiResponse.Success("Branch retrieved successfully", branch));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branch");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving branch"));
            }
        }

        [Permission("Manage Branches", "Add")]
        [HttpPost("create-branch")]
        public async Task<ActionResult<ApiResponse>> CreateBranch([FromBody] BranchSubmitDto branch)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                int userId = 0;
                if (!string.IsNullOrEmpty(userIdClaim))
                    int.TryParse(userIdClaim, out userId);

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                var (success, message, branchId) = await _branchRepository.CreateBranchAsync(instituteId, userId, branch);

                if (success)
                    return Ok(ApiResponse.Success(message, new { BranchId = branchId }));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating branch");
                return StatusCode(500, ApiResponse.Fail("An error occurred while creating branch"));
            }
        }

        [Permission("Manage Branches", "Edit")]
        [HttpPut("update-branch/{branchId}")]
        public async Task<ActionResult<ApiResponse>> UpdateBranch(int branchId, [FromBody] BranchEditDto branch)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                int userId = 0;
                if (!string.IsNullOrEmpty(userIdClaim))
                    int.TryParse(userIdClaim, out userId);

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                branch.BranchId = branchId;
                var (success, message) = await _branchRepository.UpdateBranchAsync(instituteId, userId, branch);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating branch");
                return StatusCode(500, ApiResponse.Fail("An error occurred while updating branch"));
            }
        }

        [Permission("Manage Branches", "Delete")]
        [HttpDelete("delete-branch/{branchId}")]
        public async Task<ActionResult<ApiResponse>> DeleteBranch(int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (success, message) = await _branchRepository.DeleteBranchAsync(instituteId, branchId, true);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting branch");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting branch"));
            }
        }
    }
}
