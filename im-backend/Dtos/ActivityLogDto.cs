namespace IM_backend.Dtos
{
    public class ActivityLogDto
    {
        public class ActivityLogCreateDto
        {
            public string ModuleName { get; set; } = string.Empty;
            public int UserId { get; set; }
            public string Action { get; set; } = string.Empty;
            public long? RecordId { get; set; }
            public string? OldData { get; set; }
            public string? NewData { get; set; }
            public string? TableName { get; set; }
            public int? InstituteId { get; set; }
            public string? BranchId { get; set; }
            public string? IpAddress { get; set; }
            public DateTime ActivityDateTime { get; set; }
            public string? Description { get; set; }
        }

        public class ActivityLogListDto
        {
            public long ActivityLogId { get; set; }
            public string ModuleName { get; set; } = string.Empty;
            public int UserId { get; set; }
            public string Action { get; set; } = string.Empty;
            public long? RecordId { get; set; }
            public string? OldData { get; set; }
            public string? NewData { get; set; }
            public string? TableName { get; set; }
            public int? InstituteId { get; set; }
            public string? BranchId { get; set; }
            public string? IpAddress { get; set; }
            public DateTime ActivityDateTime { get; set; }
            public string? Description { get; set; }
        }
    }
}
