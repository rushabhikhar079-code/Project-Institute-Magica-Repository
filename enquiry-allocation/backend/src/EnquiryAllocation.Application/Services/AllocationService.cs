using EnquiryAllocation.Application.Authorization;
using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Application.Interfaces;
using EnquiryAllocation.Application.Mapping;
using EnquiryAllocation.Domain;
using FluentValidation;

namespace EnquiryAllocation.Application.Services;

public sealed class AllocationService : IAllocationService
{
    private readonly IEnquiryRepository _enquiries;
    private readonly IAllocationRepository _allocations;
    private readonly IAllocationHistoryRepository _history;
    private readonly IUserRepository _users;
    private readonly IDbConnectionFactory _connections;
    private readonly ICurrentUser _user;
    private readonly IValidator<AllocateRequest> _allocateValidator;
    private readonly IValidator<ReassignRequest> _reassignValidator;
    private readonly IValidator<RejectRequest> _rejectValidator;
    private readonly IValidator<BulkAllocateRequest> _bulkValidator;

    public AllocationService(
        IEnquiryRepository enquiries,
        IAllocationRepository allocations,
        IAllocationHistoryRepository history,
        IUserRepository users,
        IDbConnectionFactory connections,
        ICurrentUser user,
        IValidator<AllocateRequest> allocateValidator,
        IValidator<ReassignRequest> reassignValidator,
        IValidator<RejectRequest> rejectValidator,
        IValidator<BulkAllocateRequest> bulkValidator)
    {
        _enquiries = enquiries;
        _allocations = allocations;
        _history = history;
        _users = users;
        _connections = connections;
        _user = user;
        _allocateValidator = allocateValidator;
        _reassignValidator = reassignValidator;
        _rejectValidator = rejectValidator;
        _bulkValidator = bulkValidator;
    }

    public async Task<EnquiryDto> AllocateAsync(Guid enquiryId, AllocateRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryAllocate);
        var validation = await _allocateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new BusinessValidationException(validation.ToDictionary());

        if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
        {
            var existing = await _allocations.GetByIdempotencyKeyAsync(request.IdempotencyKey, ct);
            if (existing is not null)
            {
                using var lookup = _connections.Create();
                lookup.Open();
                var replay = await _enquiries.GetByIdAsync(existing.EnquiryId, lookup, null, ct)
                    ?? throw new NotFoundException("Enquiry not found.");
                return EnquiryMapper.ToDto(replay);
            }
        }

