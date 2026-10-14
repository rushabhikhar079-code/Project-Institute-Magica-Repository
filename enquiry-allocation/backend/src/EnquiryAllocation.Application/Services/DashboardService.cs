using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Application.Interfaces;
using EnquiryAllocation.Domain;

namespace EnquiryAllocation.Application.Services;

public sealed class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboard;
    private readonly IAllocationHistoryRepository _history;
    private readonly ICurrentUser _user;

    public DashboardService(IDashboardRepository dashboard, IAllocationHistoryRepository history, ICurrentUser user)
    {
        _dashboard = dashboard;
        _history = history;
        _user = user;
    }

    public Task<AllocationSummaryDto> SummaryAsync(CancellationToken ct = default)
    {
        EnsureView();
        return _dashboard.GetSummaryAsync(_user, ct);
    }

    public Task<IReadOnlyList<NamedCountDto>> StatusAsync(CancellationToken ct = default)
    {
        EnsureView();
        return _dashboard.GetByStatusAsync(_user, ct);
    }

    public Task<IReadOnlyList<NamedCountDto>> SourceAsync(CancellationToken ct = default)
    {
        EnsureView();
        return _dashboard.GetBySourceAsync(_user, ct);
    }

    public Task<IReadOnlyList<TrendPointDto>> TrendsAsync(int days, CancellationToken ct = default)
    {
        EnsureView();
        return _dashboard.GetTrendsAsync(_user, Math.Clamp(days, 7, 90), ct);
    }

    public Task<IReadOnlyList<EmployeeWorkloadDto>> WorkloadAsync(CancellationToken ct = default)
    {
        EnsureView();
        return _dashboard.GetWorkloadAsync(_user, ct);
    }

    public Task<IReadOnlyList<RecentActivityDto>> RecentAsync(CancellationToken ct = default)
    {
        EnsureView();
        return _history.GetRecentAsync(_user, 15, ct);
    }

    public Task<AllocationPerformanceDto> PerformanceAsync(CancellationToken ct = default)
    {
        if (!_user.Has(PermissionCodes.ReportsView) && !_user.Has(PermissionCodes.DashboardView))
            throw new ForbiddenException("Missing reporting permission.");
        return _dashboard.GetPerformanceAsync(_user, ct);
    }

    private void EnsureView()
    {
        if (!_user.IsAuthenticated)
            throw new UnauthorizedDomainException("Authentication is required.");
        if (!_user.Has(PermissionCodes.DashboardView))
            throw new ForbiddenException("Missing permission Dashboard.View.");
    }
}
