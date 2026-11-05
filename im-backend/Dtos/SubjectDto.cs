using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class SubjectListDto
    {
        public int SubId { get; set; }
        public string SubName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CurriculumName { get; set; } = string.Empty;
        public string DurationFull { get; set; } = string.Empty;
        public double ActualFees { get; set; }
        public string SubjectType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? RefSubId { get; set; }
        public int BranchId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Taxable { get; set; } = string.Empty;
        public string TaxType { get; set; } = string.Empty;
        public int CourseFeeWise { get; set; }
        public int AdhocSub { get; set; }
        public int BranchReferenceCount { get; set; }
        public bool IsImported => RefSubId > 0;
    }

    public class SubjectSearchDto : PaginationRequest
    {
        public string? SubjectName { get; set; }
        public int? CrclmId { get; set; }
        public int? CourseId { get; set; }
        public int? Status { get; set; }
        public int BranchId { get; set; }
        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class SubjectSubmitDto
    {

        public int? CrclmId { get; set; }
        [Required(ErrorMessage = "Course name is required")]
        public int CourseId { get; set; }
        [Required(ErrorMessage = "Subject name is required")]
        [MaxLength(100, ErrorMessage = "Subject name cannot exceed 100 characters")]
        [RegularExpression(@"^\w+([\s-_]\w+)*$", ErrorMessage = "Only one space, number, text, underscore, hyphen allowed")]
        public string SubName { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public int? Duration { get; set; }
        public int DurationType { get; set; } = 1;
        public string FeesType { get; set; } = string.Empty; // M = Monthly, F = Fixed
        [Required(ErrorMessage = "Amount is required")]
        public int SubFeesType { get; set; } // 1 = Fixed Duration, 2 = Ongoing, 3 = Course End
        public int NoofMonths { get; set; }
        public string? CourseEndDate { get; set; } = null;
        public bool UpdateAllBranches { get; set; } = false;
        public double Fees { get; set; }
        public int AdhocSub { get; set; }
        public bool Taxable { get; set; } = false;
        public bool IncludingTax { get; set; } = false;
        public bool AllowProrated { get; set; } = false;
        public bool AllowInstallment { get; set; } = false;
        [Required(ErrorMessage = "Maximum Installment is required")]
        public int MaxInstallment { get; set; }
        public bool HasStudentsAssigned { get; set; } = false;
        public int PaymentTemplateId { get; set; }
        public bool IsCreateTemplate { get; set; } = false;
        public bool TemplateStatus { get; set; } = false;
        public int TemplateType { get; set; } // 1 = Interval Days, 2 = Monthly, 3 = Quarterly
        public int NoofDays { get; set; }
        public List<string> TemplateDetails { get; set; } = new List<string>(); // Format: "Day#Amount"
        public int Status { get; set; }
        public int BranchId { get; set; }
    }

    public class InstituteSubjectSubmitDto
    {
        public List<int> InstSubIds { get; set; } = new List<int>();
        public int BranchId { get; set; }
    }

    public class SubjectPaymentTemplateDto
    {
        public int PaymentTemplateId { get; set; }
        public int TemplateDurationType { get; set; }
        public int NoofDays { get; set; }
        public int StatusFlag { get; set; }
        public List<SubjectPaymentTemplateDetailDto> TemplateDetails { get; set; } = new List<SubjectPaymentTemplateDetailDto>();
    }

    public class SubjectPaymentTemplateDetailDto
    {
        public int NoOfDay { get; set; }
        public double Amount { get; set; }
    }

    public class SubjectInstallmentIntervalRequestDto
    {
        public int CourseFee { get; set; }
        public int MaxInstallment { get; set; }
        public int Day { get; set; }
        public int BranchId { get; set; }
    }

    public class SubjectInstallmentTemplateDto
    {
        public int SrNo { get; set; }
        public int DayOfMonth { get; set; }
        public double Amount { get; set; }
    }

    public class SubjectInstallmentIntervalResponseDto
    {
        public List<SubjectInstallmentTemplateDto> Templates { get; set; } = new();
        public double TotalAmount { get; set; }
    }

    public class SubjectExportSubmitDto
    {
        public List<int> SubjectIds { get; set; } = new List<int>();
        public List<int> BranchIds { get; set; } = new List<int>();
    }

    public class SubjectInstituteDto : PaginationRequest
    {
        public int BranchId { get; set; }
        public int[]? CrclmIds { get; set; }
        public int[]? CourseIds { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }

    }
}