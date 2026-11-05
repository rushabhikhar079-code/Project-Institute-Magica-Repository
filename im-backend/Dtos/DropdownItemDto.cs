namespace IM_backend.Dtos
{
    public class DropdownItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
    public class UserIpLocationDto
    {
        public int? CountryId { get; set; }
        public string? CountryName { get; set; }
        public int? StateId { get; set; }
        public string? StateName { get; set; }
        public int? CityId { get; set; }
        public string? CityName { get; set; }
    }
    public class GeoIpResponseDto
    {
        public string? Country { get; set; }
        public string? RegionName { get; set; }
        public string? City { get; set; }
        public string? Status { get; set; }
    }

    public class FollowUpStatusDto
    {
        public string StatusId { get; set; } = string.Empty;
        public string SName { get; set; } = string.Empty;
        public int SFlag { get; set; }
        public string Productive { get; set; } = string.Empty;
        public int reminder { get; set; }
        public int InstId { get; set; }
    }
}
