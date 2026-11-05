namespace IM_backend.Models
{
    public class PaymentHistoryModels
    {
        public int PaymentHistoryId { get; set; }
        public int UserId { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int IsActive { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? NoOfStudents { get; set; }
        public int? NoOfMonths { get; set; }
        public int? NoOfEnquiry { get; set; }
        public decimal? Amount { get; set; }
    }
}
