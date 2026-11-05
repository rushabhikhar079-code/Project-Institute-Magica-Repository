using Dapper;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Services
{
    public class WhatsAppService : IWhatsAppService
    {
        public async Task SendStudentRegistrationWhatsAppAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string username, string password, string regDate, string regNo = "")
        {
            try
            {
                // Get WhatsApp config from database
                var whatsappConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetWhatsAppConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (whatsappConfig == null || string.IsNullOrEmpty(whatsappConfig.AccountSID))
                {
                    Console.WriteLine("WhatsApp configuration not found");
                    return;
                }

                string whatappKey = whatsappConfig.AccountSID?.ToString() ?? string.Empty;
                string whatsappName = whatsappConfig.AppName?.ToString() ?? string.Empty;
                string whatsappNumber = whatsappConfig.WhatsAppNumber?.ToString() ?? string.Empty;

                // Get institute mobile number from branch
                var branchMobile = await db.QueryFirstOrDefaultAsync(StudentQueries.GetBranchMobile,
                    new { BranchId = branchId, InstId = instituteId });
                string mobileNumber = branchMobile?.Phone?.ToString() ?? string.Empty;

                // Send WhatsApp to student/parent for registration
                var whatsappAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetWhatsAppAnnouncement,
                    new { InstId = instituteId, BranchId = branchId, SettingType = "Registration" });

                if (whatsappAnnouncement != null && whatsappAnnouncement.status.ToString() == "1")
                {
                    string template = whatsappAnnouncement.templateBody?.ToString() ?? string.Empty;
                    string message = ReplaceWhatsAppTemplatePlaceholders(template, studentName, regDate, courseName, instituteName, mobileNumber);
                    string templateName = whatsappAnnouncement.wabaTemplateName?.ToString() ?? string.Empty;

                    // Extract parameter values for WhatsApp template
                    var parameterValues = ExtractParameterValues(template, studentName, regDate, courseName, instituteName, mobileNumber);

                    // Whitelist check before sending
                    if (await WhitelistWhatsappNumber(whatappKey, studentMobile))
                    {
                        // TODO: Call WhatsApp API with whatappKey, whatsappName, whatsappNumber, studentMobile, message, templateName, parameterValues
                        Console.WriteLine($"Sending WhatsApp to student: {studentMobile} - Template: {templateName}");
                    }
                }

                // Send WhatsApp to student/parent for username/password
                var whatsappAnnouncementUP = await db.QueryFirstOrDefaultAsync(StudentQueries.GetWhatsAppAnnouncement,
                    new { InstId = instituteId, BranchId = branchId, SettingType = "Username Password" });

                if (whatsappAnnouncementUP != null && whatsappAnnouncementUP.status.ToString() == "1")
                {
                    string template = whatsappAnnouncementUP.templateBody?.ToString() ?? string.Empty;
                    string message = ReplaceWhatsAppTemplatePlaceholders(template, studentName, regDate, courseName, instituteName, mobileNumber, username, password);
                    string templateName = whatsappAnnouncementUP.wabaTemplateName?.ToString() ?? string.Empty;

                    // Extract parameter values for WhatsApp template (with regNo for username/password)
                    var parameterValues = ExtractParameterValues(template, studentName, regDate, courseName, instituteName, mobileNumber, username, password, regNo);

                    // Whitelist check before sending
                    if (await WhitelistWhatsappNumber(whatappKey, studentMobile))
                    {
                        // TODO: Call WhatsApp API with whatappKey, whatsappName, whatsappNumber, studentMobile, message, templateName, parameterValues
                        Console.WriteLine($"Sending WhatsApp to student for credentials: {studentMobile} - Template: {templateName}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"WhatsApp sending failed: {ex.Message}");
            }
        }


        private string ReplaceWhatsAppTemplatePlaceholders(string template, string studentName, string regDate, string courseName, string instituteName, string mobileNo, string username = "", string password = "")
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
                                replacement = "https://www.institutemagica.com/Students/";
                                break;
                            case "Mobile No":
                                replacement = mobileNo;
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

            return result.Replace("\r\n", "\n");
        }

        private System.Collections.Generic.List<string> ExtractParameterValues(string template, string studentName, string regDate, string courseName, string instituteName, string mobileNo, string username = "", string password = "", string regNo = "")
        {
            var parameterValues = new System.Collections.Generic.List<string>();

            if (string.IsNullOrEmpty(template))
                return parameterValues;

            string[] parts = template.Replace("\n", "\r\n").Split('[');

            foreach (string part in parts)
            {
                if (part.Contains(']'))
                {
                    string[] subParts = part.Split(']');

                    foreach (string subPart in subParts)
                    {
                        string value = subPart;
                        switch (subPart)
                        {
                            case "Student Name":
                                value = studentName;
                                break;
                            case "Date":
                                value = regDate;
                                break;
                            case "Course Name":
                                value = courseName;
                                break;
                            case "Institute Name":
                                value = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(instituteName.ToLower());
                                break;
                            case "Username":
                                value = username;
                                break;
                            case "Password":
                                value = password;
                                break;
                            case "Link":
                                value = "https://www.institutemagica.com/Students/";
                                break;
                            case "Mobile No":
                                value = mobileNo;
                                break;
                            case "Registration Number":
                                value = regNo;
                                break;
                        }
                        if (!string.IsNullOrEmpty(value) && value != subPart)
                        {
                            parameterValues.Add(value);
                        }
                    }
                }
            }

            return parameterValues;
        }

        private async Task<bool> WhitelistWhatsappNumber(string apiKey, string mobileNumber)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    var request = new HttpRequestMessage(HttpMethod.Post, $"https://api.gupshup.io/sm/api/v1/app/opt/in/{apiKey}");
                    request.Headers.Add("Cache-Control", "no-cache");
                    request.Headers.Add("Content-Type", "application/x-www-form-urlencoded");
                    request.Headers.Add("apikey", apiKey);

                    var content = new FormUrlEncodedContent(new[]
                    {
                        new KeyValuePair<string, string>("user", mobileNumber)
                    });
                    request.Content = content;

                    var response = await httpClient.SendAsync(request);
                    return response.IsSuccessStatusCode;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"WhatsApp whitelist failed: {ex.Message}");
                return false;
            }
        }

        public async Task SendEnquiryWhatsAppAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string regDate)
        {
            try
            {
                // Get WhatsApp config from database
                var whatsappConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetWhatsAppConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (whatsappConfig == null || string.IsNullOrEmpty(whatsappConfig.AccountSID))
                {
                    Console.WriteLine("WhatsApp configuration not found");
                    return;
                }

                string whatappKey = whatsappConfig.AccountSID?.ToString() ?? string.Empty;
                string whatsappName = whatsappConfig.AppName?.ToString() ?? string.Empty;
                string whatsappNumber = whatsappConfig.WhatsAppNumber?.ToString() ?? string.Empty;

                // Get institute mobile number from branch
                var branchMobile = await db.QueryFirstOrDefaultAsync(StudentQueries.GetBranchMobile,
                    new { BranchId = branchId, InstId = instituteId });
                string mobileNumber = branchMobile?.Phone?.ToString() ?? string.Empty;

                // Send WhatsApp to student/parent for enquiry
                var whatsappAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetWhatsAppAnnouncement,
                    new { InstId = instituteId, BranchId = branchId, SettingType = "Enquiry" });

                if (whatsappAnnouncement != null && whatsappAnnouncement.status.ToString() == "1")
                {
                    string template = whatsappAnnouncement.templateBody?.ToString() ?? string.Empty;
                    string message = ReplaceWhatsAppTemplatePlaceholders(template, studentName, regDate, courseName, instituteName, mobileNumber);
                    string templateName = whatsappAnnouncement.wabaTemplateName?.ToString() ?? string.Empty;

                    // Extract parameter values for WhatsApp template
                    var parameterValues = ExtractParameterValues(template, studentName, regDate, courseName, instituteName, mobileNumber);

                    // Whitelist check before sending
                    if (await WhitelistWhatsappNumber(whatappKey, studentMobile))
                    {
                        // TODO: Call WhatsApp API with whatappKey, whatsappName, whatsappNumber, studentMobile, message, templateName, parameterValues
                        Console.WriteLine($"Sending WhatsApp to student for enquiry: {studentMobile} - Template: {templateName}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Enquiry WhatsApp sending failed: {ex.Message}");
            }
        }
    }
}
