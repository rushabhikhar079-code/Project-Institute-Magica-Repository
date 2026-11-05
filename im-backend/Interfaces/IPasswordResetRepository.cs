using IM_backend.Models;

namespace IM_backend.Interfaces
{
    public interface IPasswordResetRepository
    {
        Task<LoginModels?> GetUserByLoginIdAsync(string loginId);

        Task SavePasswordResetTokenAsync(PasswordResetToken token);
        Task<PasswordResetToken?> GetResetTokenAsync(string token);

        Task<LoginModels?> GetUserByIdAsync(int userId);

        Task UpdatePasswordAsync(int userId, byte[] encryptedPassword);
        Task MarkTokenAsUsedAsync(string tokenHash);
        Task MarkTokenExpiredAsync(int id);
        //Task DeleteResetTokenAsync(string tokenHash);
    }
}