using EnquiryAllocation.Application.Common;

namespace EnquiryAllocation.Application.DTOs;

public sealed class EnquiryListQuery : PagedRequest
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Source { get; set; }
    public Guid? AssignedEmployeeId { get; set; }
    public Guid? TeamId { get; set; }
    public DateTime? ReceivedFrom { get; set; }
    public DateTime? ReceivedTo { get; set; }
    public DateTime? AllocatedFrom { get; set; }
    public DateTime? AllocatedTo { get; set; }
}

public sealed class EnquiryDto
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; }
    public string AllocationStatus { get; set; } = string.Empty;
    public Guid? AssignedEmployeeId { get; set; }
    public string? AssignedEmployeeName { get; set; }
    public Guid? AssignedTeamId { get; set; }
    public string? AssignedTeamName { get; set; }
    public Guid? AllocatedByUserId { get; set; }
    public string? AllocatedByName { get; set; }
    public DateTime? AllocatedAt { get; set; }
    public DateTime? DueAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public int RowVersion { get; set; }
}

public sealed class DuplicateMatchDto
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
}

public sealed class CreateEnquiryRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = "ManualEntry";
    public string Priority { get; set; } = "Medium";
    public bool ConfirmDuplicates { get; set; }
}

public sealed class CreateEnquiryResponse
{
    public EnquiryDto Enquiry { get; set; } = new();
    public IReadOnlyList<DuplicateMatchDto> Duplicates { get; set; } = [];
    public bool RequiresDuplicateConfirmation { get; set; }
}

public sealed class UpdateEnquiryRequest
{
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium";
    public int RowVersion { get; set; }
}

public sealed class AllocateRequest
{
    public Guid AssignedEmployeeId { get; set; }
    public Guid? AssignedTeamId { get; set; }
    public string? Remarks { get; set; }
    public DateTime? DueAt { get; set; }
    public int RowVersion { get; set; }
    public string? IdempotencyKey { get; set; }
}

public sealed class ReassignRequest
{
    public Guid NewEmployeeId { get; set; }
    public Guid? NewTeamId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public int RowVersion { get; set; }
}

public sealed class RejectRequest
{
    public string Reason { get; set; } = string.Empty;
    public int RowVersion { get; set; }
}

public sealed class AcceptRequest
{
    public int RowVersion { get; set; }
}

public sealed class BulkAllocateRequest
{
    public IReadOnlyList<Guid> EnquiryIds { get; set; } = [];
    public Guid AssignedEmployeeId { get; set; }
    public Guid? AssignedTeamId { get; set; }
    public string? Remarks { get; set; }
    public DateTime? DueAt { get; set; }
}

public sealed class BulkAllocateItemResult
{
    public Guid EnquiryId { get; set; }
    public string? ReferenceNumber { get; set; }
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

public sealed class BulkAllocateResponse
{
    public IReadOnlyList<BulkAllocateItemResult> Results { get; set; } = [];
    public int SuccessCount => Results.Count(r => r.Success);
    public int FailureCount => Results.Count(r => !r.Success);
}

public sealed class AllocationHistoryDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public Guid? PreviousAssigneeId { get; set; }
    public string? PreviousAssigneeName { get; set; }
    public Guid? NewAssigneeId { get; set; }
    public string? NewAssigneeName { get; set; }
    public Guid ActorUserId { get; set; }
    public string? ActorName { get; set; }
    public DateTime OccurredAt { get; set; }
    public string? Reason { get; set; }
    public string? Remarks { get; set; }
}
