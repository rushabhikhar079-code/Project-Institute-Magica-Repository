using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class TopicListDto
    {
        public int TopicID { get; set; }
        public int SubjectID { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string SubName { get; set; } = string.Empty;
        public string CurriculumName { get; set; } = string.Empty;
        public float TopicSeqNum { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string TopicDuration { get; set; } = string.Empty;
        public int IsActive { get; set; }
        public int? RefTopicID { get; set; }
        public string? ModifiedDt { get; set; }
    }

    public class TopicSearchDto : PaginationRequest
    {
        public string? TopicName { get; set; }
        public int? CrclmId { get; set; }
        public int? CourseId { get; set; }
        public int? SubjectId { get; set; }
        public int? Status { get; set; }
        public int BranchId { get; set; }
        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class TopicSubmitDto
    {
        public int CurriculumId { get; set; }
        public int? RefTopicID { get; set; }
        [Required(ErrorMessage = "Course name is required")]
        public int CourseId { get; set; }
        [Required(ErrorMessage = "Subject name is required")]
        public int SubjectId { get; set; }
        [Required(ErrorMessage = "Topic sequence number is required")]
        public float TopicSeqNum { get; set; }
        [Required(ErrorMessage = "Topic name is required")]
        [MaxLength(200, ErrorMessage = "Topic name cannot exceed 200 characters")]
        [RegularExpression(@"^[^()*&^%$#@!<>\\/]+$", ErrorMessage = "Special characters not allowed")]
        public string TopicName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Unit is required")]
        public int TopicDurId { get; set; } // 1 = Hours, 2 = Days, 3 = Months
        [Required(ErrorMessage = "Duration is required")]
        public string TopicDuration { get; set; }
        [MaxLength(1000, ErrorMessage = "Remarks cannot exceed 1000 characters")]
        public string? Remark { get; set; }
        public int IsActive { get; set; } = 1; // 1 = Active, 0 = Inactive
        public bool IsReflect { get; set; } = false; // For institute level updates
        public int BranchId { get; set; }
        public int? CrclmId { get; set; }
    }

    public class InstituteTopicListDto
    {
        public int TopicID { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string CurriculumName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string SubName { get; set; } = string.Empty;
        public float TopicSeqNum { get; set; }
        public string TopicDuration { get; set; } = string.Empty;
    }

    public class TopicExcelImportDto
    {
        [Required(ErrorMessage = "Course is required")]
        public int CourseId { get; set; }
        [Required(ErrorMessage = "Subject is required")]
        public int SubjectId { get; set; }
        public List<TopicExcelRowDto> Topics { get; set; } = new List<TopicExcelRowDto>();
        public int BranchId { get; set; }
        public string ErrorLog { get; set; } = string.Empty;
    }

    public class TopicExcelRowDto
    {
        public int RowNumber { get; set; }
        public string TopicSequenceNumber { get; set; } = string.Empty;
        public string TopicName { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public string DurationUnit { get; set; } = string.Empty;
        public string Remark { get; set; } = string.Empty;
        public bool IsValid { get; set; } = true;
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class TopicImportResultDto
    {
        public int TotalRows { get; set; }
        public int ImportedCount { get; set; }
        public int FailedCount { get; set; }
        public string ErrorLog { get; set; } = string.Empty;
        public List<TopicExcelRowDto> FailedRecords { get; set; } = new List<TopicExcelRowDto>();
    }

    public class InstituteLevelTopicsListDto
    {
        public int TopicId { get; set; }
        public int SubjectId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string SubName { get; set; } = string.Empty;
        public float TopicSeqNum { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string? Remark { get; set; }
        public string TopicDuration { get; set; } = string.Empty;
        public int RefCourseId { get; set; }
        public int RefSubId { get; set; }
        public int BranchId { get; set; }
    }

    public class InstituteLevelTopicsSearchDto : PaginationRequest
    {
        public int? CourseId { get; set; }
        public int? CrclmId { get; set; }
        public int? SubjectId { get; set; }
        public int BranchId { get; set; }
        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class InstituteTopicsSubmitDto
    {
        [Required]
        public List<int> TopicIds { get; set; } = new List<int>();
        public int BranchId { get; set; }
    }

    public class TopicExcelFileUploadDto
    {
        [Required]
        public int CourseId { get; set; }
        [Required]
        public int SubjectId { get; set; }
        public int BranchId { get; set; }
    }

    public class TopicExportSubmitDto
    {
        public List<int> TopicIds { get; set; } = new List<int>();
        public List<int> BranchIds { get; set; } = new List<int>();
    }

    public class TopicInstituteDto : PaginationRequest
    {
        public int BranchId { get; set; }
        public int[]? CourseIds { get; set; }
        public int[]? SubjectIds { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int[]? CrclmIds { get; set; }
    }
}
