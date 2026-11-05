namespace IM_backend.Models
{
    public class ValidateResetTokenResponse
    {
        public bool Success { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
