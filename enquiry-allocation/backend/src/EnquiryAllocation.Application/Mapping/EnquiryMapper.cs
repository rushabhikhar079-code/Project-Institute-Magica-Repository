using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Domain;

namespace EnquiryAllocation.Application.Mapping;

public static class EnquiryMapper
{
    public static EnquiryDto ToDto(Enquiry e) => new()
    {
        Id = e.Id,
        ReferenceNumber = e.ReferenceNumber,
        CustomerName = e.CustomerName,
        CompanyName = e.CompanyName,
        Email = e.Email,
        Phone = e.Phone,
        Subject = e.Subject,
        Description = e.Description,
        Source = e.Source,
        Priority = e.Priority,
        ReceivedAt = DateTime.SpecifyKind(e.ReceivedAt, DateTimeKind.Utc),
        AllocationStatus = e.AllocationStatus,
        AssignedEmployeeId = e.AssignedEmployeeId,
        AssignedEmployeeName = e.AssignedEmployeeName,
        AssignedTeamId = e.AssignedTeamId,
        AssignedTeamName = e.AssignedTeamName,
        AllocatedByUserId = e.AllocatedByUserId,
        AllocatedByName = e.AllocatedByName,
        AllocatedAt = e.AllocatedAt.HasValue ? DateTime.SpecifyKind(e.AllocatedAt.Value, DateTimeKind.Utc) : null,
        DueAt = e.DueAt.HasValue ? DateTime.SpecifyKind(e.DueAt.Value, DateTimeKind.Utc) : null,
        CreatedAt = DateTime.SpecifyKind(e.CreatedAt, DateTimeKind.Utc),
        LastModifiedAt = e.LastModifiedAt.HasValue ? DateTime.SpecifyKind(e.LastModifiedAt.Value, DateTimeKind.Utc) : null,
        RowVersion = e.RowVersion
    };

    public static AllocationHistoryDto ToDto(AllocationHistory h) => new()
    {
        Id = h.Id,
        EventType = h.EventType,
        PreviousStatus = h.PreviousStatus,
        NewStatus = h.NewStatus,
        PreviousAssigneeId = h.PreviousAssigneeId,
        PreviousAssigneeName = h.PreviousAssigneeName,
        NewAssigneeId = h.NewAssigneeId,
        NewAssigneeName = h.NewAssigneeName,
        ActorUserId = h.ActorUserId,
        ActorName = h.ActorName,
        OccurredAt = DateTime.SpecifyKind(h.OccurredAt, DateTimeKind.Utc),
        Reason = h.Reason,
        Remarks = h.Remarks
    };

    public static CurrentUserDto ToDto(ApplicationUser u) => new()
    {
        Id = u.Id,
        Email = u.Email,
        DisplayName = u.DisplayName,
        TeamId = u.TeamId,
        TeamName = u.TeamName,
        Roles = u.Roles,
        Permissions = u.Permissions
    };
}
