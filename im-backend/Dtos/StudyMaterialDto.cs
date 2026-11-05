using IM_backend.Common;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class SaveStudyMaterialDto
    {
        [FromForm(Name = "StudymaterialId")]
        public int? StudymaterialId { get; set; }
        [Required]
        public int InstituteId { get; set; }
        [Required]
        [FromForm(Name = "BranchId")]
        public int BranchId { get; set; }
        [Required]
        [FromForm(Name = "CourseId")]
        public int CourseId { get; set; }
        [Required]
        [FromForm(Name = "SubjectId")]
        public int SubjectId { get; set; }
        [Required]
        [FromForm(Name = "TopicId")]
        public int TopicId { get; set; }
        //[Required]
        [MaxLength(100)]
        [FromForm(Name = "Heading")]
        public string Heading { get; set; } = string.Empty;
        [FromForm(Name = "IsActive")]
        public int IsActive { get; set; } = 1;
        [FromForm(Name = "StudymaterialHtml")]
        public string? StudymaterialHtml { get; set; }
        [FromForm(Name = "Attachment")]
        public IFormFile? Attachment { get; set; }

        [FromForm(Name = "AttachmentRemoved")]
        public bool AttachmentRemoved { get; set; }
        [FromForm(Name = "CrclmId")]
        public int? CrclmId { get; set; }
    }
    public class StudyMaterialDto
    {
        public int StudymaterialId { get; set; }
        public int InstituteId { get; set; }
        public int BranchId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public int CrclmId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string CurriculumName { get; set; } = string.Empty;
        public int TopicId { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string Heading { get; set; } = string.Empty;
        public int IsActive { get; set; }
        public string? StudymaterialHtml { get; set; }
        public string? AttachmentOriginalName { get; set; }
        public string? AttachmentPath { get; set; }
        public string? AttachmentExtension { get; set; }
        public long? AttachmentSize { get; set; }
    }
    public class StudyMaterialSearchDto : PaginationRequest
    {
        public string? StudyMaterialHeading { get; set; }
        public int BranchId { get; set; }
        public int? CrclmId { get; set; }
        public int? CourseId { get; set; }
        public int? SubjectId { get; set; }
        public int? TopicId { get; set; }
        public int Status { get; set; }
        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class StudyMaterialExportSubmitDto
    {
        public List<int> StudyMaterialIds { get; set; } = new List<int>();
        public List<int> BranchIds { get; set; } = new List<int>();
    }

    public class StudyMaterialImportDto : PaginationRequest
    {
        public int BranchId { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class StudyMaterialImportSubmitDto
    {
        public List<int> StudyMaterialIds { get; set; } = new List<int>();
        public int BranchId { get; set; }
    }
}
