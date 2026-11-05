using IM_backend.Common;

namespace IM_backend.Dtos
{
    public class EnquiryAllocationSearchDto : PaginationRequest
    {
        public string? StudentName { get; set; }
        public string? SubjectIds { get; set; }        
        public int Category { get; set; } = 0;          // Category: 0=All, 1=Enquiry, 2=List from Enquiry, 3=List from Registration
        public string? FromDate { get; set; }
        public string? ToDate { get; set; }
        public int? EnqStatus { get; set; }
        public bool CheckUser { get; set; }
        public string? UserId { get; set; }
        public int BranchId { get; set; }

        // Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "asc";
    }

    public class EnquiryAllocationListDto
    {
        public string RegNo { get; set; } = string.Empty;
        public string StudName { get; set; } = string.Empty;
        public string RegNo_Manual { get; set; } = string.Empty;
        public string EnquiryDate { get; set; } = string.Empty;
        public string Registered { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string EnqStatus { get; set; } = string.Empty;
        public string Allocatedate { get; set; } = string.Empty;
    }

    public class EnquiryAllocationSubmitDto
    {
        public string StudentIds { get; set; } = string.Empty;  // Comma-separated student regnos
        public string UserId { get; set; } = string.Empty;       // User to allocate to
        public int BranchId { get; set; }
    }
}
