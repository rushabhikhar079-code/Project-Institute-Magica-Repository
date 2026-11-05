using Microsoft.AspNetCore.Mvc.Filters;

namespace IM_backend.Filters
{
    public class SkipActivityLogAttribute : ActionFilterAttribute
    {
        // This attribute can be used to exclude specific endpoints from activity logging
        // Example: [SkipActivityLog] on an action method will skip activity logging for that endpoint
    }
}
