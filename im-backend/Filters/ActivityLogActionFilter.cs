using IM_backend.Configuration;
using IM_backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.Json;

namespace IM_backend.Filters
{
    public class ActivityLogActionFilter : ActionFilterAttribute
    {
        private readonly IActivityLogService _activityLogService;
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly ILogger<ActivityLogActionFilter> _logger;

        public ActivityLogActionFilter(IActivityLogService activityLogService, IActivityLogRepository activityLogRepository, ILogger<ActivityLogActionFilter> logger)
        {
            _activityLogService = activityLogService;
            _activityLogRepository = activityLogRepository;
            _logger = logger;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // Check if the action has SkipActivityLog attribute
            var skipActivityLog = context.ActionDescriptor.EndpointMetadata
                .Any(m => m is SkipActivityLogAttribute);

            if (skipActivityLog)
            {
                await next();
                return;
            }

            // Fetch old data before action executes (for Edit/Delete operations)
            await FetchOldDataAsync(context);

            var executedContext = await next();

            // Only log successful operations
            // Check both: no exception AND HTTP status < 400 AND response indicates success
            if (executedContext.Exception == null && executedContext.HttpContext.Response.StatusCode < 400)
            {
                // Check if the response is an ApiResponse and if it's successful
                var result = executedContext.Result;
                if (result is ObjectResult objectResult && objectResult.Value != null)
                {
                    // Try to check if it's an ApiResponse with Success property
                    var resultType = objectResult.Value.GetType();
                    var successProperty = resultType.GetProperty("Success");
                    if (successProperty != null)
                    {
                        var successValue = successProperty.GetValue(objectResult.Value);
                        if (successValue is bool isSuccess && !isSuccess)
                        {
                            // ApiResponse indicates failure, don't log
                            return;
                        }
                    }
                }

                await LogActivityAsync(context, executedContext);
            }
        }

        private async Task FetchOldDataAsync(ActionExecutingContext context)
        {
            var httpContext = context.HttpContext;
            var user = httpContext.User;

            if (user == null || !user.Identity?.IsAuthenticated == true)
                return;

            // Get route template
            var routeTemplate = string.Empty;
            if (context.ActionDescriptor is ControllerActionDescriptor controllerActionDescriptor)
            {
                routeTemplate = controllerActionDescriptor.AttributeRouteInfo?.Template ?? string.Empty;
            }

            // Determine action type
            var action = DetermineAction(httpContext.Request.Method, routeTemplate);

            _logger.LogInformation("FetchOldDataAsync - Action: {Action}, Route: {Route}", action, routeTemplate);

            // Only fetch old data for Edit and Delete operations
            if (action != "Edit" && action != "Delete")
                return;

            // Extract record ID
            long? recordId = ExtractRecordId(context);
            _logger.LogInformation("Extracted RecordId: {RecordId}", recordId);

            if (!recordId.HasValue || recordId.Value <= 0)
                return;

            // Get table name
            var controllerName = context.Controller.GetType().Name.Replace("Controller", "");
            var tableName = GetTableName(controllerName);
            _logger.LogInformation("Controller: {Controller}, TableName: {TableName}", controllerName, tableName);

            // Fetch old data from database
            try
            {
                var oldData = await _activityLogRepository.GetRecordDataAsync(tableName, recordId.Value);

                // Store in HttpContext.Items for use in OnActionExecuted
                httpContext.Items["ActivityLog_OldData"] = oldData;

                _logger.LogInformation("Fetched old data for {TableName} with RecordId {RecordId}: {HasData}, DataLength: {Length}",
                    tableName, recordId.Value, oldData != null ? "Yes" : "No", oldData?.Length ?? 0);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching old data for {TableName} with RecordId {RecordId}", tableName, recordId.Value);
                httpContext.Items["ActivityLog_OldData"] = null;
            }
        }

