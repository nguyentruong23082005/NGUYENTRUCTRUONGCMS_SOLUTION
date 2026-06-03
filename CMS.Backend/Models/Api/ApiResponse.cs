using System.Collections.Generic;

namespace CMS.Backend.Models.Api
{
    public sealed class ApiResponse
    {
        public bool Success { get; }
        public object? Data { get; }
        public string Message { get; }
        public IReadOnlyCollection<string> Errors { get; }

        private ApiResponse(bool success, object? data, string message, IReadOnlyCollection<string>? errors = null)
        {
            Success = success;
            Data = data;
            Message = message;
            Errors = errors ?? System.Array.Empty<string>();
        }

        public static ApiResponse SuccessResponse(object? data, string message = "")
        {
            return new ApiResponse(true, data, message);
        }

        public static ApiResponse FailureResponse(string message, IReadOnlyCollection<string>? errors = null)
        {
            return new ApiResponse(false, null, message, errors);
        }

        public static ApiResponse FailureResponse(string message, string error)
        {
            return new ApiResponse(false, null, message, new[] { error });
        }
    }
}