        return await MutateAsync(enquiryId, request.RowVersion, ct, async (enquiry, db, tx) =>
        {
            EnquiryScope.EnsureCanView(_user, enquiry);
            if (!AllocationRules.CanAllocate(enquiry.AllocationStatus))
                throw new ConflictException($"Enquiry {enquiry.ReferenceNumber} is not eligible for allocation.");

            var target = await RequireEligibleEmployee(request.AssignedEmployeeId, request.AssignedTeamId, ct);
            ApplyAssignment(enquiry, target, request.AssignedTeamId ?? target.TeamId, nameof(AllocationStatus.Allocated), request.DueAt);
            await PersistAssignment(enquiry, request.Remarks, null, nameof(AllocationEventType.Allocated),
                nameof(AllocationStatus.Unallocated), request.IdempotencyKey, db, tx, ct);
        });
    }

    public async Task<EnquiryDto> ReassignAsync(Guid enquiryId, ReassignRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryReassign);
        var validation = await _reassignValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new BusinessValidationException(validation.ToDictionary());

        return await MutateAsync(enquiryId, request.RowVersion, ct, async (enquiry, db, tx) =>
        {
            EnquiryScope.EnsureCanView(_user, enquiry);
            if (!AllocationRules.CanReassign(enquiry.AllocationStatus))
                throw new ConflictException($"Enquiry {enquiry.ReferenceNumber} cannot be reassigned in its current state.");
            if (enquiry.AssignedEmployeeId == request.NewEmployeeId)
                throw new BusinessValidationException("Select a different employee for reassignment.");

            var previous = enquiry.AssignedEmployeeId;
            var previousStatus = enquiry.AllocationStatus;
            var target = await RequireEligibleEmployee(request.NewEmployeeId, request.NewTeamId, ct);
            ApplyAssignment(enquiry, target, request.NewTeamId ?? target.TeamId, nameof(AllocationStatus.Reassigned), enquiry.DueAt);
            await PersistAssignment(enquiry, request.Remarks, request.Reason, nameof(AllocationEventType.Reassigned),
                previousStatus, null, db, tx, ct, previous);
        });
    }

    public async Task<EnquiryDto> AcceptAsync(Guid enquiryId, AcceptRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryAccept);
        return await MutateAsync(enquiryId, request.RowVersion, ct, async (enquiry, db, tx) =>
        {
            if (enquiry.AssignedEmployeeId != _user.UserId)
                throw new ForbiddenException("You can only accept enquiries assigned to you.");
            if (!AllocationRules.CanAccept(enquiry.AllocationStatus))
                throw new ConflictException("This enquiry is not pending acceptance.");

            var previousStatus = enquiry.AllocationStatus;
            enquiry.AllocationStatus = nameof(AllocationStatus.Accepted);
            enquiry.LastModifiedBy = _user.UserId;
            enquiry.LastModifiedAt = DateTime.UtcNow;
            await WriteHistory(enquiry, previousStatus, nameof(AllocationEventType.Accepted), null, null, db, tx, ct);
        });
    }

    public async Task<EnquiryDto> RejectAsync(Guid enquiryId, RejectRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryReject);
        var validation = await _rejectValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new BusinessValidationException(validation.ToDictionary());

        return await MutateAsync(enquiryId, request.RowVersion, ct, async (enquiry, db, tx) =>
        {
            if (enquiry.AssignedEmployeeId != _user.UserId)
                throw new ForbiddenException("You can only reject enquiries assigned to you.");
            if (!AllocationRules.CanReject(enquiry.AllocationStatus))
                throw new ConflictException("This enquiry is not pending acceptance.");

            var previousStatus = enquiry.AllocationStatus;
            var previousAssignee = enquiry.AssignedEmployeeId;
            enquiry.AllocationStatus = nameof(AllocationStatus.Rejected);
            enquiry.AssignedEmployeeId = null;
            enquiry.AssignedTeamId = null;
            enquiry.AllocatedByUserId = null;
            enquiry.AllocatedAt = null;
            enquiry.DueAt = null;
            enquiry.LastModifiedBy = _user.UserId;
            enquiry.LastModifiedAt = DateTime.UtcNow;
            await _allocations.ClearCurrentAsync(enquiry.Id, db, tx, ct);
            await WriteHistory(enquiry, previousStatus, nameof(AllocationEventType.Rejected), request.Reason, previousAssignee, db, tx, ct);
        });
    }

    public async Task<BulkAllocateResponse> BulkAllocateAsync(BulkAllocateRequest request, CancellationToken ct = default)
    {
        EnsurePermission(PermissionCodes.EnquiryBulkAllocate);
        var validation = await _bulkValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new BusinessValidationException(validation.ToDictionary());

        var results = new List<BulkAllocateItemResult>();
        foreach (var id in request.EnquiryIds.Distinct())
        {
            try
            {
                using var db = _connections.Create();
                db.Open();
                var current = await _enquiries.GetByIdAsync(id, db, null, ct);
                if (current is null)
                {
                    results.Add(new BulkAllocateItemResult { EnquiryId = id, Success = false, Message = "Enquiry not found." });
                    continue;
                }

                var allocated = await AllocateAsync(id, new AllocateRequest
                {
                    AssignedEmployeeId = request.AssignedEmployeeId,
                    AssignedTeamId = request.AssignedTeamId,
                    Remarks = request.Remarks,
                    DueAt = request.DueAt,
                    RowVersion = current.RowVersion,
                    IdempotencyKey = $"bulk:{id}:{request.AssignedEmployeeId}"
                }, ct);

                results.Add(new BulkAllocateItemResult
                {
                    EnquiryId = id,
                    ReferenceNumber = allocated.ReferenceNumber,
                    Success = true,
                    Message = "Allocated."
                });
            }
            catch (Exception ex) when (ex is DomainException)
            {
                results.Add(new BulkAllocateItemResult { EnquiryId = id, Success = false, Message = ex.Message });
            }
        }

        return new BulkAllocateResponse { Results = results };
    }

    private async Task<EnquiryDto> MutateAsync(
        Guid enquiryId,
        int expectedVersion,
        CancellationToken ct,
        Func<Enquiry, System.Data.IDbConnection, System.Data.IDbTransaction, Task> action)
    {
        using var db = _connections.Create();
        db.Open();
        using var tx = db.BeginTransaction();
        try
        {
            var enquiry = await _enquiries.GetByIdForUpdateAsync(enquiryId, db, tx, ct)
                ?? throw new NotFoundException("Enquiry not found.");

            await action(enquiry, db, tx);

            if (!await _enquiries.UpdateAllocationAsync(enquiry, expectedVersion, db, tx, ct))
                throw new ConflictException("The enquiry assignment changed. Refresh and try again.");

            tx.Commit();
            var fresh = await _enquiries.GetByIdAsync(enquiryId, db, null, ct) ?? enquiry;
            fresh.RowVersion = expectedVersion + 1;
            return EnquiryMapper.ToDto(fresh);
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    private async Task<ApplicationUser> RequireEligibleEmployee(Guid employeeId, Guid? teamId, CancellationToken ct)
    {
        var target = await _users.GetByIdAsync(employeeId, ct)
            ?? throw new BusinessValidationException("The selected employee was not found.");
        if (!target.IsActive)
            throw new BusinessValidationException("The selected employee is not active.");
        if (!target.Permissions.Contains(PermissionCodes.EnquiryAccept) &&
            !target.Roles.Contains(RoleNames.Employee) &&
            !target.Roles.Contains(RoleNames.TeamLeader) &&
            !target.Roles.Contains(RoleNames.AllocationManager) &&
            !target.Roles.Contains(RoleNames.Administrator))
            throw new BusinessValidationException("The selected user is not eligible for allocation.");
        if (_user.IsTeamLeader && target.TeamId != _user.TeamId)
            throw new ForbiddenException("Team leaders may only allocate within their team.");
        if (teamId is not null && target.TeamId is not null && target.TeamId != teamId)
            throw new BusinessValidationException("The selected employee does not belong to the selected team.");
        return target;
    }

    private void ApplyAssignment(Enquiry enquiry, ApplicationUser target, Guid? teamId, string status, DateTime? dueAt)
    {
        enquiry.AssignedEmployeeId = target.Id;
        enquiry.AssignedTeamId = teamId ?? target.TeamId;
        enquiry.AllocatedByUserId = _user.UserId;
        enquiry.AllocatedAt = DateTime.UtcNow;
        enquiry.DueAt = dueAt;
        enquiry.AllocationStatus = status;
        enquiry.LastModifiedBy = _user.UserId;
        enquiry.LastModifiedAt = DateTime.UtcNow;
    }

    private async Task PersistAssignment(
        Enquiry enquiry,
        string? remarks,
        string? reason,
        string eventType,
        string previousStatus,
        string? idempotencyKey,
        System.Data.IDbConnection db,
        System.Data.IDbTransaction tx,
        CancellationToken ct,
        Guid? previousAssignee = null)
    {
        await _allocations.ClearCurrentAsync(enquiry.Id, db, tx, ct);
        await _allocations.InsertAsync(new EnquiryAllocationRecord
        {
            Id = Guid.NewGuid(),
            EnquiryId = enquiry.Id,
            AssignedEmployeeId = enquiry.AssignedEmployeeId!.Value,
            AssignedTeamId = enquiry.AssignedTeamId,
            AllocatedByUserId = _user.UserId,
            AllocatedAt = enquiry.AllocatedAt!.Value,
            Status = enquiry.AllocationStatus,
            Remarks = remarks,
            DueAt = enquiry.DueAt,
            IsCurrent = true,
            IdempotencyKey = idempotencyKey
        }, db, tx, ct);
        await WriteHistory(enquiry, previousStatus, eventType, reason ?? remarks, previousAssignee, db, tx, ct);
    }

    private async Task WriteHistory(
        Enquiry enquiry,
        string previousStatus,
        string eventType,
        string? reason,
        Guid? previousAssignee,
        System.Data.IDbConnection db,
        System.Data.IDbTransaction tx,
        CancellationToken ct)
    {
        await _history.InsertAsync(new AllocationHistory
        {
            Id = Guid.NewGuid(),
            EnquiryId = enquiry.Id,
            EventType = eventType,
            PreviousStatus = previousStatus,
            NewStatus = enquiry.AllocationStatus,
            PreviousAssigneeId = previousAssignee,
            NewAssigneeId = enquiry.AssignedEmployeeId,
            ActorUserId = _user.UserId,
            OccurredAt = DateTime.UtcNow,
            Reason = reason,
            CorrelationId = _user.CorrelationId
        }, db, tx, ct);
    }

    private void EnsurePermission(string permission)
    {
        if (!_user.IsAuthenticated)
            throw new UnauthorizedDomainException("Authentication is required.");
        if (!_user.Has(permission))
            throw new ForbiddenException($"Missing permission {permission}.");
    }
}
