using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class InstituteRegistrationDto
    {
        [Required(ErrorMessage = "Please enter username")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter institute name")]
        public string InstituteName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter emailid")]
        [EmailAddress(ErrorMessage = "Please enter valid emailid")]
        public string EmailId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter mobile no")]
        [RegularExpression(@"^[0-9]{10}$", ErrorMessage = "Please enter valid mobile no")]
        public string MobileNo { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter address")]
        public string Address { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "Please select country")]
        public int CountryId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Please select state")]
        public int StateId { get; set; }

        //[Range(1, int.MaxValue, ErrorMessage = "Please select city")]
        public int? CityId { get; set; }

        [Required(ErrorMessage = "Please enter pincode")]
        public string Pincode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter contact person")]
        public string ContactPerson { get; set; } = string.Empty;

        public string? Remarks { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter number of students")]
        public string InstNoOfStudents { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please enter provide coaching for")]
        public string InstProvideCoachingFor { get; set; } = string.Empty;

        //[Range(1, int.MaxValue, ErrorMessage = "Please select Plan")]
        //public int PlanId { get; set; }

        [Required(ErrorMessage = "Please enter captcha code")]
        public string CaptchaId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Please Enter Captcha Code")]
        public string CaptchaInput { get; set; } = string.Empty;

        public string? otherCity { get; set; } = string.Empty; //Added by Nikhil L. on 28-07-2026
    }
}
