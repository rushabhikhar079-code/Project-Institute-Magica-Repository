using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Models;
using System.Security.Cryptography;
using System.Text;
namespace IM_backend.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IPasswordResetRepository _passwordResetRepository;
        private readonly ILoginRepository _loginRepository;
        private readonly ICommonRepository _commonRepository;
        private readonly IEmailService _emailService;
        public PasswordResetService(
            IPasswordResetRepository passwordResetRepository,
            ILoginRepository loginRepository, ICommonRepository commonRepository, IEmailService emailService)
        {
            _passwordResetRepository = passwordResetRepository;
            _loginRepository = loginRepository;
            _commonRepository = commonRepository;
            _emailService = emailService;
        }

        public async Task<object> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            try
            {
                Console.WriteLine("Step 1: Finding user...");

                var user = await _passwordResetRepository.GetUserByLoginIdAsync(dto.Username);

                if (user == null)
                {
                    Console.WriteLine("User not found.");

                    return new
                    {
                        success = false,
                        message = "User does not exist."
                    };
                }
                if (!user.InstituteStatus)
                {
                    return new
                    {
                        success = false,
                        message = "Institute is not active. Please contact support."
                    };
                }

                Console.WriteLine($"UserId: {user.User_Id}");
                Console.WriteLine($"InstituteId: {user.Institute_Id}");
                Console.WriteLine($"Email: {user.Email}");

                Console.WriteLine("Step 2: Generating reset token...");
                var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

                Console.WriteLine("Step 3: Hashing token...");
                var tokenHash = HashToken(resetToken);

                var passwordResetToken = new PasswordResetToken
                {
                    UserId = user.User_Id,
                    TokenHash = tokenHash,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(30)
                };

                Console.WriteLine("Step 4: Getting email settings...");
                var emailSettings = await _commonRepository.GetEmailSettingsAsync(user.Institute_Id);

                if (emailSettings == null)
                {
                    //Console.WriteLine("Email settings not found.");

                    //return new
                    //{
                    //    success = false,
                    //    message = "Email configuration not found for your institute."
                    //};
                    emailSettings = new EmailSettings
                    {
                        MailHost = "mail.institutemagica.com",
                        MailFrom = "support@institutemagica.com",
                        EmailUser = "support@institutemagica.com",
                        EmailPassword = "zFg5u648?@@zFg5u648?",
                        SmtpServer = "mail.institutemagica.com",
                        EnableSsl = false,
                        PortNo = 587
                    };
                }

                Console.WriteLine("Step 5: Saving reset token...");
                await _passwordResetRepository.SavePasswordResetTokenAsync(passwordResetToken);

                Console.WriteLine("Step 6: Sending email...");
                await _emailService.SendPasswordResetEmailAsync(
                    user.Email,
                    user.Username,
                    resetToken,
                    emailSettings);

                Console.WriteLine("Step 7: Completed successfully.");

                return new
                {
                    success = true,
                    message = "Password reset link sent successfully.",
                    data = new
                    {
                        maskedEmail = MaskEmail(user.Email)
                    }
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("======================================");
                Console.WriteLine(ex.ToString());
                Console.WriteLine("======================================");

                throw;
            }
        }
        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();

            var bytes = sha256.ComputeHash(
                System.Text.Encoding.UTF8.GetBytes(token)
            );

            return Convert.ToHexString(bytes);
        }
        private byte[] EncryptPassword(string userName, string password, int encryptionVersion)
        {
            string s = null;
            switch (encryptionVersion)
            {
                case 0:
                    byte[] bytes = new UTF8Encoding().GetBytes(s);
                    if (encryptionVersion == 2)
                        return System.Security.Cryptography.SHA384.Create().ComputeHash(bytes);
                    return System.Security.Cryptography.MD5.Create().ComputeHash(bytes);
                case 1:
                    s = userName.ToLower() + password;
                    goto case 0;
                case 2:
                    s = Convert.ToBase64String(Encoding.ASCII.GetBytes("Techior")) + Convert.ToBase64String(Encoding.ASCII.GetBytes("Solutions")) + userName.ToLower() + password;
                    goto case 0;
                default:
                    s = password;
                    goto case 0;
            }
        }

        public async Task<ValidateResetTokenResponse> ValidateResetTokenAsync(string token)
        {
            var hashedToken = HashToken(token);

            var resetToken = await _passwordResetRepository.GetResetTokenAsync(hashedToken);

            if (resetToken == null)
            {
                return new ValidateResetTokenResponse
                {
                    Success = false,
                    Message = "Invalid reset link."
                };
            }
            if (resetToken.UsedAt != null)
            {
                return new ValidateResetTokenResponse
                {
                    Success = false,
                    Message = "Reset link has been used."
                };
            }
            if (resetToken.IsExpired)
            {
                return new ValidateResetTokenResponse
                {
                    Success = false,
                    Message = "Reset link is no longer valid."
                };
            }

            if (resetToken.ExpiresAt <= DateTime.UtcNow)
            {
                await _passwordResetRepository.MarkTokenExpiredAsync(resetToken.Id);

                return new ValidateResetTokenResponse
                {
                    Success = false,
                    Message = "Reset link has expired."
                };
            }

            var user = await _passwordResetRepository.GetUserByIdAsync(resetToken.UserId);

            if (user == null)
            {
                return new ValidateResetTokenResponse
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            return new ValidateResetTokenResponse
            {
                Success = true,
                Username = user.LoginID,
                Message = "Token is valid."
            };
        }
        public async Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
        {
            // 1. Passwords match?
            if (request.Password != request.ConfirmPassword)
            {
                return new ResetPasswordResponse
                {
                    Success = false,
                    Message = "Passwords do not match."
                };
            }

            // 2. Hash the raw token
            var hashedToken = HashToken(request.Token);

            // 3. Find the reset token
            var resetToken = await _passwordResetRepository.GetResetTokenAsync(hashedToken);

            if (resetToken == null)
            {
                return new ResetPasswordResponse
                {
                    Success = false,
                    Message = "Invalid reset link."
                };
            }

            if (resetToken.IsExpired)
            {
                return new ResetPasswordResponse
                {
                    Success = false,
                    Message = "Reset token is no longer valid."
                };
            }

            if (resetToken.ExpiresAt <= DateTime.UtcNow)
            {
                await _passwordResetRepository.MarkTokenExpiredAsync(resetToken.Id);

                return new ResetPasswordResponse
                {
                    Success = false,
                    Message = "Reset token has expired."
                };
            }

            // 5. Get the user
            var user = await _passwordResetRepository.GetUserByIdAsync(resetToken.UserId);

            if (user == null)
            {
                return new ResetPasswordResponse
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            byte[] encryptedPassword = EncryptPassword(
     user.LoginID,
     request.Password,
     2
 );


            // 7. Update password
            await _passwordResetRepository.UpdatePasswordAsync(
                resetToken.UserId,
                  encryptedPassword);


            await _passwordResetRepository.MarkTokenAsUsedAsync(hashedToken);
            await _passwordResetRepository.MarkTokenExpiredAsync(resetToken.Id);
            // 9. Return success
            return new ResetPasswordResponse
            {
                Success = true,
                Message = "Password reset successfully."
            };
        }
        private string MaskEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                return email;
            var parts = email.Split('@');
            var username = parts[0];
            var domain = parts[1];
            if (username.Length <= 2)
            {
                return $"{username[0]}*@{domain}";
            }
            string maskedUsername = $"{username[0]}{new string("****")}{username[^1]}";
            return $"{maskedUsername}@{domain}";
        }

    }
}

