using IM_backend.Dtos;

namespace IM_backend.Interfaces
{
    public interface IExcelService
    {
        Task<(List<TopicExcelRowDto> ValidRows, string ErrorLog)> ParseTopicExcelAsync(Stream fileStream, string fileName);
    }
}
