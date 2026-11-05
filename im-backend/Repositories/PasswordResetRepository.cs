using Dapper;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Repositories
{
    public class PasswordResetRepository : IPasswordResetRepository
    {
        private readonly IDbConnectionFactory _dbFactory;

        public PasswordResetRepository(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<LoginModels?> GetUserByLoginIdAsync(string username)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            return await db.QueryFirstOrDefaultAsync<LoginModels>(
                PasswordResetQueries.GetUserByLoginId,
                new { Username = username });
        }

        public async Task SavePasswordResetTokenAsync(PasswordResetToken token)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            await db.ExecuteAsync(
                PasswordResetQueries.InsertPasswordResetToken,
                new
                {
                    token.UserId,
                    token.TokenHash,
                    token.CreatedAt,
                    token.ExpiresAt
                });
        }
        public async Task<PasswordResetToken?> GetResetTokenAsync(string token)
        {
            string sql = @"
        SELECT *
        FROM PasswordResetTokens
        WHERE TokenHash = @Token";

            using IDbConnection db = _dbFactory.CreateConnection();

            return await db.QueryFirstOrDefaultAsync<PasswordResetToken>(
                sql,
                new { Token = token });
        }
        public async Task<LoginModels?> GetUserByIdAsync(int userId)
        {
            string sql = @"
        SELECT *
        FROM Users
        WHERE User_Id = @User_Id";

            using IDbConnection db = _dbFactory.CreateConnection();

            return await db.QueryFirstOrDefaultAsync<LoginModels>(
                sql,
                new { User_Id = userId });
        }
        public async Task UpdatePasswordAsync(int userId, byte[] encryptedPassword)
        {
            string sql = @"
        UPDATE users
        SET Passwd = @Password
        WHERE User_id = @UserId";

            using IDbConnection db = _dbFactory.CreateConnection();

            await db.ExecuteAsync(sql, new
            {
                UserId = userId,
                Password = encryptedPassword
            });
        }
        public async Task MarkTokenAsUsedAsync(string tokenHash)
        {
            string sql = @"
        UPDATE PasswordResetTokens
        SET UsedAt = @UsedAt
        WHERE TokenHash = @TokenHash";

            using IDbConnection db = _dbFactory.CreateConnection();

            await db.ExecuteAsync(sql, new
            {
                TokenHash = tokenHash,
                UsedAt = DateTime.UtcNow
            });
        }
        public async Task MarkTokenExpiredAsync(int id)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            await db.ExecuteAsync(
                @"UPDATE PasswordResetTokens
          SET IsExpired = 1
          WHERE Id = @Id",
                new { Id = id });
        }
        //public async Task DeleteResetTokenAsync(string tokenHash)
        //{
        //    string sql = @"
        //DELETE FROM PasswordResetTokens
        //WHERE TokenHash = @TokenHash";

        //    using IDbConnection db = _dbFactory.CreateConnection();

        //    await db.ExecuteAsync(sql, new
        //    {
        //        TokenHash = tokenHash
        //    });
        //}

    }
}