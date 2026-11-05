namespace IM_backend.Models
{
    public class LoginModels
    {
        public int User_Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int LoginStatus { get; set; }
        public byte[] Passwd { get; set; } = Array.Empty<byte>();
        public int Branch_Id { get; set; }
        public int Institute_Id { get; set; }
        public string InstituteName { get; set; }
        public int StaffId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public int RegStatus { get; set; }
        public int RegType { get; set; }
        public DateTime LastLogin { get; set; }
        public int StaffUser { get; set; }
        public int Role_Id { get; set; }
        public int Plan_Id { get; set; }
        public string LoginID { get; set; }
        public bool InstituteStatus { get; set; }
    }

    // Notification config models
    public class UserDetailForExcel
    {
        public string? Date { get; set; }
        public string Username { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string? Login { get; set; }
        public string? Logout { get; set; }
        public string? IPAddress { get; set; }
    }

    public class EmailConfig
    {
        public int EmailSettingId { get; set; }
        public string Email_User { get; set; } = string.Empty;
        public string Email_Pwd { get; set; } = string.Empty;
        public string Smtp_Server { get; set; } = string.Empty;
        public bool EnableSsl { get; set; }
        public int PortNo { get; set; }
        public int Branch_Id { get; set; }
        public int Institute_Id { get; set; }
        public int ref_ofcode { get; set; }
    }

    public class SMSConfig
    {
        public string SMS_Server { get; set; } = string.Empty;
        public string EmailRecipients { get; set; } = string.Empty;
        public string MobileNo { get; set; } = string.Empty;
    }

    public class AnnouncementSettings
    {
        public bool IsEnabled { get; set; }
        public string Template { get; set; } = string.Empty;
        public string TemplateNo { get; set; } = string.Empty;
    }

    public class LoginFailureDetails
    {
        public string Reason { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string InstituteId { get; set; } = string.Empty;
        public string BranchId { get; set; } = string.Empty;
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
    }

    public class Modules
    {
        public int ModuleId { get; set; }
        public string Module { get; set; } = string.Empty;
        public int? SubModuleId { get; set; }
        public string? SubModuleName { get; set; }
        public bool AllowView { get; set; }
        public bool AllowAdd { get; set; }
        public bool AllowModify { get; set; }
        public bool AllowDelete { get; set; }
        public bool AllowReports { get; set; }
        public bool IsSubModule { get; set; }
    }

    public class SubModules
    {
        public int SubModuleId { get; set; }
        public string SubModuleName { get; set; } = string.Empty;
        public int ModuleId { get; set; }
        public bool IsActive { get; set; }
    }

    public class HeaderDetails
    {
        public string InstituteName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public byte[]? Logo { get; set; }
        public string? LogoBase64 => Logo != null && Logo.Length > 0
        ? $"data:image/png;base64,{Convert.ToBase64String(Logo)}"
        : null;
        public string Country { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string LastLogin { get; set; } = string.Empty;
        public string RemainingDays { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string expiryDate { get; set; } = string.Empty;
        public string roleName { get; set; } = string.Empty;
    }

}
