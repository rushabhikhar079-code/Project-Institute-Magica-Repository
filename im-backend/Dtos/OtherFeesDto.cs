namespace IM_backend.Dtos
{
    public class OtherFeesDto
    {
        public int of_code { get; set; }
        public string of_name { get; set; } = string.Empty;
        public decimal amount{ get; set; }
        public int istaxable { get; set; } = 0;
        public int isincluding { get; set; } = 0;
        public string Of_FrequencyName { get; set; } = string.Empty;

    }
}
