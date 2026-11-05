using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class EnquiryFollowUpSearchDto : PaginationRequest
    {
        // Category: 0=All, 1=Enquiry, 2=Registration, 3=Pending Callback
        public int Category { get; set; } = 0;
        public string? StudentName { get; set; }
        public string? CourseIds { get; set; }
        public string? SubjectIds { get; set; }
        public int? EnqStatus { get; set; }
        public string? FromDate { get; set; }
        public string? ToDate { get; set; }
        public int FilterOn { get; set; } = 1;
        public string? CallbackFromDate { get; set; }
        public string? CallbackToDate { get; set; }
        public int BranchId { get; set; }

        // Sorting
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } = "asc";
    }

    public class EnquiryFollowUpListDto
    {
        public int RegNo { get; set; }
        public string EnquiryDate { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PContact { get; set; } = string.Empty;
        public string Subjects { get; set; } = string.Empty;
        public string CallBackDate { get; set; } = string.Empty;
        public string CallbackTime { get; set; } = string.Empty;
        public string FollowDate { get; set; } = string.Empty;
        public string Remark { get; set; } = string.Empty;
        public string RegNoManual { get; set; } = string.Empty;
        public int? EnquiryStatus { get; set; }
        public string EnqStatusText { get; set; } = string.Empty;
        public string Registered { get; set; } = string.Empty;
        public string EDate { get; set; } = string.Empty;
        public bool? IsInterested { get; set; } = false;
    }

    public class FollowUpRemarkSubmitDto
    {
        public int StudentId { get; set; }
        public int EnquiryStatus { get; set; }
        public int StatusId { get; set; }
        public string? CallbackDate { get; set; }
        public string? CallbackTime { get; set; }
        public bool Interested { get; set; } = true;
        public string Remarks { get; set; } = string.Empty;
        public int BranchId { get; set; }
    }

    public class FollowUpRemarkHistoryDto
    {
        public string CallDate { get; set; } = string.Empty;
        public string Remarks { get; set; } = string.Empty;
        public string Called_By { get; set; } = string.Empty;
        public int CallId { get; set; }
        public string? CallbackDate { get; set; }
        public string? CallbackTime { get; set; }
    }

    public class FollowUpStatusSubmitDto
    {
        [Required]
        public string StatusName { get; set; } = string.Empty;

        [Required]
        public ushort Flag { get; set; }

        [Required]
        public ushort Reminder { get; set; }

        [Required]
        public int BranchId { get; set; }
    }

    public class FollowUpStatusListDto
    {
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public ushort Flag { get; set; }
        public string Productive { get; set; } = string.Empty;
        public ushort Reminder { get; set; }
        public int InstId { get; set; }
    }
}