        private async Task LogActivityAsync(ActionExecutingContext context, ActionExecutedContext executedContext)
        {
            var httpContext = context.HttpContext;
            var user = httpContext.User;

            if (user == null || !user.Identity?.IsAuthenticated == true)
                return;

            // Extract user info from JWT claims
            var userIdClaim = user.FindFirst("userid")?.Value;
            var instituteIdClaim = user.FindFirst("instid")?.Value;

            if (!int.TryParse(userIdClaim, out int userId))
                return;

            int? instituteId = int.TryParse(instituteIdClaim, out int instId) ? instId : null;

            // Extract branchId from action arguments (request body)
            string? branchId = ExtractBranchId(context);

            // Get IP address
            var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();

            // Get route template
            var routeTemplate = string.Empty;
            if (context.ActionDescriptor is ControllerActionDescriptor controllerActionDescriptor)
            {
                routeTemplate = controllerActionDescriptor.AttributeRouteInfo?.Template ?? string.Empty;
            }

            // Determine action type from HTTP method and route
            var action = DetermineAction(httpContext.Request.Method, routeTemplate);

            // Skip logging for GET requests (view operations)
            if (action == "View")
                return;

            // Extract module name from controller
            var controllerName = context.Controller.GetType().Name.Replace("Controller", "");
            var moduleName = controllerName;

            // Extract record ID from route data or action arguments(only for Edit and Delete)
            long? recordId = null;
            if (action == "Edit" || action == "Delete")
            {
                recordId = ExtractRecordId(context);
            }

            // Serialize request body for new data (for Add/Edit/Import/Export)
            string? newData = null;
            if (action == "Add" || action == "Edit" || action == "Import" || action == "Export")
            {
                newData = SerializeRequestBody(context);
            }

            // Get old data from HttpContext.Items (fetched in FetchOldDataAsync)
            string? oldData = null;
            if (action == "Edit" || action == "Delete")
            {
                oldData = httpContext.Items["ActivityLog_OldData"]?.ToString();
            }

            // Create description
            var description = $"{action} operation on {moduleName}";

            // Log the activity
            await _activityLogService.LogActivityAsync(
                moduleName: moduleName,
                action: action,
                recordId: recordId,
                oldData: oldData,
                newData: newData,
                tableName: GetTableName(moduleName),
                instituteId: instituteId,
                branchId: branchId,
                ipAddress: ipAddress,
                description: description,
                userId: userId
            );
        }

        private string DetermineAction(string httpMethod, string routeTemplate)
        {
            // Determine action based on route pattern first (more accurate than HTTP method)
            var lowerRoute = routeTemplate.ToLower();

            // Check for specific action keywords in route
            if (lowerRoute.Contains("import"))
                return "Import";
            if (lowerRoute.Contains("export"))
                return "Export";
            if (lowerRoute.Contains("delete"))
                return "Delete";
            if (lowerRoute.Contains("update") || lowerRoute.Contains("edit"))
                return "Edit";
            if (lowerRoute.Contains("add") || lowerRoute.Contains("create"))
                return "Add";
            if (lowerRoute.Contains("search") || lowerRoute.Contains("get-"))
                return "View";

            // Fallback to HTTP method if no keywords found
            if (httpMethod == "POST")
                return "Add";
            if (httpMethod == "PUT" || httpMethod == "PATCH")
                return "Edit";
            if (httpMethod == "DELETE")
                return "Delete";
            if (httpMethod == "GET")
                return "View";

            return "Unknown";
        }

