namespace IM_backend.SqlQueries
{
    public class PasswordResetQueries
    {
        public const string GetUserByLoginId = @"
            SELECT
                u.User_id AS User_Id,
                u.LoginID AS LoginId,
                u.Email AS Email,
                u.Username,institute_id,
                i.institute_status as InstituteStatus
            FROM users u
            INNER JOIN institute i ON (i.instituteid= u.institute_id)
            WHERE u.loginid = @Username";
        public const string InsertPasswordResetToken = @"
            INSERT INTO PasswordResetTokens
            (
                UserId,
                TokenHash,
                CreatedAt,
                ExpiresAt,
                IsExpired
            )
            VALUES
            (
                @UserId,
                @TokenHash,
                @CreatedAt,
                @ExpiresAt,
                 0
            );";
    }
}
