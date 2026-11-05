using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{

    public class CourseListDto
    {
        public int CourseId { get; set; }
        public string Course_Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Duration { get; set; }
        public string Duration_Type { get; set; }
        public string Status { get; set; } = string.Empty;
        public int RefCourseId { get; set; }
        public int BranchId { get; set; }
        public int CrclmId { get; set; }
        public string Curriculum_Name { get; set; } = string.Empty;
        public double CourseFees { get; set; }
        public int IsCourseLvl { get; set; }
        public bool cTaxable { get; set; }
        public bool cIncluding_Tax { get; set; }
        public string cAllow_Installment { get; set; } = string.Empty;
        public string cMax_Installment { get; set; } = string.Empty;
        public string CourseType { get; set; }
        public string Hsncode { get; set; } = string.Empty;
        public int CourseFeeWise { get; set; }
        public int adhocCourse { get; set; }
        public bool IsImported => RefCourseId > 0;

        public PaymentTemplateDto? PaymentTemplate { get; set; }
        public List<PaymentTemplateInstallmentDto> TemplateInstallments { get; set; } = new();

        public List<int> TrainerIds { get; set; } = new List<int>();

        public bool HasStudentsAssignedToAdhoc { get; set; }
        public bool HasStudentsAssigned { get; set; }

    }

    public class CourseSubmitDto
    {
        [Required(ErrorMessage = "Course name is required")]
        [MaxLength(100, ErrorMessage = "Course name cannot exceed 100 characters")]
        [RegularExpression(@"^\w+([\s-_]\w+)*$", ErrorMessage = "Only one space, number, text, underscore, hyphen allowed")]
        public string CourseName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Curriculum is required")]
        public int CrclmId { get; set; }
        [MaxLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Hsncode { get; set; } = string.Empty;
        public double Duration { get; set; }
        public int DurationType { get; set; }
        public List<int> TrainerIds { get; set; } = new List<int>();
        public bool IsCourseLvl { get; set; }
        public int CourseFeeWise { get; set; }
        public int AdhocCourse { get; set; }
        public double CourseFee { get; set; }
        public bool Taxable { get; set; } = false;
        public bool IncludingTax { get; set; } = false;
        public bool AllowInstallment { get; set; } = false;
        public int MaxInstallment { get; set; }

        // Payment Template fields
        public int PaymentTemplateId { get; set; }
        public bool IsCreateTemplate { get; set; } = false;
        public bool TemplateStatus { get; set; } = false;
        public int TemplateType { get; set; }
        public int NoofDays { get; set; }
        public List<string> TemplateDetails { get; set; } = new List<string>();
        public int BranchId { get; set; }
    }

    public class CourseEditDto
    {
        public int CourseId { get; set; }

        [Required(ErrorMessage = "Course name is required")]
        [MaxLength(100, ErrorMessage = "Course name cannot exceed 100 characters")]
        [RegularExpression(@"^\w+([\s-_]\w+)*$", ErrorMessage = "Only one space, number, text, underscore, hyphen allowed")]
        public string CourseName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Curriculum is required")]
        public int CrclmId { get; set; }
        [MaxLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Hsncode { get; set; } = string.Empty;
        public double Duration { get; set; }
        public int DurationType { get; set; }
        public List<int> TrainerIds { get; set; } = new List<int>();
        public bool IsCourseLvl { get; set; }
        public int CourseFeeWise { get; set; }
        public int AdhocCourse { get; set; }
        public double CourseFee { get; set; }
        public bool Taxable { get; set; }
        public bool IncludingTax { get; set; }
        public bool AllowInstallment { get; set; }
        public int MaxInstallment { get; set; }

        // Payment Template fields
        public int PaymentTemplateId { get; set; }
        public bool IsCreateTemplate { get; set; }
        public bool TemplateStatus { get; set; }
        public int TemplateType { get; set; }
        public int NoofDays { get; set; }
        public List<string> TemplateDetails { get; set; } = new List<string>();
        public int BranchId { get; set; }
        // Update to all branches flag
        public bool UpdateAllBranches { get; set; }
        public int status { get; set; }
    }

    public class CourseSearchDto : PaginationRequest
    {
        public string CourseName { get; set; } = string.Empty;
        public int Status { get; set; } = 2; // 2 = All, 1 = Active, 0 = Inactive
        public int BranchId { get; set; }
        public int? CurriculumId { get; set; }
        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class CourseSubjectsDto : PaginationRequest
    {
        public List<int> CourseIds { get; set; } = new List<int>();
        public int BranchId { get; set; }
    }

    public class CourseSubjectListDto
    {
        public int SubId { get; set; }
        public string Sub_Name { get; set; } = string.Empty;
        public string Course_Name { get; set; } = string.Empty;
        public string DurationFull { get; set; } = string.Empty;
        public double ActualFees { get; set; }
        public string SubjectType { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string Curriculum_Name { get; set; } = string.Empty;
    }

    public class PaymentTemplateDto
    {
        public int PaymentTemplateId { get; set; }
        public int TemplateType { get; set; }
        public bool StatusFlag { get; set; }
        public int TemplateDurationType { get; set; } // 1=Days, 2=Monthly, 3=Quarterly
        public int NoofDays { get; set; }
        public int BranchId { get; set; }
        public int InstituteId { get; set; }
        public int CourseId { get; set; }
    }

    public class PaymentTemplateInstallmentDto
    {
        public int SrNo { get; set; }
        public int DayOfMonth { get; set; }
        public double Amount { get; set; }
    }

    public class CourseInstituteDto : PaginationRequest
    {
        public int BranchId { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int[]? CrclmIds { get; set; }
    }

    public class CourseInstituteListDto
    {

        public int CourseId { get; set; }
        public string Course_Name { get; set; } = string.Empty;
        public string Curriculum_Name { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }

    }

    public class InstituteSubjectListDto
    {
        public int SubId { get; set; }
        public string SubName { get; set; } = string.Empty;
        public string CurriculumName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string DurationFull { get; set; } = string.Empty;
        public double ActualFees { get; set; }
        public string SubjectType { get; set; } = string.Empty;
    }
    public class InstituteSubjectSearchDto : PaginationRequest
    {
        public int CourseId { get; set; }
        public int RefCourseId { get; set; }
        public int? CrclmId { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class CourseImportSubmitDto
    {
        public List<int> CourseIds { get; set; } = new List<int>();
        public int BranchId { get; set; }
    }

    public class CourseExportSubmitDto
    {
        public List<int> CourseIds { get; set; } = new List<int>();
        public List<int> BranchIds { get; set; } = new List<int>();
    }
}
