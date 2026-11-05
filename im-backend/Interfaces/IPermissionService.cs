namespace IM_backend.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> HasPermissionAsync(string moduleName, string action);
    }
}
