namespace IM_backend.Models
{
    public class InstituteModels
    {
        public int InstituteId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Person { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string CpMobile { get; set; } = string.Empty;
        public string CpEmail { get; set; } = string.Empty;
        public DateTime RegDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int NoOfStudents { get; set; }
        public int NoOfReg { get; set; }
        public int NoOfEnq { get; set; }
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public int CityId { get; set; }
        public string OtherCity { get; set; } = string.Empty;
        public string PinCode { get; set; } = string.Empty;
        public int InstNoofStuds { get; set; }
        public string InstProCoachingFor { get; set; } = string.Empty;
        public int IsBranchWise { get; set; }
        public int CountryIdc { get; set; }
        public int StateIdc { get; set; }
        public int CityIdc { get; set; }
        public string OtherCityc { get; set; } = string.Empty;
    }

    public class InstUserModels
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string LoginId { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public int InstituteId { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Address2 { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Contact { get; set; } = string.Empty;
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public int CityId { get; set; }
        public string OtherCity { get; set; } = string.Empty;
        public int CountryIdc { get; set; }
        public int StateIdc { get; set; }
        public int CityIdc { get; set; }
        public string OtherCityc { get; set; } = string.Empty;
        public string PinCodeC { get; set; } = string.Empty;
        public byte[] Password { get; set; } = Array.Empty<byte>();
    }
}
