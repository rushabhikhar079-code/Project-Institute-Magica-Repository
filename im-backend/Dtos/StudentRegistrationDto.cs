using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class StudentRegistrationDto
    {
        // Registration Details
        [Required(ErrorMessage = "Registration date is required")]
        public string RegDate { get; set; } = string.Empty;
        [Required(ErrorMessage = "Registration number is required")]
        public string RegNo { get; set; } = string.Empty;
        public string? RollNo { get; set; }
        public int Status { get; set; } = 1; // 1 = Active, 0 = Inactive
        public string? InactiveStatus { get; set; } // Reason for inactivity

        [Required(ErrorMessage = "Gender is required")]
        public int Gender { get; set; } // 1 = Male, 2 = Female, 3 = Other
        public string Salutation { get; set; } = string.Empty;
        [Required(ErrorMessage = "First name is required")]
        [MaxLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = string.Empty;
        [MaxLength(100, ErrorMessage = "Middle name cannot exceed 100 characters")]
        public string? MiddleName { get; set; } = string.Empty;
        [MaxLength(100, ErrorMessage = "Last name cannot exceed 100 characters")]
        public string? LastName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Mobile number is required")]
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string Mobile { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;
        public string? BiometricAttendanceId { get; set; }

        [Required(ErrorMessage = "At least one subject must be selected")]
        public string SelectedSubjects { get; set; } = string.Empty; // Comma-separated subject IDs
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

        //[Required(ErrorMessage = "Father's first name is required")]
        public string? FatherFirstName { get; set; } = string.Empty;
        public string? FatherMiddleName { get; set; }
        public string? FatherLastName { get; set; }
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string? Mobile1 { get; set; }
        [RegularExpression(@"^[0-9]{10,15}$", ErrorMessage = "Mobile number must be between 10-15 digits")]
        public string? Mobile2 { get; set; }
        public string? ParentCompanyName { get; set; }
        public string? ParentGSTNo { get; set; }

        public List<EducationDto> Education { get; set; } = new List<EducationDto>();

        public string? Remarks { get; set; }

        public int BranchId { get; set; } = 0;
    }

    public class EducationDto
    {
        [Required(ErrorMessage = "Degree is required")]
        public string Degree { get; set; } = string.Empty;

        public string? College { get; set; }
        public string? Stream { get; set; }
        public string? Percentage { get; set; }
        public string? Year { get; set; }
    }

    public class StudentRegistrationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? StudentId { get; set; }
        public string? RegNo { get; set; }
    }

    public class EditRegistrationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? StudentId { get; set; }
    }

    public class StudentListDto
    {
        public string RegNo { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PContact { get; set; } = string.Empty;
        public string FMobile { get; set; } = string.Empty;
        public string MMobile { get; set; } = string.Empty;
        public string EmailId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Registered { get; set; } = string.Empty;
        public string RegNo_Manual { get; set; } = string.Empty;
        public string RegDate { get; set; } = string.Empty;
        public int BranchId { get; set; }
        public string EnqDate { get; set; } = string.Empty;
        public string EnqStatus { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public bool AllowStudModule { get; set; }
        public string CourseNames { get; set; } = "-";
        public string SubjectNames { get; set; } = "-";
        public string BatchNames { get; set; } = "-";
    }

    public class StudentSearchDto : PaginationRequest
    {
        public string ListType { get; set; } = "Registration"; // "Registration" or "Enquiry"
        public string? StudentName { get; set; }
        public string? Reg { get; set; } // "Yes", "No", or ""
        public string? RegManual { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? RegFrDate { get; set; } // dd/MM/yyyy format
        public string? RegToDate { get; set; } // dd/MM/yyyy format
        public int Status { get; set; } = 2; // 0=Inactive, 1=Active, 2=All
        public int CurriculumId { get; set; } = 0;
        public int CourseId { get; set; } = 0;
        public int SubId { get; set; } = 0;
        public int BatchId { get; set; } = 0;
        public int EnquiryStatus { get; set; } = 0;
        public bool NotInBatch { get; set; } = false;
        public int BranchId { get; set; }

        //Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class StudentForEditDto
    {
        public int StudentId { get; set; }
        public string RegNo { get; set; } = string.Empty;
        public string RegDate { get; set; } = string.Empty;

        // Registration-specific fields
        public string? RollNo { get; set; }
        public int Status { get; set; } = 1;
        public string? InactiveStatus { get; set; }

        // Enquiry-specific fields
        public string? EnquiryDate { get; set; }
        public string? WalkInDate { get; set; }
        public string? WalkIn { get; set; }

        // Additional fields
        public string? ValidUpto { get; set; }

        // Common fields
        public int Gender { get; set; }
        public string Salutation { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? BiometricAttendanceId { get; set; }
        public string SelectedSubjects { get; set; } = string.Empty;
        public string SelectedCourses { get; set; } = string.Empty;
        public string? OtherFeesIds { get; set; }
        public string? OtherFeesScheduledIds { get; set; }
        public string? ScheduledSubjects { get; set; }
        public string? ScheduledCourses { get; set; }
        public string? CoursesWithoutSubjects { get; set; }
        public List<int> BatchIds { get; set; } = new List<int>();
        public string Address { get; set; } = string.Empty;
        public int? CountryId { get; set; }
        public int? StateId { get; set; }
        public int? CityId { get; set; }
        public string? OtherCity { get; set; }
        public string? PinCode { get; set; }
        public string? PermanentAddress { get; set; }
        public int? CountryIdC { get; set; }
        public int? StateIdC { get; set; }
        public int? CityIdC { get; set; }
        public string? OtherCityC { get; set; }
        public string? PinCodeC { get; set; }
        public string? HomePhone { get; set; }
        public string? DateOfBirth { get; set; }
        public int? Age { get; set; }
        public string? Category { get; set; }
        public byte[]? Photo { get; set; }
        public string WorkStatus { get; set; } = "No";
        public string? Occupation { get; set; }
        public string? Organization { get; set; }
        public double? Salary { get; set; }
        public string? Source { get; set; }
        public string? Comments { get; set; }
        public string FatherFirstName { get; set; } = string.Empty;
        public string? FatherMiddleName { get; set; }
        public string? FatherLastName { get; set; }
        public string? Mobile1 { get; set; }
        public string? Mobile2 { get; set; }
        public string? ParentCompanyName { get; set; }
        public string? ParentGSTNo { get; set; }
        public string? MotherFirstName { get; set; }
        public string? MotherMiddleName { get; set; }
        public string? MotherLastName { get; set; }
        public List<EducationDto> Education { get; set; } = new List<EducationDto>();

        // Follow-up fields (enquiry)
        public bool EnableFollowUp { get; set; } = false;
        public int? FollowUpStatusId { get; set; }
        public string? FollowUpRemarks { get; set; }
        public string? FollowUpDate { get; set; }
        public string? FollowUpTime { get; set; }
        public bool IsInterested { get; set; } = false;

        public string? Remarks { get; set; }
        public int EnqStatus { get; set; } = 0;
        public int BranchId { get; set; } = 0;
    }

    public class BulkStudentStatusDto
    {
        [Required(ErrorMessage = "Student IDs are required")]
        public List<int> StudentIds { get; set; } = new List<int>();

        [Required(ErrorMessage = "Status is required")]
        public int Status { get; set; } // 1 = Active, 0 = Inactive

        public string? InactiveStatus { get; set; } // Reason for inactivity (required when Status = 0)
    }

    public class BulkStudentDeleteDto
    {
        [Required(ErrorMessage = "Student IDs are required")]
        public List<int> StudentIds { get; set; } = new List<int>();
    }

    public class DeleteStudentDto
    {
        [Required(ErrorMessage = "Student ID is required")]
        public int StudentId { get; set; }

        [Required(ErrorMessage = "Status is required")]
        public int Status { get; set; } // 0 = Soft delete (set StatusFlag to 0), 1 = Hard delete (remove from tables)
    }
}
