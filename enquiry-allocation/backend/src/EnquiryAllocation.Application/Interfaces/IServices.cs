using EnquiryAllocation.Application.Common;
using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Domain;

namespace EnquiryAllocation.Application.Interfaces;

public interface IJwtTokenService
{
    string CreateAccessToken(ApplicationUser user);
    (string Token, string Hash, DateTime ExpiresAt) CreateRefreshToken();
    string HashToken(string token);
}

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default);
    Task LogoutAsync(LogoutRequest request, CancellationToken ct = default);
    Task<CurrentUserDto> MeAsync(CancellationToken ct = default);
}

public interface IEnquiryService
{
    Task<PagedResult<EnquiryDto>> ListAsync(EnquiryListQuery query, CancellationToken ct = default);
    Task<EnquiryDto> GetAsync(Guid id, CancellationToken ct = default);
    Task<CreateEnquiryResponse> CreateAsync(CreateEnquiryRequest request, CancellationToken ct = default);
    Task<EnquiryDto> UpdateAsync(Guid id, UpdateEnquiryRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<AllocationHistoryDto>> HistoryAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<EnquiryAllocationRecord>> AllocationsAsync(Guid id, CancellationToken ct = default);
}

public interface IAllocationService
{
    Task<EnquiryDto> AllocateAsync(Guid enquiryId, AllocateRequest request, CancellationToken ct = default);
    Task<EnquiryDto> ReassignAsync(Guid enquiryId, ReassignRequest request, CancellationToken ct = default);
    Task<EnquiryDto> AcceptAsync(Guid enquiryId, AcceptRequest request, CancellationToken ct = default);
    Task<EnquiryDto> RejectAsync(Guid enquiryId, RejectRequest request, CancellationToken ct = default);
    Task<BulkAllocateResponse> BulkAllocateAsync(BulkAllocateRequest request, CancellationToken ct = default);
}

public interface IDashboardService
{
    Task<AllocationSummaryDto> SummaryAsync(CancellationToken ct = default);
    Task<IReadOnlyList<NamedCountDto>> StatusAsync(CancellationToken ct = default);
    Task<IReadOnlyList<NamedCountDto>> SourceAsync(CancellationToken ct = default);
    Task<IReadOnlyList<TrendPointDto>> TrendsAsync(int days, CancellationToken ct = default);
    Task<IReadOnlyList<EmployeeWorkloadDto>> WorkloadAsync(CancellationToken ct = default);
    Task<IReadOnlyList<RecentActivityDto>> RecentAsync(CancellationToken ct = default);
    Task<AllocationPerformanceDto> PerformanceAsync(CancellationToken ct = default);
}
