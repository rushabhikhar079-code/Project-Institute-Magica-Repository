using EnquiryAllocation.Domain;
using EnquiryAllocation.Application.Interfaces;

namespace EnquiryAllocation.Application.Authorization;

public static class EnquiryScope
{
    public static void EnsureCanView(ICurrentUser user, Enquiry enquiry)
    {
        if (user.Has(PermissionCodes.EnquiryView) is false)
            throw new ForbiddenException("Missing permission Enquiry.View.");

        if (user.IsAdministrator || user.IsAllocationManager)
            return;

        if (user.IsTeamLeader)
        {
            if (enquiry.AssignedTeamId == user.TeamId || enquiry.AllocationStatus == nameof(AllocationStatus.Unallocated))
                return;
            throw new ForbiddenException("This enquiry is outside your team scope.");
        }

        if (enquiry.AssignedEmployeeId == user.UserId)
            return;

        throw new ForbiddenException("You are not authorized to view this enquiry.");
    }
}
