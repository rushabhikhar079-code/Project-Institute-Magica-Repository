using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Application.Interfaces;
using EnquiryAllocation.Application.Mapping;
using EnquiryAllocation.Domain;
using FluentValidation;

namespace EnquiryAllocation.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtTokenService _jwt;
    private readonly IPasswordHasher _passwords;
    private readonly ICurrentUser _current;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthService(
        IUserRepository users,
        IJwtTokenService jwt,
        IPasswordHasher passwords,
        ICurrentUser current,
        IValidator<LoginRequest> loginValidator)
    {
        _users = users;
        _jwt = jwt;
        _passwords = passwords;
        _current = current;
        _loginValidator = loginValidator;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var validation = await _loginValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            throw new BusinessValidationException(validation.ToDictionary());

        var user = await _users.GetByEmailAsync(request.Email.Trim(), ct);
        if (user is null || !user.IsActive || !_passwords.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedDomainException("Invalid email or password.");

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            throw new UnauthorizedDomainException("Refresh token is required.");

        var stored = await _users.GetRefreshTokenByHashAsync(_jwt.HashToken(request.RefreshToken), ct);
        if (stored is null || stored.RevokedAt is not null || stored.ExpiresAt <= DateTime.UtcNow)
            throw new UnauthorizedDomainException("The refresh token is invalid or expired.");

        var user = await _users.GetByIdAsync(stored.UserId, ct)
            ?? throw new UnauthorizedDomainException("The refresh token is invalid or expired.");
        if (!user.IsActive)
            throw new UnauthorizedDomainException("The account is inactive.");

        var issued = await IssueAsync(user, ct);
        await _users.RevokeRefreshTokenAsync(stored.Id, null, ct);
        return issued;
    }

    public async Task LogoutAsync(LogoutRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return;
        var stored = await _users.GetRefreshTokenByHashAsync(_jwt.HashToken(request.RefreshToken), ct);
        if (stored is not null)
            await _users.RevokeRefreshTokenAsync(stored.Id, null, ct);
    }

    public async Task<CurrentUserDto> MeAsync(CancellationToken ct = default)
    {
        if (!_current.IsAuthenticated)
            throw new UnauthorizedDomainException("Authentication is required.");
        var user = await _users.GetByIdAsync(_current.UserId, ct)
            ?? throw new UnauthorizedDomainException("Authentication is required.");
        return EnquiryMapper.ToDto(user);
    }

    private async Task<AuthResponse> IssueAsync(ApplicationUser user, CancellationToken ct)
    {
        var access = _jwt.CreateAccessToken(user);
        var refresh = _jwt.CreateRefreshToken();
        await _users.InsertRefreshTokenAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = refresh.Hash,
            ExpiresAt = refresh.ExpiresAt,
            CreatedAt = DateTime.UtcNow
        }, ct);

        return new AuthResponse
        {
            AccessToken = access,
            RefreshToken = refresh.Token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = EnquiryMapper.ToDto(user)
        };
    }
}
