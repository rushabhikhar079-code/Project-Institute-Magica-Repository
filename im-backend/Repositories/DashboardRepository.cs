using Dapper;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DashboardRepository(IDbConnectionFactory dbFactory, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _dbFactory = dbFactory;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<BranchData>> GetBranchesForDashboardAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var branches = await db.QueryAsync<BranchData>(DashboardQueries.GetBranchesForDashboard, new { InstituteId = instituteId });
            return branches.ToList();
        }

        public async Task<DashboardCount?> GetDashboardCountAsync(int instituteId, int branchId, string yearMonth, string dtToday)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryFirstOrDefaultAsync<DashboardCount>(DashboardQueries.GetDashboardCount, new { InstituteId = instituteId, BranchId = branchId, YearMonth = yearMonth, DtToday = dtToday });
            return result;
        }

        public async Task<CollectionData?> GetCollectionDataAsync(int instituteId, int branchId, string date)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var dateObj = DateTime.Parse(date);

            // Today's collection
            string todayCondition = $"AND DATE_FORMAT(pay_date, '%Y/%m/%d') = '{dateObj.ToString("yyyy/MM/dd")}'";
            string queryToday = string.Format(DashboardQueries.GetCollectionDetails, todayCondition);
            var todayResult = await db.QueryFirstOrDefaultAsync(queryToday, new { InstituteId = instituteId, BranchId = branchId });
            decimal today = todayResult?.NetPayment != null ? Convert.ToDecimal(todayResult.NetPayment) : 0;

            // Current month collection
            int months = dateObj.Month;
            string checkmonth = months <= 9 ? "0" + months.ToString() : months.ToString();
            int year = dateObj.Year;
            string monthlyCondition = $"AND DATE_FORMAT(pay_date, '%Y/%m/%d') >= '{year}/{checkmonth}/01' AND DATE_FORMAT(pay_date,'%Y/%m/%d')  <= '{dateObj.ToString("yyyy/MM/dd")}'";
            string queryMonthly = string.Format(DashboardQueries.GetCollectionDetails, monthlyCondition);
            var monthlyResult = await db.QueryFirstOrDefaultAsync(queryMonthly, new { InstituteId = instituteId, BranchId = branchId });
            decimal currentMonth = monthlyResult?.NetPayment != null ? Convert.ToDecimal(monthlyResult.NetPayment) : 0;

            // Previous month collection
            var todayDate = DateTime.Today;
            var month = new DateTime(todayDate.Year, todayDate.Month, 1);
            var monthStart = month.AddMonths(-1);
            var monthEnd = month.AddDays(-1);
            string previousCondition = $"AND DATE_FORMAT(pay_date, '%Y/%m/%d') >= '{monthStart.ToString("yyyy/MM/dd")}' AND DATE_FORMAT(pay_date,'%Y/%m/%d')  <= '{monthEnd.ToString("yyyy/MM/dd")}'";
            string queryPrevious = string.Format(DashboardQueries.GetCollectionDetails, previousCondition);
            var previousResult = await db.QueryFirstOrDefaultAsync(queryPrevious, new { InstituteId = instituteId, BranchId = branchId });
            decimal previousMonth = previousResult?.NetPayment != null ? Convert.ToDecimal(previousResult.NetPayment) : 0;

            return new CollectionData
            {
                Today = today,
                CurrentMonth = currentMonth,
                PreviousMonth = previousMonth
            };
        }

        public async Task<List<StudentGrowthData>> GetStudentGrowthAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<StudentGrowthData>(DashboardQueries.StudentGrowth, new { InstituteId = instituteId, BranchId = branchId });
            return result.ToList();
        }

        public async Task<List<PaymentAnalysisData>> GetPaymentAnalysisAsync(int instituteId, int branchId, string period, string date)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var dateObj = DateTime.Parse(date);
            string dateString = dateObj.ToString("yyyy/MM/dd");

            IEnumerable<dynamic> dtPayment;
            IEnumerable<dynamic> dtOutstanding;

            if (period == "today")
            {
                dtPayment = await db.QueryAsync(DashboardQueries.PaymentReceivedAnalysis_Today, new { InstituteId = instituteId, BranchId = branchId, Date = dateString });

                // Outstanding analysis with monthly fees merge for today
                var dtOutstandingMain = await db.QueryAsync(DashboardQueries.OutstandingAnalysis_Today, new { InstituteId = instituteId, BranchId = branchId });
                var dtMonthlyFees = await db.QueryAsync(DashboardQueries.OutstandingAnalysis_Today_MonthlyFees, new { InstituteId = instituteId, BranchId = branchId });

                // Merge and group by TimeSlot
                var dayTotals = new Dictionary<string, decimal>();

                foreach (var row in dtOutstandingMain)
                {
                    string day = row.TimeSlot?.ToString() ?? "";
                    decimal amount = row.due == null ? 0 : Convert.ToDecimal(row.due);
                    if (dayTotals.ContainsKey(day))
                        dayTotals[day] += amount;
                    else
                        dayTotals[day] = amount;
                }

                foreach (var row in dtMonthlyFees)
                {
                    string day = row.TimeSlot?.ToString() ?? "";
                    decimal amount = row.due == null ? 0 : Convert.ToDecimal(row.due);
                    if (dayTotals.ContainsKey(day))
                        dayTotals[day] += amount;
                    else
                        dayTotals[day] = amount;
                }

                // Order by Morning, Afternoon, Evening, Night
                string[] dayOrder = { "Morning", "Afternoon", "Evening", "Night" };
                var orderedDays = dayOrder.Where(d => dayTotals.ContainsKey(d))
                    .Select(d => new { TimeSlot = d, due = dayTotals[d] });

                dtOutstanding = orderedDays;
            }
            else if (period == "weekly")
            {
                dtPayment = await db.QueryAsync(DashboardQueries.PaymentReceivedAnalysis_Weekly, new { InstituteId = instituteId, BranchId = branchId });

                // Add inventory logic for weekly (same as original)
                var inventoryResult = await db.QueryFirstOrDefaultAsync(DashboardQueries.PaymentReceivedAnalysis_Weekly_Inventory, new { InstituteId = instituteId, Date = dateString });
                decimal inventoryAmount = inventoryResult?.NetPayment != null ? Convert.ToDecimal(inventoryResult.NetPayment) : 0;

                if (inventoryAmount > 0 && dtPayment.Any())
                {
                    // Add inventory amount to the first row's NetPayment
                    var firstRow = dtPayment.First();
                    var currentPayment = Convert.ToDecimal(firstRow.NetPayment);
                    var paymentList = dtPayment.ToList();
                    if (paymentList.Count > 0)
                    {
                        paymentList[0] = new
                        {
                            TimeSlot = paymentList[0].TimeSlot,
                            NetPayment = (currentPayment + inventoryAmount).ToString("0.00")
                        };
                        dtPayment = paymentList;
                    }
                }

                // Outstanding analysis with monthly fees merge for weekly
                var dtOutstandingMain = await db.QueryAsync(DashboardQueries.OutstandingAnalysis_Weekly, new { InstituteId = instituteId, BranchId = branchId });
                var dtMonthlyFees = await db.QueryAsync(DashboardQueries.OutstandingAnalysis_Weekly_MonthlyFees, new { InstituteId = instituteId, BranchId = branchId });

                // Merge and group by TimeSlot
                var dayTotals = new Dictionary<string, decimal>();

                foreach (var row in dtOutstandingMain)
                {
                    string day = row.TimeSlot?.ToString() ?? "";
                    decimal amount = row.due == null ? 0 : Convert.ToDecimal(row.due);
                    if (dayTotals.ContainsKey(day))
                        dayTotals[day] += amount;
                    else
                        dayTotals[day] = amount;
                }

                foreach (var row in dtMonthlyFees)
                {
                    string day = row.TimeSlot?.ToString() ?? "";
                    decimal amount = row.due == null ? 0 : Convert.ToDecimal(row.due);
                    if (dayTotals.ContainsKey(day))
                        dayTotals[day] += amount;
                    else
                        dayTotals[day] = amount;
                }

                // Order by Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
                string[] dayOrder = { "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" };
                var orderedDays = dayOrder.Where(d => dayTotals.ContainsKey(d))
                    .Select(d => new { TimeSlot = d, due = dayTotals[d] });

                dtOutstanding = orderedDays;
            }
            else // monthly - uses financial year logic (April to March)
            {
                dtPayment = await db.QueryAsync(DashboardQueries.PaymentReceivedAnalysis_Monthly, new { InstituteId = instituteId, BranchId = branchId });

                // Add inventory logic for monthly (same as original)
                var inventoryResult = await db.QueryFirstOrDefaultAsync(DashboardQueries.PaymentReceivedAnalysis_Monthly_Inventory, new { InstituteId = instituteId, Date = dateString });
                decimal inventoryAmount = inventoryResult?.NetPayment != null ? Convert.ToDecimal(inventoryResult.NetPayment) : 0;

                if (inventoryAmount > 0 && dtPayment.Any())
                {
                    // Add inventory amount to the first row's NetPayment
                    var firstRow = dtPayment.First();
                    var currentPayment = Convert.ToDecimal(firstRow.NetPayment);
                    // Since dtPayment is IEnumerable<dynamic>, we need to convert to list to modify
                    var paymentList = dtPayment.ToList();
                    if (paymentList.Count > 0)
                    {
                        paymentList[0] = new
                        {
                            TimeSlot = paymentList[0].TimeSlot,
                            NetPayment = (currentPayment + inventoryAmount).ToString("0.00")
                        };
                        dtPayment = paymentList;
                    }
                }

                // Outstanding analysis with monthly fees merge
                var dtOutstandingMain = await db.QueryAsync(DashboardQueries.OutstandingAnalysis_Monthly, new { InstituteId = instituteId, BranchId = branchId });
                var dtMonthlyFees = await db.QueryAsync(DashboardQueries.OutstandingAnalysis_Monthly_MonthlyFees, new { InstituteId = instituteId, BranchId = branchId });

                // Merge and group by TimeSlot
                var monthTotals = new Dictionary<string, decimal>();

                foreach (var row in dtOutstandingMain)
                {
                    string month = row.TimeSlot?.ToString() ?? "";
                    decimal amount = row.due == null ? 0 : Convert.ToDecimal(row.due);
                    if (monthTotals.ContainsKey(month))
                        monthTotals[month] += amount;
                    else
                        monthTotals[month] = amount;
                }

                foreach (var row in dtMonthlyFees)
                {
                    string month = row.TimeSlot?.ToString() ?? "";
                    decimal amount = row.due == null ? 0 : Convert.ToDecimal(row.due);
                    if (monthTotals.ContainsKey(month))
                        monthTotals[month] += amount;
                    else
                        monthTotals[month] = amount;
                }

                // Order by date
                var orderedMonths = monthTotals
                    .OrderBy(x => DateTime.ParseExact(x.Key, "MMM yy", System.Globalization.CultureInfo.InvariantCulture))
                    .Select(x => new { TimeSlot = x.Key, due = x.Value });

                dtOutstanding = orderedMonths;
            }

            // Merge the two datasets
            var allSlots = dtPayment.Select(r => r.TimeSlot.ToString())
                .Union(dtOutstanding.Select(r => r.TimeSlot.ToString()));

            var result = allSlots.Select(slot =>
            {
                var payRow = dtPayment.FirstOrDefault(r => r.TimeSlot.ToString() == slot);
                var outRow = dtOutstanding.FirstOrDefault(r => r.TimeSlot.ToString() == slot);

                return new PaymentAnalysisData
                {
                    label = slot,
                    received = payRow == null ? 0 : Convert.ToDecimal(payRow.NetPayment),
                    outstanding = outRow == null ? 0 : Convert.ToDecimal(outRow.due)
                };
            }).ToList();

            return result;
        }

        public async Task<List<RevenueData>> GetRevenueAsync(int instituteId, int branchId, string period)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var dateObj = DateTime.Now;
            string dateString = dateObj.ToString("yyyy/MM/dd");

            IEnumerable<dynamic> dtRevenue;

            if (period == "yearly")
            {
                dtRevenue = await db.QueryAsync(DashboardQueries.Revenue_Yearly, new { InstituteId = instituteId, BranchId = branchId });

                // Add inventory logic for yearly (same as original)
                var inventoryResult = await db.QueryFirstOrDefaultAsync(DashboardQueries.Revenue_Inventory, new { InstituteId = instituteId, Date = dateString });
                decimal inventoryAmount = inventoryResult?.NetPayment != null ? Convert.ToDecimal(inventoryResult.NetPayment) : 0;

                if (inventoryAmount > 0 && dtRevenue.Any())
                {
                    var firstRow = dtRevenue.First();
                    var currentRevenue = Convert.ToDecimal(firstRow.NetPayment);
                    var revenueList = dtRevenue.ToList();
                    if (revenueList.Count > 0)
                    {
                        revenueList[0] = new
                        {
                            TimeSlot = revenueList[0].TimeSlot,
                            NetPayment = (currentRevenue + inventoryAmount).ToString("0.00")
                        };
                        dtRevenue = revenueList;
                    }
                }
            }
            else // monthly
            {
                dtRevenue = await db.QueryAsync(DashboardQueries.Revenue_Monthly, new { InstituteId = instituteId, BranchId = branchId });

                // Add inventory logic for monthly (same as original)
                var inventoryResult = await db.QueryFirstOrDefaultAsync(DashboardQueries.Revenue_Inventory, new { InstituteId = instituteId, Date = dateString });
                decimal inventoryAmount = inventoryResult?.NetPayment != null ? Convert.ToDecimal(inventoryResult.NetPayment) : 0;

                if (inventoryAmount > 0 && dtRevenue.Any())
                {
                    var firstRow = dtRevenue.First();
                    var currentRevenue = Convert.ToDecimal(firstRow.NetPayment);
                    var revenueList = dtRevenue.ToList();
                    if (revenueList.Count > 0)
                    {
                        revenueList[0] = new
                        {
                            TimeSlot = revenueList[0].TimeSlot,
                            NetPayment = (currentRevenue + inventoryAmount).ToString("0.00")
                        };
                        dtRevenue = revenueList;
                    }
                }
            }

            var result = dtRevenue.Select(row => new RevenueData
            {
                TimeSlot = row.TimeSlot?.ToString() ?? "",
                NetPayment = row.NetPayment == null ? 0 : Convert.ToDecimal(row.NetPayment),
                branch_id = row.branch_id == null ? 0 : Convert.ToInt32(row.branch_id)
            }).ToList();

            return result;
        }

        public async Task<RegistrationStatusData?> GetRegistrationStatusAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryFirstOrDefaultAsync<RegistrationStatusData>(DashboardQueries.GetRegistrationStatus, new { InstituteId = instituteId, BranchId = branchId });
            return result;
        }

        public async Task<AttendanceData> GetAttendanceAsync(string period)
        {
            var attendanceData = new AttendanceData();

            switch (period)
            {
                case "today":
                    attendanceData.labels = new List<string> { "Morning", "Afternoon", "Evening" };
                    attendanceData.present = new List<int> { 180, 195, 175 };
                    attendanceData.absent = new List<int> { 15, 10, 8 };
                    attendanceData.leave = new List<int> { 5, 3, 7 };
                    attendanceData.subtitle = "Today's attendance breakdown";
                    break;
                case "weekly":
                    attendanceData.labels = new List<string> { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
                    attendanceData.present = new List<int> { 450, 480, 470, 490, 460, 440 };
                    attendanceData.absent = new List<int> { 50, 30, 35, 20, 40, 55 };
                    attendanceData.leave = new List<int> { 20, 10, 15, 10, 20, 25 };
                    attendanceData.subtitle = "Weekly attendance overview";
                    break;
                case "monthly":
                default:
                    attendanceData.labels = new List<string> { "Jan", "Feb", "Mar", "Apr", "May", "Jun" };
                    attendanceData.present = new List<int> { 9500, 9800, 10200, 9900, 10400, 10100 };
                    attendanceData.absent = new List<int> { 850, 750, 680, 720, 650, 700 };
                    attendanceData.leave = new List<int> { 350, 280, 320, 290, 310, 340 };
                    attendanceData.subtitle = "Monthly attendance overview";
                    break;
            }

            return attendanceData;
        }

        public async Task<List<StaffLeaveDistributionData>> GetStaffLeaveDistributionAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var result = await db.QueryAsync<StaffLeaveDistributionData>(DashboardQueries.StaffLeaveDistribution, new { InstituteId = instituteId, BranchId = branchId });
            return result.ToList();
        }

        public async Task<LiveNotificationsData> GetLiveNotificationsAsync(int instituteId, int branchId, int userId, string date)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var notifications = new LiveNotificationsData();
            var liveClassModel = new LiveClasses();
            // Get staff birthdays
            var staffBirthdays = await db.QueryAsync(DashboardQueries.StaffBirthday, new { InstituteId = instituteId, BranchId = branchId, UserId = userId, Date = date });

            var birthdayList = staffBirthdays.Select(row => new StaffBirthdayData
            {
                trainnerid = row.trainnerid == null ? 0 : Convert.ToInt32(row.trainnerid),
                StaffName = row.StaffName?.ToString() ?? "",
                DOB = row.DOB?.ToString() ?? "",
                t_contact = row.t_contact?.ToString() ?? "",
                t_email = row.t_email?.ToString() ?? ""
            }).ToList();

            notifications.StaffBirthdays = birthdayList;

            // Format birthday count and names
            if (birthdayList.Count > 0)
            {
                var names = birthdayList.Select(b => b.StaffName.Trim()).ToList();
                int total = names.Count;

                notifications.BirthdayCount = total + " staffs celebrating today";
                notifications.BirthdayNames = string.Join(", ", names);
                //if (total <= 2)
                //{
                //    notifications.BirthdayNames = string.Join(", ", names);
                //}
                //else
                //{
                //    notifications.BirthdayNames = string.Join(", ", names.Take(2))
                //                        + " +" + (total - 2) + " more";
                //}
            }
            else
            {
                notifications.BirthdayCount = "No birthday alerts for today.";
                notifications.BirthdayNames = "";
            }

            // Get today's collection
            var collectionResult = await db.QueryFirstOrDefaultAsync(DashboardQueries.TodayCollection_Count, new { InstituteId = instituteId, Date = date });
            decimal collectionAmount = collectionResult?.NetPayment != null ? Convert.ToDecimal(collectionResult.NetPayment) : 0;

            // Add inventory collection
            var inventoryResult = await db.QueryFirstOrDefaultAsync(DashboardQueries.TodayCollection_Count_Inventory, new { InstituteId = instituteId, Date = date });
            decimal inventoryAmount = inventoryResult?.NetPayment != null ? Convert.ToDecimal(inventoryResult.NetPayment) : 0;

            decimal totalCollection = collectionAmount + inventoryAmount;
            notifications.TodayCollection = "₹" + totalCollection.ToString("0.00") + " collected so far";

            //Live classes
            // //Live classes
            var liveClasses = await db.QueryFirstOrDefaultAsync(
                DashboardQueries.LiveClasses,
                new { InstituteId = instituteId, BranchId = branchId }
            );

            if (liveClasses != null)
            {
                liveClassModel.liveClassCount = liveClasses.liveClassesCount?.ToString() ?? "0";
                liveClassModel.liveClassName = liveClasses.liveClassTopics ?? string.Empty;
            }
            notifications.LiveClasses.Add(liveClassModel);
            return notifications;
        }
    }
}
