using Dapper;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using IM_backend.Models;
using IM_backend.SqlQueries;
using System.Data;
namespace IM_backend.Repositories
{
    public class CommonRepository : ICommonRepository
    {
        private readonly IDbConnectionFactory _dbFactory;
        public CommonRepository(IDbConnectionFactory dbFactory, IHttpClientFactory httpClientFactory)
        {
            _dbFactory = dbFactory;
            _httpClient = httpClientFactory.CreateClient();
        }
        public async Task<IEnumerable<DropdownItemDto>> GetCountriesAsync()
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetCountries);
        }

        public async Task<IEnumerable<DropdownItemDto>> GetStatesByCountryIdAsync(int countryId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetStatesByCountryId, new { CountryId = countryId });
        }
        public async Task<IEnumerable<DropdownItemDto>> GetCitiesByStateIdAsync(int stateId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetCitiesByStateId, new { StateId = stateId });
        }
        public async Task<EmailSettings?> GetEmailSettingsAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryFirstOrDefaultAsync<EmailSettings>(
                CommonQueries.GetEmailSettings,
                new
                {
                    InstituteId = instituteId
                });
        }

        private readonly HttpClient _httpClient;
        public async Task<UserIpLocationDto> GetUserLocationByIpAsync(string clientIp)
        {
            var result = new UserIpLocationDto();

            try
            {
                string countryName;
                string stateName;
                string cityName;

                // Local development
                if (string.IsNullOrEmpty(clientIp) ||
                    clientIp == "::1" ||
                    clientIp == "127.0.0.1")
                {
                    countryName = "India";
                    stateName = "Maharashtra";
                    cityName = "Nagpur";
                }
                else
                {
                    // Production - get location from IP API
                    string url = $"http://ip-api.com/json/{clientIp}";

                    var geoData = await _httpClient
                        .GetFromJsonAsync<GeoIpResponseDto>(url);

                    if (geoData == null || geoData.Status != "success")
                    {
                        return result;
                    }

                    countryName = geoData.Country ?? "";
                    stateName = geoData.RegionName ?? "";
                    cityName = geoData.City ?? "";
                }

                // Get IDs from your database
                using IDbConnection db = _dbFactory.CreateConnection();

                var matched = await db.QueryFirstOrDefaultAsync<UserIpLocationDto>(
                    CommonQueries.GetUserLocationByNames,
                    new
                    {
                        CountryName = countryName,
                        StateName = stateName,
                        CityName = cityName
                    });

                if (matched != null)
                {
                    return matched;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"IP Location error: {ex}");
            }

            return result;
        }
        public async Task<IEnumerable<DropdownItemDto>> GetUserLocationByNamesAsync(string countryName, string stateName, string cityName)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetUserLocationByNames,
                new
                {
                    CountryName = countryName,
                    StateName = stateName,
                    CityName = cityName
                });
        }
        public async Task<IEnumerable<DropdownItemDto>> GetInstitutePlansAsync()
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetInstitutePlans);
        }
        public async Task<IEnumerable<StaffDto>> GetAllStaffAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<StaffDto>(CommonQueries.GetAllStaff,
                new
                {
                    InstituteId = instituteId,
                    BranchId = branchId
                });
        }

        public async Task<IEnumerable<StaffDto>> GetCounselorsAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<StaffDto>(CommonQueries.GetCounselors,
                new
                {
                    InstituteId = instituteId,
                    BranchId = branchId
                });
        }

        public async Task<IEnumerable<DropdownItemDto>> GetCurriculumsAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetCurriculums,
                new
                {
                    InstituteId = instituteId,
                    BranchId = branchId
                });
        }

        public async Task<IEnumerable<DropdownItemDto>> GetCoursesByCurriculumAsync(int instituteId, int branchId, int curriculumId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetCoursesByCurriculum,
                new
                {
                    InstituteId = instituteId,
                    BranchId = branchId,
                    CurriculumId = curriculumId
                });
        }
        public async Task<IEnumerable<DropdownItemDto>> GetCoursesAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetCourses,
                new
                {
                    InstituteId = instituteId,
                    BranchId = branchId
                });
        }
        public async Task<IEnumerable<DropdownItemDto>> GetSubjectsByCourseIdAsync(int courseId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetSubjectsByCourseId,
                new
                {
                    //InstituteId = instituteId,
                    //BranchId = branchId,
                    CourseId = courseId,
                });
        }
        public async Task<IEnumerable<DropdownItemDto>> GetTopicsByCourseIdAsync(int courseId, int subjectId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(CommonQueries.GetTopicsByCourseId,
                new
                {
                    CourseId = courseId,
                    SubjectId = subjectId
                });
        }
        public async Task<IEnumerable<DropdownItemDto>> GetSubjectsByCourseAsync(int courseId, int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            var subjects = await db.QueryAsync<DropdownItemDto>(CommonQueries.GetSubjectsByCourse,
                new { CourseId = courseId });
            return subjects.ToList();
        }

        public async Task<List<CourseWithSubjectsDto>> GetCoursesWithSubjectsAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            if (db.State == ConnectionState.Closed)
                db.Open();

            // Get courses for registration
            var courses = await db.QueryAsync<dynamic>(
                CommonQueries.GetCoursesForRegistration,
                new { InstID = instituteId, BranchID = branchId });

            var result = new List<CourseWithSubjectsDto>();
            string currentDate = DateTime.Now.ToShortDateString();

            foreach (var course in courses)
            {
                int courseId = (int)course.courseID;
                string courseName = course.course_Name?.ToString() ?? string.Empty;
                int isCourseLvl = course.IscourseLvl != null ? Convert.ToInt32(course.IscourseLvl) : 0;
                int? courseFeeWise = course.courseFeeWise != null ? (int?)Convert.ToInt32(course.courseFeeWise) : null;

                // Get subjects for this course
                var subjects = await db.QueryAsync<dynamic>(
                    CommonQueries.GetSubjectsByCourseMulti,
                    new { CourseID = courseId.ToString() });

                var subjectList = new List<SubjectsDto>();
                foreach (var subject in subjects)
                {
                    // Parse subID format: subID#feesType
                    string subIdStr = subject.subID?.ToString() ?? string.Empty;
                    string[] parts = subIdStr.Split('#');
                    int subId = int.Parse(parts[0]);
                    string feesType = parts.Length > 1 ? parts[1] : string.Empty;
                    string subName = subject.sub_name?.ToString() ?? string.Empty;
                    int subjectIsCourseLvl = subject.IscourseLvl != null ? Convert.ToInt32(subject.IscourseLvl) : 0;

                    subjectList.Add(new SubjectsDto
                    {
                        SubId = subId,
                        SubName = subName,
                        FeesType = feesType,
                        IsCourseLvl = subjectIsCourseLvl
                    });
                }

                result.Add(new CourseWithSubjectsDto
                {
                    CourseId = courseId,
                    CourseName = courseName,
                    IsCourseLvl = isCourseLvl,
                    CourseFeeWise = courseFeeWise,
                    Subjects = subjectList
                });
            }

            return result;
        }

        public async Task<IEnumerable<DropdownItemDto>> GetBatchesBySubjectsAsync(
    string subjectIds,
    int instituteId,
    int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();

            var subjectIdList = subjectIds
                .Split(',')
                .Select(x => x.Trim())
                .Where(x => !string.IsNullOrEmpty(x))
                .ToList();

            var parameters = new DynamicParameters();

            parameters.Add("InstituteId", instituteId);
            parameters.Add("BranchId", branchId);

            // No subject selected → get all batches
            if (!subjectIdList.Any())
            {
                return await db.QueryAsync<DropdownItemDto>(
                    CommonQueries.GetAllBatches,
                    parameters
                );
            }

            // Subject selected → get batches for those subjects
            var subjectIdParams = string.Join(
                ",",
                subjectIdList.Select((x, i) => $"@SubId{i}")
            );

            var query = string.Format(
                CommonQueries.GetBatchesBySubjects,
                subjectIdParams
            );

            for (int i = 0; i < subjectIdList.Count; i++)
            {
                parameters.Add(
                    $"SubId{i}",
                    subjectIdList[i]
                );
            }

            return await db.QueryAsync<DropdownItemDto>(
                query,
                parameters
            );
        }
        public async Task<IEnumerable<FollowUpStatusDto>> GetFollowUpStatusAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<FollowUpStatusDto>(
                CommonQueries.GetFollowUpStatus,
                new { InstituteId = instituteId, BranchId = branchId });
        }

        public async Task<IEnumerable<DropdownItemDto>> GetUsernamesAsync(string roleName, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(
                CommonQueries.GetUsernamebyRole,
                new { RoleName = roleName, BranchId = branchId });
        }

        public async Task<IEnumerable<DropdownItemDto>> GetSourcesAsync(int instituteId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<DropdownItemDto>(
                CommonQueries.GetSources,
                new { InstituteId = instituteId });
        }
        public async Task<IEnumerable<OtherFeesDto>> GetOtherFeesAsync(int instituteId, int branchId)
        {
            using IDbConnection db = _dbFactory.CreateConnection();
            return await db.QueryAsync<OtherFeesDto>(
                CommonQueries.GetOtherFees,
                new { InstituteId = instituteId, BranchId= branchId });
        }
    }
}