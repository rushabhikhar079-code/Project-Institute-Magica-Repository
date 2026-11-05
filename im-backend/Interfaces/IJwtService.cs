using System.Security.Claims;

namespace IM_backend.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(int userId, string email, string role);
        string GenerateAccessTokenWithClaims(Dictionary<string, string> sessionData);
        string GenerateRefreshToken(Dictionary<string, string> sessionData);
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        ClaimsPrincipal? ValidateRefreshToken(string token);
    }
}
