using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class StudentEnquiryDto
    {
        // Registration Details
     
        public string? RegDate { get; set; } = string.Empty;
        public string? EnquiryDate { get; set; }
        public string? WalkInDate { get; set; }
        public string? WalkIn { get; set; } // Yes/No

        [Required(ErrorMessage = "Gender is required")]
        public int Gender { get; set; } // 1 = Male, 2 = Female, 3 = Other
        public string Salutation { get; set; } = string.Empty;
        [Required(ErrorMessage = "First name is required")]
        [MaxLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = string.Empty;
        [MaxLength(100, ErrorMessage = "Middle name cannot exceed 100 characters")]
        public string MiddleName { get; set; } = string.Empty;
        [MaxLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
        public string LastName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Mobile number is required")]
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string Mobile { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? BiometricAttendanceId { get; set; }

        public string SelectedSubjects { get; set; } = string.Empty; // Comma-separated subject IDs with format: SubjectID#FeesType#SubRegDate#BatchId#CourseId
        public string SelectedCourses { get; set; } = string.Empty; // Comma-separated course IDs
        public string? OtherFeesIds { get; set; } // Comma-separated other fees IDs
        public List<int> BatchIds { get; set; } = new List<int>();

        public string Address { get; set; } = string.Empty;
        public int CountryId { get; set; } = 0;
        public int StateId { get; set; } = 0;
        public int CityId { get; set; } = 0;
        public string? OtherCity { get; set; }
        public string? PinCode { get; set; }
        public string? PermanentAddress { get; set; }
        public int CountryIdC { get; set; } = 0;
        public int StateIdC { get; set; } = 0;
        public int CityIdC { get; set; } = 0;
        public string? OtherCityC { get; set; }
        public string? PinCodeC { get; set; }
        public string? HomePhone { get; set; }
        public string? DateOfBirth { get; set; }
        public int? Age { get; set; }
        public string? Category { get; set; }
        public byte[]? Photo { get; set; }

        public string WorkStatus { get; set; } = "No"; // Yes/No
        public string? Occupation { get; set; }
        public string? Organization { get; set; }
        public double? Salary { get; set; }

        public string? Source { get; set; }
        public string? Comments { get; set; }
        public string FatherFirstName { get; set; } = string.Empty;
        public string? FatherMiddleName { get; set; }
        public string? FatherLastName { get; set; }
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string? Mobile1 { get; set; }
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string? Mobile2 { get; set; }
        public string? ParentCompanyName { get; set; }
        public string? ParentGSTNo { get; set; }

        // Mother's name details
        public string? MotherFirstName { get; set; }
        public string? MotherMiddleName { get; set; }
        public string? MotherLastName { get; set; }

        public List<EducationDto> Education { get; set; } = new List<EducationDto>();

        // Follow-up details
        public bool EnableFollowUp { get; set; } = false;
        public int? FollowUpStatusId { get; set; }
        public string? FollowUpRemarks { get; set; }
        public string? FollowUpDate { get; set; }
        public string? FollowUpTime { get; set; }
        public bool IsInterested { get; set; } = false;

        public string? Remarks { get; set; }
        public int EnqStatus { get; set; } = 0; // Enquiry status

        public int BranchId { get; set; } = 0;
    }

    public class EnquiryStudentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? StudentId { get; set; }
    }

    // Step 1: Enquiry & Personal Details
    public class EnquiryStep1Dto
    {
        [Required(ErrorMessage = "Enquiry date is required")]
        public string EnquiryDate { get; set; } = string.Empty;

        [Required(ErrorMessage = "Enquiry status is required")]
        public int EnqStatus { get; set; } = 0;

        [Required(ErrorMessage = "Walk in date is required")]
        public string WalkInDate { get; set; } = string.Empty;

        // Follow-up details
        public int? FollowUpStatusId { get; set; }
        public string? FollowUpDate { get; set; }
        public string? FollowUpTime { get; set; }
        public string? FollowUpRemarks { get; set; }
        public bool IsInterested { get; set; } = false;

        // Photo
        public byte[]? Photo { get; set; }

        // Personal details
        [Required(ErrorMessage = "Gender is required")]
        public int Gender { get; set; }

        public string Salutation { get; set; } = string.Empty;

        [Required(ErrorMessage = "First name is required")]
        [MaxLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "Middle name cannot exceed 100 characters")]
        public string MiddleName { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Contact number is required")]
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string Mobile { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? DateOfBirth { get; set; }

        public int? Age { get; set; }

        public string? Category { get; set; }

        public string? BiometricAttendanceId { get; set; }

        // Correspondence address
        public string Address { get; set; } = string.Empty;
        public int CountryId { get; set; } = 0;
        public int StateId { get; set; } = 0;
        public int CityId { get; set; } = 0;
        public string? OtherCity { get; set; }
        public string? PinCode { get; set; }

        // Permanent address
        public bool SameAsCorrespondence { get; set; } = false;
        public string? PermanentAddress { get; set; }
        public int CountryIdC { get; set; } = 0;
        public int StateIdC { get; set; } = 0;
        public int CityIdC { get; set; } = 0;
        public string? OtherCityC { get; set; }
        public string? PinCodeC { get; set; }

        public int BranchId { get; set; } = 0;
    }

    // Step 2: Academic Details
    public class EnquiryStep2Dto
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }

        public string SelectedSubjects { get; set; } = string.Empty; // Comma-separated subject IDs with format: SubjectID#FeesType#SubRegDate#BatchId#CourseId
        public string SelectedCourses { get; set; } = string.Empty; // Comma-separated course IDs
        public string? OtherFeesIds { get; set; } // Comma-separated other fees IDs
        public List<int> BatchIds { get; set; } = new List<int>();
    }

    // Step 3: Family & Work Details
    public class EnquiryStep3Dto
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }

        // Father/Guardian details
        public string FatherFirstName { get; set; } = string.Empty;
        public string? FatherMiddleName { get; set; }
        public string? FatherLastName { get; set; }
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string? Mobile1 { get; set; }

        // Mother details
        public string? MotherFirstName { get; set; }
        public string? MotherMiddleName { get; set; }
        public string? MotherLastName { get; set; }
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string? Mobile2 { get; set; }

        // Parent's employer details
        public string? ParentCompanyName { get; set; }
        public string? ParentGSTNo { get; set; }

        // Working details
        public string WorkStatus { get; set; } = "No"; // Yes/No
        public string? Occupation { get; set; }
        public string? Organization { get; set; }
        public double? Salary { get; set; }
    }

    // Step 4: Education Details
    public class EnquiryStep4Dto
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }

        public List<EducationDto> Education { get; set; } = new List<EducationDto>();
    }

    // Step 5: Remarks
    public class EnquiryStep5Dto
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }

        public string? Source { get; set; } // How did you hear about the institute?
        public string? Comments { get; set; }
        public string? Remarks { get; set; }
        public string? HomePhone { get; set; }
    }
}
