namespace IM_backend.Interfaces
{
    public interface IFileLogger
    {
        Task LogExceptionAsync(Exception ex, HttpContext context);
    }
}
