using System.Text.Json.Serialization;

namespace IM_backend.Dtos
{
    public class AutoRegNoDto
    {
        // Database query fields
        [JsonIgnore]
        public int? CurrentRegNo { get; set; }
        [JsonIgnore]
        public string? Prefix { get; set; }
        //[JsonIgnore]
        //public int RegType { get; set; }
        // API response fields
        public string RegistrationNo { get; set; } = string.Empty;
        public bool SystemGen { get; set; }
        public int? TempRegNo { get; set; }
        public int RegLevel { get; set; }
        public int Automated { get; set; }
        public bool ShowRegNoCheckbox { get; set; }
        public bool RegNoCheckboxChecked { get; set; }
        public bool RegNoCheckboxEnabled { get; set; }
        public bool RegNoEnabled { get; set; }
        public int RegFormat { get; set; }
    }
}