namespace EnquiryAllocation.Application.Interfaces;

public interface ICurrentUser
{
    Guid UserId { get; }
    Guid? TeamId { get; }
    string? CorrelationId { get; }
    IReadOnlyList<string> Roles { get; }
    IReadOnlyList<string> Permissions { get; }
    bool IsAuthenticated { get; }
    bool Has(string permission);
    bool IsAdministrator { get; }
    bool IsAllocationManager { get; }
    bool IsTeamLeader { get; }
    bool IsEmployeeOnly { get; }
}
