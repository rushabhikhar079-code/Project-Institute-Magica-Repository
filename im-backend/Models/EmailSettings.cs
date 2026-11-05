namespace IM_backend.Models
{
    public class EmailSettings
    {
        public string EmailUser { get; set; } = string.Empty;
        public string EmailPassword { get; set; } = string.Empty;
        public string SmtpServer { get; set; } = string.Empty;
        public bool EnableSsl { get; set; }
        public int PortNo { get; set; }
        public string MailHost { get; set; } = string.Empty;
        public string MailFrom { get; set; } = string.Empty;
    }
}
