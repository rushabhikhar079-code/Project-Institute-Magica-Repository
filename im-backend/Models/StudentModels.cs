namespace IM_backend.Models
{
    public class StudentModels
    {
        public int StudentId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int CountryId { get; set; }
        public int StateId { get; set; }
        public int CityId { get; set; }
        public string? OtherCity { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
