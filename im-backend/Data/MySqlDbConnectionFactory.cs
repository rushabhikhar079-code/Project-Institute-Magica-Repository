using IM_backend.Interfaces;
using MySql.Data.MySqlClient;
using System.Data;
namespace IM_backend.Data
{
    public class MySqlDbConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;
        public MySqlDbConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection string is missing.");
        }
        public IDbConnection CreateConnection() => new MySqlConnection(_connectionString);
    }
}