        private long? ExtractRecordId(ActionExecutingContext context)
        {
            _logger.LogInformation("ExtractRecordId - RouteData.Values: {RouteValues}",
                string.Join(", ", context.RouteData.Values.Select(kv => $"{kv.Key}={kv.Value}")));

            // Try to get record ID from route values first (case-insensitive)
            foreach (var routeValue in context.RouteData.Values)
            {
                if (ActivityLogConfiguration.CommonIdParameters.Contains(routeValue.Key, StringComparer.OrdinalIgnoreCase))
                {
                    if (long.TryParse(routeValue.Value?.ToString(), out long id))
                    {
                        _logger.LogInformation("Found recordId from route '{ParamName}': {Id}", routeValue.Key, id);
                        return id;
                    }
                }
            }

            // If not found in route, try to extract from action arguments (request body and parameters)
            _logger.LogInformation("RecordId not found in route, checking action arguments");
            foreach (var arg in context.ActionArguments)
            {
                if (arg.Value == null) continue;

                var argType = arg.Value.GetType();
                _logger.LogInformation("Checking argument '{ArgName}' of type: {ArgType}", arg.Key, argType.Name);

                // Check if the argument name itself matches an ID parameter (for simple parameters like topicId)
                if (ActivityLogConfiguration.CommonIdParameters.Contains(arg.Key, StringComparer.OrdinalIgnoreCase))
                {
                    if (long.TryParse(arg.Value.ToString(), out long id))
                    {
                        _logger.LogInformation("Found recordId from action argument '{ArgName}': {Id}", arg.Key, id);
                        return id;
                    }
                }

                // For complex types, check properties inside the object
                if (!argType.IsPrimitive && argType != typeof(string) && argType != typeof(DateTime))
                {
                    var properties = argType.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                    foreach (var property in properties)
                    {
                        if (ActivityLogConfiguration.CommonIdParameters.Contains(property.Name, StringComparer.OrdinalIgnoreCase))
                        {
                            var value = property.GetValue(arg.Value);
                            if (value != null && long.TryParse(value.ToString(), out long id))
                            {
                                _logger.LogInformation("Found recordId from action argument property '{ParamName}': {Id}", property.Name, id);
                                return id;
                            }
                        }
                    }
                }
            }

            _logger.LogWarning("No recordId found in route values or action arguments");
            return null;
        }

        private string? ExtractBranchId(ActionExecutingContext context)
        {
            // Try to extract branchId from action arguments (request body)
            foreach (var arg in context.ActionArguments.Values)
            {
                if (arg == null) continue;

                // Check for BranchIds (plural) first - for import/export operations
                // Return comma-separated branch IDs
                var branchIdsProperty = arg.GetType().GetProperty("BranchIds", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                if (branchIdsProperty != null)
                {
                    var value = branchIdsProperty.GetValue(arg);
                    if (value != null && value is System.Collections.IList branchIdsList && branchIdsList.Count > 0)
                    {
                        var branchIds = string.Join(",", branchIdsList.Cast<object>().Select(x => x?.ToString()));
                        return branchIds;
                    }
                }

                // Also try lowercase branchids
                var branchIdsPropertyLower = arg.GetType().GetProperty("branchIds", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                if (branchIdsPropertyLower != null)
                {
                    var value = branchIdsPropertyLower.GetValue(arg);
                    if (value != null && value is System.Collections.IList branchIdsList && branchIdsList.Count > 0)
                    {
                        var branchIds = string.Join(",", branchIdsList.Cast<object>().Select(x => x?.ToString()));
                        return branchIds;
                    }
                }

                // Use reflection to find BranchId property (single branch)
                var branchIdProperty = arg.GetType().GetProperty("BranchId", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                if (branchIdProperty != null)
                {
                    var value = branchIdProperty.GetValue(arg);
                    if (value != null)
                    {
                        return value.ToString();
                    }
                }

                // Also try lowercase branchid
                var branchIdPropertyLower = arg.GetType().GetProperty("branchId", System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
                if (branchIdPropertyLower != null)
                {
                    var value = branchIdPropertyLower.GetValue(arg);
                    if (value != null)
                    {
                        return value.ToString();
                    }
                }
            }

            return null;
        }

        private string? SerializeRequestBody(ActionExecutingContext context)
        {
            try
            {
                if (context.ActionArguments.Count > 0)
                {
                    // Filter out route parameters (simple types like int, string, etc.)
                    // Only serialize complex DTO objects from the request body
                    foreach (var arg in context.ActionArguments.Values)
                    {
                        if (arg != null)
                        {
                            var argType = arg.GetType();
                            // Skip simple types (int, string, bool, etc.) - these are likely route parameters
                            if (!argType.IsPrimitive && argType != typeof(string) && argType != typeof(DateTime))
                            {
                                return JsonSerializer.Serialize(arg, new JsonSerializerOptions
                                {
                                    WriteIndented = false,
                                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                                });
                            }
                        }
                    }
                }
            }
            catch
            {
                // If serialization fails, return null
            }

            return null;
        }

        private string GetTableName(string moduleName)
        {
            // Use centralized configuration for table mappings
            if (ActivityLogConfiguration.ControllerTableMappings.TryGetValue(moduleName, out var tableName))
                return tableName;

            // Fallback to default naming convention
            return $"tbl_{moduleName.ToLower()}";
        }
    }
}
