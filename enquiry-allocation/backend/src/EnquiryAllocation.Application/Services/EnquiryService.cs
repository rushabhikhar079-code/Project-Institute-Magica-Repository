using EnquiryAllocation.Application.Authorization;
using EnquiryAllocation.Application.Common;
using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Application.Interfaces;
using EnquiryAllocation.Application.Mapping;
using EnquiryAllocation.Domain;
using FluentValidation;

namespace EnquiryAllocation.Application.Services;

public sealed class EnquiryService : IEnquiryService
{
    private readonly IEnquiryRepository _enquiries;
    private readonly IAllocationHistoryRepository _history;
    private readonly IAllocationRepository _allocations;
    private readonly IDbConnectionFactory _connections;
    private readonly ICurrentUser _user;
    private readonly IValidator<CreateEnquiryRequest> _createValidator;

    public EnquiryService(
        IEnquiryRepository enquiries,
        IAllocationHistoryRepository history,
        IAllocationRepository allocations,
        IDbConnectionFactory connections,
        ICurrentUser user,
        IValidator<CreateEnquiryRequest> createValidator)
    {
        _enquiries = enquiries;
        _history = history;
        _allocations = allocations;
        _connections = connections;
        _user = user;
        _createValidator = createValidator;
    }

    public async Task<PagedResult<EnquiryDto>> ListAsync(EnquiryListQuery query, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryView);
        NormalizeQuery(query);
        var page = await _enquiries.SearchAsync(query, _user, ct);
        return new PagedResult<EnquiryDto>
        {
            Items = page.Items.Select(EnquiryMapper.ToDto).ToList(),
            Page = page.Page,
            PageSize = page.PageSize,
            TotalCount = page.TotalCount
        };
    }

    public async Task<EnquiryDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryView);
        using var db = _connections.Create();
        db.Open();
        var enquiry = await _enquiries.GetByIdAsync(id, db, null, ct)
            ?? throw new NotFoundException("Enquiry not found.");
        EnquiryScope.EnsureCanView(_user, enquiry);
        return EnquiryMapper.ToDto(enquiry);
    }

    public async Task<CreateEnquiryResponse> CreateAsync(CreateEnquiryRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryCreate);
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new BusinessValidationException(validation.ToDictionary());

        var duplicates = await _enquiries.FindDuplicatesAsync(request.Email, request.Phone, null, ct);
        if (duplicates.Count > 0 && !request.ConfirmDuplicates)
        {
            return new CreateEnquiryResponse
            {
                RequiresDuplicateConfirmation = true,
                Duplicates = duplicates
            };
        }

        using var db = _connections.Create();
        db.Open();
        using var tx = db.BeginTransaction();
        try
        {
            var now = DateTime.UtcNow;
            var enquiry = new Enquiry
            {
                Id = Guid.NewGuid(),
                ReferenceNumber = await _enquiries.NextReferenceAsync(now, db, tx, ct),
                CustomerName = request.CustomerName.Trim(),
                CompanyName = string.IsNullOrWhiteSpace(request.CompanyName) ? null : request.CompanyName.Trim(),
                Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim(),
                Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
                Subject = request.Subject.Trim(),
                Description = request.Description.Trim(),
                Source = request.Source,
                Priority = request.Priority,
                ReceivedAt = now,
                AllocationStatus = nameof(AllocationStatus.Unallocated),
                CreatedBy = _user.UserId,
                CreatedAt = now,
                RowVersion = 1
            };
            await _enquiries.InsertAsync(enquiry, db, tx, ct);
            await _history.InsertAsync(new AllocationHistory
            {
                Id = Guid.NewGuid(),
                EnquiryId = enquiry.Id,
                EventType = nameof(AllocationEventType.Created),
                NewStatus = enquiry.AllocationStatus,
                ActorUserId = _user.UserId,
                OccurredAt = now,
                CorrelationId = _user.CorrelationId
            }, db, tx, ct);
            tx.Commit();
            var created = await _enquiries.GetByIdAsync(enquiry.Id, db, null, ct) ?? enquiry;
            return new CreateEnquiryResponse { Enquiry = EnquiryMapper.ToDto(created), Duplicates = duplicates };
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task<EnquiryDto> UpdateAsync(Guid id, UpdateEnquiryRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryCreate);
        if (!AllocationRules.Priorities.Contains(request.Priority))
            throw new BusinessValidationException("Invalid priority.");

        using var db = _connections.Create();
        db.Open();
        using var tx = db.BeginTransaction();
        var enquiry = await _enquiries.GetByIdForUpdateAsync(id, db, tx, ct)
            ?? throw new NotFoundException("Enquiry not found.");
        EnquiryScope.EnsureCanView(_user, enquiry);

        var previousPriority = enquiry.Priority;
        enquiry.Subject = request.Subject.Trim();
        enquiry.Description = request.Description.Trim();
        enquiry.Priority = request.Priority;
        enquiry.LastModifiedBy = _user.UserId;
        enquiry.LastModifiedAt = DateTime.UtcNow;

        if (!await _enquiries.UpdateDetailsAsync(enquiry, request.RowVersion, db, tx, ct))
            throw new ConflictException("The enquiry was modified by another user. Refresh and try again.");

        if (!string.Equals(previousPriority, request.Priority, StringComparison.Ordinal))
        {
            await _history.InsertAsync(new AllocationHistory
            {
                Id = Guid.NewGuid(),
                EnquiryId = enquiry.Id,
                EventType = nameof(AllocationEventType.PriorityChanged),
                PreviousStatus = enquiry.AllocationStatus,
                NewStatus = enquiry.AllocationStatus,
                ActorUserId = _user.UserId,
                OccurredAt = DateTime.UtcNow,
                Remarks = $"{previousPriority} → {request.Priority}",
                CorrelationId = _user.CorrelationId
            }, db, tx, ct);
        }

        tx.Commit();
        var updated = await _enquiries.GetByIdAsync(id, db, null, ct) ?? enquiry;
        updated.RowVersion = request.RowVersion + 1;
        return EnquiryMapper.ToDto(updated);
    }

    public async Task<IReadOnlyList<AllocationHistoryDto>> HistoryAsync(Guid id, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryViewHistory);
        _ = await GetAsync(id, ct);
        var items = await _history.GetByEnquiryAsync(id, ct);
        return items.Select(EnquiryMapper.ToDto).ToList();
    }

    public async Task<IReadOnlyList<EnquiryAllocationRecord>> AllocationsAsync(Guid id, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryView);
        _ = await GetAsync(id, ct);
        return await _allocations.GetByEnquiryAsync(id, ct);
    }

    private void EnsurePermission(string permission)
    {
        if (!_user.IsAuthenticated)
            throw new UnauthorizedDomainException("Authentication is required.");
        if (!_user.Has(permission))
            throw new ForbiddenException($"Missing permission {permission}.");
    }

    private static void NormalizeQuery(EnquiryListQuery query)
    {
        query.Page = query.Page < 1 ? 1 : query.Page;
        query.PageSize = query.PageSize is < 1 or > 100 ? 20 : query.PageSize;
        query.SortBy = AllocationRules.SortColumns.Contains(query.SortBy ?? "") ? query.SortBy : "receivedAt";
        query.SortDir = string.Equals(query.SortDir, "asc", StringComparison.OrdinalIgnoreCase) ? "asc" : "desc";
        if (!string.IsNullOrWhiteSpace(query.Status) && !AllocationRules.Statuses.Contains(query.Status))
            throw new BusinessValidationException("Invalid status filter.");
        if (!string.IsNullOrWhiteSpace(query.Priority) && !AllocationRules.Priorities.Contains(query.Priority))
            throw new BusinessValidationException("Invalid priority filter.");
        if (!string.IsNullOrWhiteSpace(query.Source) && !AllocationRules.Sources.Contains(query.Source))
            throw new BusinessValidationException("Invalid source filter.");
    }
}
