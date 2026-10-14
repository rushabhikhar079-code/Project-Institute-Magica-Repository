using System.Data;
using EnquiryAllocation.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using MySqlConnector;

namespace EnquiryAllocation.Infrastructure.Data;

public sealed class MySqlDbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public MySqlDbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
    }

    public IDbConnection Create() => new MySqlConnection(_connectionString);
}
