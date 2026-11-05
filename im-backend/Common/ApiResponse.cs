namespace IM_backend.Common
{
    public class ApiResponse
    {
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public DateTime TimeStamp { get; set; }
        public object? Error { get; set; }
        public object? Data { get; set; }

        public static ApiResponse Success(string message, object? data = null, int statusCode = 200)
        {
            return new ApiResponse
            {
                Status = "success",
                StatusCode = statusCode,
                Message = message,
                TimeStamp = DateTime.UtcNow,
                Error = null,
                Data = data
            };
        }

        public static ApiResponse Fail(string message, object? error = null, int statusCode = 400)
        {
            return new ApiResponse
            {
                Status = "fail",
                StatusCode = statusCode,
                Message = message,
                TimeStamp = DateTime.UtcNow,
                Error = error,
                Data = null
            };
        }
    }

    public class ApiResponse<T>
    {
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public DateTime TimeStamp { get; set; }
        public object? Error { get; set; }
        public T? Data { get; set; }

        public static ApiResponse<T> Success(string message, T? data = default, int statusCode = 200)
        {
            return new ApiResponse<T>
            {
                Status = "success",
                StatusCode = statusCode,
                Message = message,
                TimeStamp = DateTime.UtcNow,
                Error = null,
                Data = data
            };
        }

        public static ApiResponse<T> Fail(string message, object? error = null, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                Status = "fail",
                StatusCode = statusCode,
                Message = message,
                TimeStamp = DateTime.UtcNow,
                Error = error,
                Data = default
            };
        }
    }
}
