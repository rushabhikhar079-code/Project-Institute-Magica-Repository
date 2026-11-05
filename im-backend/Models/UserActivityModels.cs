namespace IM_backend.Models
{
    public class UserActivityModels
    {
        public int InstituteId { get; set; }
        public int BranchId { get; set; }
        public int UserId { get; set; }
        public string ActivityDate { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string DeviceType { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
    }
}
