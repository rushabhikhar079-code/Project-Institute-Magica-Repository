namespace IM_backend.Models
{
    public class StudyMaterial
    {
        public int StudymaterialId { get; set; }
        public int InstituteId { get; set; }
        public int BranchId { get; set; }
        public int CourseId { get; set; }
        public int SubjectId { get; set; }
        public int TopicId { get; set; }
        public string Heading { get; set; } = string.Empty;
        public int IsActive { get; set; }
        public int? AddedBy { get; set; }
        public string? AddedIP { get; set; }
        public DateTime? AddedDate { get; set; }
        public int? UpdatedBy { get; set; }
        public string? UpdatedIP { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? StudymaterialHtml { get; set; }
        public string? AttachmentOriginalName { get; set; }
        public string? AttachmentStoredName { get; set; }
        public string? AttachmentPath { get; set; }
        public string? AttachmentExtension { get; set; }
        public long? AttachmentSize { get; set; }
        public string? AttachmentMimeType { get; set; }
    }
}
