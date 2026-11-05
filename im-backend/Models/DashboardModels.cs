namespace IM_backend.Models
{
    public class BranchData
    {
        public int BranchId { get; set; }
        public string Branchname { get; set; } = string.Empty;
    }

    public class DashboardCount
    {
        public decimal TotalRevenue { get; set; }
        public int ActiveStudentCount { get; set; }
        public int RegisteredStudentCount { get; set; }
        public decimal TotalOutstandingCollection { get; set; }
    }

    public class CollectionData
    {
        public decimal Today { get; set; }
        public decimal CurrentMonth { get; set; }
        public decimal PreviousMonth { get; set; }
    }

    public class StudentGrowthData
    {
        public int studCount { get; set; }
        public int RegisteredByMonth { get; set; }
        public string monthName { get; set; } = string.Empty;
        public string monthYear { get; set; } = string.Empty;

    }

    public class PaymentAnalysisData
    {
        public string label { get; set; } = string.Empty;
        public decimal received { get; set; }
        public decimal outstanding { get; set; }
    }

    public class RevenueData
    {
        public string TimeSlot { get; set; } = string.Empty;
        public decimal NetPayment { get; set; }
        public int branch_id { get; set; }
    }

    public class RegistrationStatusData
    {
        public int Paytype { get; set; }
        public int Total { get; set; }
        public int Enq { get; set; }
        public int noofstudents { get; set; }
        public int noofreg { get; set; }
        public int noofnq { get; set; }
        public int TotalCount { get; set; }
        public int RegCount { get; set; }
        public int EnqCount { get; set; }
        public int RegType { get; set; }
        public bool isBranchwise { get; set; }
    }

    public class AttendanceData
    {
        public List<string> labels { get; set; } = new List<string>();
        public List<int> present { get; set; } = new List<int>();
        public List<int> absent { get; set; } = new List<int>();
        public List<int> leave { get; set; } = new List<int>();
        public string subtitle { get; set; } = string.Empty;
    }

    public class StaffLeaveDistributionData
    {
        public DateTime RequestDate { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public int PendingCount { get; set; }
    }

    public class StaffBirthdayData
    {
        public int trainnerid { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string DOB { get; set; } = string.Empty;
        public string t_contact { get; set; } = string.Empty;
        public string t_email { get; set; } = string.Empty;
    }

    public class LiveNotificationsData
    {
        public string BirthdayCount { get; set; } = string.Empty;
        public string BirthdayNames { get; set; } = string.Empty;
        public List<StaffBirthdayData> StaffBirthdays { get; set; } = new List<StaffBirthdayData>();
        public string TodayCollection { get; set; } = string.Empty;
        public List<LiveClasses> LiveClasses { get; set; } = new List<LiveClasses>();
    }
    public class LiveClasses
    {
        public string liveClassCount { get; set; } = "0";
        public string liveClassName { get; set; } = string.Empty;
    }
}
