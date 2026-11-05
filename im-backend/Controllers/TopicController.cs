using IM_backend.Authorization;
using IM_backend.Common;
using IM_backend.Dtos;
using IM_backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicController : ControllerBase
    {
        private readonly ITopicRepository _topicRepository;
        private readonly ILogger<TopicController> _logger;
        private readonly IExcelService _excelService;

        public TopicController(ITopicRepository topicRepository, ILogger<TopicController> logger, IExcelService excelService)
        {
            _topicRepository = topicRepository;
            _logger = logger;
            _excelService = excelService;
        }

        [Authorize]
        [HttpPost("topic-search")]
        public async Task<ActionResult<ApiResponse>> SearchTopics([FromBody] TopicSearchDto search)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var topics = await _topicRepository.GetTopicsAsync(instituteId, search);

                return Ok(ApiResponse.Success("Topics retrieved successfully", topics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching topics");
                return StatusCode(500, ApiResponse.Fail("An error occurred while searching topics"));
            }
        }

        [Authorize]
        [HttpGet("get-topic/{topicId}")]
        public async Task<ActionResult<ApiResponse>> GetTopicById(int topicId, int branchId)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var topic = await _topicRepository.GetTopicByIdAsync(topicId, instituteId, branchId);

                if (topic == null)
                    return NotFound(ApiResponse.Fail("Topic not found"));

                return Ok(ApiResponse.Success("Topic retrieved successfully", topic));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting topic");
                return StatusCode(500, ApiResponse.Fail("An error occurred while getting topic"));
            }
        }

        [Permission("Manage Topics", "Add")]
        [HttpPost("add-topic")]
        public async Task<ActionResult<ApiResponse>> AddTopic([FromBody] TopicSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var (success, message) = await _topicRepository.AddTopicAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding topic");
                return StatusCode(500, ApiResponse.Fail("An error occurred while adding topic"));
            }
        }

        [Permission("Manage Topics", "Edit")]
        [HttpPut("update-topic")]
        public async Task<ActionResult<ApiResponse>> UpdateTopic(int topicId, [FromBody] TopicSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                    return BadRequest(ApiResponse.Fail("Invalid user information"));

                var (success, message) = await _topicRepository.UpdateTopicAsync(request, instituteId, userId, topicId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating topic");
                return StatusCode(500, ApiResponse.Fail("An error occurred while updating topic"));
            }
        }

        [Permission("Manage Topics", "Delete")]
        [HttpDelete("delete-topic/{topicId}")]
        public async Task<ActionResult<ApiResponse>> DeleteTopic(int topicId)
        {
            try
            {
                var (success, message) = await _topicRepository.DeleteTopicAsync(topicId);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting topic");
                return StatusCode(500, ApiResponse.Fail("An error occurred while deleting topic"));
            }
        }

        [Authorize]
        [HttpPost("institute-topics")]
        public async Task<ActionResult<ApiResponse>> GetInstituteLevelTopics([FromBody] InstituteLevelTopicsSearchDto search)
        {
            //var totalSw = Stopwatch.StartNew();
            try
            {

                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                Console.WriteLine("Controller started");
                //var repoSw = Stopwatch.StartNew();

                var topics = await _topicRepository.GetInstituteLevelTopicsAsync(instituteId, search);
                //    Console.WriteLine(
                //$"Repository Time: {repoSw.ElapsedMilliseconds} ms");

                //    Console.WriteLine(
                //        $"Controller before response: {totalSw.ElapsedMilliseconds} ms");



                return Ok(ApiResponse.Success("Institute level topics retrieved successfully", topics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting institute level topics");
                return StatusCode(500, ApiResponse.Fail("An error occurred while getting institute level topics"));
            }
        }

        [Authorize]
        [HttpPost("get-institute-topics-by-course-crclm-subject")]
        public async Task<ActionResult<ApiResponse>> GetInstituteTopicsByCourseCrclmSubject([FromBody] TopicInstituteDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                var topics = await _topicRepository.GetInstituteTopicsByCourseCrclmSubjectAsync(request, instituteId);

                return Ok(ApiResponse.Success("Institute topics retrieved successfully", topics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving institute topics for import");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving institute topics"));
            }
        }

        [Permission("Manage Topics", "Add")]
        [HttpPost("add-institute-topics")]
        public async Task<ActionResult<ApiResponse>> AddInstituteTopics([FromBody] InstituteTopicsSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.TopicIds == null || request.TopicIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select one or more topic(s)"));

                var (success, message, addedCount, totalCount) = await _topicRepository.AddInstituteTopicsAsync(request, instituteId);

                if (success)
                    return Ok(ApiResponse.Success(message, new { AddedCount = addedCount, TotalCount = totalCount }));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding institute topics");
                return StatusCode(500, ApiResponse.Fail("An error occurred while adding institute topics"));
            }
        }

        [Permission("Manage Topics", "Import")]
        [HttpPost("import-topics-from-excel-file")]
        public async Task<ActionResult<ApiResponse>> ImportTopicsFromExcelFile(IFormFile file, [FromForm] TopicExcelFileUploadDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (file == null || file.Length == 0)
                    return BadRequest(ApiResponse.Fail("Please select Excel File to import."));

                // Validate file extension
                string ext = Path.GetExtension(file.FileName).ToLower();
                if (ext != ".xls" && ext != ".xlsx")
                    return BadRequest(ApiResponse.Fail("Invalid file selected! Please select excel file"));

                // Validate file name contains "Subject_Topic"
                if (!file.FileName.Contains("Subject_Topic"))
                    return BadRequest(ApiResponse.Fail("Invalid file selected! Please select correct excel file"));

                // Parse Excel file with validation
                var (validRows, errorLog) = await _excelService.ParseTopicExcelAsync(file.OpenReadStream(), file.FileName);

                if (validRows.Count == 0)
                    return BadRequest(ApiResponse.Fail("No record exist in excel sheet !"));

                // Create import request
                var importRequest = new TopicExcelImportDto
                {
                    CourseId = request.CourseId,
                    SubjectId = request.SubjectId,
                    BranchId = request.BranchId,
                    Topics = validRows,
                    ErrorLog = errorLog
                };

                var result = await _topicRepository.ImportTopicsFromExcelAsync(importRequest, instituteId);

                if (result.FailedCount == 0)
                {
                    return Ok(ApiResponse.Success($"Import done Successfully ({result.ImportedCount}) Subject Topics Imported.", result));
                }
                else
                {
                    string message = $"Total {result.ImportedCount} subject topic imported out of {result.TotalRows}.{Environment.NewLine}{result.FailedCount} subject topic not imported because duplicate data found.";
                    return Ok(ApiResponse.Success(message, result));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing topics from excel file");
                return StatusCode(500, ApiResponse.Fail($"An error occurred while importing topics from excel: {ex.Message}"));
            }
        }

        [Authorize]
        [HttpGet("get-next-topic-sequence")]
        public async Task<ActionResult<ApiResponse>> GetNextTopicSequence(int SubjectID)
        {
            try
            {
                var nextSequence = await _topicRepository.GetNextTopicSequenceAsync(SubjectID);
                return Ok(ApiResponse.Success("Next topic sequence retrieved successfully", new { NextSequence = nextSequence }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting next topic sequence");
                return StatusCode(500, ApiResponse.Fail("An error occurred while getting next topic sequence"));
            }
        }

        [Permission("Manage Topics", "Export")]
        [HttpPost("export-topic")]
        public async Task<ActionResult<ApiResponse>> ExportTopic([FromBody] TopicExportSubmitDto request)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));

                if (request.TopicIds == null || request.TopicIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one topic"));

                if (request.BranchIds == null || request.BranchIds.Count == 0)
                    return BadRequest(ApiResponse.Fail("Please select at least one branch"));

                var (success, message) = await _topicRepository.ExportTopicAsync(request.TopicIds, instituteId, request.BranchIds);

                if (success)
                    return Ok(ApiResponse.Success(message));
                else
                    return BadRequest(ApiResponse.Fail(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting topic");
                return StatusCode(500, ApiResponse.Fail("An error occurred while exporting topic"));
            }
        }
    }
}