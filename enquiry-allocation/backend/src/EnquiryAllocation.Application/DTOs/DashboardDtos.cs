namespace EnquiryAllocation.Application.DTOs;

public sealed class AllocationSummaryDto
{
    public int TotalEnquiries { get; set; }
    public int Unallocated { get; set; }
    public int Allocated { get; set; }
    public int PendingAcceptance { get; set; }
    public int Accepted { get; set; }
    public int Rejected { get; set; }
    public int Reassigned { get; set; }
    public int Overdue { get; set; }
}

public sealed class NamedCountDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public sealed class TrendPointDto
{
    public DateTime Date { get; set; }
    public int Created { get; set; }
    public int Allocated { get; set; }
}

public sealed class EmployeeWorkloadDto
{
    public Guid EmployeeId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public int Assigned { get; set; }
    public int Accepted { get; set; }
    public int Rejected { get; set; }
    public int Overdue { get; set; }
}

public sealed class AllocationPerformanceDto
{
    public double AverageHoursToAllocate { get; set; }
    public int AllocatedWithinSla { get; set; }
    public int AllocatedOutsideSla { get; set; }
    public int UnallocatedOverdue { get; set; }
}

public sealed class RecentActivityDto
{
    public Guid EnquiryId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string? ActorName { get; set; }
    public DateTime OccurredAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
}
