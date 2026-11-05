namespace IM_backend.Configuration
{
    public static class ActivityLogConfiguration
    {
        // Common route parameter names for record IDs
        public static string[] CommonIdParameters =
        {
            "crclmId", "courseId", "subId", "subjectId", "topicId", "branchId", "studentId", "userId", "id", "studymaterialId", "regno"
        };

        // Table name to primary key column mappings
        public static Dictionary<string, string> TablePrimaryKeyMappings = new(StringComparer.OrdinalIgnoreCase)
        {
            { "tbl_curriculum", "crclmId" },
            { "tbl_course", "courseId" },
             { "registration", "regno" },
            { "subject_topics", "topicId" },
            { "tbl_subject", "subId" },
            { "branch", "branchId" },
            { "users", "userId" },
            { "tbl_branch", "branchId" },
            { "tbl_user", "userId" },
            {"tblStudyMaterial","studymaterialId" }
        };

        // Controller name to table name mappings
        public static Dictionary<string, string> ControllerTableMappings = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Curriculum", "tbl_curriculum" },
            { "Course", "tbl_course" },
            { "Student", "registration" },
            { "Topic", "subject_topics" },
            { "Subject", "tbl_subject" },
            { "Branch", "branch" },
            { "User", "users" },
            { "Auth", "users" },
            {"StudyMaterial","tblStudyMaterial" }
        };

        // Helper method to add new table mapping
        public static void AddTableMapping(string controllerName, string tableName, string primaryKeyColumn)
        {
            if (!string.IsNullOrEmpty(controllerName) && !string.IsNullOrEmpty(tableName))
            {
                ControllerTableMappings[controllerName] = tableName;
            }

            if (!string.IsNullOrEmpty(tableName) && !string.IsNullOrEmpty(primaryKeyColumn))
            {
                TablePrimaryKeyMappings[tableName] = primaryKeyColumn;
            }
        }

        // Helper method to add new ID parameter
        public static void AddIdParameter(string parameterName)
        {
            if (!string.IsNullOrEmpty(parameterName) && !CommonIdParameters.Contains(parameterName))
            {
                var list = CommonIdParameters.ToList();
                list.Add(parameterName);
                CommonIdParameters = list.ToArray();
            }
        }
    }
}
