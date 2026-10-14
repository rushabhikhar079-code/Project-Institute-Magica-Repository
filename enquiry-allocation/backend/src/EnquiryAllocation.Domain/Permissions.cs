namespace EnquiryAllocation.Domain;

public static class PermissionCodes
{
    public const string EnquiryView = "Enquiry.View";
    public const string EnquiryCreate = "Enquiry.Create";
    public const string EnquiryAllocate = "Enquiry.Allocate";
    public const string EnquiryBulkAllocate = "Enquiry.BulkAllocate";
    public const string EnquiryReassign = "Enquiry.Reassign";
    public const string EnquiryViewHistory = "Enquiry.ViewHistory";
    public const string EnquiryManageSettings = "Enquiry.ManageSettings";
    public const string EnquiryAccept = "Enquiry.Accept";
    public const string EnquiryReject = "Enquiry.Reject";
    public const string DashboardView = "Dashboard.View";
    public const string ReportsView = "Reports.View";

    public static readonly string[] All =
    [
        EnquiryView, EnquiryCreate, EnquiryAllocate, EnquiryBulkAllocate, EnquiryReassign,
        EnquiryViewHistory, EnquiryManageSettings, EnquiryAccept, EnquiryReject,
        DashboardView, ReportsView
    ];
}

public static class RoleNames
{
    public const string Administrator = "Administrator";
    public const string AllocationManager = "AllocationManager";
    public const string TeamLeader = "TeamLeader";
    public const string Employee = "Employee";
}
