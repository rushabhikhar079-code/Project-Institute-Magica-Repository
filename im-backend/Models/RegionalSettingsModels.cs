namespace IM_backend.Models
{
    public class RegionalSettingsModels
    {
        public int RegionalId { get; set; }
        public string TimeZone { get; set; } = string.Empty;
        public string TimeZone_Id { get; set; } = string.Empty;
        public string DateFormat { get; set; } = string.Empty;
        public string CountryCurr { get; set; } = string.Empty;
        public string CurrCode { get; set; } = string.Empty;
        public string CurrName { get; set; } = string.Empty;
        public string CurrFractionalUnit { get; set; } = string.Empty;
    }
}
