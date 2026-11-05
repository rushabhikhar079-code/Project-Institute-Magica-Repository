using IM_backend.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace IM_backend.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IPermissionService _permissionService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PermissionAuthorizationHandler(IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
        {
            _permissionService = permissionService;
            _httpContextAccessor = httpContextAccessor;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            // Check if user is authenticated
            var user = context.User;
            if (user == null || !user.Identity?.IsAuthenticated == true)
            {
                context.Fail();
                return;
            }

            // Check if the module exists and user has the required permission
            bool hasPermission = await _permissionService.HasPermissionAsync(requirement.ModuleName, requirement.Action);

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
        }
    }
}
