using Dapper;
using IM_backend.Interfaces;
using IM_backend.SqlQueries;
using System.Data;

namespace IM_backend.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IDbConnectionFactory _dbFactory;

        public PermissionService(IDbConnectionFactory dbFactory)
        {
            _dbFactory = dbFactory;
        }

        public async Task<bool> HasPermissionAsync(string moduleName, string action)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var result = await db.QueryFirstOrDefaultAsync<int?>(
                LoginQueries.CheckModulePermission,
                new { ModuleName = moduleName, Action = action });

            // If result is null, module doesn't exist or no permission found in hierarchy
            // If result is 0, permission is not granted
            // If result is 1, permission is granted
            return result.HasValue && result.Value > 0;
        }
    }
}
