using IM_backend.Common;
using IM_backend.Interfaces;
namespace IM_backend.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        public async Task InvokeAsync(HttpContext context, IFileLogger fileLogger)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await fileLogger.LogExceptionAsync(ex, context);

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var response = ApiResponse<string>.Fail(
                    "An internal server error occurred. Details have been logged.", ex.Message,
                    statusCode: 500
                );
                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
