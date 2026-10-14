using System.Data;
using EnquiryAllocation.Application.Common;
using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Domain;

namespace EnquiryAllocation.Application.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection Create();
}

public interface IEnquiryRepository
{
    Task<Enquiry?> GetByIdAsync(Guid id, IDbConnection connection, IDbTransaction? tx = null, CancellationToken ct = default);
    Task<Enquiry?> GetByIdForUpdateAsync(Guid id, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task<PagedResult<Enquiry>> SearchAsync(EnquiryListQuery query, ICurrentUser user, CancellationToken ct = default);
    Task InsertAsync(Enquiry enquiry, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task<bool> UpdateAllocationAsync(Enquiry enquiry, int expectedVersion, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task<bool> UpdateDetailsAsync(Enquiry enquiry, int expectedVersion, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task<IReadOnlyList<DuplicateMatchDto>> FindDuplicatesAsync(string? email, string? phone, Guid? excludeId, CancellationToken ct = default);
    Task<string> NextReferenceAsync(DateTime utcNow, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
}

public interface IAllocationRepository
{
    Task InsertAsync(EnquiryAllocationRecord record, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task ClearCurrentAsync(Guid enquiryId, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task<EnquiryAllocationRecord?> GetByIdempotencyKeyAsync(string key, CancellationToken ct = default);
    Task<IReadOnlyList<EnquiryAllocationRecord>> GetByEnquiryAsync(Guid enquiryId, CancellationToken ct = default);
}

public interface IAllocationHistoryRepository
{
    Task InsertAsync(AllocationHistory history, IDbConnection connection, IDbTransaction tx, CancellationToken ct = default);
    Task<IReadOnlyList<AllocationHistory>> GetByEnquiryAsync(Guid enquiryId, CancellationToken ct = default);
    Task<IReadOnlyList<RecentActivityDto>> GetRecentAsync(ICurrentUser user, int take, CancellationToken ct = default);
}

public interface IUserRepository
{
    Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<ApplicationUser?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<EligibleUserDto>> GetEligibleAsync(ICurrentUser user, string? search, Guid? teamId, CancellationToken ct = default);
    Task<IReadOnlyList<Team>> GetTeamsAsync(CancellationToken ct = default);
    Task InsertRefreshTokenAsync(RefreshToken token, CancellationToken ct = default);
    Task<RefreshToken?> GetRefreshTokenByHashAsync(string hash, CancellationToken ct = default);
    Task RevokeRefreshTokenAsync(Guid id, Guid? replacedBy, CancellationToken ct = default);
    Task RevokeUserRefreshTokensAsync(Guid userId, CancellationToken ct = default);
}

public interface IDashboardRepository
{
    Task<AllocationSummaryDto> GetSummaryAsync(ICurrentUser user, CancellationToken ct = default);
    Task<IReadOnlyList<NamedCountDto>> GetBySourceAsync(ICurrentUser user, CancellationToken ct = default);
    Task<IReadOnlyList<NamedCountDto>> GetByStatusAsync(ICurrentUser user, CancellationToken ct = default);
    Task<IReadOnlyList<TrendPointDto>> GetTrendsAsync(ICurrentUser user, int days, CancellationToken ct = default);
    Task<IReadOnlyList<EmployeeWorkloadDto>> GetWorkloadAsync(ICurrentUser user, CancellationToken ct = default);
    Task<AllocationPerformanceDto> GetPerformanceAsync(ICurrentUser user, CancellationToken ct = default);
}
