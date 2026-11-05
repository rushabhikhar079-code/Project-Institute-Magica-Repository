using Dapper;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class BranchRepository : IBranchRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly IEmailService _emailService;
        public BranchRepository(IDbConnectionFactory dbFactory, IEmailService emailService)
        {
            _dbFactory = dbFactory;
            _emailService = emailService;
        }

        public async Task<PagedResponse<BranchListItemDto>> GetBranchesAsync(int instituteId, BranchSearchDto search, int userRole, int userId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Build SQL condition dynamically
            string sqlCondition = string.Empty;

            if (instituteId != 0)
                sqlCondition += " AND Instituteid = " + instituteId + "";

            if (!string.IsNullOrEmpty(search.BranchName))
                sqlCondition += " AND branchname LIKE '" + search.BranchName + "%'";

            if (!string.IsNullOrEmpty(search.Email))
                sqlCondition += " AND CpEmail LIKE '%" + search.Email + "%'";

            if (!string.IsNullOrEmpty(search.ContactPerson))
                sqlCondition += " AND Contactperson LIKE '" + search.ContactPerson + "%'";

            if (!string.IsNullOrEmpty(search.Mobile))
                sqlCondition += " AND CpMobile = '" + search.Mobile + "'";

            if (!string.IsNullOrEmpty(search.City))
                sqlCondition += " AND cityid IN (SELECT CityId FROM countrycity WHERE cityname IN ('" + search.City + "'))";

            //if (search.Status != 2 && search.Status!=0)
            //    sqlCondition += " AND branch_status = " + search.Status;
            if (search.Status != 2)
                sqlCondition += " AND branch_status = " + search.Status;

            string query; string cntquery;
            var parameters = new
            {
                InstituteId = instituteId,
                UserId = userId,
                PageSize = search.PageSize,
                Offset = search.Offset
            };
            #region Sorting

            string direction =
                search.SortDirection?.ToLower() == "desc"
                    ? "DESC"
                    : "ASC";

            string orderByColumn;

            switch (search.SortBy)
            {
                case "BranchName":
                    orderByColumn = "Branchname";
                    break;

                default:
                    orderByColumn = "Branchid";
                    break;
            }

            string orderByClause;

            if (!string.IsNullOrEmpty(search.SortBy))
            {
                orderByClause =
                    $"ORDER BY {orderByColumn} {direction}, Branchid {direction}";
            }
            else
            {
                orderByClause =
                    "ORDER BY Branchid DESC, Branchid DESC";
            }

            #endregion
            // Check multi-branch status from database for non-admin users
            int MultiBranches = 0;
            if (userRole != 1 && userRole != 2 && userRole != 3 && userId > 0)
            {
                var branchCounts = await db.QueryAsync<int>(BranchQueries.CheckUserMultiBranch, new { InstituteId = instituteId, UserId = userId });
                int totalBranchCount = branchCounts.Sum();
                if (totalBranchCount > 1)
                {
                    MultiBranches = 1;
                }
            }

            // Select query based on user role
            if (userRole == 3)
            {
                query = string.Format(BranchQueries.GetBranchesForBranchAdmin, sqlCondition, orderByClause);
                cntquery = string.Format(BranchQueries.GetBranchesForBranchAdminCount, sqlCondition);
            }
            else if (userRole == 2)
            {
                query = string.Format(BranchQueries.GetBranchesForInstituteAdmin, sqlCondition, orderByClause);
                cntquery = string.Format(BranchQueries.GetBranchesForInstituteAdminCount, sqlCondition);
            }
            else if (MultiBranches == 1)
            {
                query = string.Format(BranchQueries.GetBranchesForMultiBranch, sqlCondition, orderByClause);
                cntquery = string.Format(BranchQueries.GetBranchesForMultiBranchCount, sqlCondition);
            }
            else
            {
                query = string.Format(BranchQueries.GetBranchesForGrid, sqlCondition, orderByClause);
                cntquery = string.Format(BranchQueries.GetBranchesForGridCount, sqlCondition);
            }

            // Get total count
            var countResult = await db.QueryFirstOrDefaultAsync<int>(cntquery, parameters);
            int totalCount = countResult;

            // Get paginated data
            var branches = await db.QueryAsync(query, parameters);
            var branchList = new List<BranchListItemDto>();

            foreach (var row in branches)
            {
                // Get tax rate from config table
                var taxRate = await db.QueryFirstOrDefaultAsync<string>(
                    BranchQueries.GetBranchTaxRate,
                    new { InstituteId = instituteId, BranchId = row.Branchid });

                double finalTaxRate = row.tax_rate ?? 0;
                if (!string.IsNullOrEmpty(taxRate))
                {
                    double.TryParse(taxRate, out finalTaxRate);
                }

                try
                {
                    object rawExpiry = row.expirydate;
                    string formattedExpiryDate = "";

                    if (rawExpiry != null && rawExpiry != DBNull.Value)
                    {
                        // Convert to string safely to check validity
                        string expiryStr = rawExpiry.ToString();
                        if (!string.IsNullOrEmpty(expiryStr) && DateTime.TryParse(expiryStr, out DateTime parsedDate))
                        {
                            formattedExpiryDate = parsedDate.ToString("dd/MM/yyyy");
                        }
                    }
                    branchList.Add(new BranchListItemDto
                    {
                        BranchId = (int)row.Branchid,
                        BranchName = row.Branchname,
                        ContactPerson = row.Contactperson,
                        CpMobile = row.CpMobile,
                        CpEmail = row.CpEmail,
                        statusId = (int)row.bid,
                        BranchStatus = Convert.ToInt32(row.BRANCH_STATUS) == 1 ? "Active" : "Inactive", //Change made by nikhil on 10-08-2026, replace branch_status with BRANCH_STATUS as per sql query.
                        FranchiseeFlag = row.franchiseeflag,
                        TaxRate = finalTaxRate,
                        ExpiryDate = formattedExpiryDate
                    });
                }
                catch (Exception ex)
                {
                    throw;
                }
            }

            return new PagedResponse<BranchListItemDto>
            {
                Items = branchList,
                TotalCount = totalCount,
                PageNumber = search.PageNumber,
                PageSize = search.PageSize
            };
        }

        public async Task<(BranchEditDto? Branch, string? ErrorMessage)> GetBranchByIdAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Check institute status
            var instStatus = await db.QueryFirstOrDefaultAsync(
                BranchQueries.CheckInstituteStatus,
                new { InstituteId = instituteId }
            );

            if (instStatus != null &&
                instStatus.paytype != null &&
                instStatus.paytype.ToString() == "1")
            {
                // Check branch expiry date
                var branchExpiry = await db.QueryFirstOrDefaultAsync(
                    "SELECT expirydate FROM branch WHERE Branchid = @BranchId",
                    new { BranchId = branchId }
                );

                if (branchExpiry != null && branchExpiry.expirydate != null)
                {
                    DateTime expiryDate = Convert.ToDateTime(branchExpiry.expirydate);
                    DateTime currentDate = DateTime.Now;

                    if (currentDate.Date > expiryDate.Date)
                    {
                        return (
                            null,
                            "Branch access date has expired. Please contact Techior Solutions."
                        );
                    }
                }
            }

            var branch = await db.QueryFirstOrDefaultAsync(
                BranchQueries.GetBranchById,
                new
                {
                    InstituteId = instituteId,
                    BranchId = branchId
                }
            );
            Console.WriteLine($"Branch ID: {branchId}");
            Console.WriteLine($"Branch Status from DB: {branch?.Status}");
            if (branch == null)
                return (null, "Branch not found.");

            var courseList = new List<CourseDto>();
            if (branch.franchiseeflag == 1)
            {
                int franchiseeId = await db.QueryFirstOrDefaultAsync<int>(
    BranchQueries.GetFranchiseeByBranchId,
    new { BranchId = branchId }
);


                //var existingFranchisee = await db.QueryFirstOrDefaultAsync(BranchQueries.GetFranchiseeByBranchId, new { BranchId = branchId });
                //if (existingFranchisee.HasValue)
                //{
                //    int id = existingFranchisee.Value;

                //    // use id here
                //}
                //int franchiseeId = existingFranchisee?.FranchiseeId ?? 0;
                if (franchiseeId > 0)
                {
                    // Fetch courses for the branch
                    var courses = await db.QueryAsync(BranchQueries.GetCourses, new { BranchId = branchId });

                    foreach (var course in courses)
                    {
                        // Fetch subjects for each course
                        var subjects = await db.QueryAsync(BranchQueries.GetFranchiseeFee, new { CourseId = course.courseid });
                        var subjectList = new List<SubjectDto>();

                        foreach (var subject in subjects)
                        {
                            subjectList.Add(new SubjectDto
                            {
                                SubId = (int)subject.subid,
                                SubName = subject.sub_name,
                                Fees = subject.Fees,
                                StudCount = subject.StudCount,
                                TotalFees = subject.TotalFees,
                                Commission = subject.commission
                            });
                        }

                        courseList.Add(new CourseDto
                        {
                            CourseId = (int)course.courseid,
                            CourseName = course.course_name,
                            Subjects = subjectList
                        });
                    }
                }
                else
                {
                    var courses = await db.QueryAsync(BranchQueries.GetCourses, new { BranchId = branchId });

                    foreach (var course in courses)
                    {
                        // Fetch subjects for each course
                        var subjects = await db.QueryAsync(BranchQueries.GetSubjects, new { CourseId = course.courseid });
                        var subjectList = new List<SubjectDto>();

                        foreach (var subject in subjects)
                        {
                            subjectList.Add(new SubjectDto
                            {
                                SubId = (int)subject.subid,
                                SubName = subject.sub_name,
                                Fees = subject.Fees,
                                StudCount = subject.StudCount,
                                TotalFees = subject.TotalFees,
                                Commission = subject.commission
                            });
                        }

                        courseList.Add(new CourseDto
                        {
                            CourseId = (int)course.courseid,
                            CourseName = course.course_name,
                            Subjects = subjectList
                        });
                    }
                }
            }

            return (new BranchEditDto
            {
                // Branch details
                BranchId = (int)branch.Branchid,
                BranchName = branch.Branchname,
                Address = branch.address,

                CityId = branch.CityId != null
                    ? (int)branch.CityId
                    : 0,

                StateId = branch.StateId != null
                    ? (int)branch.StateId
                    : 0,

                CountryId = branch.CountryId != null
                    ? (int)branch.CountryId
                    : 0,

                PinCode = branch.pinCode,
                Phone = branch.phone,
                Email = branch.email,

                ContactPerson = branch.Contactperson,
                CpMobile = branch.cpMobile,
                CpEmail = branch.cpEmail,

                BranchCode = branch.branchcode,

                TaxRate = branch.tax_rate ?? 0,

                OtherCity = branch.othercity,

                MakeFranchisee = branch.franchiseeflag,
                Status = branch.Status ? 1 : 0,
                Courses = courseList,
                // Franchisee details
                // Franchisee
                RegDate = DateTime.TryParse(
    branch.RegDate?.ToString(),
    out DateTime parsedRegDate
)
    ? parsedRegDate
    : null,
                SignUp_Amt = branch.SignUp_Amt ?? 0,
                Monthly_Fee = branch.Monthly_Fee ?? 0,
                Exam_Fee = branch.Exam_Fee ?? 0,
                Certification_Fee = branch.Certification_Fee ?? 0,
                Commision_All = branch.Commision_All ?? 0,
                Stud_Fixed_Fee = branch.Stud_Fixed_Fee ?? 0,

                // Only return filename when loading edit
                AgreementFileName = branch.AgreementFileName ?? "",

                // Don't return LONGBLOB here
                AgreementFile = null
            }, null);
        }

        public async Task<(bool Success, string Message, int? BranchId)> CreateBranchAsync(int instituteId, int userId, BranchSubmitDto branch)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Check duplicate branch name
            var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                BranchQueries.CheckDuplicateBranchName,
                new { BranchName = branch.BranchName, InstituteId = instituteId, BranchId = 0 });

            if (duplicateCount > 0)
                return (false, "Branch name already exists.", null);

            // Validate franchisee registration date (cannot be future date)
            if (branch.MakeFranchisee == 1 && branch.RegDate.HasValue)
            {
                if (branch.RegDate.Value.Date > DateTime.Now.Date)
                {
                    return (false, "Date cannot be future date.", null);
                }
            }

            // Get institute expiry date for ExpDate
            var instituteexp = await db.QueryFirstOrDefaultAsync("SELECT expirydate FROM institute WHERE instituteid = @InstituteId", new { InstituteId = instituteId });
            DateTime? expDate = null;
            if (instituteexp != null && !Convert.IsDBNull(instituteexp.expirydate))
                expDate = Convert.ToDateTime(instituteexp.expirydate);

            string cityName = string.Empty;
            string stateName = string.Empty;
            string districtName = string.Empty;

            if (branch.CityId > 0)
            {
                var city = await db.QueryFirstOrDefaultAsync("SELECT cityname FROM countrycity WHERE CityId = @CityId", new { CityId = branch.CityId });
                cityName = city?.cityname?.ToString() ?? string.Empty;
            }
            else
            {
                cityName = branch.OtherCity;
            }

            if (branch.StateId > 0)
            {
                var state = await db.QueryFirstOrDefaultAsync("SELECT statename FROM countrystate WHERE StateId = @StateId", new { StateId = branch.StateId });
                stateName = state?.statename?.ToString() ?? string.Empty;
            }

            // Create branch
            var parameters = new
            {
                BranchName = branch.BranchName.Replace("'", "''"),
                ContactPerson = branch.ContactPerson,
                InstituteId = instituteId,
                Phone = branch.Phone,
                Email = branch.Email,
                Address = branch.Address,
                City = cityName,
                BranchCode = branch.BranchCode,
                CpMobile = branch.CpMobile,
                CpEmail = branch.CpEmail,
                PinCode = branch.PinCode,
                State = stateName,
                TaxRate = branch.TaxRate,
                RegDate = branch.RegDate,
                ExpDate = expDate,
                MakeFranchisee = branch.MakeFranchisee,
                CountryId = branch.CountryId,
                StateId = branch.StateId,
                CityId = branch.CityId,
                OtherCity = branch.OtherCity
            };

            var result = await db.QueryFirstOrDefaultAsync(BranchQueries.CreateBranch, parameters);
            int newBranchId = result?.BranchId > 0 ? Convert.ToInt32(result.BranchId) : 0;

            if (newBranchId == 0)
                return (false, "Branch not saved.", null);

            // Create franchisee if MakeFranchisee is 1
            if (branch.MakeFranchisee == 1)
            {
                int courseFee = branch.Course_Fixed_Fee.Count > 0 ? 1 : 0;
                int courseWComm = branch.Coursewise_Commision.Count > 0 ? 1 : 0;

                var franchiseeParams = new
                {
                    FranchiseeName = branch.BranchName,
                    SignUp_Date = branch.RegDate,
                    Agreement = branch.AgreementFile,
                    SignUp_Amt = branch.SignUp_Amt,
                    Monthly_Fee = branch.Monthly_Fee,
                    Commision_All = branch.Commision_All,
                    Exam_Fee = branch.Exam_Fee,
                    Certification_Fee = branch.Certification_Fee,
                    FileName = branch.AgreementFileName,
                    Stud_Fixed_Fee = branch.Stud_Fixed_Fee,
                    BranchId = newBranchId,
                    Course_Fixed_Fee = branch.Course_Fixed_Fee,
                    Coursewise_Commision = branch.Coursewise_Commision

                };
                //var franchiseeResult = await db.QueryFirstOrDefaultAsync(BranchQueries.CreateFranchisee, franchiseeParams);
                //int franchiseeId = franchiseeResult != null ? Convert.ToInt32(franchiseeResult) : 0;
                int franchiseeId = 0;

                try
                {
                    Console.WriteLine("=== CREATE FRANCHISEE ===");
                    Console.WriteLine($"FranchiseeName: {franchiseeParams.FranchiseeName}");

                    Console.WriteLine($"SignUp_Date: {franchiseeParams.SignUp_Date}");
                    Console.WriteLine($"Agreement: {franchiseeParams.Agreement}");
                    Console.WriteLine($"SignUp_Amt: {franchiseeParams.SignUp_Amt}");
                    Console.WriteLine($"Monthly_Fee: {franchiseeParams.Monthly_Fee}");

                    Console.WriteLine($"Exam_Fee: {franchiseeParams.Exam_Fee}");
                    Console.WriteLine($"Certification_Fee: {franchiseeParams.Certification_Fee}");
                    Console.WriteLine($"FileName: {franchiseeParams.FileName}");
                    Console.WriteLine($"Stud_Fixed_Fee: {franchiseeParams.Stud_Fixed_Fee}");
                    Console.WriteLine($"BranchId: {franchiseeParams.BranchId}");

                    var franchiseeResult = await db.QueryFirstOrDefaultAsync(
                        BranchQueries.CreateFranchisee,
                        franchiseeParams
                    );
                    franchiseeId = await db.QueryFirstOrDefaultAsync<int>(
    BranchQueries.CreateFranchisee,
    franchiseeParams
);
                    //franchiseeId = franchiseeResult != null
                    //    ? Convert.ToInt32(franchiseeResult)
                    //    : 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("=== CREATE FRANCHISEE ERROR ===");
                    Console.WriteLine(ex.ToString());

                    throw;
                }
                if (franchiseeId > 0)
                {
                    // Insert course fees
                    foreach (var courseFees in branch.Course_Fixed_Fee)
                    {
                        await db.ExecuteAsync(BranchQueries.CreateFranchiseeCourseFee, new
                        {
                            FranchiseeId = franchiseeId,
                            CourseId = courseFees.SubjectId,
                            Amount = courseFees.Amount
                        });
                    }

                    // Insert course commissions
                    foreach (var courseComm in branch.Coursewise_Commision)
                    {
                        await db.ExecuteAsync(BranchQueries.CreateFranchiseeCourseComm, new
                        {
                            FranchiseeId = franchiseeId,
                            CourseId = courseComm.SubjectId,
                            Commission = courseComm.Commision
                        });
                    }
                }
            }

            // Send email notification to InstituteAdmins
            try
            {
                // Get institute name for email body
                var institute = await db.QueryFirstOrDefaultAsync(BranchQueries.GetInstituteName, new { InstituteId = instituteId });
                string instituteName = institute?.InstituteName ?? "Institute";

                await _emailService.SendBranchCreationEmailAsync(instituteId, newBranchId, branch.BranchName, instituteName);
            }
            catch (Exception ex)
            {
                // Log error but don't fail branch creation
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }

            return (true, "Branch saved successfully.", newBranchId);
        }

        public async Task<(bool Success, string Message)> UpdateBranchAsync(int instituteId, int userId, BranchEditDto branch)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Check duplicate branch name (excluding current branch)
            var duplicateCount = await db.QueryFirstOrDefaultAsync<int>(
                BranchQueries.CheckDuplicateBranchName,
                new { BranchName = branch.BranchName, InstituteId = instituteId, BranchId = branch.BranchId });

            if (duplicateCount > 0)
                return (false, "Branch name already exists.");

            // Get city name from cityid if not "Other"
            string cityName = string.Empty;
            string stateName = string.Empty;
            string districtName = string.Empty;

            if (branch.CityId > 0)
            {
                var city = await db.QueryFirstOrDefaultAsync("SELECT cityname FROM countrycity WHERE CityId = @CityId", new { CityId = branch.CityId });
                cityName = city?.cityname?.ToString() ?? string.Empty;
            }
            else
            {
                cityName = branch.OtherCity;
            }

            if (branch.StateId > 0)
            {
                var state = await db.QueryFirstOrDefaultAsync("SELECT statename FROM countrystate WHERE StateId = @StateId", new { StateId = branch.StateId });
                stateName = state?.statename?.ToString() ?? string.Empty;
            }

            districtName = string.Empty;

            // Update branch
            var parameters = new
            {
                BranchId = branch.BranchId,
                BranchName = branch.BranchName.Replace("'", "''"),
                Address = branch.Address,
                City = cityName,
                CityId = branch.CityId,
                State = stateName,
                StateId = branch.StateId,
                CountryId = branch.CountryId,
                PinCode = branch.PinCode,
                Phone = branch.Phone,
                Email = branch.Email,
                ContactPerson = branch.ContactPerson,
                CpMobile = branch.CpMobile,
                CpEmail = branch.CpEmail,
                BranchCode = branch.BranchCode,
                Status = branch.Status,
                TaxRate = branch.TaxRate,
                OtherCity = branch.OtherCity,
                District = districtName,
                InstituteId = instituteId,
                MakeFranchisee = branch.MakeFranchisee,
            };

            int rowsAffected = await db.ExecuteAsync(BranchQueries.UpdateBranch, parameters);

            if (rowsAffected == 0)
                return (false, "Branch not updated.");

            if (branch.MakeFranchisee == 1)
            {
                int franchiseeId = await db.QueryFirstOrDefaultAsync<int>(
    BranchQueries.GetFranchiseeByBranchId,
    new { BranchId = branch.BranchId }
); Console.WriteLine($"BranchId: {branch.BranchId}");
                Console.WriteLine($"Existing FranchiseeId: {franchiseeId}");
                Console.WriteLine($"MakeFranchisee: {branch.MakeFranchisee}");

                //           var existingFranchisee =
                //               await db.QueryFirstOrDefaultAsync(
                //                   BranchQueries.GetFranchiseeByBranchId,
                //                   new { BranchId = branch.BranchId });

                //           int franchiseeId = existingFranchisee?.FranchiseeId != null
                //? Convert.ToInt32(existingFranchisee.FranchiseeId)
                //: 0;// ---------------------------------------------------------
                // Agreement handling
                // ---------------------------------------------------------

                byte[]? agreementBytes = null;

                // Only convert when a NEW file was uploaded
                if (!string.IsNullOrWhiteSpace(branch.AgreementFile))
                {
                    agreementBytes = Convert.FromBase64String(branch.AgreementFile);
                }

                // ---------------------------------------------------------
                // UPDATE existing franchisee
                // ---------------------------------------------------------

                if (franchiseeId > 0)
                {
                    var franchiseeParams = new
                    {
                        FranchiseeId = franchiseeId,
                        SignUp_Date = branch.RegDate,

                        // New agreement if uploaded
                        Agreement = agreementBytes,
                        AgreementFileChanged = branch.AgreementFileChanged ? 1 : 0,
                        SignUp_Amt = branch.SignUp_Amt,
                        Monthly_Fee = branch.Monthly_Fee,
                        Exam_Fee = branch.Exam_Fee,
                        Certification_Fee = branch.Certification_Fee,
                        Commision_All = branch.Commision_All,
                        Stud_Fixed_Fee = branch.Stud_Fixed_Fee,

                        Course_Fixed_Fee =
                            branch.Course_Fixed_Fee.Count > 0 ? 1 : 0,

                        Coursewise_Commision =
                            branch.Coursewise_Commision.Count > 0 ? 1 : 0,

                        FileName = branch.AgreementFileName,

                    };

                    await db.ExecuteAsync(
                        BranchQueries.UpdateFranchisee,
                        franchiseeParams
                    );

                    // Delete existing course fees and commissions
                    await db.ExecuteAsync(
                        BranchQueries.DeleteFranchiseeCourseFees,
                        new { FranchiseeId = franchiseeId }
                    );

                    await db.ExecuteAsync(
                        BranchQueries.DeleteFranchiseeCourseComm,
                        new { FranchiseeId = franchiseeId }
                    );
                }
                else
                {
                    var createParams = new
                    {
                        FranchiseeName = branch.BranchName,
                        SignUp_Date = branch.RegDate,
                        Agreement = agreementBytes,

                        SignUp_Amt = branch.SignUp_Amt,
                        Monthly_Fee = branch.Monthly_Fee,
                        Exam_Fee = branch.Exam_Fee,
                        Certification_Fee = branch.Certification_Fee,
                        Commision_All = branch.Commision_All,
                        Stud_Fixed_Fee = branch.Stud_Fixed_Fee,

                        FileName = branch.AgreementFileName,

                        // IMPORTANT
                        BranchId = branch.BranchId
                    };

                    Console.WriteLine("=== CREATING FRANCHISEE DURING UPDATE ===");
                    Console.WriteLine($"BranchId: {createParams.BranchId}");
                    Console.WriteLine($"FranchiseeName: {createParams.FranchiseeName}");
                    Console.WriteLine($"SignUp_Date: {createParams.SignUp_Date}");
                    Console.WriteLine($"SignUp_Amt: {createParams.SignUp_Amt}");
                    Console.WriteLine($"Monthly_Fee: {createParams.Monthly_Fee}");
                    Console.WriteLine($"Exam_Fee: {createParams.Exam_Fee}");
                    Console.WriteLine($"Certification_Fee: {createParams.Certification_Fee}");
                    Console.WriteLine($"Commision_All: {createParams.Commision_All}");
                    Console.WriteLine($"Stud_Fixed_Fee: {createParams.Stud_Fixed_Fee}");
                    Console.WriteLine($"FileName: {createParams.FileName}");

                    franchiseeId = await db.QueryFirstOrDefaultAsync<int>(
                        BranchQueries.CreateFranchisee,
                        createParams
                    );

                    Console.WriteLine($"New FranchiseeId: {franchiseeId}");
                }

                // ---------------------------------------------------------
                // Insert course fees
                // ---------------------------------------------------------

                foreach (var courseFee in branch.Course_Fixed_Fee)
                {
                    await db.ExecuteAsync(
                        BranchQueries.InsertFranchiseeCourseFees,
                        new
                        {
                            FranchiseeId = franchiseeId,
                            SubjectId = courseFee.SubjectId,
                            SubAmount = courseFee.Amount
                        });
                }

                // ---------------------------------------------------------
                // Insert course commissions
                // ---------------------------------------------------------

                foreach (var courseComm in branch.Coursewise_Commision)
                {
                    await db.ExecuteAsync(
                        BranchQueries.InsertFranchiseeCourseComm,
                        new
                        {
                            FranchiseeId = franchiseeId,
                            SubjectId = courseComm.SubjectId,
                            Commision = courseComm.Commision
                        });
                }
            }
            else
            {
                var existingFranchisee =
                    await db.QueryFirstOrDefaultAsync(
                        BranchQueries.GetFranchiseeByBranchId,
                        new { BranchId = branch.BranchId });

                if (existingFranchisee?.FranchiseeId != null)
                {
                    int franchiseeId = Convert.ToInt32(existingFranchisee.FranchiseeId);


                    await db.ExecuteAsync(
       BranchQueries.DeleteFranchiseeById,
       new { FranchiseeId = franchiseeId }
   );
                }
            }


            return (true, "Branch updated successfully.");
        }

        public async Task<(bool Success, string Message)> DeleteBranchAsync(int instituteId, int branchId, bool status)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            // Soft delete (status = 0) - just mark as inactive
            if (status == false)
            {
                int rowsAffected = await db.ExecuteAsync(BranchQueries.DeleteBranch, new { StatusId = status, BranchId = branchId });

                if (rowsAffected == 0)
                    return (false, "Branch not found or could not be deleted.");

                return (true, "Branch marked as inactive successfully.");
            }

            // Hard delete (status = 1) - delete all related records
            if (status == true)
            {
                if (db.State == ConnectionState.Closed)
                    db.Open();

                using var transaction = db.BeginTransaction();
                try
                {
                    var parameters = new { BranchId = branchId, InstituteId = instituteId };

                    await db.ExecuteAsync(BranchQueries.DeleteFranchisee, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchUser, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchTest, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchTrainer, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchPayments, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchBatch, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchInventory, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchLibrary, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchTransport, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchHostel, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchHealth, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchStud, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchCourse, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchSettings, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchNotification, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchFormats, parameters, transaction: transaction);
                    await db.ExecuteAsync(BranchQueries.DeleteBranchFinal, parameters, transaction: transaction);

                    transaction.Commit();
                    return (true, "Branch deleted successfully.");
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return (false, $"Error deleting branch: {ex.Message}");
                }
            }

            return (false, "Invalid status parameter.");
        }
    }
}
