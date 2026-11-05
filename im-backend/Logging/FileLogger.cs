using IM_backend.Interfaces;
using System.Text;
namespace IM_backend.Logging
{
    public class FileLogger : IFileLogger
    {
        private readonly string _logFolderPath;
        public FileLogger()
        {
            _logFolderPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");
            if (!Directory.Exists(_logFolderPath))
            {
                Directory.CreateDirectory(_logFolderPath);
            }
        }
        public async Task LogExceptionAsync(Exception ex, HttpContext context)
        {
            string fileName = $"ErrorLog_{DateTime.Now:yyyy-MM-dd}.txt";
            string filePath = Path.Combine(_logFolderPath, fileName);

            var sb = new StringBuilder();
            sb.AppendLine("==================================================");
            sb.AppendLine($"Timestamp    : {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine($"Request Path : {context.Request.Path}");
            sb.AppendLine($"HTTP Method  : {context.Request.Method}");
            sb.AppendLine($"Error Message: {ex.Message}");
            sb.AppendLine($"Stack Trace  : {ex.StackTrace}");
            sb.AppendLine("==================================================");
            sb.AppendLine();
            await File.AppendAllTextAsync(filePath, sb.ToString(), Encoding.UTF8);
        }
    }
}
