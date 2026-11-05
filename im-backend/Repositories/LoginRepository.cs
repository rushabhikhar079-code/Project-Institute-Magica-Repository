using Dapper;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.SqlQueries;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IM_backend.Repositories
{
    public class LoginRepository : ILoginRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LoginRepository(IDbConnectionFactory dbFactory, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _dbFactory = dbFactory;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<LoginModels?> GetLoginByUsernameAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Step 1: Check Super Admin
            var user = await db.QueryFirstOrDefaultAsync<LoginModels>(
                LoginQueries.GetLoginByUsername_SuperAdmin,
                new { Username = username });

            if (user != null)
            {
                return user;
            }

            // Step 2: Get Normal User
            user = await db.QueryFirstOrDefaultAsync<LoginModels>(
                LoginQueries.GetLoginByUsername,
                new { Username = username });

            if (user == null)
            {
                return null;
            }

            // Step 3: If Trainer/Admin/Faculty (Role 4,5,6), execute trainer query
            if (user.Role_Id == 4 || user.Role_Id == 5 || user.Role_Id == 6)
            {
                user = await db.QueryFirstOrDefaultAsync<LoginModels>(
                    LoginQueries.GetLoginByUsername_Trainer,
                    new { Username = username });
            }

            return user;
        }

        public async Task<LoginModels?> GetLoginByUserIdAsync(string userid)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Step 1: Check Super Admin
            var user = await db.QueryFirstOrDefaultAsync<LoginModels>(
                LoginQueries.GetLoginByUserId_SuperAdmin,
                new { User_Id = userid });

            if (user != null)
            {
                return user;
            }

            // Step 2: Get Normal User
            user = await db.QueryFirstOrDefaultAsync<LoginModels>(
                LoginQueries.GetLoginByUserId,
                new { User_Id = userid });

            if (user == null)
            {
                return null;
            }

            // Step 3: If Trainer/Admin/Faculty (Role 4,5,6), execute trainer query
            if (user.Role_Id == 4 || user.Role_Id == 5 || user.Role_Id == 6)
            {
                user = await db.QueryFirstOrDefaultAsync<LoginModels>(
                    LoginQueries.GetLoginByUserId_Trainer,
                    new { User_Id = userid });
            }

            return user;
        }

        public async Task<bool> UpdateLastLoginDateAsync(string username, string logDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(LoginQueries.UpdateLastLoginDate, new { Username = username, LogDate = logDate });
            return rowsAffected > 0;
        }

        public async Task<string?> GetRoleInfoAsync(int roleId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.GetRoleInfo, new { RoleId = roleId });
        }

        public async Task<bool> CheckStatusAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            string? status;
            if (branchId != 0)
            {
                status = await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.CheckStatusBranchwise, new { InstituteId = instituteId, BranchId = branchId });
            }
            else
            {
                status = await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.CheckInstituteStatus, new { InstituteId = instituteId });
            }
            return string.IsNullOrEmpty(status) || Convert.ToBoolean(status);
        }

        public async Task<int> UsersActivityAsync(UserActivityModels activity)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.ExecuteAsync(LoginQueries.UsersActivity, activity);
        }

        public async Task<List<BranchAdminModels>> GetAdminBranchesAsync(int userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<BranchAdminModels>(LoginQueries.GetAdminBranches, new { UserId = userId });
            return result.ToList();
        }

        public async Task<List<UserRoleAccessModels>> GetRoleAccessAsync(int roleId, int planId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            string query = planId != 0
                ? LoginQueries.GetRoleAccessWithPlan
                : LoginQueries.GetRoleAccess;

            var result = await db.QueryAsync<UserRoleAccessModels>(
                query,
                new
                {
                    RoleId = roleId,
                    PlanId = planId
                });

            return result.ToList();
        }

        public async Task<string?> GetTaxAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.GetTax, new { InstituteId = instituteId, BranchId = branchId });
        }

        // Plan expiry methods
        public async Task<PaymentHistoryModels?> CheckCurrentPlanExpiryAsync(int instituteId, string currentDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<PaymentHistoryModels?>(LoginQueries.CheckCurrentPlanExpiry, new { InstituteId = instituteId, CurrentDate = currentDate });
        }

        public async Task<PaymentHistoryModels?> CheckCurrentPlanHoldAsync(int instituteId, string currentDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<PaymentHistoryModels?>(LoginQueries.CheckCurrentPlanHold, new { InstituteId = instituteId, CurrentDate = currentDate });
        }

        public async Task<PaymentHistoryModels?> CheckFutureDatePlanExistsAsync(int instituteId, string currentDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<PaymentHistoryModels?>(LoginQueries.CheckFutureDatePlanExists, new { InstituteId = instituteId, CurrentDate = currentDate });
        }

        public async Task<PaymentHistoryModels?> CheckBackDatePlanExistsAsync(int instituteId, string currentDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<PaymentHistoryModels?>(LoginQueries.CheckBackDatePlanExists, new { InstituteId = instituteId, CurrentDate = currentDate });
        }

        public async Task<List<PaymentHistoryModels>> AllFutureDatePlanExistsAsync(int instituteId, string currentDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<PaymentHistoryModels>(LoginQueries.AllFutureDatePlanExists, new { InstituteId = instituteId, CurrentDate = currentDate });
            return result.ToList();
        }

        public async Task<bool> UpdatePlanStatusAsync(int paymentHistoryId, int userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(LoginQueries.UpdatePlanStatus, new { PaymentHistoryId = paymentHistoryId, UserId = userId });
            return rowsAffected > 0;
        }

        public async Task<bool> UpdateInstituteStatusAsync(int instituteId, int instituteStatus, int regType)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(LoginQueries.UpdateInstituteStatus, new { InstituteId = instituteId, InstituteStatus = instituteStatus, RegType = regType });
            return rowsAffected > 0;
        }

        // Regional and config methods
        public async Task<RegionalSettingsModels?> GetRegionalInfoAsync(int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<RegionalSettingsModels?>(LoginQueries.GetRegionalInfo, new { BranchId = branchId });
        }

        public async Task<string?> GetInstituteBranchNameAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.GetInstituteBranchName, new { InstituteId = instituteId });
        }

        public async Task<string?> GetBranchContactNoAsync(int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.GetBranchContactNo, new { BranchId = branchId });
        }

        public async Task<int?> GetIsRedirectToNewTabAsync(int branchId, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int?>(LoginQueries.GetIsRedirectToNewTab, new { BranchId = branchId, InstituteId = instituteId });
        }

        public async Task<(int? AllowStudModule, int? IsAllowTestEngine)> GetStudentModuleAllowedAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryFirstOrDefaultAsync<dynamic>(LoginQueries.GetStudentModuleAllowed, new { InstituteId = instituteId });
            return (
                Convert.ToInt32(result?.AllowStudModule),
                Convert.ToInt32(result?.IsAllowTestEngine)
            );
        }

        public async Task<List<int>> GetActTraiBranchAsync(int userId, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<int>(LoginQueries.GetActTraiBranch, new { UserId = userId, InstituteId = instituteId });
            return result.ToList();
        }

        // Security methods
        public async Task<int> CheckUserLoginTimeRecordAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(LoginQueries.CheckUserLoginTimeRecord, new { Username = username });
        }

        public async Task<int> ConfigCheckUserLoginTimeRecordAsync(int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(LoginQueries.ConfigCheckUserLoginTimeRecord, new { BranchId = branchId });
        }

        public async Task<string?> UserIPAddressAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.UserIPAddress, new { Username = username });
        }

        public async Task<string?> ConfigUserIPAddressAsync(int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<string?>(LoginQueries.ConfigUserIPAddress, new { BranchId = branchId });
        }

        public async Task<LoginTimeModels?> CompUserLoginTimeAsync(string username, int day)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<LoginTimeModels?>(LoginQueries.CompUserLoginTime, new { Username = username, Day = day });
        }

        public async Task<int> FunCompUserLoginTimeAsync(string userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(LoginQueries.FunCompUserLoginTime, new { UserId = userId });
        }

        public async Task<LoginTimeModels?> FunConfigCompUserLoginTimeAsync(int branchId, int day)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<LoginTimeModels?>(LoginQueries.FunConfigCompUserLoginTime, new { BranchId = branchId, Day = day });
        }

        public async Task<int> FunCountBranchSecurityRecordAsync(int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(LoginQueries.FunCountBranchSecurityRecord, new { BranchId = branchId });
        }

        public async Task<int> LoginFailedAsync(string loginType, string ipAddress, string fromTime, string toTime, string username, string failedDate, string instituteId, string branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            string? refreshToken = _httpContextAccessor.HttpContext?.Request.Cookies["refresh_token"];
            int result = await db.ExecuteAsync(LoginQueries.RevokeRefreshToken, new { Token = refreshToken, RevokedAt = DateTime.UtcNow, ReasonRevoked = "Login Failed" });
            return result;
        }

        // Notification config methods
        public async Task<UserDetailForExcel?> GetUserDetailForExcelAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<UserDetailForExcel?>(LoginQueries.GetUserDetailForExcel, new { Username = username });
        }

        public async Task<EmailConfig?> GetEmailConfigAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<EmailConfig?>(LoginQueries.GetEmailConfig, new { InstituteId = instituteId, BranchId = branchId });
        }

        public async Task<SMSConfig?> GetSMSConfigAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryFirstOrDefaultAsync<dynamic>(LoginQueries.GetSMSConfig, new { InstituteId = instituteId, BranchId = branchId });

            if (result == null) return null;

            return new SMSConfig
            {
                SMS_Server = result.SMS_Server?.ToString() ?? "",
                EmailRecipients = result.EmailRecipients?.ToString() ?? "",
                MobileNo = result.MobileNo?.ToString() ?? ""
            };
        }

        public async Task<AnnouncementSettings?> GetAnnouncementSettingsAsync(int instituteId, int branchId, string type)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            string query = type switch
            {
                "unauthorised" => LoginQueries.GetAnnouncementUnauthorised,
                "logintime" => LoginQueries.GetAnnouncementLoginTime,
                "logintimenotset" => LoginQueries.GetAnnouncementNoTimeSlot,
                _ => ""
            };

            if (string.IsNullOrEmpty(query)) return null;

            var result = await db.QueryFirstOrDefaultAsync<dynamic>(query, new { InstituteId = instituteId, BranchId = branchId });
            if (result == null) return null;

            return new AnnouncementSettings
            {
                IsEnabled = result.IsEnabled?.ToString() == "1",
                Template = result.Template?.ToString() ?? "",
                TemplateNo = result.TemplateNo?.ToString() ?? ""
            };
        }

        public async Task<int> SaveRefreshTokenAsync(int userId, string token, DateTime expiresAt, DateTime createdAt)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(LoginQueries.SaveRefreshToken, new { UserId = userId, Token = token, ExpiresAt = expiresAt, CreatedAt = createdAt });
        }

        public async Task<RefreshTokenModels?> GetRefreshTokenAsync(string token)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<RefreshTokenModels?>(LoginQueries.GetRefreshToken, new { Token = token });
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token, DateTime revokedAt, string reason)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(LoginQueries.RevokeRefreshToken, new { Token = token, RevokedAt = revokedAt, ReasonRevoked = reason });
            return rowsAffected > 0;
        }

        public async Task<bool> RevokeDescendantRefreshTokensAsync(string token, DateTime revokedAt, string reason)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(LoginQueries.RevokeDescendantRefreshTokens, new { Token = token, RevokedAt = revokedAt, ReasonRevoked = reason });
            return rowsAffected > 0;
        }

        public async Task<int> DeleteExpiredRefreshTokensAsync(DateTime currentDate)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.ExecuteAsync(LoginQueries.DeleteExpiredRefreshTokens, new { CurrentDate = currentDate });
        }

        public async Task<List<Modules>> GetModuleListAsync(int roleId, int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<Modules>(LoginQueries.GetModuleList, new { RoleId = roleId, InstituteId = instituteId, BranchId = branchId });
            return result.ToList();
        }

        public async Task<List<SubModules>> GetSubModulesAsync(int moduleId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<SubModules>(LoginQueries.GetSubModules, new { ModuleId = moduleId });
            return result.ToList();
        }

        public async Task<ModuleHierarchyResponseDto> GetModuleHierarchyAsync()
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Fetch all modules with permissions
            var modules = await db.QueryAsync<dynamic>(LoginQueries.GetModuleHierarchyForAuth);
            var moduleList = modules.ToList();

            // Build hierarchical structure
            var hierarchy = new ModuleHierarchyResponseDto();
            var moduleDict = new Dictionary<int, ModuleHierarchyItemDto>();

            // Convert to DTOs without permissions initially
            foreach (var item in moduleList)
            {
                var module = new ModuleHierarchyItemDto
                {
                    ModuleId = item.moduleId,
                    ModuleCode = item.module_code?.ToString() ?? "",
                    Name = item.name?.ToString() ?? "",
                    Level = item.level,
                    Sequence = item.sequence ?? 0,
                    Route = null,                    
                    Permissions = null,
                    SelfOperation = item.selfOperation ?? 0,
                };

                moduleDict[module.ModuleId] = module;
            }

            // Build tree structure using masterModuleId
            foreach (var module in moduleDict.Values)
            {
                // Need to get masterModuleId from the original data
                var moduleData = moduleList.FirstOrDefault(m => m.moduleId == module.ModuleId);
                int masterModuleId = moduleData?.masterModuleId ?? 0;

                if (masterModuleId == 0)
                {
                    // Top level module (no parent)
                    hierarchy.Modules.Add(module);
                }
                else if (moduleDict.ContainsKey(masterModuleId))
                {
                    // Add as child of parent
                    moduleDict[masterModuleId].Children.Add(module);
                }
            }

            // Set permissions only for leaf nodes (modules with no children)
            foreach (var module in moduleDict.Values)
            {
                if (module.Children.Count == 0 && module.SelfOperation == false)
                {
                    // Leaf node - set permissions from database
                    var moduleData = moduleList.FirstOrDefault(m => m.moduleId == module.ModuleId);
                    module.Permissions = new ModulePermissionsDto
                    {
                        View = moduleData?.canView == true,
                        Add = moduleData?.canAdd == true,
                        Edit = moduleData?.canEdit == true,
                        Delete = moduleData?.canDelete == true,
                        Import = moduleData?.canImport == true,
                        Export = moduleData?.canExport == true
                    };

                    // If all permissions are false, set to null
                    if (!module.Permissions.View && !module.Permissions.Add &&
                        !module.Permissions.Edit && !module.Permissions.Delete &&
                        !module.Permissions.Import && !module.Permissions.Export)
                    {
                        module.Permissions = null;
                    }
                }
                // Modules with children keep permissions as null
            }

            // Sort children by sequence
            foreach (var module in hierarchy.Modules)
            {
                SortChildren(module);
            }

            return hierarchy;
        }

        public async Task<ModuleHierarchyResponseDto> GetModuleHierarchyAsync(int branchSpecific,int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Fetch all modules with BranchSpecific filter
            var modules = await db.QueryAsync<dynamic>(LoginQueries.GetModuleHierarchyForAuthWithBranchSpecific, new { BranchSpecific = branchSpecific, InstituteId=instituteId });
            var moduleList = modules.ToList();

            // Build hierarchical structure
            var hierarchy = new ModuleHierarchyResponseDto();
            var moduleDict = new Dictionary<int, ModuleHierarchyItemDto>();

            // Convert to DTOs without permissions initially
            foreach (var item in moduleList)
            {
                var module = new ModuleHierarchyItemDto
                {
                    ModuleId = item.moduleId,
                    ModuleCode = item.module_code?.ToString() ?? "",
                    Name = item.name?.ToString() ?? "",
                    Level = item.level,
                    Sequence = item.sequence ?? 0,
                    //Route = null,
                    Route = GenerateModuleRoute(item.name?.ToString()),
                    Permissions = null,
                    SelfOperation = item.selfOperation ?? 0,
                };

                moduleDict[module.ModuleId] = module;
            }

            // Build tree structure using masterModuleId
            foreach (var module in moduleDict.Values)
            {
                var moduleData = moduleList.FirstOrDefault(m => m.moduleId == module.ModuleId);
                int masterModuleId = moduleData?.masterModuleId ?? 0;

                if (masterModuleId == 0)
                {
                    hierarchy.Modules.Add(module);
                }
                else if (moduleDict.ContainsKey(masterModuleId))
                {
                    moduleDict[masterModuleId].Children.Add(module);
                }
            }

            // Set permissions only for leaf nodes
            foreach (var module in moduleDict.Values)
            {
                if (module.Children.Count == 0 && module.SelfOperation == false)
                {
                    var moduleData = moduleList.FirstOrDefault(m => m.moduleId == module.ModuleId);
                    module.Permissions = new ModulePermissionsDto
                    {
                        View = moduleData?.canView == true,
                        Add = moduleData?.canAdd == true,
                        Edit = moduleData?.canEdit == true,
                        Delete = moduleData?.canDelete == true,
                        Import = moduleData?.canImport == true,
                        Export = moduleData?.canExport == true
                    };

                    if (!module.Permissions.View && !module.Permissions.Add &&
                        !module.Permissions.Edit && !module.Permissions.Delete &&
                        !module.Permissions.Import && !module.Permissions.Export)
                    {
                        module.Permissions = null;
                    }
                }
            }

            // Sort children by sequence
            foreach (var module in hierarchy.Modules)
            {
                SortChildren(module);
            }

            return hierarchy;
        }


        private void SortChildren(ModuleHierarchyItemDto module)
        {
            module.Children = module.Children.OrderBy(c => c.Sequence).ToList();
            foreach (var child in module.Children)
            {
                SortChildren(child);
            }
        }

        public async Task<(bool Success, string Message, string RedirectUrl, Dictionary<string, string> SessionData, LoginFailureDetails? FailureDetails)> CheckLoginAsync(string username, string password, string ipAddress)
        {
            var sessionData = new Dictionary<string, string>();
            var sanitizedUsername = username.Replace("\"", "\\\"").Replace("'", "\'").Trim();
            var sanitizedPassword = password.Replace("\"", "\\\"").Replace("'", "\'").Trim();

            LoginModels? user = await GetLoginByUsernameAsync(sanitizedUsername);

            if (user == null)
            {
                return (false, "Invalid username.", "", sessionData, null);
            }
            byte[] uPassword = EncryptPassword(sanitizedUsername, sanitizedPassword, 2);
            string hexString = BitConverter.ToString(uPassword).Replace("-", "");
            byte[] generated = EncryptPassword("techior", "admin123", 2);
            byte[] dbPassword = user.Passwd; // Length from DB

            string a = $"Generated Length: {generated.Length}";
            string b = $"DB Length: {dbPassword.Length}";

            string c = $"Generated Hex: {BitConverter.ToString(generated)}";
            string d = $"DB Hex:        {BitConverter.ToString(dbPassword)}";
            if (!user.Passwd.SequenceEqual(uPassword))
            {
                return (false, "Invalid password.", "", sessionData, null);
            }

            if (user.LoginStatus == 0)
            {
                return (false, "Your login is disabled. Please contact administrator.", "", sessionData, null);
            }

            DateTime currentDateTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, "India Standard Time");
            string logDate = currentDateTime.ToString("yyyy-MM-dd HH:mm");

            var activity = new UserActivityModels
            {
                InstituteId = user.Institute_Id,
                BranchId = user.Branch_Id,
                UserId = user.User_Id,
                ActivityDate = logDate,
                UserType = "USER",
                DeviceType = "WEB",
                ActivityType = "LOGIN",
                IpAddress = ipAddress
            };

            int userActivityId = await UsersActivityAsync(activity);
            await UpdateLastLoginDateAsync(sanitizedUsername, logDate);

            // Check institute status
            if (!await CheckStatusAsync(user.Institute_Id, user.Branch_Id))
            {
                return (false, "Your institute has been disabled. Please contact Techior Solutions Pvt. Ltd. at 9766616435.", "", sessionData, null);
            }

            // Set basic session data
            sessionData["USD"] = "DayMonthYear";
            sessionData["instid"] = user.Institute_Id.ToString();
            sessionData["branchid"] = user.Branch_Id.ToString();
            sessionData["userid"] = user.User_Id.ToString();
            sessionData["username"] = sanitizedUsername;
            sessionData["staffid"] = user.StaffId.ToString();
            sessionData["Email"] = user.Email;
            sessionData["UserActivityId"] = userActivityId.ToString();

            // Get regional info
            RegionalSettingsModels? regionalInfo = await GetRegionalInfoAsync(user.Branch_Id);
            if (regionalInfo != null)
            {
                sessionData["TimeZone"] = regionalInfo.TimeZone;
                sessionData["TimeZone_Id"] = regionalInfo.TimeZone_Id;
                sessionData["DateFormat"] = regionalInfo.DateFormat;
                sessionData["USD"] = regionalInfo.DateFormat == "dd/MM/yyyy" ? "DayMonthYear" : "MonthDayYear";
            }
            else
            {
                sessionData["TimeZone"] = "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi";
                sessionData["TimeZone_Id"] = "India Standard Time";
                sessionData["DateFormat"] = "dd/MM/yyyy";
                sessionData["USD"] = "DayMonthYear";
            }

            // Check plan expiry for non-admin users
            if (user.LoginStatus != 1)
            {
                string todaysDate = currentDateTime.ToString("yyyy-MM-dd");
                var currentPlan = await CheckCurrentPlanExpiryAsync(user.Institute_Id, todaysDate);

                if (currentPlan != null && currentPlan.IsActive == 1)
                {
                    if (currentPlan.EndDate.HasValue)
                    {
                        DateTime dtExpr = currentPlan.EndDate.Value;
                        DateTime dtNow = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, sessionData["TimeZone_Id"].ToString());
                        TimeSpan t = dtExpr.Subtract(dtNow.Date);
                        sessionData["RemainDays"] = t.Days.ToString();
                        sessionData["ExpiryDate"] = currentPlan.EndDate.ToString();

                        if (dtExpr.Date.CompareTo(dtNow.Date) < 0)
                        {
                            string endDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(currentPlan.EndDate.Value, TimeZone.CurrentTimeZone.StandardName, "India Standard Time").ToString("yyyy-MM-dd");
                            await UpdatePlanStatusAsync(currentPlan.PaymentHistoryId, user.User_Id);
                            await UpdateLastLoginDateAsync(sanitizedUsername, logDate);
                            string message = user.RegStatus == 0
                                ? "Your trial period has expired. Please contact Techior Solutions Pvt. Ltd. at 9766616435."
                                : "Your institute subscription period has expired. Please contact Techior Solutions Pvt. Ltd. at 9766616435.";
                            return (false, message, "~\\Online\\frmaccounthistory.aspx", sessionData, null);
                        }
                    }

                    // Check future plans
                    var futurePlans = await AllFutureDatePlanExistsAsync(user.Institute_Id, todaysDate);
                    if (futurePlans.Count > 0)
                    {
                        sessionData["ExpiryDate"] = futurePlans[futurePlans.Count - 1].EndDate.ToString();
                    }
                }

                // Check plan hold
                var planHold = await CheckCurrentPlanHoldAsync(user.Institute_Id, todaysDate);
                if (planHold != null)
                {
                    return (false, "Sorry, you can not login to your institute as your plan is kept on hold for some technical reason, please contact Techior Solutions on 9766616435.", "", sessionData, null);
                }

                // Check future plan
                var futurePlan = await CheckFutureDatePlanExistsAsync(user.Institute_Id, todaysDate);
                if (futurePlan != null && futurePlan.StartDate.HasValue)
                {
                    DateTime dtExpr = futurePlan.StartDate.Value;
                    DateTime dtNow = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, sessionData["TimeZone_Id"].ToString());
                    if (dtExpr.Date.CompareTo(dtNow.Date) > 0)
                    {
                        sessionData["StartDate"] = futurePlan.StartDate.ToString();
                        return (false, $"Your start date of plan is {futurePlan.StartDate:yyyy-MM-dd}. Please contact Techior Solutions Pvt. Ltd. at 9766616435.", "", sessionData, null);
                    }
                }

                // Check trial expiry
                if (user.ExpiryDate != default && user.ExpiryDate != DateTime.Parse("0000-00-00"))
                {
                    DateTime dtExpr = user.ExpiryDate;
                    DateTime dtNow = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, "India Standard Time");
                    TimeSpan t = dtExpr.Subtract(dtNow.Date);
                    sessionData["RemainDays"] = t.Days.ToString();

                    if (dtExpr.Date.CompareTo(dtNow.Date) < 0)
                    {
                        return (false, "Your trial period has expired. Please contact Techior Solutions Pvt. Ltd. at 9766616435.", "", sessionData, null);
                    }
                }
                else
                {
                    return (false, "Your account has expired. Please contact administrator.", "", sessionData, null);
                }
            }

            // Get student module allowed
            var (allowStudModule, isAllowTestEngine) = await GetStudentModuleAllowedAsync(user.Institute_Id);
            sessionData["IsStudentModuleAllowed"] = allowStudModule?.ToString() ?? "0";
            sessionData["IsAllowTestEngine"] = isAllowTestEngine?.ToString() ?? "0";

            // Get role info
            string? roleInfo = await GetRoleInfoAsync(user.Role_Id);
            string[] roles = roleInfo?.Split(',') ?? new string[0];
            string userRole = roles.Length > 0 ? roles[0] : "User";

            sessionData["role"] = user.Role_Id.ToString();
            sessionData["userrole"] = userRole;
            sessionData["roleOnOFF"] = "0";
            sessionData["loginStatus"] = user.LoginStatus.ToString();
            sessionData["LastLogin"] = user.LastLogin.ToString();
            sessionData["StaffUser"] = user.StaffUser.ToString();
            sessionData["regStatus"] = user.RegStatus.ToString();
            sessionData["Name"] = user.Name;
            sessionData["instEmailId"] = user.Email;

            // Update institute status
            await UpdateInstituteStatusAsync(user.Institute_Id, 1, 1);

            // Check if user has role access defined
            List<UserRoleAccessModels> roleAccessList = await GetRoleAccessAsync(user.Role_Id, user.Plan_Id);
            if (roleAccessList.Count == 0 && userRole != "SuperAdmin" && userRole != "InstituteAdmin" && userRole != "BranchAdmin")
            {
                return (false, "User roles not defined for this user.", "", sessionData, null);
            }

            // Security validations for non-admin users
            if (userRole != "SuperAdmin" && userRole != "InstituteAdmin" && userRole != "BranchAdmin")
            {
                // Get trainer branches
                var actTraiBranches = await GetActTraiBranchAsync(user.User_Id, user.Institute_Id);

                if (actTraiBranches.Count > 1)
                {
                    sessionData["hdMultiBranches"] = "true";
                    sessionData["UserBr"] = "true";
                }

                // Check user login time record
                int userLoginTimeRecord = await CheckUserLoginTimeRecordAsync(sanitizedUsername);
                if (userLoginTimeRecord == 0)
                {
                    userLoginTimeRecord = await ConfigCheckUserLoginTimeRecordAsync(user.Branch_Id);
                }

                // If login time is set, validate IP and time
                if (userLoginTimeRecord > 0)
                {
                    // IP Address validation
                    string? userIpAddress = await UserIPAddressAsync(sanitizedUsername);
                    if (string.IsNullOrEmpty(userIpAddress))
                    {
                        userIpAddress = await ConfigUserIPAddressAsync(user.Branch_Id);
                    }

                    if (!string.IsNullOrEmpty(userIpAddress))
                    {
                        if (userIpAddress != ipAddress)
                        {
                            string failedDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, sessionData["TimeZone_Id"].ToString()).ToString("dd/MM/yyyy hh:mm tt");
                            await LoginFailedAsync("IP", ipAddress, "", "", sanitizedUsername, failedDate, user.Institute_Id.ToString(), user.Branch_Id.ToString());
                            var failureDetails = new LoginFailureDetails
                            {
                                Reason = "IP",
                                Username = sanitizedUsername,
                                IpAddress = ipAddress,
                                InstituteId = user.Institute_Id.ToString(),
                                BranchId = user.Branch_Id.ToString()
                            };
                            return (false, $"Invalid IP Address for the user {sanitizedUsername}", "", sessionData, failureDetails);
                        }
                    }

                    // Login Time validation
                    string dayOfWeek = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, sessionData["TimeZone_Id"].ToString()).DayOfWeek.ToString();
                    int dayInt = dayOfWeek switch
                    {
                        "Monday" => 1,
                        "Tuesday" => 2,
                        "Wednesday" => 3,
                        "Thursday" => 4,
                        "Friday" => 5,
                        "Saturday" => 6,
                        "Sunday" => 7,
                        _ => 1
                    };

                    // User level login time
                    var userLoginTime = await CompUserLoginTimeAsync(sanitizedUsername, dayInt);
                    int userLevelCount = await FunCompUserLoginTimeAsync(sanitizedUsername);

                    if (userLoginTime == null && userLevelCount == 0)
                    {
                        // Branch level login time
                        userLoginTime = await FunConfigCompUserLoginTimeAsync(user.Branch_Id, dayInt);
                        int branchLevelCount = await FunCountBranchSecurityRecordAsync(user.Branch_Id);

                        if (userLoginTime == null && branchLevelCount != 0)
                        {
                            await LoginFailedAsync("NoTimeSlot", "", "", "", "", "", user.Institute_Id.ToString(), user.Branch_Id.ToString());
                            var failureDetails = new LoginFailureDetails
                            {
                                Reason = "NoTimeSlot",
                                Username = sanitizedUsername,
                                IpAddress = ipAddress,
                                InstituteId = user.Institute_Id.ToString(),
                                BranchId = user.Branch_Id.ToString()
                            };
                            return (false, $"No login time set for the user {sanitizedUsername} on {dayOfWeek}.", "", sessionData, failureDetails);
                        }
                    }
                    else if (userLoginTime == null && userLevelCount != 0)
                    {
                        await LoginFailedAsync("NoTimeSlot", "", "", "", "", "", user.Institute_Id.ToString(), user.Branch_Id.ToString());
                        var failureDetails = new LoginFailureDetails
                        {
                            Reason = "NoTimeSlot",
                            Username = sanitizedUsername,
                            IpAddress = ipAddress,
                            InstituteId = user.Institute_Id.ToString(),
                            BranchId = user.Branch_Id.ToString()
                        };
                        return (false, $"No login time set for the user {sanitizedUsername} on {dayOfWeek}.", "", sessionData, failureDetails);
                    }

                    // Validate login time if set
                    if (userLoginTime != null)
                    {
                        if (!string.IsNullOrEmpty(userLoginTime.FromTime) && !string.IsNullOrEmpty(userLoginTime.ToTime))
                        {
                            string loginTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, sessionData["TimeZone_Id"].ToString()).ToString("HH:mm");

                            var fromTimeParts = userLoginTime.FromTime.Split(' ');
                            var toTimeParts = userLoginTime.ToTime.Split(' ');

                            if (fromTimeParts.Length > 0 && toTimeParts.Length > 0)
                            {
                                try
                                {
                                    DateTime fromTime = DateTime.Parse(fromTimeParts[0]);
                                    DateTime toTime = DateTime.Parse(toTimeParts[0]);
                                    DateTime currentTime = DateTime.Parse(loginTime);

                                    string savedTime = toTime.ToString("HH:mm");
                                    string fTime = fromTime.ToString("HH:mm");

                                    int t1 = int.Parse(loginTime.Replace(":", ""));
                                    int t2 = int.Parse(savedTime.Replace(":", ""));
                                    int t3 = int.Parse(fTime.Replace(":", ""));

                                    if (t1 < t2 && t3 > t1)
                                    {
                                        await LoginFailedAsync("LoginTime", "", userLoginTime.FromTime, userLoginTime.ToTime, "", "", user.Institute_Id.ToString(), user.Branch_Id.ToString());
                                        var failureDetails = new LoginFailureDetails
                                        {
                                            Reason = "LoginTime",
                                            Username = sanitizedUsername,
                                            IpAddress = ipAddress,
                                            InstituteId = user.Institute_Id.ToString(),
                                            BranchId = user.Branch_Id.ToString(),
                                            StartTime = userLoginTime.FromTime,
                                            EndTime = userLoginTime.ToTime
                                        };
                                        return (false, $"User's login time on {dayOfWeek} is between {userLoginTime.FromTime} to {userLoginTime.ToTime}.", "", sessionData, failureDetails);
                                    }
                                    else if (t1 > t2)
                                    {
                                        await LoginFailedAsync("LoginTime", "", userLoginTime.FromTime, userLoginTime.ToTime, "", "", user.Institute_Id.ToString(), user.Branch_Id.ToString());
                                        var failureDetails = new LoginFailureDetails
                                        {
                                            Reason = "LoginTime",
                                            Username = sanitizedUsername,
                                            IpAddress = ipAddress,
                                            InstituteId = user.Institute_Id.ToString(),
                                            BranchId = user.Branch_Id.ToString(),
                                            StartTime = userLoginTime.FromTime,
                                            EndTime = userLoginTime.ToTime
                                        };
                                        return (false, $"User's login time on {dayOfWeek} is between {userLoginTime.FromTime} to {userLoginTime.ToTime}.", "", sessionData, failureDetails);
                                    }
                                }
                                catch
                                {
                                    // If time parsing fails, allow login
                                }
                            }
                        }
                    }
                }
            }

            // Get redirect URL
            string redirectUrl = await GetRedirectUrl(userRole, user.Institute_Id.ToString(), user.Branch_Id.ToString(), user.User_Id, roleAccessList);
            sessionData["HomeURL"] = redirectUrl;

            return (true, "", redirectUrl, sessionData, null);
        }

        private byte[] EncryptPassword(string userName, string password, int encryptionVersion)
        {
            string s = null;
            switch (encryptionVersion)
            {
                case 0:
                    byte[] bytes = new UTF8Encoding().GetBytes(s);
                    if (encryptionVersion == 2)
                        return System.Security.Cryptography.SHA384.Create().ComputeHash(bytes);
                    return System.Security.Cryptography.MD5.Create().ComputeHash(bytes);
                case 1:
                    s = userName.ToLower() + password;
                    goto case 0;
                case 2:
                    s = Convert.ToBase64String(Encoding.ASCII.GetBytes("Techior")) + Convert.ToBase64String(Encoding.ASCII.GetBytes("Solutions")) + userName.ToLower() + password;
                    goto case 0;
                default:
                    s = password;
                    goto case 0;
            }
        }

        private string GenerateJwtToken(string username, string userRole, string instID, string branchID, string userId)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, userRole),
                new Claim("username", username),
                new Claim("instID", instID),
                new Claim("branchID", branchID),
                new Claim("userId", userId)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<string> GetRedirectUrl(string userRole, string instID, string branchID, int userId, List<UserRoleAccessModels> roleAccessList)
        {
            string host = _httpContextAccessor.HttpContext?.Request.Host.Value ?? "";
            bool isLocal = host.Contains("192.168.1.105") || host.Contains("192.168.1.150");

            switch (userRole)
            {
                case "SuperAdmin":
                    return isLocal ? ".\\superAdmin\\Institutesv2.aspx" : "..\\superAdmin\\Institutesv2.aspx";

                case "InstituteAdmin":
                    return isLocal ? ".\\Dashboards\\dashboardAdminV2.aspx" : "..\\Dashboards\\dashboardAdminV2.aspx";

                case "BranchAdmin":
                    List<BranchAdminModels> branches = await GetAdminBranchesAsync(userId);
                    if (branches != null && branches.Count > 0)
                    {
                        // Check franchisee flag
                        bool hasFranchisee = branches.Any(b => b.IsFranchisee == 1);
                        if (hasFranchisee)
                        {
                            // Franchisee logic handled in session
                        }

                        // Check if user has branches
                        if (branches.Count >= 1)
                        {
                            if (branches.Count > 1)
                            {
                                // Multi-branch logic
                                return isLocal ? ".\\InstituteAdmin\\Branches.aspx" : "..\\InstituteAdmin\\Branches.aspx";
                            }
                            else
                            {
                                // Single branch logic
                                return isLocal ? ".\\Dashboards\\frmdashboardbranchadminv2.aspx" : "..\\Dashboards\\frmdashboardbranchadminv2.aspx";
                            }
                        }
                        else
                        {
                            // No branches, check role access
                            if (roleAccessList.Count == 0)
                            {
                                return "";
                            }

                            return GetRoleBasedRedirect(roleAccessList, isLocal);
                        }
                    }
                    return isLocal ? ".\\Dashboards\\dashboardAdminV2.aspx" : "..\\Dashboards\\dashboardAdminV2.aspx";

                default:
                    if (roleAccessList.Count > 0)
                    {
                        return GetRoleBasedRedirect(roleAccessList, isLocal);
                    }
                    return isLocal ? ".\\Dashboards\\dashboardAdminV2.aspx" : "..\\Dashboards\\dashboardAdminV2.aspx";
            }
        }

        private string GetRoleBasedRedirect(List<UserRoleAccessModels> roleAccessList, bool isLocal)
        {
            // Loop through role access list to find matching role
            for (int i = 0; i < roleAccessList.Count; i++)
            {
                var roleAccess = roleAccessList[i];
                string roleName = roleAccess.RoleName;
                int p1 = roleAccess.Permission1;
                int p2 = roleAccess.Permission2;
                int p3 = roleAccess.Permission3;
                int p4 = roleAccess.Permission4;
                int p5 = roleAccess.Permission5;
                int p6 = roleAccess.Permission6;


                switch (roleName)
                {
                    case "Student":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=3" : "..\\Reports\\Payment.aspx?id=3";
                        }
                        else
                        {
                            return isLocal ? ".\\user\\students.aspx" : "..\\user\\students.aspx";
                        }

                    case "Payment":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=0" : "..\\Reports\\Payment.aspx?id=0";
                        }
                        else
                        {
                            return isLocal ? ".\\user\\SchedulePayments.aspx" : "..\\user\\SchedulePayments.aspx";
                        }

                    case "Test":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\user\\Config.aspx" : "..\\user\\Config.aspx";
                        }
                        else
                        {
                            return isLocal ? ".\\branchadmin\\tests.aspx?id=0" : "..\\branchadmin\\tests.aspx?id=0";
                        }

                    case "Test Results":
                        if (p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=2" : "..\\Reports\\Payment.aspx?id=2";
                        }
                        else
                        {
                            return isLocal ? ".\\branchadmin\\tests.aspx?id=1" : "..\\branchadmin\\tests.aspx?id=1";
                        }

                    case "Staff":
                        if (p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=9" : "..\\Reports\\Payment.aspx?id=9";
                        }
                        else
                        {
                            return isLocal ? ".\\branchadmin\\trainerregistration.aspx" : "..\\branchadmin\\trainerregistration.aspx";
                        }

                    case "Staff Attendance":
                        if (p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=10" : "..\\Reports\\Payment.aspx?id=10";
                        }
                        else
                        {
                            return isLocal ? ".\\branchadmin\\instructorattendence.aspx" : "..\\branchadmin\\instructorattendence.aspx";
                        }

                    case "Staff Payment":
                        if (p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=10" : "..\\Reports\\Payment.aspx?id=10";
                        }
                        else
                        {
                            return isLocal ? ".\\branchadmin\\SetTrainerPay.aspx" : "..\\branchadmin\\SetTrainerPay.aspx";
                        }

                    case "Batch":
                    case "Attendance":
                        return isLocal ? ".\\Reports\\Payment.aspx?id=1" : "..\\Reports\\Payment.aspx?id=1";

                    case "Courses":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\user\\Config.aspx" : "..\\user\\Config.aspx";
                        }
                        else
                        {
                            return isLocal ? ".\\branchadmin\\courses.aspx" : "..\\branchadmin\\courses.aspx";
                        }

                    case "Expense":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=6" : "..\\Reports\\Payment.aspx?id=6";
                        }
                        else
                        {
                            return isLocal ? ".\\user\\Expenses.aspx" : "..\\user\\Expenses.aspx";
                        }

                    case "Inventory":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=12" : "..\\Reports\\Payment.aspx?id=12";
                        }
                        else
                        {
                            return isLocal ? ".\\InventoryMgmt\\Inventory.aspx?id=4" : "..\\InventoryMgmt\\Inventory.aspx?id=4";
                        }

                    case "Transportation":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=14" : "..\\Reports\\Payment.aspx?id=14";
                        }
                        else
                        {
                            return isLocal ? ".\\Transportation\\Buses.aspx?id=0" : "..\\Transportation\\Buses.aspx?id=0";
                        }

                    case "Hostel":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=14" : "..\\Reports\\Payment.aspx?id=14";
                        }
                        else
                        {
                            return isLocal ? ".\\Hostel\\Hostel.aspx?id=0" : "..\\Hostel\\Hostel.aspx?id=0";
                        }

                    case "Health":
                        if (p1 == 0 && p2 == 0 && p3 == 0 && p4 == 0 && p5 == 0 && p6 == 1)
                        {
                            return isLocal ? ".\\Reports\\Payment.aspx?id=16" : "..\\Reports\\Payment.aspx?id=16";
                        }
                        else
                        {
                            return isLocal ? ".\\HealthCheckUp\\HealthCheckup.aspx" : "..\\HealthCheckUp\\HealthCheckup.aspx";
                        }
                }
            }

            return isLocal ? ".\\Dashboards\\dashboardAdminV2.aspx" : "..\\Dashboards\\dashboardAdminV2.aspx";
        }
        public async Task<List<Modules>> GetModuleListForSuperAdminAsync(int roleId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<Modules>(LoginQueries.GetModuleListForSuperAdmin, new { RoleId = roleId });
            return result.ToList();
        }
        public async Task<List<HeaderDetails>> HeaderDetailsAsync(int roleId, int instituteId, int userId)
        {
            string query = (roleId == 1)
        ? LoginQueries.HeaderDetails_SuperAdmin
        : LoginQueries.HeaderDetails;
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<HeaderDetails>(query, new { InstituteId = instituteId, UserId = userId });
            return result.ToList();
        }
        public async Task<List<BranchListItemDto>> BranchListAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<BranchListItemDto>(LoginQueries.BranchList, new { InstituteId = instituteId });
            return result.ToList();
        }
        private string? GenerateModuleRoute(string? moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                return null;

            var route = moduleName
                .Trim()
                .ToLowerInvariant();

            // Remove characters that are not suitable for a URL
            route = System.Text.RegularExpressions.Regex.Replace(
                route,
                @"[^a-z0-9\s\-]",
                ""
            );

            // Replace spaces with nothing
            route = route.Replace(" ", "");

            // Replace multiple hyphens if any
            route = System.Text.RegularExpressions.Regex.Replace(
                route,
                @"-+",
                "-"
            );

            return "/" + route;
        }
    }
}
