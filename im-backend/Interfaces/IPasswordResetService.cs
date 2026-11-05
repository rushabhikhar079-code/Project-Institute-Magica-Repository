using IM_backend.Dtos;
using IM_backend.Models;

namespace IM_backend.Interfaces
{
    public interface IPasswordResetService
    {
        Task<object> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<ValidateResetTokenResponse> ValidateResetTokenAsync(string token);

        Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request);

    }
}
