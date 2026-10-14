namespace EnquiryAllocation.Domain;

public sealed class Enquiry
{
    public Guid Id { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = nameof(EnquirySource.ManualEntry);
    public string Priority { get; set; } = nameof(EnquiryPriority.Medium);
    public DateTime ReceivedAt { get; set; }
    public string AllocationStatus { get; set; } = "Unallocated";
    public Guid? AssignedEmployeeId { get; set; }
    public Guid? AssignedTeamId { get; set; }
    public Guid? AllocatedByUserId { get; set; }
    public DateTime? AllocatedAt { get; set; }
    public DateTime? DueAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? LastModifiedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public bool IsArchived { get; set; }
    public int RowVersion { get; set; } = 1;
    public string? AssignedEmployeeName { get; set; }
    public string? AssignedTeamName { get; set; }
    public string? AllocatedByName { get; set; }
}

public sealed class EnquiryAllocationRecord
{
    public Guid Id { get; set; }
    public Guid EnquiryId { get; set; }
    public Guid AssignedEmployeeId { get; set; }
    public Guid? AssignedTeamId { get; set; }
    public Guid AllocatedByUserId { get; set; }
    public DateTime AllocatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateTime? DueAt { get; set; }
    public bool IsCurrent { get; set; }
    public string? IdempotencyKey { get; set; }
    public string? AssignedEmployeeName { get; set; }
}

public sealed class AllocationHistory
{
    public Guid Id { get; set; }
    public Guid EnquiryId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
    public Guid? PreviousAssigneeId { get; set; }
    public Guid? NewAssigneeId { get; set; }
    public Guid ActorUserId { get; set; }
    public DateTime OccurredAt { get; set; }
    public string? Reason { get; set; }
    public string? Remarks { get; set; }
    public string? CorrelationId { get; set; }
    public string? ActorName { get; set; }
    public string? PreviousAssigneeName { get; set; }
    public string? NewAssigneeName { get; set; }
}

public sealed class ApplicationUser
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public Guid? TeamId { get; set; }
    public string? TeamName { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = [];
    public IReadOnlyList<string> Permissions { get; set; } = [];
}

public sealed class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public sealed class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? ReplacedById { get; set; }
}
