namespace IM_backend.Models
{
    public class UserRoleAccessModels
    {
        public int UserId { get; set; }
        public int Permission1 { get; set; }
        public int Permission2 { get; set; }
        public int Permission3 { get; set; }
        public int Permission4 { get; set; }
        public int Permission5 { get; set; }
        public int Permission6 { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }
}
