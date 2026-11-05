namespace IM_backend.Dtos
{
    public class CourseWithSubjectsDto
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public int IsCourseLvl { get; set; }
        public int? CourseFeeWise { get; set; }
        public List<SubjectsDto> Subjects { get; set; } = new List<SubjectsDto>();
    }

    public class SubjectsDto
    {
        public int SubId { get; set; }
        public string SubName { get; set; } = string.Empty;
        public string FeesType { get; set; } = string.Empty;
        public int IsCourseLvl { get; set; }
    }
}
