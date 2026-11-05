namespace IM_backend.Dtos
{
    public class InstallmentIntervalRequestDto
    {
        public int CourseFee { get; set; }
        public int MaxInstallment { get; set; }
        public int Day { get; set; }
        public int BranchId { get; set; }
    }

    public class InstallmentTemplateDto
    {
        public int SrNo { get; set; }
        public int DayOfMonth { get; set; }
        public double Amount { get; set; }
    }

    public class InstallmentIntervalResponseDto
    {
        public List<InstallmentTemplateDto> Templates { get; set; } = new();
        public double TotalAmount { get; set; }
    }
}
