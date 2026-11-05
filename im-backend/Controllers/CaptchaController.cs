using IM_backend.Common;
using IM_backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CaptchaController : ControllerBase
    {
        private readonly ICaptchaService _captchaService;

        public CaptchaController(ICaptchaService captchaService)
        {
            _captchaService = captchaService;
        }

        [HttpGet("generate")]
        public IActionResult GenerateCaptcha()
        {
            var result = _captchaService.GenerateCaptcha();

            Response.Headers.Append("X-Captcha-Id", result.Id);

            return File(result.ImageBytes, "image/png");
        }

        [HttpPost("validate")]
        public ActionResult<ApiResponse> ValidateCaptcha([FromBody] ValidateCaptchaRequest request)
        {
            if (string.IsNullOrEmpty(request.CaptchaId) || string.IsNullOrEmpty(request.UserInput))
            {
                return BadRequest(ApiResponse.Fail("Invalid request"));
            }

            var result = _captchaService.ValidateCaptcha(request.CaptchaId, request.UserInput);

            if (result == CaptchaValidationResult.Expired)
            {
                return Ok(ApiResponse.Fail("Captcha expired. Please refresh and try again."));
            }

            if (result == CaptchaValidationResult.Valid)
            {
                return Ok(ApiResponse.Success("CAPTCHA validated successfully"));
            }

            return Ok(ApiResponse.Fail("Invalid CAPTCHA code"));
        }
    }
    public class ValidateCaptchaRequest
    {
        public string CaptchaId { get; set; } = string.Empty;
        public string UserInput { get; set; } = string.Empty;
    }
}
