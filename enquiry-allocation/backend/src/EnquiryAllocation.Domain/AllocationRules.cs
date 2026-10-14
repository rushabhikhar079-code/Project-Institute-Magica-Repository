namespace EnquiryAllocation.Domain;

public static class AllocationRules
{
    public static bool CanAllocate(string status) =>
        status is nameof(AllocationStatus.Unallocated) or nameof(AllocationStatus.Rejected);

    public static bool CanReassign(string status) =>
        status is nameof(AllocationStatus.Allocated)
            or nameof(AllocationStatus.Accepted)
            or nameof(AllocationStatus.Rejected)
            or nameof(AllocationStatus.Reassigned);

    public static bool CanAccept(string status) =>
        status is nameof(AllocationStatus.Allocated) or nameof(AllocationStatus.Reassigned);

    public static bool CanReject(string status) =>
        status is nameof(AllocationStatus.Allocated) or nameof(AllocationStatus.Reassigned);

    public static readonly HashSet<string> SortColumns = new(StringComparer.OrdinalIgnoreCase)
    {
        "receivedAt", "allocatedAt", "priority", "status", "referenceNumber", "customerName"
    };

    public static readonly HashSet<string> Sources = new(StringComparer.OrdinalIgnoreCase)
    {
        nameof(EnquirySource.Website), nameof(EnquirySource.Email), nameof(EnquirySource.Telephone),
        nameof(EnquirySource.Referral), nameof(EnquirySource.ManualEntry), nameof(EnquirySource.Other)
    };

    public static readonly HashSet<string> Priorities = new(StringComparer.OrdinalIgnoreCase)
    {
        nameof(EnquiryPriority.Low), nameof(EnquiryPriority.Medium),
        nameof(EnquiryPriority.High), nameof(EnquiryPriority.Urgent)
    };

    public static readonly HashSet<string> Statuses = new(StringComparer.OrdinalIgnoreCase)
    {
        nameof(AllocationStatus.Unallocated), nameof(AllocationStatus.Allocated),
        nameof(AllocationStatus.Accepted), nameof(AllocationStatus.Rejected),
        nameof(AllocationStatus.Reassigned)
    };
}
