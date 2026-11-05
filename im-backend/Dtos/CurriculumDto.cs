using IM_backend.Common;
using System.ComponentModel.DataAnnotations;

namespace IM_backend.Dtos
{
    public class CurriculumDto
    {
        public class CurriculumListDto
        {
            public int CrclmId { get; set; }
            public string CrclmName { get; set; } = string.Empty;
            public string CrclmDesc { get; set; } = string.Empty;
            public bool CrclmStatus { get; set; }
            public int RefCrclmId { get; set; }
            public bool IsImported => RefCrclmId > 0;
        }

        public class CurriculumSubmitDto
        {
            [Required(ErrorMessage = "Curriculum name is required")]
            [MaxLength(100, ErrorMessage = "Curriculum name cannot exceed 100 characters")]
            public string CrclmName { get; set; } = string.Empty;
            [MaxLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
            public string CrclmDesc { get; set; } = string.Empty;
            public bool CrclmStatus { get; set; } = true; // Default to Active
            public int BranchId { get; set; }
        }

        public class CurriculumEditDto
        {
            public int CrclmId { get; set; } // 0 for new, >0 for update
            [Required(ErrorMessage = "Curriculum name is required")]
            [MaxLength(100, ErrorMessage = "Curriculum name cannot exceed 100 characters")]
            public string CrclmName { get; set; } = string.Empty;
            [MaxLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
            public string CrclmDesc { get; set; } = string.Empty;
            public bool CrclmStatus { get; set; } = true; // Default to Active
            public int BranchId { get; set; }
        }

        public class CurriculumSearchDto : PaginationRequest
        {
            public string CurriculumName { get; set; } = string.Empty;
            public int Status { get; set; } = 2; // 2 = All, 1 = Active, 0 = Inactive
            public int BranchId { get; set; }

            // Sorting
            public string? SortBy { get; set; }
            public string? SortDirection { get; set; }
        }

        public class CurriculumImportDto : PaginationRequest
        {
            public int BranchId { get; set; }
            //Sorting
            public string? SortBy { get; set; }
            public string? SortDirection { get; set; }
        }

        public class CurriculumImportSubmitDto
        {
            public List<int> CurriculumIds { get; set; } = new List<int>();
            public int BranchId { get; set; }
        }

        public class CurriculumExportSubmitDto
        {
            public List<int> CurriculumIds { get; set; } = new List<int>();
            public List<int> BranchIds { get; set; } = new List<int>();
        }
    }
}
