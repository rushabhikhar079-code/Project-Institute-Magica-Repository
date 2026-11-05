using IM_backend.Common;
using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface ITopicRepository
    {
        Task<PagedResponse<TopicListDto>> GetTopicsAsync(int instituteId, TopicSearchDto search);
        Task<TopicSubmitDto?> GetTopicByIdAsync(int topicId, int instituteId, int branchId);
        Task<(bool Success, string Message)> AddTopicAsync(TopicSubmitDto request, int instituteId);
        Task<(bool Success, string Message)> UpdateTopicAsync(TopicSubmitDto request, int instituteId, int userId, int topicId);
        Task<(bool Success, string Message)> DeleteTopicAsync(int topicId);
        Task<TopicImportResultDto> ImportTopicsFromExcelAsync(TopicExcelImportDto request, int instituteId);
        //Task<List<InstituteLevelTopicsListDto>> GetInstituteLevelTopicsAsync(int instituteId, InstituteLevelTopicsSearchDto search);
        Task<PagedResponse<InstituteLevelTopicsListDto>> GetInstituteLevelTopicsAsync(int instituteId, InstituteLevelTopicsSearchDto search);
        Task<PagedResponse<InstituteTopicListDto>> GetInstituteTopicsByCourseCrclmSubjectAsync(TopicInstituteDto topic_institute, int instituteId);
        Task<(bool Success, string Message, int AddedCount, int TotalCount)> AddInstituteTopicsAsync(InstituteTopicsSubmitDto request, int instituteId);
        Task<int> GetNextTopicSequenceAsync(int subjectId);
        Task<(bool Success, string Message)> ExportTopicAsync(List<int> topicIds, int instituteId, List<int> branchIds);
    }
}
