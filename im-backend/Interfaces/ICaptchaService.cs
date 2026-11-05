using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public enum CaptchaValidationResult
    {
        Valid,
        Invalid,
        Expired
    }
    public interface ICaptchaService
    {
        CaptchaDto GenerateCaptcha();
        CaptchaValidationResult ValidateCaptcha(string captchaId, string userInput);
    }
}
