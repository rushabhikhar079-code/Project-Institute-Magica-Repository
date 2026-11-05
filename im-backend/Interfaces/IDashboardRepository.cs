using IM_backend.Models;

namespace IM_backend.Interfaces
{
    public interface IDashboardRepository
    {
        Task<List<BranchData>> GetBranchesForDashboardAsync(int instituteId);
        Task<DashboardCount?> GetDashboardCountAsync(int instituteId, int branchId, string yearMonth, string dtToday);
        Task<CollectionData?> GetCollectionDataAsync(int instituteId, int branchId, string date);
        Task<List<StudentGrowthData>> GetStudentGrowthAsync(int instituteId, int branchId);
        Task<List<PaymentAnalysisData>> GetPaymentAnalysisAsync(int instituteId, int branchId, string period, string date);
        Task<List<RevenueData>> GetRevenueAsync(int instituteId, int branchId, string period);
        Task<RegistrationStatusData?> GetRegistrationStatusAsync(int instituteId, int branchId);
        Task<AttendanceData> GetAttendanceAsync(string period);
        Task<List<StaffLeaveDistributionData>> GetStaffLeaveDistributionAsync(int instituteId, int branchId);
        Task<LiveNotificationsData> GetLiveNotificationsAsync(int instituteId, int branchId, int userId, string date);
    }
}
