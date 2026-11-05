using Dapper;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.SqlQueries;
using System.Data;
using System.Diagnostics;
using System.Text;

namespace IM_backend.Repositories
{
    public class InstituteRepository : IInstituteRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly IEmailService _emailService;
        public InstituteRepository(IDbConnectionFactory dbFactory, IEmailService emailService)
        {
            _dbFactory = dbFactory;
            _emailService = emailService;
        }

        public async Task<int> CheckUsernameAvailabilityAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(InstituteQueries.CheckUsernameAvailability, new { Username = username });
        }

        public async Task<int> CreateInstituteAsync(InstituteModels institute)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(InstituteQueries.CreateInstitute, institute);
        }

        public async Task<int> CreateInstUserAsync(InstUserModels instUser)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(InstituteQueries.CreateInstUser, instUser);
        }

        public async Task<bool> UpdateUserPasswordAsync(int userId, byte[] password)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(InstituteQueries.UpdateUserPassword, new { UserId = userId, Password = password });
            return rowsAffected > 0;
        }

        public async Task<bool> UpdateInstituteMetadataAsync(int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            string currentDateTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, "India Standard Time").ToString("yyyy-MM-dd HH:mm");
            int rowsAffected = await db.ExecuteAsync(InstituteQueries.UpdateInstituteMetadata, new
            {
                CreateDateTime = currentDateTime,
                CreateByUserId = userId,
                IpAddress = ipAddress,
                InstituteId = instituteId
            });
            return rowsAffected > 0;
        }

        public async Task<int> CreateBranchAsync(InstituteModels institute, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(InstituteQueries.CreateBranch, new
            {
                Person = institute.Person,
                InstituteId = instituteId,
                Phone = institute.Phone,
                Email = institute.Email,
                Address = institute.Address,
                CpMobile = institute.CpMobile,
                CpEmail = institute.CpEmail,
                PinCode = institute.PinCode,
                RegDate = institute.RegDate.ToString("yyyy-MM-dd"),
                ExpiryDate = institute.ExpiryDate.ToString("yyyy-MM-dd"),
                CountryId = institute.CountryId,
                StateId = institute.StateId,
                CityId = institute.CityId,
                OtherCity = institute.OtherCity
            });
        }

        public async Task<int> CreateConfigAsync(int branchId, int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int>(InstituteQueries.CreateConfig, new { BranchId = branchId, InstituteId = instituteId });
        }

        public async Task<bool> CreateRegNoFormatAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(InstituteQueries.CreateRegNoFormat, new { InstituteId = instituteId });
            return rowsAffected > 0;
        }

        public async Task<bool> CreateReceiptNoFormatAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(InstituteQueries.CreateReceiptNoFormat, new { InstituteId = instituteId });
            return rowsAffected > 0;
        }

        public async Task<bool> CreateTempModuleList(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            int rowsAffected = await db.ExecuteAsync(InstituteQueries.CreateTempModuleList, new { InstituteId = instituteId });
            return rowsAffected > 0;
        }

        public async Task<int?> GetUserIdByUsernameAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int?>(InstituteQueries.GetUserIdByUsername, new { Username = username });
        }

        public async Task<int?> GetInstituteIdByUserIdAsync(int userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int?>(InstituteQueries.GetInstituteIdByUserId, new { UserId = userId });
        }

        public async Task<int?> GetBranchIdByUserIdAsync(int userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<int?>(InstituteQueries.GetBranchIdByUserId, new { UserId = userId });
        }

        public async Task<(bool Success, string Message)> RegisterInstituteAsync(InstituteRegistrationDto request, string ipAddress)
        {
            // Check username availability (following old code sequence)
            int usernameCount = await CheckUsernameAvailabilityAsync(request.Username);
            if (usernameCount > 0)
            {
                return (false, "Username already exists! Please try another.");
            }

            // Create institute record with SQL injection prevention (following old code logic)
            DateTime regDate = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.Now, TimeZone.CurrentTimeZone.StandardName, "India Standard Time");
            DateTime expiryDate = regDate.AddDays(7.0);

            var institute = new InstituteModels
            {
                Name = request.InstituteName.Trim().Replace("'", "''"),
                Person = request.ContactPerson.Trim().Replace("'", "''"),
                Phone = request.MobileNo.Trim().Replace("'", "''"),
                Email = request.EmailId.Trim().Replace("'", "''"),
                Address = request.Address.Trim().Replace("'", "''"),
                CpMobile = request.MobileNo.Trim().Replace("'", "''"),
                CpEmail = request.EmailId.Trim().Replace("'", "''"),
                RegDate = regDate,
                ExpiryDate = expiryDate,
                NoOfStudents = 30,
                NoOfReg = 10,
                NoOfEnq = 20,
                CountryId = request.CountryId,
                StateId = request.StateId,
                CityId = request.CityId ?? 0,
                OtherCity = request.otherCity ?? "",
                PinCode = request.Pincode.Trim().Replace("'", "''"),
                InstNoofStuds = Convert.ToInt32(request.InstNoOfStudents),
                InstProCoachingFor = request.InstProvideCoachingFor,
                IsBranchWise = 0,
                CountryIdc = request.CountryId,
                StateIdc = request.StateId,
                CityIdc = request.CityId ?? 0,
                OtherCityc = string.Empty
            };

            int instituteId = await CreateInstituteAsync(institute);
            if (instituteId <= 0)
            {
                return (false, "Failed to create institute record");
            }

            // Create user record with encrypted password (following old code logic)
            byte[] encryptedPassword = EncryptPassword(request.Username, "admin123", 2);

            var instUser = new InstUserModels
            {
                UserName = request.Username.Trim().Replace("'", "''"),
                Email = request.EmailId.Trim().Replace("'", "''"),
                LoginId = request.Username.Trim().Replace("'", "''"),
                UserType = "2",
                InstituteId = instituteId,
                Address = request.Address.Trim().Replace("'", "''"),
                Address2 = request.Address.Trim().Replace("'", "''"),
                Mobile = request.MobileNo.Trim().Replace("'", "''"),
                Contact = request.MobileNo.Trim().Replace("'", "''"),
                CountryId = request.CountryId,
                StateId = request.StateId,
                CityId = request.CityId ?? 0,
                OtherCity = string.Empty,
                CountryIdc = request.CountryId,
                StateIdc = request.StateId,
                CityIdc = request.CityId ?? 0,
                OtherCityc = string.Empty,
                PinCodeC = request.Pincode.Trim().Replace("'", "''"),
                Password = encryptedPassword
            };

            int userId = await CreateInstUserAsync(instUser);
            if (userId <= 0)
            {
                return (false, "Failed to create user record");
            }

            // Update user password (following old code logic)
            bool passwordUpdated = await UpdateUserPasswordAsync(userId, encryptedPassword);
            if (!passwordUpdated)
            {
                return (false, "Failed to update user password");
            }

            // Update institute metadata with IP address (following old code logic)
            bool metadataUpdated = await UpdateInstituteMetadataAsync(instituteId, userId, ipAddress);
            if (!metadataUpdated)
            {
                return (false, "Failed to update institute metadata");
            }

            // Create HQ branch (following old code logic)
            DateTime branchExpiryDate = regDate.AddDays(3.0);
            institute.ExpiryDate = branchExpiryDate;
            int branchId = await CreateBranchAsync(institute, instituteId);
            if (branchId <= 0)
            {
                return (false, "Failed to create branch");
            }

            // Create config (following old code logic)
            int configId = await CreateConfigAsync(branchId, instituteId);
            if (configId <= 0)
            {
                return (false, "Failed to create config");
            }

            // Create regnoformat (following old code logic)
            bool regNoFormatCreated = await CreateRegNoFormatAsync(instituteId);
            if (!regNoFormatCreated)
            {
                return (false, "Failed to create regnoformat");
            }

            // Create receiptnoformat (following old code logic)
            bool receiptNoFormatCreated = await CreateReceiptNoFormatAsync(instituteId);
            if (!receiptNoFormatCreated)
            {
                return (false, "Failed to create receiptnoformat");
            }

            // Create tempModuleList (temporary it will be removed once new module implementation done)
            bool tempModuleListCreated = await CreateTempModuleList(instituteId);
            if (!tempModuleListCreated)
            {
                return (false, "Failed to create temporary module list");
            }

            // Send email with account details (SendMails in old code)
            await _emailService.SendRegistrationEmailAsync(
                request.Username,
                request.EmailId,
                request.InstituteName,
                request.Address,
                request.ContactPerson,
                request.MobileNo,
                request.EmailId,
                request.Remarks,
                ipAddress,
                request.InstNoOfStudents,
                request.InstProvideCoachingFor
            );

            return (true, "Thank you! An email is sent to registered email id with account details.");
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

        public async Task<PagedResponse<InstituteListItemDto>> GetInstitutesAsync(InstituteSearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Build SQL condition dynamically
            string sqlCondition = string.Empty;

            if (!string.IsNullOrEmpty(search.instName))
                sqlCondition += " AND Institutename LIKE '%" + search.instName.Replace("&", "¬") + "%'";
            if (!string.IsNullOrEmpty(search.email))
                sqlCondition += " AND Cpemail LIKE '%" + search.email + "%'";
            if (!string.IsNullOrEmpty(search.cpName))
                sqlCondition += " AND Contactperson LIKE '%" + search.cpName + "%'";
            if (!string.IsNullOrEmpty(search.cpPhone))
                sqlCondition += " AND CpMobile LIKE '%" + search.cpPhone + "%'";
            if (!string.IsNullOrEmpty(search.city))
                sqlCondition += " AND city LIKE '%" + search.city + "%'";
            if (search.status != 2)
                sqlCondition += " AND institute_status = " + search.status.ToString();
            if (search.regType != 2)
                sqlCondition += " AND regtype = " + search.regType;
            if (search.type != 2)
            {
                sqlCondition += " AND isinternal = " + search.type;
            }
            if (search.dtExpiryFrom != DateTime.MinValue && search.dtExpiryTo != DateTime.MinValue)
            {
                sqlCondition += $" AND expirydate BETWEEN '{search.dtExpiryFrom:yyyy-MM-dd}' AND '{search.dtExpiryTo:yyyy-MM-dd}'";
            }
            else if (search.dtExpiryFrom != DateTime.MinValue)
            {
                sqlCondition += $" AND expirydate >= '{search.dtExpiryFrom:yyyy-MM-dd}'";
            }
            else if (search.dtExpiryTo != DateTime.MinValue)
            {
                sqlCondition += $" AND expirydate <= '{search.dtExpiryTo:yyyy-MM-dd}'";
            }
            if (search.institutePlan != 0)
            {
                sqlCondition += " AND institutePlan = " + search.institutePlan;
            }
            #region Sorting
            string direction =
            search.SortDirection?.ToLower() == "asc"
            ? "ASC"
            : "DESC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "InstituteName":
                    orderByColumn = "i.Institutename";
                    break;

                case "CpEmail":
                    orderByColumn = "i.CpEmail";
                    break;

                default:
                    orderByColumn = "i.Instituteid";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy) &&
                orderByColumn != "i.Instituteid")
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, i.Instituteid {direction}";
            }
            else
            {
                orderByClause = $"ORDER BY i.Instituteid {direction}";
            }
            #endregion Sorting
            string query = string.Format(InstituteQueries.GetInstitutes, sqlCondition, orderByClause);

            string cntquery = string.Format(InstituteQueries.GetInstitutesCount, sqlCondition);

            var parameters = new
            {
                PageSize = search.PageSize,
                Offset = search.Offset
            };

            // Get total count
            var stopwatch = Stopwatch.StartNew();
            var countResult = await db.QueryFirstOrDefaultAsync<int>(cntquery, parameters);
            Console.WriteLine(
    $"Institute COUNT Query: {stopwatch.ElapsedMilliseconds} ms"
);
            stopwatch.Restart();
            int totalCount = countResult;

            // Get paginated data
            var institutes = await db.QueryAsync(query, parameters);
            Console.WriteLine(
    $"Institute SELECT Query: {stopwatch.ElapsedMilliseconds} ms"
);
            var instituteList = new List<InstituteListItemDto>();

            foreach (var row in institutes)
            {
                double taxRate = row.tax_rate ?? 0;

                instituteList.Add(new InstituteListItemDto
                {
                    InstituteId = (int)row.Instituteid,
                    InstituteName = row.Institutename,
                    ContactPerson = row.Contactperson,
                    Address = row.Address,
                    City = row.City,
                    CpMobile = row.CpMobile,
                    CpEmail = row.CpEmail,
                    State = row.state,
                    InstituteStatus = row.status,
                    TaxRate = taxRate,
                    RegDate = row.RegDate?.ToString() ?? "",
                    PayType = row.PayType?.ToString() ?? "",
                    RegType = row.RegType?.ToString() ?? "",
                    ExpiryDate = row.Expirydate?.ToString() ?? "",
                    InstitutePlan = row.institutePlan ?? ""
                });
            }

            return new PagedResponse<InstituteListItemDto>
            {
                Items = instituteList,
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<InstituteEditDto?> GetInstituteByIdAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var institute = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetInstituteById, new { InstituteId = instituteId });

            if (institute == null)
                return null;

            return new InstituteEditDto
            {
                InstituteId = (int)institute.Instituteid,
                InstituteName = institute.Institutename,
                ContactPerson = institute.contactPerson,
                Phone = institute.Phone,
                Email = institute.Email,
                Address = institute.Address,
                City = institute.City,
                Logo = institute.Logo,
                CpMobile = institute.CpMobile,
                CpEmail = institute.CpEmail,
                State = institute.state,
                PinCode = institute.pincode,
                instituteStatus = Convert.ToBoolean(institute.institute_STATUS),
                RegDate = institute.RegDate?.ToString() ?? "",
                instituteType = institute.RegType != null ? Convert.ToByte(institute.RegType) : (byte)0,
                instituteExpiryDate = institute.ExpiryDate?.ToString() ?? "",
                NoOfStudents = (int)institute.NoOfStudents,
                NoOfReg = (int)institute.NoOfReg,
                NoOfEnq = (int)institute.NoOfEnq,
                PayType = (byte)institute.PayType,
                Total = (byte)institute.Total,
                Enq = (byte)institute.Enq,
                Reg = (byte)institute.Reg,
                NoOfBranches = (int)institute.NoOfBranches,
                //District = institute.District ?? "",
                isAllowStudModule = (byte)institute.AllowStudModule,
                LogoPath = institute.LogoPath ?? "",
                CountryId = (int)institute.countryid,
                StateId = (int)institute.stateid,
                CityId = (int)institute.cityid,
                OtherCity = institute.othercity ?? "",
                isAllowedAndroidApp = Convert.ToBoolean(institute.IsAllowedAndroidApp),
                isAllowTestEngine = Convert.ToBoolean(institute.IsAllowTestEngine),
                InstNoofStuds = (int)institute.InstituteNoofStudents,
                InstProCoachingFor = institute.InstituteProCoachingFor ?? "",
                SalesPersonName = institute.salespersonname ?? "",
                InstituteShortCode = institute.InstituteShortCode ?? "",
                ParentCompanyName = institute.ParentCompanyName ?? "",
                institutePlanId = institute.institutePlan ?? 0,
                isInternalUse = (bool)institute.isinternal,
            };
        }

        public async Task<PagedResponse<AccountHistoryDto>> GetAccountHistoryAsync(AccountHistorySearchDto search)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            string query = InstituteQueries.GetAccountHistory;
            string cntquery = InstituteQueries.GetAccountHistoryCount;

            if (!string.IsNullOrEmpty(search.PlanName))
                query += " AND IF(oph.IsBranchWise,'Branch Wise','Student Wise') LIKE '" + search.PlanName + "%'";

            if (search.SearchStatus == "0")
                query += " AND oph.isactive = 0";
            else if (search.SearchStatus == "1")
                query += " AND oph.isactive = 1";

            var parameters = new
            {
                InstId = search.InstId,
                PageSize = search.PageSize,
                Offset = search.Offset
            };

            // Get total count
            int totalCount = await db.QueryFirstOrDefaultAsync<int>(cntquery, parameters);

            // Get paginated data
            var accountHistory = await db.QueryAsync(query, parameters);
            var accountHistoryList = new List<AccountHistoryDto>();

            foreach (var row in accountHistory)
            {
                accountHistoryList.Add(new AccountHistoryDto
                {
                    PaymentHistoryId = row.paymenthistoryid != null ? Convert.ToInt32(row.paymenthistoryid) : 0,
                    UserId = row.user_id != null ? Convert.ToInt32(row.user_id) : 0,
                    PurchaseDate = row.purchasedate?.ToString() ?? "",
                    Amount = row.amount != null ? Convert.ToDecimal(row.amount) : 0m,
                    StartDate = row.startdate?.ToString() ?? "",
                    EndDate = row.enddate?.ToString() ?? "",
                    IsActive = row.isactive != null ? Convert.ToInt32(row.isactive) : 0,
                    TotalAmount = row.totalamount != null ? Convert.ToDecimal(row.totalamount) : 0m,
                    NoOfStudents = row.noofstudents != null ? Convert.ToInt32(row.noofstudents) : 0,
                    Days = row.Days != null ? Convert.ToInt32(row.Days) : 0,
                    Months = row.Months != null ? Convert.ToInt32(row.Months) : 0,
                    NoOfEnquiry = row.noofenquiry != null ? Convert.ToInt32(row.noofenquiry) : 0,
                    Type = row.Type ?? "",
                    NoOfBranches = row.NoofBranches != null ? Convert.ToInt32(row.NoofBranches) : 0
                });
            }

            return new PagedResponse<AccountHistoryDto>
            {
                Items = accountHistoryList,
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<(bool Success, string Message)> DeleteInstituteAsync(int instituteId, bool status)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();
            try
            {
                if (status == false)
                {
                    // Soft delete - just update status
                    await db.ExecuteAsync(InstituteQueries.SoftDeleteInstitute, new { InstituteId = instituteId, Status = 0 }, transaction);
                    transaction.Commit();
                    return (true, "Institute deactivated successfully");
                }

                else if (status == true)
                {
                    try
                    {
                        // Hard delete - cascade delete all related data
                        await db.ExecuteAsync(
            InstituteQueries.DeleteInstituteCascade,
            new { InstituteId = instituteId },
            transaction,
            commandTimeout: 120
        );
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstUser, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstTest, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstTrainer, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstPayment, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstBatch, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstInventory, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstLibrary, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstituteHostel, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstituteTransport, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstituteHealth, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstFranchisee, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstStudent, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstStudentCourse, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstConfig, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstNotification, new { InstituteId = instituteId }, transaction);
                        //await db.ExecuteAsync(InstituteQueries.DeleteInstBranch, new { InstituteId = instituteId }, transaction);

                        //await db.ExecuteAsync(InstituteQueries.DeleteInstitute, new { InstituteId = instituteId }, transaction);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return (false, $"Error deleting institute: {ex.Message}");
                    }

                    transaction.Commit();
                    return (true, "Institute deleted successfully");
                }
                else
                {
                    return (false, "Invalid status value");
                }
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error deleting institute: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> SubmitInstituteAsync(InstituteSubmitDto request, int instituteId, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                if (!string.IsNullOrEmpty(request.RegDate))
                {
                    if (DateTime.TryParse(request.RegDate, out DateTime regDateCheck))
                    {
                        if (regDateCheck.Date > DateTime.Now.Date)
                            return (false, "Date cannot be future date");
                    }
                }

                // Validate duplicate short code
                if (!string.IsNullOrEmpty(request.InstituteShortCode))
                {
                    var duplicateCheck = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckDuplicateInstituteShortCode, new { ShortCode = request.InstituteShortCode, InstituteId = 0 }, transaction);
                    if (duplicateCheck != null)
                        return (false, "Institute short code already exists");
                }

                // Validate subscription type fields
                if (request.Subscription != null)
                {
                    if (request.Subscription.SubscriptionType == 1 && request.Subscription.NoOfBranches == 0)
                        return (false, "Please enter no. of branches");
                    else if (request.Subscription.SubscriptionType == 0 && request.Subscription.NoOfRegStudents == 0)
                        return (false, "Please enter no. of register students");
                    else if (request.Subscription.SubscriptionType == 0 && request.Subscription.NoOfEnquiry == 0)
                        return (false, "Please enter no. of enquiry students");

                    if (request.Subscription.SubscriptionType > 0)
                    {
                        // Check current plan expiry for non-zero subscription type
                        if (!string.IsNullOrEmpty(request.Subscription.StartDate))
                        {
                            string startDate = DateTime.TryParse(request.Subscription.StartDate, out DateTime sDate) ? sDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");
                            var currentPlan = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = instituteId, TodaysDate = startDate }, transaction);
                            if (currentPlan != null)
                                return (false, $"The institute already has subscription with this start date {request.Subscription.StartDate}. Please select new start date.");

                            var branchCount = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetBranchCount, new { InstId = instituteId }, transaction);
                            if (branchCount != null && branchCount?.noofbranches > request.Subscription.NoOfBranches)
                            {
                                return (false, $"The institute already has {branchCount?.noofbranches} branches. Please remove the extra branches.");
                            }
                        }

                        // Student/Enquiry validation for subscription type 2
                        if (request.Subscription.SubscriptionType == 0)
                        {
                            var instStatus = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckInstStatus, new { InstId = instituteId }, transaction);
                            if (instStatus != null)
                            {
                                string todaysDate = DateTime.Now.ToString("yyyy-MM-dd");
                                var currentPlan = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = instituteId, TodaysDate = todaysDate }, transaction);

                                // Check registered students
                                if (instStatus.IsBranchwise == 0)
                                {
                                    if (instStatus.regcount > request.Subscription.NoOfRegStudents)
                                        return (false, $"The institute already has {instStatus.regcount} registered students. Please remove the extra students.");
                                }

                                // Check enquiries
                                if (instStatus.IsBranchwise == 0)
                                {
                                    if (instStatus.enqcount > request.Subscription.NoOfEnquiry)
                                        return (false, $"The institute already has {instStatus.enqcount} enquiries. Please remove the extra students.");
                                }
                            }
                        }
                    }
                    //if (request.Subscription.SubscriptionType > 0)
                    //{
                    //    // Check current plan expiry for non-zero subscription type
                    //    if (request.Subscription.SubscriptionType != 0 && !string.IsNullOrEmpty(request.Subscription.StartDate))
                    //    {
                    //        string startDate = DateTime.TryParse(request.Subscription.StartDate, out DateTime sDate) ? sDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");
                    //        var currentPlan = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = instituteId, TodaysDate = startDate }, transaction);
                    //        if (currentPlan != null)
                    //            return (false, $"The institute already has subscription with this start date {request.Subscription.StartDate}. Please select new start date.");

                    //        var branchCount = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetBranchCount, new { InstId = instituteId }, transaction);
                    //        if (branchCount != null && branchCount.noofbranches > 0)
                    //        {
                    //            if (branchCount.noofbranches > request.Subscription.NoOfBranches)
                    //                return (false, $"The institute already has {branchCount.noofbranches} branches. Please remove the extra branches.");
                    //        }
                    //    }

                    //    // Student/Enquiry validation for subscription type 2
                    //    if (request.Subscription.SubscriptionType == 2)
                    //    {
                    //        var instStatus = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckInstStatus, new { InstId = instituteId }, transaction);
                    //        if (instStatus != null)
                    //        {
                    //            string todaysDate = DateTime.Now.ToString("yyyy-MM-dd");
                    //            var currentPlan = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = instituteId, TodaysDate = todaysDate }, transaction);

                    //            // Check registered students
                    //            if (instStatus.IsBranchwise == 0)
                    //            {
                    //                if (instStatus.regcount > request.Subscription.NoOfRegStudents)
                    //                    return (false, $"The institute already has {instStatus.regcount} registered students. Please remove the extra students.");
                    //            }

                    //            // Check enquiries
                    //            if (instStatus.IsBranchwise == 0)
                    //            {
                    //                if (instStatus.enqcount > request.Subscription.NoOfEnquiry)
                    //                    return (false, $"The institute already has {instStatus.enqcount} enquiries. Please remove the extra students.");
                    //            }
                    //        }
                    //    }
                    //}
                }

                bool IsBranchwise = false;
                if (request.Subscription?.SubscriptionType == 1)
                    IsBranchwise = true;

                // Create new institute
                var parameters = new
                {
                    InstituteShortCode = request.InstituteShortCode,
                    ParentCompanyName = request.ParentCompanyName,
                    Institutename = request.InstituteName,
                    Contactperson = request.ContactPerson,
                    Phone = request.Phone,
                    Email = request.Email,
                    Address = request.Address,
                    Logo = request.Logo,
                    CpMobile = request.CpMobile,
                    CpEmail = request.CpEmail,
                    pincode = request.PinCode,
                    RegDate = DateTime.TryParse(request.RegDate, out DateTime parsedRegDate) ? parsedRegDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd"),
                    NoOfStudents = request.NoOfStudents,
                    InstProCoachingFor = request.InstProCoachingFor,
                    SalesPersonName = request.SalesPersonName,
                    ExpiryDate = DateTime.TryParse(request.instituteExpiryDate, out DateTime expDate) ? expDate.ToString("yyyy-MM-dd") : DateTime.Now.AddYears(1).ToString("yyyy-MM-dd"),
                    AllowStudModule = request.isAllowStudModule,
                    LogoPath = request.LogoPath,
                    InstituteStatus = request.instituteStatus,
                    RegType = request.instituteType,
                    countryid = request.CountryId,
                    stateid = request.StateId,
                    cityid = request.CityId,
                    othercity = request.OtherCity,
                    IsAllowedAndroidApp = request.isAllowedAndroidApp,
                    IsAllowTestEngine = request.isAllowTestEngine,
                    isInternalUse = request.isInternalUse,

                    SubscriptionType = request.Subscription?.SubscriptionType,
                    StartDate = request.Subscription?.StartDate,
                    EndDate = request.Subscription?.EndDate,
                    NoOfDays = request.Subscription?.NoOfDays ?? 0,
                    NoOfReg = request.Subscription?.NoOfRegStudents ?? 0,
                    NoOfEnq = request.Subscription?.NoOfEnquiry ?? 0,
                    NoOfBranches = request.Subscription?.NoOfBranches ?? 0,
                    IsBranchwise,
                    userId,
                    ipAddress,
                    institute_status = request.instituteStatus,
                    institutePlan = request.institutePlanId,
                };

                int instituteIds = await db.QuerySingleAsync<int>(InstituteQueries.CreateInstituteFull, parameters, transaction);

                transaction.Commit();

                // Add new subscription
                int subscriptionIsBranchWise = request.Subscription.SubscriptionType == 1 ? 1 : 0;
                string startDatePlan = DateTime.TryParse(request.Subscription.StartDate, out DateTime sDatePlan) ? sDatePlan.ToString("yyyy-MM-dd HH:mm") : DateTime.Now.ToString("yyyy-MM-dd HH:mm");
                string endDatePlan = DateTime.TryParse(request.Subscription.EndDate, out DateTime eDatePlan) ? eDatePlan.ToString("yyyy-MM-dd HH:mm") : DateTime.Now.AddMonths(request.Subscription.NoOfDays).ToString("yyyy-MM-dd HH:mm");
                if (request.Subscription.SubscriptionType != 2)
                {
                    var subscriptionParams = new
                    {
                        userId = userId,
                        purchasedate = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                        startdate = startDatePlan,
                        enddate = endDatePlan,
                        amount = 0,
                        discountcode = string.Empty,
                        discountamount = 0,
                        netamount = 0,
                        taxpercent = 0,
                        totalamount = 0,
                        remark = string.Empty,
                        isactive = request.Subscription.planStatus,
                        instid = instituteIds,
                        branchid = 0,
                        noofmonths = request.Subscription.NoOfDays,
                        noofstudents = request.Subscription.SubscriptionType == 0 ? request.Subscription.NoOfRegStudents : 0,
                        noofenquiry = request.Subscription.SubscriptionType == 0 ? request.Subscription.NoOfEnquiry : 0,
                        IsBranchWise = subscriptionIsBranchWise,
                        NoofBranches = request.Subscription.SubscriptionType == 1 ? request.Subscription.NoOfBranches : 0
                    };

                    await db.ExecuteAsync(InstituteQueries.AddAccount, subscriptionParams, transaction);
                }
                return (true, "Institute saved successfully");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error creating institute: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> EditInstituteAsync(InstituteEditSubmitDto request, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                if (request.InstituteId == 0)
                    return (false, "InstituteId is required for edit operation");

                // Validate RegDate - cannot be future date
                if (!string.IsNullOrEmpty(request.RegDate))
                {
                    if (DateTime.TryParse(request.RegDate, out DateTime regDateCheck))
                    {
                        if (regDateCheck.Date > DateTime.Now.Date)
                            return (false, "Date cannot be future date");
                    }
                }

                // Validate duplicate short code
                if (!string.IsNullOrEmpty(request.InstituteShortCode))
                {
                    var duplicateCheck = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckDuplicateInstituteShortCode, new { ShortCode = request.InstituteShortCode, InstituteId = request.InstituteId }, transaction);
                    if (duplicateCheck != null)
                        return (false, "Institute short code already exists");
                }

                // Validate subscription type fields
                if (request.Subscription != null && request.Subscription.StartDate != "" && request.Subscription.EndDate != "")
                {
                    if(request.Subscription.SubscriptionType==0 && request.Subscription.NoOfRegStudents == 0 && request.Subscription.NoOfEnquiry == 0)
                    {
                        return (false, "Please select subscription plan.");
                    }
                    if (request.Subscription.SubscriptionType == 1 && request.Subscription.NoOfBranches == 0)
                        return (false, "Please enter no. of branches.");
                    else if (request.Subscription.SubscriptionType == 0 && request.Subscription.NoOfRegStudents == 0)
                        return (false, "Please enter no. of register students.");
                    else if (request.Subscription.SubscriptionType == 0 && request.Subscription.NoOfEnquiry == 0)
                        return (false, "Please enter no. of enquiry students.");

                    // Check current plan expiry for non-zero subscription type
                    if (request.Subscription.SubscriptionType != 0 && !string.IsNullOrEmpty(request.Subscription.StartDate))
                    {
                        string startDate = DateTime.TryParse(request.Subscription.StartDate, out DateTime sDate) ? sDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd");
                        var currentPlan = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = request.InstituteId, TodaysDate = startDate }, transaction);
                        if (currentPlan != null)
                            return (false, $"The selected start date ({request.Subscription.StartDate:yyyy-MM-dd}) overlaps with an existing active plan.{Environment.NewLine}Please choose a start date after {currentPlan.enddate:yyyy-MM-dd}.");
                        //return (false, $"The institute already has subscription with this start date {request.Subscription.StartDate}. Please select new start date.");
                    }

                    // Branch validation for subscription type 1
                    if (request.Subscription.SubscriptionType == 1)
                    {
                        var branchCount = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetBranchCount, new { InstId = request.InstituteId }, transaction);
                        if (branchCount != null && branchCount.noofbranches > 0)
                        {
                            if (branchCount.noofbranches > request.Subscription.NoOfBranches)
                                return (false, $"The institute already has {branchCount.noofbranches} branches. Please remove the extra branches.");
                        }
                    }

                    // Student/Enquiry validation for subscription type 0
                    if (request.Subscription.SubscriptionType == 0)
                    {
                        var branchCount = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetBranchCount, new { InstId = request.InstituteId }, transaction);
                        if (branchCount != null && branchCount.noofbranches > 0)
                        {
                            if (branchCount.noofbranches > request.Subscription.NoOfBranches)
                                return (false, $"The institute already has {branchCount.noofbranches} branches. Please remove the extra branches.");
                        }

                        var instStatus = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckInstStatus, new { InstId = request.InstituteId }, transaction);
                        if (instStatus != null)
                        {
                            string todaysDate = DateTime.Now.ToString("yyyy-MM-dd");
                            var currentPlan = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = request.InstituteId, TodaysDate = todaysDate }, transaction);

                            // Check registered students
                            if (instStatus.IsBranchwise == 0)
                            {
                                if (instStatus.regcount > request.Subscription.NoOfRegStudents)
                                    return (false, $"The institute already has {instStatus.regcount} registered students. Please remove the extra students.");
                            }

                            // Check enquiries
                            if (instStatus.IsBranchwise == 0)
                            {
                                if (instStatus.enqcount > request.Subscription.NoOfEnquiry)
                                    return (false, $"The institute already has {instStatus.enqcount} enquiries. Please remove the extra students.");
                            }
                        }
                    }
                }

                // Get user ID for subscription
                var userIdResult = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetUserIdByInstituteId, new { InstituteId = request.InstituteId }, transaction);
                int instituteUserId = userIdResult?.User_id ?? 0;

                // Set IsBranchWise based on subscription
                int isBranchWise = -1;

                if (request.Subscription != null &&
                    request.Subscription.NoOfDays > 0)
                {
                    if (request.Subscription.SubscriptionType == 1)
                        isBranchWise = 1; // Branch Wise
                    else if (request.Subscription.SubscriptionType == 2)
                        isBranchWise = 2; // Trial
                    else
                        isBranchWise = 0; // Student Wise
                }
                var parameters = new
                {
                    InstituteShortCode = request.InstituteShortCode,
                    ParentCompanyName = request.ParentCompanyName,
                    Institutename = request.InstituteName,
                    Contactperson = request.ContactPerson,
                    Phone = request.Phone,
                    Email = request.Email,
                    Address = request.Address,
                    Logo = request.Logo,
                    CpMobile = request.CpMobile,
                    CpEmail = request.CpEmail,
                    pincode = request.PinCode,
                    RegDate = DateTime.TryParse(request.RegDate, out DateTime parsedRegDate) ? parsedRegDate.ToString("yyyy-MM-dd") : DateTime.Now.ToString("yyyy-MM-dd"),
                    NoOfStudents = request.NoOfStudents,
                    NoOfReg = request.Subscription?.NoOfRegStudents ?? 0,
                    NoOfEnq = request.Subscription?.NoOfEnquiry ?? 0,
                    InstProCoachingFor = request.InstProCoachingFor,
                    SalesPersonName = request.SalesPersonName,
                    ExpiryDate = DateTime.TryParse(request.instituteExpiryDate, out DateTime expDate) ? expDate.ToString("yyyy-MM-dd") : DateTime.Now.AddYears(1).ToString("yyyy-MM-dd"),
                    AllowStudModule = request.isAllowStudModule ? 1 : 0,
                    LogoPath = request.LogoPath,
                    InstituteStatus = request.instituteStatus,
                    RegType = request.instituteType,
                    NoOfBranches = request.Subscription?.NoOfBranches ?? 0,
                    countryid = request.CountryId,
                    stateid = request.StateId,
                    cityid = request.CityId,
                    othercity = request.OtherCity,
                    IsAllowedAndroidApp = request.isAllowedAndroidApp,
                    IsAllowTestEngine = request.isAllowTestEngine,
                    isInternalUse = request.isInternalUse,
                    IsBranchWise = isBranchWise,
                    LastModfiedTimestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                    LastModifiedByUserID = userId,
                    IpAddress = ipAddress,
                    instituteid = request.InstituteId,
                    institutePlan = request.institutePlanId,
                };

                await db.ExecuteAsync(InstituteQueries.UpdateInstitute, parameters, transaction);

                // Add subscription/account history if provided
                if (request.Subscription != null && request.Subscription.NoOfDays > 0)
                {
                    var todaysDate = DateTime.Now.ToString("yyyy-MM-dd");
                    string startDate = DateTime.TryParse(request.Subscription.StartDate, out DateTime sDate) ? sDate.ToString("yyyy-MM-dd HH:mm") : DateTime.Now.ToString("yyyy-MM-dd HH:mm");
                    string endDate = DateTime.TryParse(request.Subscription.EndDate, out DateTime eDate) ? eDate.ToString("yyyy-MM-dd HH:mm") : DateTime.Now.AddMonths(request.Subscription.NoOfDays).ToString("yyyy-MM-dd HH:mm");
                    // Commented by Nikhil L. on 26-08-2026 to stop multiple updates
                    // Update current hold plans to inactive
                    //var holdPlans = await db.QueryAsync(InstituteQueries.CheckCurrentPlanHold, new { InstId = request.InstituteId, TodaysDate = todaysDate }, transaction);
                    //foreach (var plan in holdPlans)
                    //{
                    //    await db.ExecuteAsync(InstituteQueries.UpdatePlanStatus, new { PaymentHistoryId = plan.paymenthistoryid, UserId = plan.user_id }, transaction);
                    //}

                    //// Update future plans to inactive
                    //var futurePlans = await db.QueryAsync(InstituteQueries.CheckFutureDatePlan, new { InstId = request.InstituteId, TodaysDate = todaysDate }, transaction);
                    //foreach (var plan in futurePlans)
                    //{
                    //    await db.ExecuteAsync(InstituteQueries.UpdateHoldPlanStatus, new { PaymentHistoryId = plan.paymenthistoryid, UserId = plan.user_id }, transaction);
                    //}

                    // Add new subscription
                    int subscriptionIsBranchWise = request.Subscription.SubscriptionType == 1 ? 1 : 0;
                    if (request.Subscription.SubscriptionType==2 && request.Subscription.NoOfRegStudents == 0 && request.Subscription.NoOfEnquiry == 0)
                    {
                        subscriptionIsBranchWise = 2;
                    }
                    
                    //if (request.Subscription.SubscriptionType != 2)
                    //{
                        var subscriptionParams = new
                        {
                            userId = instituteUserId > 0 ? instituteUserId : userId,
                            purchasedate = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                            startdate = startDate,
                            enddate = endDate,
                            amount = 0,
                            discountcode = string.Empty,
                            discountamount = 0,
                            netamount = 0,
                            taxpercent = 0,
                            totalamount = 0,
                            remark = string.Empty,
                            isactive = request.Subscription.planStatus,
                            instid = request.InstituteId,
                            branchid = 0,
                            noofmonths = request.Subscription.NoOfDays,
                            noofstudents = request.Subscription.SubscriptionType == 0 ? request.Subscription.NoOfRegStudents : 0,
                            noofenquiry = request.Subscription.SubscriptionType == 0 ? request.Subscription.NoOfEnquiry : 0,
                            IsBranchWise = subscriptionIsBranchWise,
                            NoofBranches = request.Subscription.SubscriptionType == 1 ? request.Subscription.NoOfBranches : 0
                        };

                        await db.ExecuteAsync(InstituteQueries.AddAccount, subscriptionParams, transaction);
                    //}
                    // Update user reminder settings
                    var activeUsers = await db.QueryAsync(InstituteQueries.FillActiveUserofInstitute, new { InstId = request.InstituteId }, transaction);
                    foreach (var user in activeUsers)
                    {
                        await db.ExecuteAsync(InstituteQueries.UpdateRemindMe, new { UserId = user.User_id, RemindMe = 1 }, transaction);
                    }
                }

                transaction.Commit();

                return (true, "Institute updated successfully");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error updating institute: {ex.Message}");
            }
        }
        public async Task<AccountHistoryDto?> GetAccountHistoryByIdAsync(int payHistoryId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var accountHistory = await db.QueryFirstOrDefaultAsync(InstituteQueries.GetAccountHistoryById, new { PaymentHistoryId = payHistoryId });

            if (accountHistory == null)
                return null;
            var dto = new AccountHistoryDto();
            void TryAssign(string fieldName, Action action)
            {
                try
                {
                    action();
                }
                catch (Exception ex)
                {
                    throw new Exception($"FAILED ON COLUMN [{fieldName}]: {ex.Message}", ex);
                }
            }
            TryAssign("paymentHistoryId", () => dto.PaymentHistoryId = Convert.ToInt32(accountHistory.paymenthistoryid));
            TryAssign("purchaseDate", () => dto.PurchaseDate = accountHistory.purchasedate?.ToString());
            TryAssign("startDate", () => dto.StartDate = accountHistory.startdate?.ToString());
            TryAssign("endDate", () => dto.EndDate = accountHistory.enddate?.ToString());
            TryAssign("amount", () => dto.Amount = Convert.ToDecimal(accountHistory.amount));
            TryAssign("DiscountCode", () => dto.DiscountCode = Convert.ToString(accountHistory.discountcode));
            TryAssign("DiscountAmount", () => dto.DiscountAmount = Convert.ToDecimal(accountHistory.discountamount));
            TryAssign("NetAmount", () => dto.NetAmount = Convert.ToDecimal(accountHistory.netamount));
            TryAssign("TaxPercent", () => dto.TaxPercent = Convert.ToDecimal(accountHistory.taxpercent));
            TryAssign("remark", () => dto.Remark = Convert.ToString(accountHistory.remark));
            TryAssign("isActive", () =>
            {
                var val = accountHistory.isactive;
                if (val is bool bVal)
                {
                    dto.IsActive = bVal ? 1 : 0;
                }
                else
                {
                    dto.IsActive = Convert.ToInt32(val);
                }
            });
            TryAssign("noOfStudents", () => dto.NoOfStudents = Convert.ToInt32(accountHistory.noofstudents));
            TryAssign("noOfEnquiry", () => dto.NoOfEnquiry = Convert.ToInt32(accountHistory.noofenquiry));
            TryAssign("noOfBranches", () => dto.NoOfBranches = Convert.ToInt32(accountHistory.NoofBranches));
            TryAssign("days", () => dto.Days = Convert.ToInt32(accountHistory.noofmonths));
            TryAssign("type", () =>
    dto.Type = Convert.ToInt32(accountHistory.IsBranchWise) == 1 ? "Branch Wise" : "Student Wise"
);
            return dto;
            //return new AccountHistoryDto
            //{
            //    PaymentHistoryId = Convert.ToInt32(accountHistory.paymenthistoryid),
            //    PurchaseDate = accountHistory.purchasedate,
            //    StartDate = accountHistory.startdate,
            //    EndDate = accountHistory.enddate,
            //    Amount = accountHistory.amount != null ? Convert.ToDecimal(accountHistory.amount) : 0m,
            //    DiscountCode = Convert.ToString(accountHistory.discountcode),
            //    DiscountAmount = accountHistory.discountamount != null ? Convert.ToDecimal(accountHistory.discountamount) : 0m,
            //    NetAmount = accountHistory.netamount != null ? Convert.ToDecimal(accountHistory.netamount) : 0m,
            //    TaxPercent = accountHistory.taxpercent != null ? Convert.ToDecimal(accountHistory.taxpercent) : 0m,
            //    Remark = Convert.ToString(accountHistory.remark),
            //    IsActive = Convert.ToInt32(accountHistory.isactive)
            //};
        }
        public async Task<(bool Success, string Message)> UpdateAccountHistoryAsync(AccountHistoryDto request, int userId, string ipAddress)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                int planstatus = 0;
                planstatus = Convert.ToInt32(request.IsActive);
                #region to check existing plan will not overide with new
                if (!planstatus.Equals(0))
                {
                    //if (!string.IsNullOrEmpty(request.InstituteShortCode))
                    //{
                    string todaysDate = DateTime.Now.ToString("yyyy-MM-dd");
                    var checkCurrentPlanExpiry = await db.QueryFirstOrDefaultAsync(InstituteQueries.CheckCurrentPlanExpiry, new { InstId = request.instId, TodaysDate = todaysDate }, transaction);
                    if (checkCurrentPlanExpiry != null)
                    {
                        if (request.PaymentHistoryId.Equals(checkCurrentPlanExpiry.paymenthistoryid))
                        {
                            return (false, $"An active subscription already exists for this institute until {checkCurrentPlanExpiry.enddate:yyyy-MM-dd}.{Environment.NewLine}Please select a start date after the current plan expires.");
                        }
                    }

                    //}
                    //objclsVariables.objclsCommonQuery = new ClsCommonQuery();
                    //objclsVariables.dsPlanDataSet = objclsVariables.objclsCommonQuery.dsCheckCurrentPlanExpiry(Convert.ToInt32(ViewState["instid"].ToString()), TimeZoneInfo.ConvertTimeBySystemTimeZoneId(Convert.ToDateTime(txtStartDateModal.Text.Trim()), TimeZone.CurrentTimeZone.StandardName, "India Standard Time").ToString("yyyy-MM-dd"));
                    //if (objclsVariables.dsPlanDataSet.Tables[0].Rows.Count > 0)
                    //{
                    //    if (!objclsVariables.objAccountHistory.PaymentHistoryId.Equals(Convert.ToInt32(objclsVariables.dsPlanDataSet.Tables[0].Rows[0][0])))
                    //    {
                    //        if (Convert.ToBoolean(objclsVariables.dsPlanDataSet.Tables[0].Rows[0][7]))
                    //        {
                    //            MessageBox.Show("The institute already has subscription with this start date " + txtStartDateModal.Text + Environment.NewLine + "Please select new start date.");
                    //            ModalPopupExtender1.Show();
                    //            ScriptManager.RegisterStartupScript(this, this.GetType(), "cimage", "ChangeImage()", true);
                    //            return;
                    //        }
                    //    }
                    //}
                }
                #endregion
                var parameters = new
                {
                    startdate = request.StartDate,
                    enddate=request.EndDate,
                    isactive=request.IsActive,
                    remark=request.Remark,
                    paymenthistoryid=request.PaymentHistoryId,
                    days=request.Days
                };
                await db.ExecuteAsync(InstituteQueries.UpdateAccountHistory, parameters, transaction);
                transaction.Commit();
                return (true, "Subscription status updated successfully.");
                //objclsVariables.objAccountHistory.StartDate = Convert.ToDateTime(txtStartDateModal.Text.Trim()).ToString("yyyy-MM-dd");
                //objclsVariables.objAccountHistory.EndDate = Convert.ToDateTime(txtEndDateModal.Text.Trim()).ToString("yyyy-MM-dd");
                //objclsVariables.objAccountHistory.IsActive = planstatus;
                //objclsVariables.objAccountHistory.Remark = txtremarkpopup.Text.Trim();

                //bool isRetVal = false;

                //isRetVal = objclsVariables.objAccountHistory.fncUpdateAccountHistoryById();

                //if (isRetVal)
                //{
                //    ScriptManager.RegisterStartupScript(this, this.GetType(), "pop123", "alert('Subscription status updated successfully')", true);
                //    FillAccountHistoryList();

                //    ViewState["statuspaymenthistoryid"] = null;
                //    ViewState["RowIndex"] = null;
                //}
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return (false, $"Error updating institute: {ex.Message}");
            }
        }
    }
}
