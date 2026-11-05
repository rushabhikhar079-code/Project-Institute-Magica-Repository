using Dapper;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.SqlQueries;
using System.Data;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace IM_backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly IDbConnectionFactory _dbFactory;
        public EmailService(IConfiguration configuration, IDbConnectionFactory dbFactory)
        {
            _configuration = configuration;
            _dbFactory = dbFactory;
        }

        public async Task SendRegistrationEmailAsync(string username, string emailId, string instituteName, string address, string contactPerson, string phone, string email, string remarks, string ipAddress, string noOfStudents, string coachingFor)
        {
            try
            {
                // Get email configuration from appsettings or use defaults
                string mailHost = _configuration["EmailSettings:Host"] ?? "mail.institutemagica.com";
                string mailFrom = _configuration["EmailSettings:From"] ?? "support@institutemagica.com";
                string mailUsername = _configuration["EmailSettings:Username"] ?? "support@institutemagica.com";
                string mailPassword = _configuration["EmailSettings:Password"] ?? "zFg5u648?@@zFg5u648?";
                bool enableSsl = _configuration.GetValue<bool>("EmailSettings:EnableSSL", false);
                int port = _configuration.GetValue<int>("EmailSettings:Port", 587);

                using (var smtpClient = new SmtpClient(mailHost, port))
                {
                    smtpClient.EnableSsl = enableSsl;
                    smtpClient.Credentials = new NetworkCredential(mailUsername, mailPassword);

                    DateTime dt = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, "India Standard Time");

                    // Email 1: Welcome email to user
                    await SendEmailAsync(smtpClient, mailFrom, emailId, "info@techior.com",
                        "Thank you for registering at institutemagica.com",
                        GenerateWelcomeEmailBody(username));

                    // Email 2: Notification to admin
                    await SendEmailAsync(smtpClient, mailFrom, "info@techior.com", "techior.solutions@gmail.com",
                        $"INSTITUTE MAGICA TRIAL: {instituteName} dated {dt:dd/MM/yyyy hh:mm tt}",
                        GenerateAdminNotificationEmailBody(instituteName, address, contactPerson, phone, email, remarks, ipAddress, noOfStudents, coachingFor, dt));

                    // Commented by Nikhil L. on 10-08-2026 as it is not required to send password change link to user after registration.
                    // Email 3: Password change link to user
                    //string passwordChangeUrl = $"http://www.institutemagica.com/frmPasswordChange.aspx?UName={username}";
                    //await SendEmailAsync(smtpClient, mailFrom, emailId, "info@techior.com",
                    //    "Link to change password on institutemagica.com",
                    //    GeneratePasswordChangeEmailBody(username, passwordChangeUrl));

                }
            }
            catch (Exception ex)
            {
                // Log error but don't fail registration
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }
        }

        private async Task SendEmailAsync(SmtpClient smtpClient, string from, string to, string bcc, string subject, string body)
        {
            var mailMessage = new MailMessage
            {
                From = new MailAddress(from),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mailMessage.To.Add(to);
            if (!string.IsNullOrEmpty(bcc))
            {
                mailMessage.Bcc.Add(bcc);
            }

            await smtpClient.SendMailAsync(mailMessage);
        }

        private string GenerateWelcomeEmailBody(string username)
        {
            string websiteLink = "http://www.institutemagica.com";
            string cleanUsername = username.Trim();

            StringBuilder sb = new StringBuilder();

            sb.Append(@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Welcome to Institute Magica</title>
</head>
<body style='margin: 0; padding: 0; background-color: #0f4c81; font-family: Arial, sans-serif; color: #333333;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color: #f4f6f9; padding: 20px 0;'>
        <tr>
            <td align='center'>
                <!-- Main Container -->
                <table role='presentation' width='600' cellspacing='0' cellpadding='0' border='0' style='background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; max-width: 600px; width: 100%; text-align: left; overflow: hidden;'>
                    
                    <!-- Header -->
                    <tr>
                        <td style='background-color: #0f4c81; padding: 24px 30px; text-align: center;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;'>Welcome to Institute Magica</h1>
                            <p style='color: #e8f0fe; margin: 5px 0 0 0; font-size: 13px;'>Powered by Techior Solutions Pvt. Ltd.</p>
                        </td>
                    </tr>

                    <!-- Content Body -->
                    <tr>
                        <td style='padding: 30px;'>
                            <p style='margin: 0 0 16px 0; font-size: 15px; line-height: 1.5;'>Dear <strong>")
              .Append(cleanUsername)
              .Append(@"</strong>,</p>
                            
                            <p style='margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #555555;'>
                                Thank you for registering at <a href='").Append(websiteLink).Append(@"' target='_blank' style='color: #0f4c81; text-decoration: none; font-weight: bold;'>www.institutemagica.com</a>. 
                                Our award-winning institute management software enables you to seamlessly manage operations 24/7 from anywhere.
                            </p>

                            <!-- Login Credentials Card -->
                            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='background-color: #f8f9fa; border-left: 4px solid #0f4c81; border-radius: 4px; margin: 20px 0;'>
                                <tr>
                                    <td style='padding: 16px;'>
                                        <p style='margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #777777; text-transform: uppercase; letter-spacing: 0.5px;'>Your Login Credentials</p>
                                        <p style='margin: 0 0 6px 0; font-size: 14px;'><strong>Username:</strong> <span style='font-family: monospace; background-color: #eef2f5; padding: 2px 6px; border-radius: 3px;'>").Append(cleanUsername).Append(@"</span></p>
                                        <p style='margin: 0; font-size: 14px;'><strong>Password:</strong> <span style='font-family: monospace; background-color: #eef2f5; padding: 2px 6px; border-radius: 3px;'>admin123</span></p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Features Overview -->
                            <p style='margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #555555;'>
                                Easily track inquiries, follow-ups, fee payments, student attendance, and test performance with over 100+ automated reports and dedicated mobile apps for parents and staff.
                            </p>

                            <!-- Getting Started Steps -->
                            <h3 style='font-size: 16px; color: #333333; margin: 24px 0 12px 0; border-bottom: 1px solid #eeeeee; padding-bottom: 8px;'>Quick Steps to Get Started</h3>
                            
                            <ol style='margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #444444;'>
                                <li>HQ branch is already created upon registration.</li>
                                <li>Add additional branches if required and click to manage.</li>
                                <li>Configure courses, subjects, fees, and installment templates.</li>
                                <li>Setup dynamic fee configurations (one-time, ad-hoc, monthly).</li>
                                <li>Create batches and manage student assignments.</li>
                                <li>Capture and allocate student inquiries (auto-import from JustDial, Sulekha, or Website).</li>
                                <li>Register students, manage documents, and assign batches.</li>
                                <li>Generate payment schedules and collect fees with digital receipts.</li>
                                <li>Track attendance manually or sync with <strong>ESSL XL990</strong> biometric machines.</li>
                                <li>Conduct online evaluations, tests, and publish results.</li>
                                <li>Set up SMS/Email reminders for automated payment collection alerts.</li>
                                <li>Manage instructor salaries, leave applications, staff loans, and daily expense tracking.</li>
                                <li>Maintain Library, Inventory, Transport, Hostel, and Placement records seamlessly.</li>
                                <li>Utilize Student & Counsellor mobile apps for instant communication.</li>
                                <li>Configure role-based access permissions for system security.</li>
                                <li>Create Tests and upload Test results.</li>
                                <li>Set up SMS/Email configuration..</li>
                                <li>Send SMS/Email reminders for payments.</li>
                                <li>Send Android messages to parent.</li>
                                <li>Add Instructors and set up their salaries.</li>
                                <li>Managing Leave categories and employee leave applications with admin approvals.</li>
                                <li>Manage Staff Loan and Pay their salaries from Software.</li>
                                <li>Set up Expense Category and Create expense records daily basis.</li>
                                <li>Maintain Library, Asset, Inventory, Transport, Hostel and Health records very records very easily.</li>
                                <li>Maintain Placement and external exams.</li>
                                <li>Student App for Direct Communication with Student / Parent. (If Registered).</li>
                                <li>Counsellor Android App, they need not have PCs or laptops.</li>
                                <li>Add more users and user roles with login securities.</li>
                            </ol>
                            <!-- Footer Support Info -->
                            <table role='presentation' width='100%' cellspacing='0' cellpadding='0' border='0' style='margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;'>
                                <tr>
                                    <td style='font-size: 13px; color: #666666; line-height: 1.5;'>
                                        <p style='margin: 0 0 8px 0;'>If you have any questions or need assistance, our team is here to help.</p>
                                        <p style='margin: 0;'>
                                            <strong>Customer Support</strong><br/>
                                            Techior Solutions Pvt. Ltd.<br/>
                                            Phone: <a href='tel:9766616435' style='color: #0f4c81; text-decoration: none;'>9766616435</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer Note -->
                    <tr>
                        <td style='background-color: #f8f9fa; padding: 15px 30px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;'>
                            Thank you for choosing Institute Magica.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>");

            return sb.ToString();
        }

        private string GenerateAdminNotificationEmailBody(string instituteName, string address, string contactPerson, string phone, string email, string remarks, string ipAddress, string noOfStudents, string coachingFor, DateTime dt)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("Dear Admin,<br /><br />You have received a new enquiry. Details are given below: <br /><br />");
            sb.AppendLine($"<span>Institute Name: </span>{instituteName}<br />");
            sb.AppendLine($"<span>Address: </span>{address}<br />");
            sb.AppendLine($"<span>Contact Person: </span>{contactPerson}<br />");
            sb.AppendLine($"<span>Phone: </span>{phone}<br />");
            sb.AppendLine($"<span>Email: </span>{email}<br />");
            sb.AppendLine($"<span>Remarks: </span>{remarks}<br/>");
            sb.AppendLine($"<span>IP Address: </span>{ipAddress}<br/>");
            sb.AppendLine($"<span>Enquiry Time: </span>{dt:dd/MM/yyyy hh:mm tt}<br/>");
            sb.AppendLine($"<span>No. of Students : </span>{noOfStudents}<br/>");
            sb.AppendLine($"<span>Provide Coaching For: </span>{coachingFor}<br/><br /><br />");
            sb.AppendLine("Best Regards,<br/><span>Techior Solutions Pvt.Ltd.</span>");

            return sb.ToString();
        }

        private string GeneratePasswordChangeEmailBody(string username, string passwordChangeUrl)
        {
            string urlHtml = $"<a href='{passwordChangeUrl}' target='blank'>{passwordChangeUrl}</a>";

            StringBuilder sb = new StringBuilder();
            sb.AppendLine($"Dear {username},<br /><br />");
            sb.AppendLine("To keep your data safe, we suggest that you change the password after you register.<br /><br/>");
            sb.AppendLine("You can change your password by clicking here.:<br/>");
            sb.AppendLine($"{urlHtml}<br/><br/>");
            sb.AppendLine("<span style=font-weight:bold;>Customer Support</span><br/>Techior Solutions Pvt. Ltd.<br/>9766616435");

            return sb.ToString();
        }
        public async Task SendPasswordResetEmailAsync(string userEmail, string userName, string resetToken, EmailSettings emailSettings)
        {
            string baseUrl = _configuration["AppSettings:FrontendUrl"] ?? "";
            string resetLink = $"{baseUrl.TrimEnd('/')}/institute-magica/reset-password?token={resetToken}";
            string subject = "Institute Magica: Password Assistance";
            string emailBody = GetPasswordResetTemplate(userName, resetLink);
            string mailHost = Convert.ToString(emailSettings.MailHost);
            string mailFrom = Convert.ToString(emailSettings.MailFrom.Trim());
            string smtpUser = Convert.ToString(emailSettings.EmailUser.Trim());
            string smtpPass = Convert.ToString(emailSettings.EmailPassword);
            bool enSSL = Convert.ToBoolean(emailSettings.EnableSsl);
            int comPort = 25; // Default fallback port
            var rawPort = emailSettings.PortNo;
            if (rawPort != null && !string.IsNullOrEmpty(rawPort.ToString()))
            {
                comPort = Convert.ToInt32(rawPort);
            }

            // 3. Configure SMTP Client
            using var smtp = new SmtpClient();
            smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtp.Host = mailHost;
            smtp.Port = comPort;
            smtp.UseDefaultCredentials = false;
            smtp.Credentials = new NetworkCredential(smtpUser, smtpPass);

            if (enSSL)
            {
                smtp.EnableSsl = true;
            }

            // 4. Create Mail Message
            using var mail = new MailMessage();
            mail.From = new MailAddress(mailFrom, "Institute Magica");
            mail.To.Add(new MailAddress(userEmail.Trim()));
            mail.Subject = subject;
            mail.Body = GetPasswordResetTemplate(userName, resetLink);
            mail.IsBodyHtml = true;

            // 5. Send Email
            await smtp.SendMailAsync(mail);
            //return true;
        }
        private string GetPasswordResetTemplate(string username, string resetLink)
        {
            return $@"
            <!DOCTYPE html>
            <html lang=""en"">
            <head>
                <meta charset=""UTF-8"">
                <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                <title>Password Reset</title>
            </head>
            <body style=""margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif;"">
            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #f4f6f8; padding: 20px 0;"">
            <tr>
            <td align=""center"">
                <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;"">
                    <tr>
                        <td align=""center"" style=""background-color: #0f4c81; padding: 24px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;"">Institute Magica</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style=""padding: 32px 28px; color: #333333;"">
                            <h2 style=""margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 600;"">Password Assistance Request</h2>
                            <p style=""margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #4b5563;"">
                                Hello <strong style=""color: #111827;"">{username}</strong>,
                            </p>
                            <p style=""margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;"">
                                We received a request to reset your password. Click the button below to proceed. This link expires in <strong>30 minutes</strong>.
                            </p>
                            <table border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""margin-bottom: 28px;"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{resetLink}"" target=""_blank"" style=""background-color: #0f4c81; color: #ffffff; display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;"">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style=""margin: 0 0 8px 0; font-size: 12px; color: #6b7280;"">If the button above doesn't work, copy and paste this link into your browser:</p>
                            <p style=""margin: 0 0 24px 0; font-size: 12px; color: #0f4c81; word-break: break-all;"">
                                <a href=""{resetLink}"" style=""color: #0f4c81; text-decoration: underline;"">{resetLink}</a>
                            </p>
                            <hr style=""border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"" />
                            <p style=""margin: 0; font-size: 12px; color: #9ca3af;"">
                                If you did not request a password reset, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align=""center"" style=""background-color: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb; text-align: center;"">
                            <p style=""margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;"">Techior Solutions Pvt. Ltd.</p>
                            <p style=""margin: 0; font-size: 11px; color: #9ca3af;"">&copy; Institute Magica. All rights reserved.</p>
                        </td>
                    </tr>
            </table>
            </td>
            </tr>
            </table>
            </body>
            </html>";
        }

        public async Task SendBranchCreationEmailAsync(int instituteId, int branchId, string branchName, string instituteName)
        {
            try
            {
                using IDbConnection db = _dbFactory.CreateConnection();

                // Get email configuration from database
                var emailConfig = await db.QueryFirstOrDefaultAsync(BranchQueries.GetEmailConfig,
                    new { InstituteId = instituteId, BranchId = 0 });

                if (emailConfig == null)
                {
                    Console.WriteLine("Email configuration not found");
                    return;
                }

                // Get admin emails
                var adminEmails = await db.QueryAsync(BranchQueries.GetAdminEmail,
                    new { InstituteId = instituteId });

                if (adminEmails == null || !adminEmails.Any())
                {
                    Console.WriteLine("No admin emails found");
                    return;
                }

                string mailHost = emailConfig.Smtp_Server?.ToString() ?? "mail.institutemagica.com";
                string mailFrom = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailUsername = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailPassword = emailConfig.Email_Pwd?.ToString() ?? "";
                bool enableSsl = emailConfig.EnableSsl != null && Convert.ToBoolean(emailConfig.EnableSsl);
                int port = 25;
                if (emailConfig.Portno != null && !string.IsNullOrEmpty(emailConfig.Portno.ToString()))
                {
                    port = Convert.ToInt32(emailConfig.Portno);
                }

                using (var smtpClient = new SmtpClient(mailHost, port))
                {
                    smtpClient.EnableSsl = enableSsl;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(mailUsername, mailPassword);

                    string subject = "INSTITUTE MAGICA: New Branch Registration";
                    string body = GenerateBranchCreationEmailBody(branchName, instituteName);

                    foreach (var admin in adminEmails)
                    {
                        if (!string.IsNullOrEmpty(admin.Email))
                        {
                            var mailMessage = new MailMessage
                            {
                                From = new MailAddress(mailFrom, "Institute Magica"),
                                Subject = subject,
                                Body = body,
                                IsBodyHtml = true
                            };
                            mailMessage.To.Add(admin.Email);
                            await smtpClient.SendMailAsync(mailMessage);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }
        }

        private string GenerateBranchCreationEmailBody(string branchName, string instituteName)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("Dear Admin,<br /><br />");
            sb.AppendLine($"&nbsp;&nbsp;&nbsp; New Branch <span style=font-weight:bold;>{branchName}</span> has been registered in your institute {System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}.");
            sb.AppendLine("<br /><br />Best Regards,<br/>");
            sb.AppendLine(System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower()));

            return sb.ToString();
        }

        public async Task SendStudentRegistrationEmailAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentEmail, string courseName, string instituteName, string username, string password, string regDate, int allowStudModule = 0)
        {
            try
            {
                // Get email configuration from database
                var emailConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetEmailConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (emailConfig == null || string.IsNullOrEmpty(emailConfig.Smtp_Server))
                {
                    Console.WriteLine("Email configuration not found");
                    return;
                }

                string mailHost = emailConfig.Smtp_Server?.ToString() ?? "mail.institutemagica.com";
                string mailFrom = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailUsername = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailPassword = emailConfig.Email_Pwd?.ToString() ?? "";
                bool enableSsl = emailConfig.EnableSsl != null && Convert.ToBoolean(emailConfig.EnableSsl);
                int port = 25;
                if (emailConfig.Portno != null && !string.IsNullOrEmpty(emailConfig.Portno.ToString()))
                {
                    port = Convert.ToInt32(emailConfig.Portno);
                }

                using (var smtpClient = new SmtpClient(mailHost, port))
                {
                    smtpClient.EnableSsl = enableSsl;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(mailUsername, mailPassword);

                    // Send simple email to student with credentials if allowstudmodule == 1
                    if (allowStudModule == 1 && !string.IsNullOrEmpty(studentEmail))
                    {
                        string subject = $"{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}: Student Registration Details";
                        string body = $@"Dear {studentName},<br /><br /><p>&nbsp;&nbsp;&nbsp;Please download Institute Magica for Students app from PlayStore. <br/><br/>&nbsp;&nbsp;&nbsp; Your login credentials are as follows:<br/><br/>&nbsp;&nbsp;&nbsp; <span style=font-weight:bold;>Username: </span>{username}<br/>&nbsp;&nbsp;&nbsp; <span style=font-weight:bold;>Password: </span>{password}<br /><br />Best Regards,<br/>{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}</p>";

                        var mailMessage = new MailMessage
                        {
                            From = new MailAddress(mailFrom, "Institute Magica"),
                            Subject = subject,
                            Body = body,
                            IsBodyHtml = true
                        };
                        mailMessage.To.Add(studentEmail);
                        await smtpClient.SendMailAsync(mailMessage);

                        // Log email
                        await AddEmailLog(db, studentEmail, subject, body, instituteId, branchId);
                    }

                    // Get email announcement settings
                    var emailAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetEmailAnnouncement,
                        new { InstId = instituteId, BranchId = branchId });

                    if (emailAnnouncement == null)
                    {
                        Console.WriteLine("Email announcement settings not found");
                        return;
                    }

                    // Send Email to institute/branch admin
                    if (!string.IsNullOrEmpty(emailAnnouncement.registrationemailids) && emailAnnouncement.registrationsetting.ToString() == "1")
                    {
                        string subject = $"{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}: New Student Registration";
                        string body = $"New Student {studentName} has been enrolled in your institute for course {courseName}";
                        string[] emailIds = emailAnnouncement.registrationemailids.ToString().Replace("\n", "").Split(';');
                        string emailIdsList = string.Empty;

                        foreach (string emailId in emailIds)
                        {
                            if (!string.IsNullOrEmpty(emailId.Trim()))
                            {
                                var mailMessage = new MailMessage
                                {
                                    From = new MailAddress(mailFrom, "Institute Magica"),
                                    Subject = subject,
                                    Body = body,
                                    IsBodyHtml = true
                                };
                                mailMessage.To.Add(emailId.Trim());
                                await smtpClient.SendMailAsync(mailMessage);
                                emailIdsList += emailId.Trim() + ";";
                            }
                        }
                        // Log email
                        await AddEmailLog(db, emailIdsList, subject, body, instituteId, branchId);
                    }

                    // Send Email to student/parent for registration
                    if (!string.IsNullOrEmpty(studentEmail) && emailAnnouncement.registrationsetting.ToString() == "1" && !string.IsNullOrEmpty(emailAnnouncement.registrationtemplate?.ToString()))
                    {
                        string template = emailAnnouncement.registrationtemplate.ToString();
                        string body = ReplaceEmailTemplatePlaceholders(template, studentName, regDate, courseName, instituteName);
                        string subject = $"{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}: New Student Registration";

                        var mailMessage = new MailMessage
                        {
                            From = new MailAddress(mailFrom, "Institute Magica"),
                            Subject = subject,
                            Body = body,
                            IsBodyHtml = true
                        };
                        mailMessage.To.Add(studentEmail);
                        await smtpClient.SendMailAsync(mailMessage);

                        // Log email
                        await AddEmailLog(db, studentEmail, subject, body, instituteId, branchId);
                    }

                    // Send Email to student/parent for username/password (only if allowstudmodule == 1)
                    if (allowStudModule == 1 && !string.IsNullOrEmpty(studentEmail) && emailAnnouncement.userpasswordsetting.ToString() == "1" && !string.IsNullOrEmpty(emailAnnouncement.userpasswordtemplate?.ToString()))
                    {
                        string template = emailAnnouncement.userpasswordtemplate.ToString();
                        string body = ReplaceEmailTemplatePlaceholders(template, studentName, regDate, courseName, instituteName, username, password);
                        string subject = $"{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}: UserName Password";

                        var mailMessage = new MailMessage
                        {
                            From = new MailAddress(mailFrom, "Institute Magica"),
                            Subject = subject,
                            Body = body,
                            IsBodyHtml = true
                        };
                        mailMessage.To.Add(studentEmail);
                        await smtpClient.SendMailAsync(mailMessage);

                        // Log email
                        await AddEmailLog(db, studentEmail, subject, body, instituteId, branchId);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }
        }

        private string ReplaceEmailTemplatePlaceholders(string template, string studentName, string regDate, string courseName, string instituteName, string username = "", string password = "")
        {
            if (string.IsNullOrEmpty(template))
                return template;

            string result = template.Replace("\n", "\r\n");
            string[] parts = result.Split('[');
            result = string.Empty;

            foreach (string part in parts)
            {
                if (part.Contains(']'))
                {
                    string[] subParts = part.Split(']');
                    string replacedPart = string.Empty;

                    foreach (string subPart in subParts)
                    {
                        string replacement = subPart;
                        switch (subPart)
                        {
                            case "Student Name":
                                replacement = studentName;
                                break;
                            case "Date":
                                replacement = regDate;
                                break;
                            case "Course Name":
                                replacement = courseName;
                                break;
                            case "Institute Name":
                                replacement = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower());
                                break;
                            case "Username":
                                replacement = username;
                                break;
                            case "Password":
                                replacement = password;
                                break;
                            case "Link":
                                replacement = "<a href='https://www.institutemagica.com/Students'>here</a>";
                                break;
                        }
                        replacedPart += replacement;
                    }
                    result += replacedPart;
                }
                else
                {
                    result += part;
                }
            }

            return result;
        }

        private async Task AddEmailLog(IDbConnection db, string emailId, string subject, string body, int instituteId, int branchId)
        {
            try
            {
                await db.ExecuteAsync(StudentQueries.InsertEmailLog,
                    new
                    {
                        EmailId = emailId,
                        Subject = subject,
                        EmailDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                        EmailText = body,
                        InstituteId = instituteId,
                        BranchId = branchId
                    });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to add email log: {ex.Message}");
            }
        }

        public async Task SendEnquiryEmailAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentEmail, string courseName, string instituteName, string regDate)
        {
            try
            {
                // Get email configuration from database
                var emailConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetEmailConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (emailConfig == null || string.IsNullOrEmpty(emailConfig.Smtp_Server))
                {
                    Console.WriteLine("Email configuration not found");
                    return;
                }

                string mailHost = emailConfig.Smtp_Server?.ToString() ?? "mail.institutemagica.com";
                string mailFrom = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailUsername = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailPassword = emailConfig.Email_Pwd?.ToString() ?? "";
                bool enableSsl = emailConfig.EnableSsl != null && Convert.ToBoolean(emailConfig.EnableSsl);
                int port = 25;
                if (emailConfig.Portno != null && !string.IsNullOrEmpty(emailConfig.Portno.ToString()))
                {
                    port = Convert.ToInt32(emailConfig.Portno);
                }

                using (var smtpClient = new SmtpClient(mailHost, port))
                {
                    smtpClient.EnableSsl = enableSsl;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(mailUsername, mailPassword);

                    // Get email enquiry announcement settings
                    var emailEnquiryAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetEmailEnquiryAnnouncement,
                        new { InstId = instituteId, BranchId = branchId });

                    if (emailEnquiryAnnouncement != null)
                    {
                        // Send Email to institute/branch admin (directors)
                        if (!string.IsNullOrEmpty(emailEnquiryAnnouncement.enquiryemailids) && emailEnquiryAnnouncement.enquirysetting.ToString() == "1")
                        {
                            string subject = $"{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}: New Student Enquiry";
                            string body = $"Dear Sir,<br /><br /><p>&nbsp;&nbsp;&nbsp; New Student <span style=font-weight:bold;>{studentName}</span> has done an enquiry in your institute for course <span style=font-weight:bold;color:#000066;>{courseName}.</span><br /><br />Best Regards,<br/>{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}</p>";
                            string[] emailIds = emailEnquiryAnnouncement.enquiryemailids.ToString().Replace("\n", "").Split(';');
                            string emailIdsList = string.Empty;

                            foreach (string emailId in emailIds)
                            {
                                if (!string.IsNullOrEmpty(emailId.Trim()))
                                {
                                    var mailMessage = new MailMessage
                                    {
                                        From = new MailAddress(mailFrom, "Institute Magica"),
                                        Subject = subject,
                                        Body = body,
                                        IsBodyHtml = true
                                    };
                                    mailMessage.To.Add(emailId.Trim());
                                    await smtpClient.SendMailAsync(mailMessage);
                                    emailIdsList += emailId.Trim() + ";";
                                }
                            }
                            // Log email
                            await AddEmailLog(db, emailIdsList, subject, body, instituteId, branchId);
                        }

                        // Send Email to student/parent for enquiry
                        if (!string.IsNullOrEmpty(studentEmail) && emailEnquiryAnnouncement.enquirysetting.ToString() == "1" && !string.IsNullOrEmpty(emailEnquiryAnnouncement.enquirytemplate?.ToString()))
                        {
                            string template = emailEnquiryAnnouncement.enquirytemplate.ToString();
                            string body = ReplaceEmailTemplatePlaceholders(template, studentName, regDate, courseName, instituteName);
                            string subject = $"{System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower())}: New Student Enquiry";

                            var mailMessage = new MailMessage
                            {
                                From = new MailAddress(mailFrom, "Institute Magica"),
                                Subject = subject,
                                Body = body,
                                IsBodyHtml = true
                            };
                            mailMessage.To.Add(studentEmail);
                            await smtpClient.SendMailAsync(mailMessage);

                            // Log email
                            await AddEmailLog(db, studentEmail, subject, body, instituteId, branchId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Enquiry email sending failed: {ex.Message}");
            }
        }

        public async Task SendUsernamePasswordEmailAsync(IDbConnection db, int instituteId, int branchId, string studentName, string email, string username, string password, string instituteName)
        {
            try
            {
                var emailConfig = await db.QueryFirstOrDefaultAsync<dynamic>(
                    StudentQueries.GetEmailAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (emailConfig == null) return;

                var announcement = await db.QueryFirstOrDefaultAsync<dynamic>(
                    StudentQueries.GetUsernamePasswordEmailAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (announcement == null || announcement.userpasswordsetting != "1") return;

                string template = announcement.userpasswordtemplate ?? string.Empty;

                string emailBody = ReplaceEmailTemplatePlaceholders(template, studentName, "", "", instituteName, username, password);

                string subject = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower()) + ": UserName Password";

                await AddEmailLog(db, email, subject, emailBody, instituteId, branchId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Username/Password email sending failed: {ex.Message}");
            }
        }

        public async Task SendEnquiryAllocationEmailAsync(IDbConnection db, int instituteId, int branchId, string userId, string userName)
        {
            try
            {
                // Get email configuration from database (fncConfigEmail with type="Email")
                var emailConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetEmailConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (emailConfig == null || string.IsNullOrEmpty(emailConfig.Smtp_Server))
                {
                    Console.WriteLine("Email configuration not found");
                    return;
                }

                // Get user details
                var userDetails = await db.QueryFirstOrDefaultAsync(
                    StudentQueries.GetUserEmail,
                    new { InstituteId = instituteId, BranchId = branchId, UserId = userId });

                if (userDetails == null || string.IsNullOrEmpty(userDetails.Email))
                {
                    Console.WriteLine("User email not found");
                    return;
                }

                string mailHost = emailConfig.Smtp_Server?.ToString() ?? "mail.institutemagica.com";
                string mailFrom = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailUsername = emailConfig.Email_User?.ToString() ?? "support@institutemagica.com";
                string mailPassword = emailConfig.Email_Pwd?.ToString() ?? "";
                bool enableSsl = emailConfig.EnableSsl != null && Convert.ToBoolean(emailConfig.EnableSsl);
                int port = 25;
                if (emailConfig.Portno != null && !string.IsNullOrEmpty(emailConfig.Portno.ToString()))
                {
                    port = Convert.ToInt32(emailConfig.Portno);
                }

                using (var smtpClient = new SmtpClient(mailHost, port))
                {
                    smtpClient.EnableSsl = enableSsl;
                    smtpClient.UseDefaultCredentials = false;
                    smtpClient.Credentials = new NetworkCredential(mailUsername, mailPassword);

                    string subject = "Enquiry Allocation";
                    string body = @"Dear " + userName + ",<br /><br />&nbsp;&nbsp;&nbsp; Some enquiries have been allocated to you by admin please check.<br /><br />Best Regards,<br/><span>Techior Solutions Pvt.Ltd.</span>";

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(mailFrom, "Institute Magica"),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };
                    mailMessage.To.Add(userDetails.Email);
                    await smtpClient.SendMailAsync(mailMessage);

                    // Log email
                    await AddEmailLog(db, userDetails.Email, subject, body, instituteId, branchId);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }
        }
    }
}
