using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class InstituteSearchDto : PaginationRequest
    {
        public string instName { get; set; } = string.Empty;
        public string cpName { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string cpPhone { get; set; } = string.Empty;
        public string city { get; set; } = string.Empty;
        public int institutePlan { get; set; } = 0;
        public int status { get; set; } = 2; // 2 = All, 1 = Active, 0 = Inactive
        public int type { get; set; } = 2; // "2" = All, "1" = Internal Use, "0" = Clients
        public int regType { get; set; } = 2; // "2" = All, "1" = Premium, "0" = Trial
        public DateTime dtExpiryFrom { get; set; }
        public DateTime dtExpiryTo { get; set; }

        //Sorting Parameters
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }

    public class InstituteListItemDto
    {
        public int InstituteId { get; set; }
        public string InstituteName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string CpMobile { get; set; } = string.Empty;
        public string CpEmail { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string InstituteStatus { get; set; } = string.Empty;
        public double TaxRate { get; set; }
        public string RegDate { get; set; } = string.Empty;
        public string PayType { get; set; } = string.Empty;
        public string RegType { get; set; } = string.Empty;
        public string ExpiryDate { get; set; } = string.Empty;
        public string InstitutePlan { get; set; } = string.Empty;
    }

    public class InstituteEditDto
    {
        public int InstituteId { get; set; }
        public string InstituteName { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public byte[]? Logo { get; set; }
        public string CpMobile { get; set; } = string.Empty;
        public string CpEmail { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;

        public bool instituteStatus { get; set; }

        public string? RegDate { get; set; }
        public byte instituteType { get; set; }
        public string? instituteExpiryDate { get; set; }

        public int NoOfStudents { get; set; }
        public int NoOfReg { get; set; }
        public int NoOfEnq { get; set; }

        public byte PayType { get; set; }

        public byte Total { get; set; }
        public byte Enq { get; set; }
        public byte Reg { get; set; }

        public int NoOfBranches { get; set; }
        //public string District { get; set; } = string.Empty;

        public byte isAllowStudModule { get; set; }

        public string LogoPath { get; set; } = string.Empty;

        public int CountryId { get; set; }
        public int StateId { get; set; }
        public int CityId { get; set; }

        public string OtherCity { get; set; } = string.Empty;

        public bool isAllowedAndroidApp { get; set; }
        public bool isAllowTestEngine { get; set; }

        public int InstNoofStuds { get; set; }

        public string InstProCoachingFor { get; set; } = string.Empty;
        public string SalesPersonName { get; set; } = string.Empty;
        public string InstituteShortCode { get; set; } = string.Empty;
        public string ParentCompanyName { get; set; } = string.Empty;
        public int institutePlanId { get; set; }

        public bool isInternalUse { get; set; }
    }

    public class AccountHistoryDto
    {
        public int PaymentHistoryId { get; set; }
        public int UserId { get; set; }
        public string? PurchaseDate { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? StartDate { get; set; } = string.Empty;
        public string? EndDate { get; set; } = string.Empty;
        public int IsActive { get; set; }
        public decimal TotalAmount { get; set; }
        public int NoOfStudents { get; set; }
        public int Days { get; set; }
        public int Months { get; set; }
        public int NoOfEnquiry { get; set; }
        public string Type { get; set; } = string.Empty;
        public int NoOfBranches { get; set; }
        public string DiscountCode { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
        public decimal NetAmount { get; set; }
        public decimal TaxPercent { get; set; }
        public string? Remark { get; set; }
        public int? instId { get; set; }
    }

    public class AccountHistorySearchDto : PaginationRequest
    {
        public int InstId { get; set; }
        public string PlanName { get; set; } = string.Empty;
        public string SearchStatus { get; set; } = string.Empty; // "0" = Inactive, "1" = Active
    }

    public class InstituteDeleteDto
    {
        public int InstituteId { get; set; }
        public int Status { get; set; } // 0 = Soft delete, 1 = Hard delete
    }

    public class InstituteSubmitDto
    {
        [Required(ErrorMessage = "Date Of Registration is required.")]
        public string RegDate { get; set; } = string.Empty;
        public string InstituteShortCode { get; set; } = string.Empty;
        public string ParentCompanyName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Name of Institute is required.")]
        public string InstituteName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; } = string.Empty;
        [Required(ErrorMessage = "Country is required.")]
        public int CountryId { get; set; }
        [Required(ErrorMessage = "State is required.")]
        public int StateId { get; set; }
        public int CityId { get; set; }
        public string OtherCity { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email ID is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid Email ID.")]
        public string Email { get; set; } = string.Empty;
        public int NoOfStudents { get; set; }
        public string InstProCoachingFor { get; set; } = string.Empty;
        public string SalesPersonName { get; set; } = string.Empty;
        public bool isInternalUse { get; set; }
        public byte[]? Logo { get; set; }
        public string LogoPath { get; set; } = string.Empty;
        public int instituteType { get; set; }
        public int instituteStatus { get; set; }
        public string instituteExpiryDate { get; set; } = string.Empty;
        public bool isAllowStudModule { get; set; }
        public bool isAllowedAndroidApp { get; set; }
        public bool isAllowTestEngine { get; set; }
        [Required(ErrorMessage = "Contact Person is required.")]
        public string ContactPerson { get; set; } = string.Empty;
        [Required(ErrorMessage = "Mobile is required.")]
        public string CpMobile { get; set; } = string.Empty;
        [Required(ErrorMessage = "Contact Person Email ID is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid Contact Person Email ID.")]
        public string CpEmail { get; set; } = string.Empty;
        public SubscriptionDetailsDto? Subscription { get; set; }
        public int institutePlanId { get; set; }
    }

    public class InstituteEditSubmitDto
    {
        public int InstituteId { get; set; }
        [Required(ErrorMessage = "Date Of Registration is required.")]
        public string RegDate { get; set; } = string.Empty;
        public string InstituteShortCode { get; set; } = string.Empty;
        public string ParentCompanyName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Name of Institute is required.")]
        public string InstituteName { get; set; } = string.Empty;
        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; } = string.Empty;
        [Required(ErrorMessage = "Country is required.")]
        public int CountryId { get; set; }
        [Required(ErrorMessage = "State is required.")]
        public int StateId { get; set; }
        public int CityId { get; set; }
        public string OtherCity { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email ID is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid Email ID.")]
        public string Email { get; set; } = string.Empty;
        public int NoOfStudents { get; set; }
        public string InstProCoachingFor { get; set; } = string.Empty;
        public string SalesPersonName { get; set; } = string.Empty;
        public bool isInternalUse { get; set; }
        public byte[]? Logo { get; set; }
        public string LogoPath { get; set; } = string.Empty;
        public int instituteType { get; set; }
        public int instituteStatus { get; set; }
        public string instituteExpiryDate { get; set; } = string.Empty;
        public bool isAllowStudModule { get; set; }
        public bool isAllowedAndroidApp { get; set; }
        public bool isAllowTestEngine { get; set; }
        [Required(ErrorMessage = "Contact Person is required.")]
        public string ContactPerson { get; set; } = string.Empty;
        [Required(ErrorMessage = "Mobile is required.")]
        public string CpMobile { get; set; } = string.Empty;
        [Required(ErrorMessage = "Contact Person Email ID is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid Contact Person Email ID.")]
        public string CpEmail { get; set; } = string.Empty;

        public SubscriptionDetailsDto? Subscription { get; set; }
        public int institutePlanId { get; set; }
    }

    public class SubscriptionDetailsDto
    {
        public int SubscriptionType { get; set; } = 0;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public int NoOfDays { get; set; } = 0;
        public int NoOfRegStudents { get; set; } = 0;
        public int NoOfEnquiry { get; set; } = 0;
        public int NoOfBranches { get; set; } = 0;
        public int planStatus { get; set; } = 0;
    }
}
