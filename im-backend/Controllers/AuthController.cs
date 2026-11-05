using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Logging;
using IM_backend.Filters;
using IM_backend.Interfaces;
using IM_backend.Logging;
using IM_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ILoginRepository _loginRepository;
        private readonly ICaptchaService _captchaService;
        private readonly IJwtService _jwtService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(ILoginRepository loginRepository, ICaptchaService captchaService, IJwtService jwtService, INotificationService notificationService, ILogger<AuthController> logger)
        {
            _loginRepository = loginRepository;
            _captchaService = captchaService;
            _jwtService = jwtService;
            _notificationService = notificationService;
            _logger = logger;
        }
        [Authorize]
        [HttpGet("CheckAuth")]
        public ActionResult<ApiResponse> CheckAuth()
        {
            try
            {
                var userId = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.Fail("User is not authenticated"));
                }

                return Ok(ApiResponse.Success("User is authenticated", new
                {
                    authenticated = true
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking authentication");
                return StatusCode(
                    500,
                    ApiResponse.Fail("An error occurred while checking authentication")
                );
            }
        }
        [AllowAnonymous]
        [HttpPost("CheckLogin")]
        public async Task<ActionResult<ApiResponse>> CheckLogin([FromBody] LoginDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.Username?.Trim()))
                {
                    return BadRequest(ApiResponse.Fail("Please enter Username"));
                }

                if (string.IsNullOrEmpty(request?.Password?.Trim()))
                {
                    return BadRequest(ApiResponse.Fail("Please enter Password"));
                }

                if (string.IsNullOrEmpty(request?.CaptchaId) || string.IsNullOrEmpty(request?.CaptchaInput))
                {
                    return BadRequest(ApiResponse.Fail("Please enter captcha code"));
                }

                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

                if (ipAddress != "::1")
                {
                    var captchaResult = _captchaService.ValidateCaptcha(request.CaptchaId, request.CaptchaInput);
                    if (captchaResult == CaptchaValidationResult.Expired)
                    {
                        return BadRequest(ApiResponse.Fail("Captcha expired. Please refresh and try again."));
                    }
                    if (captchaResult == CaptchaValidationResult.Invalid)
                    {
                        return BadRequest(ApiResponse.Fail("Invalid captcha code"));
                    }
                }

                var (success, message, redirectUrl, sessionData, failureDetails) =
                    await _loginRepository.CheckLoginAsync(request.Username, request.Password, ipAddress);

                if (success)
                {
                    if (!int.TryParse(sessionData["userid"], out int userId))
                    {
                        return BadRequest(ApiResponse.Fail("Invalid user data"));
                    }
                    int.TryParse(sessionData.GetValueOrDefault("instid"), out int instituteId);
                    string userRole = sessionData.GetValueOrDefault("role") ?? sessionData.GetValueOrDefault("userrole") ?? "";

                    // Generate JWT access & refresh tokens
                    string accessToken = _jwtService.GenerateAccessTokenWithClaims(sessionData);
                    string refreshToken = _jwtService.GenerateRefreshToken(sessionData);
                    DateTime refreshTokenExpiry = DateTime.UtcNow.AddMinutes(30);

                    // Save refresh token to database
                    await _loginRepository.SaveRefreshTokenAsync(userId, refreshToken, refreshTokenExpiry, DateTime.UtcNow);

                    // Return tokens directly in the JSON response body
                    return Ok(ApiResponse.Success("Login successful", new
                    {
                        message = "Login Successful",
                        accessToken = accessToken,
                        refreshToken = refreshToken,
                        expiresIn = 900, // 15 minutes in seconds
                        instituteId = instituteId,
                        role = userRole
                    }));
                }
                else
                {
                    if (failureDetails != null)
                    {
                        await _notificationService.SendLoginFailedNotificationAsync(
                            failureDetails.Reason,
                            failureDetails.Username,
                            failureDetails.IpAddress,
                            failureDetails.InstituteId,
                            failureDetails.BranchId,
                            failureDetails.StartTime,
                            failureDetails.EndTime
                        );
                    }

                    return BadRequest(ApiResponse.Fail(message, new { RedirectUrl = redirectUrl }));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, ApiResponse.Fail("An error occurred during login"));
            }
        }

        [AllowAnonymous]
        [HttpPost("Refresh-Token")]
        public async Task<ActionResult<ApiResponse>> RefreshToken([FromBody] RefreshTokenDto request)
        {
            try
            {
                string? refreshToken = request?.Token;

                if (string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(ApiResponse.Fail("Refresh token is required"));
                }

                // Check if refresh token exists in database and is active
                var refreshTokenData = await _loginRepository.GetRefreshTokenAsync(refreshToken);
                if (refreshTokenData == null)
                {
                    return Unauthorized(ApiResponse.Fail("Invalid Refresh token"));
                }

                if (!refreshTokenData.IsActive)
                {
                    if (refreshTokenData.IsRevoked)
                    {
                        await _loginRepository.RevokeDescendantRefreshTokensAsync(
                            refreshToken,
                            DateTime.UtcNow,
                            "Attempted to use revoked refresh token"
                        );
                    }
                    return Unauthorized(ApiResponse.Fail("Refresh token is expired or revoked"));
                }

                // Validate JWT refresh token signature
                var principal = _jwtService.ValidateRefreshToken(refreshToken);
                if (principal == null)
                {
                    return Unauthorized(ApiResponse.Fail("Invalid refresh token signature"));
                }

                var userIdClaim = principal.FindFirst("userid")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(ApiResponse.Fail("Invalid refresh token claims"));
                }

                if (refreshTokenData.UserId != userId)
                {
                    return Unauthorized(ApiResponse.Fail("Refresh token user mismatch"));
                }

                var user = await _loginRepository.GetLoginByUserIdAsync(userId.ToString());
                if (user == null)
                {
                    return Unauthorized(ApiResponse.Fail("User not found"));
                }

                var sessionData = new Dictionary<string, string>
                {
                    ["userid"] = user.User_Id.ToString(),
                    ["username"] = user.Username,
                    ["instid"] = user.Institute_Id.ToString(),
                    ["branchid"] = user.Branch_Id.ToString(),
                    ["role"] = user.Role_Id.ToString(),
                    ["Email"] = user.Email
                };

                // Generate new tokens
                string newAccessToken = _jwtService.GenerateAccessTokenWithClaims(sessionData);
                string newRefreshToken = _jwtService.GenerateRefreshToken(sessionData);
                DateTime newRefreshTokenExpiry = DateTime.UtcNow.AddMinutes(30);

                await _loginRepository.SaveRefreshTokenAsync(userId, newRefreshToken, newRefreshTokenExpiry, DateTime.UtcNow);
                await _loginRepository.RevokeRefreshTokenAsync(refreshToken, DateTime.UtcNow, "Replaced by new token");

                // Return new tokens in JSON body
                return Ok(ApiResponse.Success("Token refreshed successfully", new
                {
                    accessToken = newAccessToken,
                    refreshToken = newRefreshToken,
                    expiresIn = 900
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, ApiResponse.Fail("An error occurred during token refresh"));
            }
        }

        [AllowAnonymous]
        [HttpPost("Logout")]
        public async Task<ActionResult<ApiResponse>> Logout([FromBody] RefreshTokenDto? request = null)
        {
            try
            {
                string? refreshToken = request?.Token;

                if (!string.IsNullOrEmpty(refreshToken))
                {
                    await _loginRepository.RevokeRefreshTokenAsync(
                        refreshToken,
                        DateTime.UtcNow,
                        "User logged out"
                    );
                }

                return Ok(ApiResponse.Success("Logged out successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, ApiResponse.Fail("An error occurred during logout"));
            }
        }

        [Authorize]
        [HttpGet("institutes/{instituteId}/branches/{branchId}/getmodules")]
        public async Task<ActionResult<ApiResponse>> GetModuleList(
            [FromRoute] int instituteId,
            [FromRoute] int branchId = 0)
        {
            try
            {
                var roleIdClaim = User.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out int roleId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid role information"));
                }

                List<Modules> moduleList;
                if (Convert.ToInt32(roleIdClaim) == 1 && instituteId == 0)
                {
                    moduleList = await _loginRepository.GetModuleListForSuperAdminAsync(roleId);
                }
                else
                {
                    moduleList = await _loginRepository.GetModuleListAsync(roleId, instituteId, branchId);
                }

                return Ok(ApiResponse.Success("Module list retrieved successfully", moduleList));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving module list for InstituteId: {InstituteId}, BranchId: {BranchId}", instituteId, branchId);
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving module list"));
            }
        }

        [Authorize]
        [HttpGet("GetSubModules/{moduleId}")]
        public async Task<ActionResult<ApiResponse>> GetSubModules(int moduleId)
        {
            try
            {
                if (moduleId <= 0)
                {
                    return BadRequest(ApiResponse.Fail("Invalid module ID"));
                }

                var subModules = await _loginRepository.GetSubModulesAsync(moduleId);
                return Ok(ApiResponse.Success("Submodules retrieved successfully", subModules));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving submodules");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving submodules"));
            }
        }

        [Authorize]
        [HttpGet("modules/hierarchy")]
        public async Task<ActionResult<ApiResponse>> GetModuleHierarchy()
        {
            try
            {
                var hierarchy = await _loginRepository.GetModuleHierarchyAsync();
                return Ok(ApiResponse.Success("Module hierarchy retrieved successfully", hierarchy.Modules));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving module hierarchy");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving module hierarchy"));
            }
        }

        [Authorize]
        [HttpGet("modules/modulehierarchy_branchSpecific")]
        public async Task<ActionResult<ApiResponse>> GetModuleHierarchy([FromQuery] int branchSpecific = -1)
        {
            try
            {
                ModuleHierarchyResponseDto hierarchy;
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (branchSpecific >= 0)
                {
                    hierarchy = await _loginRepository.GetModuleHierarchyAsync(branchSpecific, Convert.ToInt32(instIdClaim));
                }
                else
                {
                    hierarchy = await _loginRepository.GetModuleHierarchyAsync();
                }
                return Ok(ApiResponse.Success("Module hierarchy retrieved successfully", hierarchy.Modules));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving module hierarchy");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving module hierarchy"));
            }
        }

        [Authorize]
        [HttpGet("HeaderDetails")]
        public async Task<ActionResult<ApiResponse>> HeaderDetails([FromQuery] int? instituteId = 0)
        {
            try
            {
                int instId = instituteId ?? 0;
                if (instituteId == null || instituteId == 0)
                {
                    var instituteIdClaim = User.FindFirstValue("instid");
                    if (string.IsNullOrEmpty(instituteIdClaim) || !int.TryParse(instituteIdClaim, out instId))
                    {
                        instId = instituteIdClaim != null ? Convert.ToInt32(instituteIdClaim) : 0;
                    }
                }
                var userIdClaim = User.FindFirstValue("userid");
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid user id information"));
                }
                var roleIdClaim = User.FindFirstValue(ClaimTypes.Role);
                if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out int roleId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid role information"));
                }
                var headerDetails = await _loginRepository.HeaderDetailsAsync(roleId, instId, Convert.ToInt32(userIdClaim));
                if (headerDetails == null)
                {
                    return NotFound(ApiResponse.Fail("Header details not found"));
                }
                var branchDetails = await _loginRepository.BranchListAsync(instId);
                var trimmedBranchList = branchDetails.Select(b => new
                {
                    branchId = b.BranchId,
                    branchName = b.BranchName
                });
                return Ok(ApiResponse.Success("Header details retrieved successfully", new { header = headerDetails, branchlist = trimmedBranchList }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving header details");
                return StatusCode(500, ApiResponse.Fail(ex.Message));
            }
        }
        //[AllowAnonymous]
        //[HttpPost("CheckLogin")]
        //public async Task<ActionResult<ApiResponse>> CheckLogin([FromBody] LoginDto request)
        //{
        //    try
        //    {
        //        if (string.IsNullOrEmpty(request?.Username?.Trim()))
        //        {
        //            return BadRequest(ApiResponse.Fail("Please enter Username"));
        //        }

        //        if (string.IsNullOrEmpty(request?.Password?.Trim()))
        //        {
        //            return BadRequest(ApiResponse.Fail("Please enter Password"));
        //        }

        //        if (string.IsNullOrEmpty(request?.CaptchaId) || string.IsNullOrEmpty(request?.CaptchaInput))
        //        {
        //            return BadRequest(ApiResponse.Fail("Please enter captcha code"));
        //        }

        //        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

        //        if (ipAddress != "::1")
        //        {
        //            var captchaResult = _captchaService.ValidateCaptcha(request.CaptchaId, request.CaptchaInput);
        //            if (captchaResult == CaptchaValidationResult.Expired)
        //            {
        //                return BadRequest(ApiResponse.Fail("Captcha expired. Please refresh and try again."));
        //            }
        //            if (captchaResult == CaptchaValidationResult.Invalid)
        //            {
        //                return BadRequest(ApiResponse.Fail("Invalid captcha code"));
        //            }
        //        }

        //        var (success, message, redirectUrl, sessionData, failureDetails) = await _loginRepository.CheckLoginAsync(request.Username, request.Password, ipAddress);

        //        if (success)
        //        {
        //            // Get user ID from session data
        //            if (!int.TryParse(sessionData["userid"], out int userId))
        //            {
        //                return BadRequest(ApiResponse.Fail("Invalid user data"));
        //            }
        //            int.TryParse(sessionData.GetValueOrDefault("instid"), out int instituteId);
        //            //int.TryParse(sessionData.GetValueOrDefault("branchid"), out int branchId);
        //            string userRole = sessionData.GetValueOrDefault("role") ?? sessionData.GetValueOrDefault("userrole") ?? "";
        //            // Generate JWT access token with session data as claims
        //            string accessToken = _jwtService.GenerateAccessTokenWithClaims(sessionData);

        //            // Generate refresh token with same claims as access token
        //            string refreshToken = _jwtService.GenerateRefreshToken(sessionData);
        //            DateTime refreshTokenExpiry = DateTime.UtcNow.AddMinutes(30);

        //            // Save refresh token to database
        //            await _loginRepository.SaveRefreshTokenAsync(userId, refreshToken, refreshTokenExpiry, DateTime.UtcNow);

        //            // Store Access Token in Cookie
        //            Response.Cookies.Append("access_token", accessToken, new CookieOptions
        //            {
        //                HttpOnly = true,
        //                Secure = true,
        //                SameSite = SameSiteMode.None,
        //                Path = "/",
        //                Expires = DateTimeOffset.UtcNow.AddMinutes(15)
        //            }); 

        //            // Store Refresh Token in Cookie
        //            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
        //            {
        //                HttpOnly = true,
        //                Secure = true,
        //                SameSite = SameSiteMode.None,
        //                Path = "/",
        //                Expires = DateTimeOffset.UtcNow.AddMinutes(30)
        //            });

        //            return Ok(ApiResponse.Success("Login successful", new
        //            {
        //                message = "Login Successful",
        //                instituteId = instituteId,
        //                role = userRole
        //            }));
        //        }
        //        else
        //        {
        //            // Send notification if login failed due to security reasons
        //            if (failureDetails != null)
        //            {
        //                await _notificationService.SendLoginFailedNotificationAsync(
        //                    failureDetails.Reason,
        //                    failureDetails.Username,
        //                    failureDetails.IpAddress,
        //                    failureDetails.InstituteId,
        //                    failureDetails.BranchId,
        //                    failureDetails.StartTime,
        //                    failureDetails.EndTime
        //                );
        //            }

        //            return BadRequest(ApiResponse.Fail(message, new { RedirectUrl = redirectUrl }));
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error during login");
        //        return StatusCode(500, ApiResponse.Fail("An error occurred during login"));
        //    }

        //}

        //[AllowAnonymous]
        //[HttpPost("Refresh-Token")]
        //public async Task<ActionResult<ApiResponse>> RefreshToken()
        //{
        //    try
        //    {
        //        string? refreshToken = Request.Cookies["refresh_token"];

        //        if (string.IsNullOrEmpty(refreshToken))
        //        {
        //            return Unauthorized(ApiResponse.Fail("Refresh token is required"));
        //        }
        //        if (string.IsNullOrEmpty(refreshToken))
        //        {
        //            return Unauthorized(ApiResponse.Fail("Refresh token is required"));
        //        }

        //        // Check if refresh token exists in database and is active
        //        var refreshTokenData = await _loginRepository.GetRefreshTokenAsync(refreshToken);
        //        if (refreshTokenData == null)
        //        {
        //            return Unauthorized(ApiResponse.Fail("Invalid Refresh token"));
        //        }

        //        if (!refreshTokenData.IsActive)
        //        {
        //            if (refreshTokenData.IsRevoked)
        //            {
        //                // Revoke all successor tokens (token rotation)
        //                await _loginRepository.RevokeDescendantRefreshTokensAsync(refreshToken, DateTime.UtcNow, "Attempted to use revoked refresh token");
        //            }
        //            return Unauthorized(ApiResponse.Fail("Refresh token is expired or revoked"));
        //        }

        //        // Validate JWT refresh token
        //        var principal = _jwtService.ValidateRefreshToken(refreshToken);
        //        if (principal == null)
        //        {
        //            return Unauthorized(ApiResponse.Fail("Invalid refresh token signature"));
        //        }

        //        // Get user ID from JWT claims
        //        var userIdClaim = principal.FindFirst("userid")?.Value;
        //        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        //        {
        //            return Unauthorized(ApiResponse.Fail("Invalid refresh token claims"));
        //        }

        //        // Verify user ID matches the token in database
        //        if (refreshTokenData.UserId != userId)
        //        {
        //            return Unauthorized(ApiResponse.Fail("Refresh token user mismatch"));
        //        }

        //        // Get user login data to regenerate session data
        //        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

        //        // Get user info from database to regenerate session data
        //        var user = await _loginRepository.GetLoginByUserIdAsync(userId.ToString());
        //        if (user == null)
        //        {
        //            return Unauthorized(ApiResponse.Fail("User not found"));
        //        }

        //        // Regenerate session data (simplified version)
        //        var sessionData = new Dictionary<string, string>
        //        {
        //            ["userid"] = user.User_Id.ToString(),
        //            ["username"] = user.Username,
        //            ["instid"] = user.Institute_Id.ToString(),
        //            ["branchid"] = user.Branch_Id.ToString(),
        //            ["role"] = user.Role_Id.ToString(),
        //            ["Email"] = user.Email
        //        };

        //        // Generate new access token
        //        string newAccessToken = _jwtService.GenerateAccessTokenWithClaims(sessionData);

        //        // Generate new JWT refresh token with same claims (token rotation)
        //        string newRefreshToken = _jwtService.GenerateRefreshToken(sessionData);
        //        DateTime newRefreshTokenExpiry = DateTime.UtcNow.AddMinutes(30);

        //        // Save new refresh token to database with reference to old token
        //        await _loginRepository.SaveRefreshTokenAsync(userId, newRefreshToken, newRefreshTokenExpiry, DateTime.UtcNow);

        //        // Revoke old refresh token in database and set replaced_by_token
        //        await _loginRepository.RevokeRefreshTokenAsync(refreshToken, DateTime.UtcNow, "Replaced by new token");

        //        // Update Access Token in Cookie
        //        Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
        //        {
        //            HttpOnly = true,
        //            Secure = true, // Change to true when using HTTPS
        //            SameSite = SameSiteMode.None,
        //            Expires = DateTimeOffset.UtcNow.AddMinutes(15)
        //        });

        //        // Update Refresh Token in Cookie
        //        Response.Cookies.Append("refresh_token", newRefreshToken, new CookieOptions
        //        {
        //            HttpOnly = true,
        //            Secure = true, // Change to true when using HTTPS
        //            SameSite = SameSiteMode.None,
        //            Expires = DateTimeOffset.UtcNow.AddMinutes(30)
        //        });

        //        return Ok(ApiResponse.Success("Token refreshed successfully"));
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error during token refresh");
        //        return StatusCode(500, ApiResponse.Fail("An error occurred during token refresh"));
        //    }
        //}

        ////[Authorize] //Remove by Nikhil L. on 10-08-2026
        //[AllowAnonymous] //Added by Nikhil L. on 10-08-2026
        //[HttpPost("Logout")]
        //public async Task<ActionResult<ApiResponse>> Logout([FromBody] RefreshTokenDto? request = null)
        //{
        //    try
        //    {
        //        // Get refresh token from request body or cookie
        //        string? refreshToken = request?.Token ?? Request.Cookies["refresh_token"];

        //        if (!string.IsNullOrEmpty(refreshToken))
        //        {
        //            // Revoke the refresh token
        //            await _loginRepository.RevokeRefreshTokenAsync(
        //                refreshToken,
        //                DateTime.UtcNow,
        //                "User logged out"
        //            );
        //        }

        //        var cookieOptions = new CookieOptions
        //        {
        //            HttpOnly = true,
        //            Secure = true,
        //            SameSite = SameSiteMode.None,
        //            Path = "/"
        //        };

        //        // Clear Access Token Cookie
        //        Response.Cookies.Delete("access_token", cookieOptions);

        //        // Clear Refresh Token Cookie
        //        Response.Cookies.Delete("refresh_token", cookieOptions);

        //        return Ok(ApiResponse.Success("Logged out successfully"));
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error during logout");
        //        return StatusCode(500, ApiResponse.Fail("An error occurred during logout"));
        //    }
        //}

        //[Authorize]
        //[HttpGet("institutes/{instituteId}/branches/{branchId}/getmodules")]
        //public async Task<ActionResult<ApiResponse>> GetModuleList(
        //    [FromRoute] int instituteId,
        //    [FromRoute] int branchId=0)
        //{
        //    try
        //    {
        //        var roleIdClaim = User.FindFirst(ClaimTypes.Role)?.Value;                
        //        if (string.IsNullOrEmpty(roleIdClaim) || !int.TryParse(roleIdClaim, out int roleId))
        //        {
        //            return BadRequest(ApiResponse.Fail("Invalid role information"));
        //        }

        //        //var instituteIdClaim = User.FindFirstValue("instid");
        //        //if (string.IsNullOrEmpty(instituteIdClaim) || !int.TryParse(instituteIdClaim, out int instituteId))
        //        //{
        //        //    return BadRequest(ApiResponse.Fail("Invalid institute information"));
        //        //}
        //        List<Modules> moduleList;
        //        if (Convert.ToInt32(roleIdClaim)==1 && instituteId==0)
        //        {
        //            moduleList = await _loginRepository.GetModuleListForSuperAdminAsync(roleId);
        //        }
        //        else
        //        {
        //            // Get module list from database
        //            moduleList = await _loginRepository.GetModuleListAsync(roleId, instituteId, branchId);
        //        }

        //        return Ok(ApiResponse.Success("Module list retrieved successfully", moduleList));
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error retrieving module list for InstituteId: {InstituteId}, BranchId: {BranchId}", instituteId, branchId);
        //        return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving module list"));
        //    }
        //}

        //[Authorize]
        //[HttpGet("GetSubModules/{moduleId}")]
        //public async Task<ActionResult<ApiResponse>> GetSubModules(int moduleId)
        //{
        //    try
        //    {
        //        if (moduleId <= 0)
        //        {
        //            return BadRequest(ApiResponse.Fail("Invalid module ID"));
        //        }

        //        // Get submodules from database
        //        var subModules = await _loginRepository.GetSubModulesAsync(moduleId);

        //        return Ok(ApiResponse.Success("Submodules retrieved successfully", subModules));
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error retrieving submodules");
        //        return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving submodules"));
        //    }
        //}       
        //[Authorize]
        //[HttpGet("HeaderDetails")]
        //public async Task<ActionResult<ApiResponse>> HeaderDetails([FromQuery] int? instituteId=0)
        //{
        //    try
        //    {
        //        int instId = instituteId ?? 0;
        //        if (instituteId == null || instituteId == 0)
        //        {
        //            var instituteIdClaim = User.FindFirstValue("instid");
        //            if (string.IsNullOrEmpty(instituteIdClaim) || !int.TryParse(instituteIdClaim, out instId))
        //            {
        //                instId = instituteIdClaim != null ? Convert.ToInt32(instituteIdClaim) : 0;
        //            }
        //        }
        //        var userIdClaim = User.FindFirstValue("userid");
        //        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int roleId))
        //        {
        //            return BadRequest(ApiResponse.Fail("Invalid user id information"));
        //        }
        //        var headerDetails = await _loginRepository.HeaderDetailsAsync(roleId, instId, Convert.ToInt32(userIdClaim));
        //        if(headerDetails == null)
        //        {
        //            return NotFound(ApiResponse.Fail("Header details not found"));
        //        }
        //        var branchDetails = await _loginRepository.BranchListAsync(instId);
        //        var trimmedBranchList = branchDetails.Select(b => new
        //        {
        //            branchId = b.BranchId,
        //            branchName = b.BranchName
        //        });
        //        return Ok(ApiResponse.Success("Header details retrieved successfully", new { header = headerDetails, branchlist = trimmedBranchList }));
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error retrieving header details");
        //        return StatusCode(500, ApiResponse.Fail(ex.Message));
        //    }
        //}

    }
}