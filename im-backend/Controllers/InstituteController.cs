using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstituteController : ControllerBase
    {
        private readonly IInstituteRepository _instituteRepository;
        private readonly ICaptchaService _captchaService;
        private readonly ILogger<InstituteController> _logger;

        public InstituteController(IInstituteRepository instituteRepository, ICaptchaService captchaService, ILogger<InstituteController> logger)
        {
            _instituteRepository = instituteRepository;
            _captchaService = captchaService;
            _logger = logger;
        }

        [HttpPost("RegisterInstitute")]
        public async Task<ActionResult<ApiResponse>> RegisterInstitute([FromBody] InstituteRegistrationDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .FirstOrDefault();
                    return BadRequest(ApiResponse.Fail(errors ?? "Invalid request data"));
                }

                // Validate captcha
                if (string.IsNullOrEmpty(request?.CaptchaId) || string.IsNullOrEmpty(request?.CaptchaInput))
                    return BadRequest(ApiResponse.Fail("Please enter captcha code"));

                try
                {
                    var captchaResult = _captchaService.ValidateCaptcha(request.CaptchaId, request.CaptchaInput);
                    if (captchaResult == CaptchaValidationResult.Expired)
                        return BadRequest(ApiResponse.Fail("Captcha expired. Please refresh and try again."));
                    if (captchaResult == CaptchaValidationResult.Invalid)
                        return BadRequest(ApiResponse.Fail("Invalid captcha code"));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Captcha validation error");
                    return BadRequest(ApiResponse.Fail("Captcha validation failed. Please refresh the captcha and try again."));
                }

                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                var (success, message) = await _instituteRepository.RegisterInstituteAsync(request, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration");
                return StatusCode(500, ApiResponse.Fail("An error occurred during registration"));
            }
        }


        [Authorize]
        [HttpPost("institute-search")]
        public async Task<ActionResult<ApiResponse>> SearchInstitutes([FromBody] InstituteSearchDto search)
        {
            try
            {
                var Institutes = await _instituteRepository.GetInstitutesAsync(search);
                return Ok(ApiResponse.Success("Institutes retrieved successfully", Institutes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during institute search");
                return StatusCode(500, ApiResponse.Fail("An error occurred during institute search"));
            }
        }

        [Authorize]
        [HttpGet("get-institute/{instituteId}")]
        public async Task<ActionResult<ApiResponse>> GetInstituteById(int instituteId)
        {
            try
            {
                var institute = await _instituteRepository.GetInstituteByIdAsync(instituteId);
                if (institute == null)
                    return NotFound(ApiResponse.Fail("Institute not found"));

                return Ok(ApiResponse.Success("Institute retrieved successfully", institute));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during institute retrieval");
                return StatusCode(500, ApiResponse.Fail("An error occurred during institute retrieval", ex.Message));
            }
        }

        [Authorize]
        [HttpPost("account-history")]
        public async Task<ActionResult<ApiResponse>> GetAccountHistory([FromBody] AccountHistorySearchDto search)
        {
            try
            {
                var accountHistory = await _instituteRepository.GetAccountHistoryAsync(search);
                return Ok(ApiResponse.Success("Account history retrieved successfully", accountHistory));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during account history retrieval");
                return StatusCode(500, ApiResponse.Fail("An error occurred during account history retrieval", ex.Message));
            }
        }

        [Authorize]
        [HttpDelete("delete-institute/{instituteId}")]
        public async Task<ActionResult<ApiResponse>> DeleteInstitute(int instituteId)
        {
            try
            {
                var (success, message) = await _instituteRepository.DeleteInstituteAsync(instituteId, true);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting institute");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting institute"));
            }
        }

        [Authorize]
        [HttpPost("create-institute")]
        public async Task<ActionResult<ApiResponse>> SubmitInstitute([FromBody] InstituteSubmitDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst("userid")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var instituteIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instituteIdClaim) || !int.TryParse(instituteIdClaim, out int instituteid))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                var (success, message) = await _instituteRepository.SubmitInstituteAsync(request, instituteid, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting institute");
                return StatusCode(500, ApiResponse.Fail("An error occurred while submitting institute"));
            }
        }


        [Authorize]
        [HttpPut("update-institute/{instituteId}")]
        public async Task<ActionResult<ApiResponse>> EditInstitute(int instituteId, [FromBody] InstituteEditSubmitDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst("userid")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                request.InstituteId = instituteId;

                var (success, message) = await _instituteRepository.EditInstituteAsync(request, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing institute");
                return StatusCode(500, ApiResponse.Fail("An error occurred while editing institute"));
            }
        }
        [Authorize]
        [HttpGet("account-history/{payHistoryId}")]
        public async Task<ActionResult<ApiResponse>> GetAccountHistoryById(int payHistoryId)
        {
            try
            {
                var accountHistory = await _instituteRepository.GetAccountHistoryByIdAsync(payHistoryId);
                if (accountHistory == null)
                    return NotFound(ApiResponse.Fail("Account History not found"));

                return Ok(ApiResponse.Success("Account History retrieved successfully", accountHistory));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during account history retrieval");
                return StatusCode(500, ApiResponse.Fail("An error occurred during account history retrieval", ex.Message));
            }
        }
        [Authorize]
        [HttpPut("update-accountHistory/{payHistoryId}")]
        public async Task<ActionResult<ApiResponse>> UpdateAccountHistory(int payHistoryId, [FromBody] AccountHistoryDto request)
        {
            try
            {
                var userIdClaim = User.FindFirst("userid")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse.Fail("Invalid request data"));

                request.PaymentHistoryId = payHistoryId;

                var (success, message) = await _instituteRepository.UpdateAccountHistoryAsync(request, userId, ipAddress);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing institute");
                return StatusCode(500, ApiResponse.Fail("An error occurred while editing institute"));
            }
        }
    }
}
