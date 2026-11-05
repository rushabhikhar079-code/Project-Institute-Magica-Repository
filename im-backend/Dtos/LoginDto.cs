namespace IM_backend.Dtos
{
    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CaptchaId { get; set; } = string.Empty;
        public string CaptchaInput { get; set; } = string.Empty;
    }
}
