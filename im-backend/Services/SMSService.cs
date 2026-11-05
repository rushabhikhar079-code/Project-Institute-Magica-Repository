using Dapper;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Services
{
    public class SMSService : ISMSService
    {
        public async Task SendStudentRegistrationSMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string username, string password, string regDate)
        {
            try
            {
                // Get SMS config from database
                var smsConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetSMSConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (smsConfig == null || string.IsNullOrEmpty(smsConfig.SMS_Server))
                {
                    Console.WriteLine("SMS configuration not found");
                    return;
                }

                // Get SMS announcement settings
                var smsAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetSMSAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (smsAnnouncement == null)
                {
                    Console.WriteLine("SMS announcement settings not found");
                    return;
                }

                string smsServer = smsConfig.SMS_Server?.ToString() ?? string.Empty;
                int msgEncode = smsConfig.MsgEncode != null ? Convert.ToInt32(smsConfig.MsgEncode) : 0;

                // Send SMS to institute/branch admin
                if (!string.IsNullOrEmpty(smsAnnouncement.registrationmobileno) && smsAnnouncement.registrationsetting.ToString() == "1")
                {
                    string smsText = $"New Student {studentName} has been enrolled in your institute for course {courseName}";
                    string mobileNo = smsAnnouncement.registrationmobileno?.ToString() ?? string.Empty;
                    // TODO: Call SMS API with smsServer, msgEncode, mobileNo, smsText, templateNo = string.Empty
                    Console.WriteLine($"Sending SMS to admin: {mobileNo} - {smsText}");

                    // Log SMS
                    await AddSMSLog(db, mobileNo, smsText, instituteId, branchId);
                }

                // Send SMS to student/parent for registration
                if (smsAnnouncement.registrationsetting.ToString() == "1" && !string.IsNullOrEmpty(studentMobile))
                {
                    string template = smsAnnouncement.registrationtemplate?.ToString() ?? string.Empty;
                    string smsText = ReplaceSMSTemplatePlaceholders(template, studentName, regDate, courseName, instituteName);
                    string templateNo = smsAnnouncement.registrationtemplateno?.ToString() ?? string.Empty;
                    // TODO: Call SMS API with smsServer, msgEncode, studentMobile, smsText, templateNo
                    Console.WriteLine($"Sending SMS to student: {studentMobile} - {smsText}");

                    // Log SMS
                    await AddSMSLog(db, studentMobile, smsText, instituteId, branchId);
                }

                // Send SMS to student/parent for username/password
                if (smsAnnouncement.usernamepasswordsetting.ToString() == "1" && !string.IsNullOrEmpty(studentMobile))
                {
                    string template = smsAnnouncement.usernamepasswordtemplate?.ToString() ?? string.Empty;
                    string smsText = ReplaceSMSTemplatePlaceholders(template, studentName, regDate, courseName, instituteName, username, password);
                    string templateNo = smsAnnouncement.usernamepasswordtemplateno?.ToString() ?? string.Empty;
                    // TODO: Call SMS API with smsServer, msgEncode, studentMobile, smsText, templateNo
                    Console.WriteLine($"Sending SMS to student for credentials: {studentMobile} - {smsText}");

                    // Log SMS
                    await AddSMSLog(db, studentMobile, smsText, instituteId, branchId);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SMS sending failed: {ex.Message}");
            }
        }

        private string ReplaceSMSTemplatePlaceholders(string template, string studentName, string regDate, string courseName, string instituteName, string username = "", string password = "")
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

        private async Task AddSMSLog(IDbConnection db, string mobileNo, string message, int instituteId, int branchId)
        {
            try
            {
                string escapedMessage = message?.Replace("'", "''") ?? "";
                await db.ExecuteAsync(StudentQueries.InsertSMSLog,
                    new
                    {
                        MobileNo = mobileNo,
                        MsgDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                        Message = escapedMessage,
                        InstituteId = instituteId,
                        BranchId = branchId
                    });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to add SMS log: {ex.Message}");
            }
        }

        public async Task SendEnquirySMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string regDate)
        {
            try
            {
                // Get SMS config from database
                var smsConfig = await db.QueryFirstOrDefaultAsync(StudentQueries.GetSMSConfig,
                    new { InstId = instituteId, BranchId = branchId });

                if (smsConfig == null || string.IsNullOrEmpty(smsConfig.SMS_Server))
                {
                    Console.WriteLine("SMS configuration not found");
                    return;
                }

                string smsServer = smsConfig.SMS_Server?.ToString() ?? string.Empty;
                int msgEncode = smsConfig.MsgEncode != null ? Convert.ToInt32(smsConfig.MsgEncode) : 0;

                // Send SMS to institute/branch admin (directors)
                var directorAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetDirectorAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (directorAnnouncement != null && !string.IsNullOrEmpty(directorAnnouncement.directortemplate?.ToString()) && directorAnnouncement.directorsetting.ToString() == "1")
                {
                    string template = directorAnnouncement.directortemplate.ToString();
                    string smsText = ReplaceSMSTemplatePlaceholders(template, studentName, regDate, courseName, instituteName);
                    string templateNo = directorAnnouncement.directortemplateno?.ToString() ?? string.Empty;
                    // TODO: Call SMS API with smsServer, msgEncode, studentMobile, smsText, templateNo
                    Console.WriteLine($"Sending SMS to director: {studentMobile} - {smsText}");

                    // Log SMS
                    await AddSMSLog(db, studentMobile, smsText, instituteId, branchId);
                }

                // Send SMS to student/parent for enquiry
                var smsAnnouncement = await db.QueryFirstOrDefaultAsync(StudentQueries.GetEnquiryAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (smsAnnouncement != null && smsAnnouncement.enquirysetting.ToString() == "1" && !string.IsNullOrEmpty(studentMobile))
                {
                    string template = smsAnnouncement.enquirytemplate?.ToString() ?? string.Empty;
                    string smsText = ReplaceSMSTemplatePlaceholders(template, studentName, regDate, courseName, instituteName);
                    string templateNo = smsAnnouncement.enquirytemplateno?.ToString() ?? string.Empty;
                    // TODO: Call SMS API with smsServer, msgEncode, studentMobile, smsText, templateNo
                    Console.WriteLine($"Sending SMS to student for enquiry: {studentMobile} - {smsText}");

                    // Log SMS
                    await AddSMSLog(db, studentMobile, smsText, instituteId, branchId);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Enquiry SMS sending failed: {ex.Message}");
            }
        }

        public async Task SendCourseEnrollSMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string courseName, string instituteName)
        {
            try
            {
                var smsConfig = await db.QueryFirstOrDefaultAsync<dynamic>(
                    StudentQueries.GetSMSAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (smsConfig == null) return;

                var announcement = await db.QueryFirstOrDefaultAsync<dynamic>(
                    StudentQueries.GetCourseEnrollAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (announcement == null || announcement.courseenrollsetting != "1") return;

                string template = announcement.courseenrolltemplate ?? string.Empty;
                string templateNo = announcement.courseenrolltemplateno ?? string.Empty;
                string mobileNo = announcement.registrationmobileno ?? string.Empty;

                string smsText = ReplaceSMSTemplatePlaceholders(template, studentName, "", courseName, instituteName);

                await db.ExecuteAsync(StudentQueries.InsertSMSLog,
                    new
                    {
                        MobileNo = mobileNo,
                        SMSText = smsText,
                        InstId = instituteId,
                        BranchId = branchId,
                        TemplateNo = templateNo
                    });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Course enroll SMS sending failed: {ex.Message}");
            }
        }

        public async Task SendUsernamePasswordSMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string mobileNo, string username, string password, string instituteName)
        {
            try
            {
                var smsConfig = await db.QueryFirstOrDefaultAsync<dynamic>(
                    StudentQueries.GetSMSAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (smsConfig == null) return;

                var announcement = await db.QueryFirstOrDefaultAsync<dynamic>(
                    StudentQueries.GetUsernamePasswordAnnouncement,
                    new { InstId = instituteId, BranchId = branchId });

                if (announcement == null || announcement.usernamepasswordsetting != "1") return;

                string template = announcement.usernamepasswordtemplate ?? string.Empty;
                string templateNo = announcement.usernamepasswordtemplateno ?? string.Empty;

                string smsText = ReplaceSMSTemplatePlaceholders(template, studentName, "", "", instituteName, username, password);

                await db.ExecuteAsync(StudentQueries.InsertSMSLog,
                    new
                    {
                        MobileNo = mobileNo,
                        SMSText = smsText,
                        InstId = instituteId,
                        BranchId = branchId,
                        TemplateNo = templateNo
                    });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Username/Password SMS sending failed: {ex.Message}");
            }
        }
    }
}
