using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class BranchSubmitDto
    {
        [Required(ErrorMessage = "Branch Name is required")]
        [StringLength(45, MinimumLength = 3, ErrorMessage = "Branch Name must be between 3 and 45 characters")]
        public string BranchName { get; set; } = string.Empty;

        public string BranchCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Country is required")]
        public int CountryId { get; set; }

        [Required(ErrorMessage = "State is required")]
        public int StateId { get; set; }

        [Required(ErrorMessage = "City is required")]
        public int CityId { get; set; }

        public string OtherCity { get; set; } = string.Empty;

        [RegularExpression(@"^[0-9]{6,10}$", ErrorMessage = "Pin code must be between 6 and 10 digits")]
        public string PinCode { get; set; } = string.Empty;

        [RegularExpression(@"^[0-9]{6,15}$", ErrorMessage = "Phone number must be between 6 and 15 digits")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact Person Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Contact Person is required")]
        public string ContactPerson { get; set; } = string.Empty;
        [Required(ErrorMessage = "Contact Person Mobile is required")]
        [RegularExpression(@"^[0-9]{6,15}$", ErrorMessage = "Contact person mobile must be between 6 and 15 digits")]
        public string CpMobile { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid contact person email format")]
        public string CpEmail { get; set; } = string.Empty;

        public double TaxRate { get; set; }
        public int Branch_Status { get; set; } = 1; // 1=Active, 0=Inactive

        public int MakeFranchisee { get; set; }

        // Franchisee details
        public DateTime? RegDate { get; set; }
        public double SignUp_Amt { get; set; }
        public double Monthly_Fee { get; set; }
        public double Exam_Fee { get; set; }
        public double Certification_Fee { get; set; }
        public double Commision_All { get; set; }
        public double Stud_Fixed_Fee { get; set; }
        public string AgreementFileName { get; set; } = string.Empty;
        public byte[] AgreementFile { get; set; }
        public List<CourseFeeDto> Course_Fixed_Fee { get; set; } = new List<CourseFeeDto>();
        public List<CourseCommDto> Coursewise_Commision { get; set; } = new List<CourseCommDto>();
        public List<CourseDto> Courses { get; set; } = new List<CourseDto>();
    }
    public class BranchEditDto
    {
        [Required(ErrorMessage = "Branch Id is required")]
        public int? BranchId { get; set; } = 0;

        [Required(ErrorMessage = "Branch Name is required")]
        [StringLength(45, MinimumLength = 3, ErrorMessage = "Branch Name must be between 3 and 45 characters")]
        public string BranchName { get; set; } = string.Empty;

        public string BranchCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Country is required")]
        public int CountryId { get; set; }

        [Required(ErrorMessage = "State is required")]
        public int StateId { get; set; }

        [Required(ErrorMessage = "City is required")]
        public int CityId { get; set; }

        public string OtherCity { get; set; } = string.Empty;

        [RegularExpression(@"^[0-9]{6,10}$", ErrorMessage = "Pin code must be between 6 and 10 digits")]
        public string PinCode { get; set; } = string.Empty;

        [RegularExpression(@"^[0-9]{6,15}$", ErrorMessage = "Phone number must be between 6 and 15 digits")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact Person Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;
        [Required(ErrorMessage = "Contact Person is required")]
        public string ContactPerson { get; set; } = string.Empty;
        [Required(ErrorMessage = "Contact Person Mobile is required")]
        [RegularExpression(@"^[0-9]{6,15}$", ErrorMessage = "Contact person mobile must be between 6 and 15 digits")]
        public string CpMobile { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Invalid contact person email format")]
        public string CpEmail { get; set; } = string.Empty;

        public double TaxRate { get; set; }
        public int Status { get; set; } = 1; // 1=Active, 0=Inactive

        public int MakeFranchisee { get; set; }

        // Franchisee details
        public DateTime? RegDate { get; set; }
        public double SignUp_Amt { get; set; }
        public double Monthly_Fee { get; set; }
        public double Exam_Fee { get; set; }
        public double Certification_Fee { get; set; }
        public double Commision_All { get; set; }
        public double Stud_Fixed_Fee { get; set; }
        public string AgreementFileName { get; set; } = string.Empty;
        public string? AgreementFile { get; set; }
        public bool AgreementFileChanged { get; set; }
        // Course fees for franchisee
        public List<CourseFeeDto> Course_Fixed_Fee { get; set; } = new List<CourseFeeDto>();
        public List<CourseCommDto> Coursewise_Commision { get; set; } = new List<CourseCommDto>();
        public List<CourseDto> Courses { get; set; } = new List<CourseDto>();
    }

    public class CourseFeeDto
    {
        public int SubjectId { get; set; }
        public double Amount { get; set; }
    }

    public class CourseCommDto
    {
        public int SubjectId { get; set; }
        public double Commision { get; set; }
    }

    public class BranchSearchDto : PaginationRequest
    {
        public string BranchName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public int Status { get; set; } = 2;
        public int? InstituteId { get; set; }

        // Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class BranchListItemDto
    {
        public int BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string CpMobile { get; set; } = string.Empty;
        public string CpEmail { get; set; } = string.Empty;
        public int statusId { get; set; }
        public string BranchStatus { get; set; } = string.Empty;
        public int FranchiseeFlag { get; set; }
        public double TaxRate { get; set; }
        public string ExpiryDate { get; set; } = string.Empty;
    }

    public class SubjectDto
    {
        public int SubId { get; set; }
        public string SubName { get; set; } = string.Empty;
        public double Fees { get; set; }
        public long StudCount { get; set; }
        public double TotalFees { get; set; }
        public double Commission { get; set; }
    }

    public class CourseDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public List<SubjectDto> Subjects { get; set; } = new List<SubjectDto>();
    }
}