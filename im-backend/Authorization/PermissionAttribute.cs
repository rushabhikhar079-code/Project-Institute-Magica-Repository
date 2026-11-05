using Microsoft.AspNetCore.Authorization;

namespace IM_backend.Authorization
{
    public class PermissionAttribute : AuthorizeAttribute
    {
        public PermissionAttribute(string moduleName, string action)
        {
            Policy = $"Permission_{moduleName}_{action}";
        }
    }
}
