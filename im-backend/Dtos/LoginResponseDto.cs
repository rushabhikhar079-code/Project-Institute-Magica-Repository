namespace IM_backend.Dtos
{
    public class LoginResponseDto
    {
        public string TransactionStatus { get; set; } = string.Empty;
        public string Msg { get; set; } = string.Empty;
        public string RedirectUrl { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public int? InstituteId { get; set; }
        public int? BranchId { get; set; }
    }
}
