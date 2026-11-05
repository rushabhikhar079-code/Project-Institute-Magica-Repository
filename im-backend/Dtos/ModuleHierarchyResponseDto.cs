namespace IM_backend.Dtos
{
    public class ModulePermissionsDto
    {
        public bool View { get; set; }
        public bool Add { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
        public bool Import { get; set; }
        public bool Export { get; set; }
    }

    public class ModuleHierarchyItemDto
    {
        public int ModuleId { get; set; }
        public string ModuleCode { get; set; }
        public string Name { get; set; }
        public int Level { get; set; }
        public double Sequence { get; set; }
        public string? Route { get; set; }
        public ModulePermissionsDto? Permissions { get; set; }
        public List<ModuleHierarchyItemDto> Children { get; set; }

        public ModuleHierarchyItemDto()
        {
            Children = new List<ModuleHierarchyItemDto>();
        }
        public bool SelfOperation { get; set; }
    }

    public class ModuleHierarchyResponseDto
    {
        public List<ModuleHierarchyItemDto> Modules { get; set; }

        public ModuleHierarchyResponseDto()
        {
            Modules = new List<ModuleHierarchyItemDto>();
        }
    }
}
