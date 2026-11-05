using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace IM_backend.Authorization
{
    public class PermissionPolicyProvider : IAuthorizationPolicyProvider
    {
        private readonly DefaultAuthorizationPolicyProvider _fallbackPolicyProvider;

        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
        {
            _fallbackPolicyProvider = new DefaultAuthorizationPolicyProvider(options);
        }

        public Task<AuthorizationPolicy> GetDefaultPolicyAsync()
        {
            return _fallbackPolicyProvider.GetDefaultPolicyAsync();
        }

        public Task<AuthorizationPolicy> GetFallbackPolicyAsync()
        {
            return _fallbackPolicyProvider.GetFallbackPolicyAsync();
        }

        public Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {
            // Check if this is a permission policy (format: Permission_{ModuleName}_{Action})
            if (policyName.StartsWith("Permission_", StringComparison.OrdinalIgnoreCase))
            {
                var parts = policyName.Split('_');
                if (parts.Length >= 3)
                {
                    var moduleName = parts[1];
                    var action = parts[2];

                    var policy = new AuthorizationPolicyBuilder();
                    policy.AddRequirements(new PermissionRequirement(moduleName, action));
                    return Task.FromResult(policy.Build());
                }
            }

            // Fallback to default provider for non-permission policies
            return _fallbackPolicyProvider.GetPolicyAsync(policyName);
        }
    }
}
