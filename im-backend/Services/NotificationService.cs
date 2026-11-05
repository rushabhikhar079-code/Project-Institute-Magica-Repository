using IM_backend.Interfaces;
using IM_backend.Models;
using System.Globalization;
using System.Net;
using System.Net.Mail;

namespace IM_backend.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ILoginRepository _loginRepository;
        private readonly IConfiguration _config;
        private readonly ILogger<NotificationService> _logger;
        private readonly string _logFilePath;

        public NotificationService(ILoginRepository loginRepository, IConfiguration config, ILogger<NotificationService> logger)
        {
            _loginRepository = loginRepository;
            _config = config;
            _logger = logger;
            _logFilePath = Path.Combine(Directory.GetCurrentDirectory(), "upload", "UserLogs");
        }

        public async Task SendLoginFailedNotificationAsync(string reason, string username, string ipAddress, string instituteId, string branchId, string? startTime = null, string? endTime = null)
        {
            try
            {
                // Get user details for notification
                var userDetails = await _loginRepository.GetUserDetailForExcelAsync(username);
                string branchName = userDetails?.BranchName ?? "";
                string roleName = userDetails?.RoleName ?? "";
                string displayName = userDetails?.Username ?? username;

                // Get current time in user's timezone
                string timeZoneId = "India Standard Time"; // Default, should be fetched from user settings
                string sysTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, timeZoneId).ToString("hh:mm tt");
                string date = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, timeZoneId).ToString("dd/MM/yyyy");

                // Get SMS configuration
                var smsConfig = await _loginRepository.GetSMSConfigAsync(int.Parse(instituteId), int.Parse(branchId));
                if (smsConfig == null)
                {
                    _logger.LogWarning("SMS configuration not found for institute {InstituteId}, branch {BranchId}", instituteId, branchId);
                    return;
                }

                var emailConfig = await _loginRepository.GetEmailConfigAsync(int.Parse(instituteId), int.Parse(branchId));
                if (emailConfig == null)
                {
                    _logger.LogWarning("Email configuration not found for institute {InstituteId}, branch {BranchId}", instituteId, branchId);
                    return;
                }

                // Send Email Notification
                await SendEmailNotificationAsync(reason, displayName, branchName, roleName, ipAddress, int.Parse(instituteId), int.Parse(branchId), date, sysTime, startTime, endTime, emailConfig);

                // Send SMS Notification
                await SendSMSNotificationAsync(reason, displayName, branchName, roleName, ipAddress, int.Parse(instituteId), int.Parse(branchId), date, sysTime, smsConfig);

                // Log to file
                await LogToFileAsync(reason, displayName, branchName, roleName, ipAddress, int.Parse(branchId), date, sysTime, startTime, endTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending login failed notification for user {Username}", username);
            }
        }

        private async Task SendEmailNotificationAsync(string reason, string username, string branchName, string roleName, string ipAddress, int instituteId, int branchId, string date, string sysTime, string? startTime, string? endTime, EmailConfig emailConfig)
        {
            try
            {
                if (string.IsNullOrEmpty(emailConfig.Email_User))
                {
                    _logger.LogWarning("Email recipients not configured");
                    return;
                }

                string[] emailRecipients = emailConfig.Email_User.Split(',');

                using (var client = new SmtpClient(emailConfig.Smtp_Server, emailConfig.PortNo))
                {
                    client.EnableSsl = emailConfig.EnableSsl;
                    client.Credentials = new NetworkCredential(emailConfig.Email_User, emailConfig.Email_Pwd);

                    foreach (var recipient in emailRecipients)
                    {
                        var mail = new MailMessage
                        {
                            From = new MailAddress(emailConfig.Smtp_Server),
                            Subject = "User Login Failed",
                            Body = GetEmailBody(reason, branchName, username, ipAddress, date, sysTime, startTime, endTime),
                            IsBodyHtml = true
                        };

                        mail.To.Add(recipient.Trim());
                        await client.SendMailAsync(mail);
                    }
                }

                _logger.LogInformation("Login failed email sent for user {Username}", username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending login failed email");
            }
        }

        private string GetEmailBody(string reason, string branchName, string username, string ipAddress, string date, string sysTime, string? startTime, string? endTime)
        {
            string body = @"Dear Admin,<br /><br /><p>&nbsp;&nbsp;&nbsp; User Login Failed. " + branchName + ", User: " + username;

            if (reason == "IP")
                body += " Reason: Logged in from unauthorized IP address " + ipAddress;
            else if (reason == "LoginTime")
                body += " Reason: Logged in at wrong time slot. " + date + " " + sysTime;
            else if (reason == "NoTimeSlot")
                body += " Reason: No Login time set. " + date + " " + sysTime;

            body += "<br /><br />Best Regards,<br/>Customer Support<br/>Techior Solutions Pvt. Ltd.</p>";

            return body;
        }

        private async Task SendSMSNotificationAsync(string reason, string username, string branchName, string roleName, string ipAddress, int instituteId, int branchId, string date, string sysTime, SMSConfig smsConfig)
        {
            try
            {
                if (string.IsNullOrEmpty(smsConfig.SMS_Server))
                {
                    _logger.LogWarning("SMS server not configured");
                    return;
                }

                // Get announcement settings for SMS template
                string announcementType = reason switch
                {
                    "IP" => "unauthorised",
                    "LoginTime" => "logintime",
                    "NoTimeSlot" => "logintimenotset",
                    _ => ""
                };

                if (string.IsNullOrEmpty(announcementType))
                {
                    _logger.LogWarning("Invalid announcement type for reason {Reason}", reason);
                    return;
                }

                var announcementSettings = await _loginRepository.GetAnnouncementSettingsAsync(instituteId, branchId, announcementType);
                if (announcementSettings == null || !announcementSettings.IsEnabled)
                {
                    _logger.LogWarning("SMS announcement settings not enabled for type {Type}", announcementType);
                    return;
                }

                // Build SMS message with template replacement
                string smsMessage = BuildSMSMessage(announcementSettings.Template, username, date, sysTime, ipAddress, branchName);

                if (string.IsNullOrEmpty(smsMessage))
                {
                    _logger.LogWarning("SMS message is empty for type {Type}", announcementType);
                    return;
                }

                // Send SMS
                await SendSMSAsync(smsConfig.SMS_Server, announcementSettings.TemplateNo, smsMessage, smsConfig.MobileNo);

                _logger.LogInformation("Login failed SMS sent for user {Username}", username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending login failed SMS");
            }
        }

        private string BuildSMSMessage(string template, string username, string date, string sysTime, string ipAddress, string branchName)
        {
            string message = template.Replace("\n", "\r\n");

            // Replace placeholders
            message = message.Replace("[Username]", username);
            message = message.Replace("[Date]", date);
            message = message.Replace("[SystemTime]", sysTime);
            message = message.Replace("[IPADDRESS]", ipAddress);
            message = message.Replace("[Institute Name]", CultureInfo.CurrentCulture.TextInfo.ToTitleCase(branchName.ToLower()));
            message = message.Replace("[BranchName]", CultureInfo.CurrentCulture.TextInfo.ToTitleCase(branchName.ToLower()));

            return message;
        }

        private async Task LogToFileAsync(string reason, string username, string branchName, string roleName, string ipAddress, int branchId, string date, string sysTime, string? startTime, string? endTime)
        {
            try
            {
                string message = string.Empty;
                if (reason == "IP")
                    message = "User Login Failed. " + branchName + ", User:" + username + " Reason: Logged in from unauthorized IP address. " + ipAddress;
                else if (reason == "LoginTime")
                    message = "User Login Failed. " + branchName + ", User:" + username + " Reason: Logged in at wrong time slot. " + date + " " + sysTime;
                else if (reason == "NoTimeSlot")
                    message = "User Login Failed. " + branchName + ", User:" + username + " Reason: No Login time set. " + date + " " + sysTime;

                string logMessage = $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} - {message}{Environment.NewLine}";

                // Ensure directory exists
                if (!Directory.Exists(_logFilePath))
                {
                    Directory.CreateDirectory(_logFilePath);
                }

                string filePath = Path.Combine(_logFilePath, $"UserLogs_{branchId}.txt");

                // Append to log file
                await File.AppendAllTextAsync(filePath, logMessage);

                _logger.LogInformation("Login failed logged to file for user {Username}", username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging login failure to file");
            }
        }

        private async Task SendSMSAsync(string smsServer, string templateNo, string message, string mobileNumbers)
        {
            // TODO: Implement actual SMS sending logic using your SMS gateway
            _logger.LogInformation("SMS would be sent: Server={Server}, Template={Template}, Message={Message}, Mobile={Mobile}", smsServer, templateNo, message, mobileNumbers);
        }
    }
}
