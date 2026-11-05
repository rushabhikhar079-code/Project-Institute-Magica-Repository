using IM_backend.Common;
using IM_backend.Interfaces;
using IM_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace IM_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardRepository _dashboardRepository;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(IDashboardRepository dashboardRepository, ILogger<DashboardController> logger)
        {
            _dashboardRepository = dashboardRepository;
            _logger = logger;
        }

        [Authorize]
        [HttpGet("{instituteId}/branches")]
        public async Task<ActionResult<ApiResponse>> GetBranches(int instituteId)
        {
            try
            {
                var branches = await _dashboardRepository.GetBranchesForDashboardAsync(instituteId);

                return Ok(ApiResponse.Success("Branches retrieved successfully", branches));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving branches");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving branches"));
            }
        }

        [Authorize]
        [HttpGet("count")]
        public async Task<ActionResult<ApiResponse>> GetDashboardCount()
        {
            try
            {
                // Get institute ID and branch ID from JWT claims
                var instIdClaim = User.FindFirst("instid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                int branchId = 0;
            
                // Calculate YearMonth and DtToday
                var currentDate = DateTime.Now;
                string yearMonth = currentDate.ToString("yyyy/MM");
                string dtToday = currentDate.ToString("yyyy/MM/dd");

                // Get dashboard count from database
                var dashboardCount = await _dashboardRepository.GetDashboardCountAsync(instituteId, branchId, yearMonth, dtToday);

                if (dashboardCount == null)
                {
                    return Ok(ApiResponse.Success("Dashboard count retrieved successfully", new DashboardCount()));
                }

                return Ok(ApiResponse.Success("Dashboard count retrieved successfully", dashboardCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving dashboard count");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving dashboard count"));
            }
        }

        [Authorize]
        [HttpGet("collection-trends")]
        public async Task<ActionResult<ApiResponse>> GetCollectionData([FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var currentDate = DateTime.Now.ToString("yyyy-MM-dd");

                var collectionData = await _dashboardRepository.GetCollectionDataAsync(instituteId, branchId, currentDate);

                if (collectionData == null)
                {
                    return Ok(ApiResponse.Success("Collection data retrieved successfully", new CollectionData()));
                }

                return Ok(ApiResponse.Success("Collection data retrieved successfully", collectionData));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving collection data");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving collection data"));
            }
        }

        [Authorize]
        [HttpGet("payment-analysis")]
        public async Task<ActionResult<ApiResponse>> GetPaymentAnalysis([FromQuery] string period = "monthly", [FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var currentDate = DateTime.Now.ToString("yyyy-MM-dd");

                var paymentAnalysis = await _dashboardRepository.GetPaymentAnalysisAsync(instituteId, branchId, period, currentDate);

                return Ok(ApiResponse.Success("Payment analysis data retrieved successfully", paymentAnalysis));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment analysis data");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving payment analysis data"));
            }
        }

        [Authorize]
        [HttpGet("revenue")]
        public async Task<ActionResult<ApiResponse>> GetRevenue([FromQuery] string period = "monthly", [FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var revenue = await _dashboardRepository.GetRevenueAsync(instituteId, branchId, period);

                return Ok(ApiResponse.Success("Revenue data retrieved successfully", revenue));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving revenue data");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving revenue data"));
            }
        }

        [Authorize]
        [HttpGet("registration-status")]
        public async Task<ActionResult<ApiResponse>> GetRegistrationStatus([FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var registrationStatus = await _dashboardRepository.GetRegistrationStatusAsync(instituteId, branchId);

                if (registrationStatus == null)
                {
                    return Ok(ApiResponse.Success("Registration status retrieved successfully", new RegistrationStatusData()));
                }

                return Ok(ApiResponse.Success("Registration status retrieved successfully", registrationStatus));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving registration status");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving registration status"));
            }
        }

        [Authorize]
        [HttpGet("attendance-trends")]
        public async Task<ActionResult<ApiResponse>> GetAttendance([FromQuery] string period = "monthly")
        {
            try
            {
                var attendance = await _dashboardRepository.GetAttendanceAsync(period);

                return Ok(ApiResponse.Success("Attendance data retrieved successfully", attendance));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving attendance data");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving attendance data"));
            }
        }

        [Authorize]
        [HttpGet("student-growth")]
        public async Task<ActionResult<ApiResponse>> GetStudentGrowth([FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var studentGrowth = await _dashboardRepository.GetStudentGrowthAsync(instituteId, branchId);

                return Ok(ApiResponse.Success("Student growth data retrieved successfully", studentGrowth));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student growth data");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving student growth data"));
            }
        }


        [Authorize]
        [HttpGet("staff-leave-distribution")]
        public async Task<ActionResult<ApiResponse>> GetStaffLeaveDistribution([FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                var staffLeaveDistribution = await _dashboardRepository.GetStaffLeaveDistributionAsync(instituteId, branchId);

                return Ok(ApiResponse.Success("Staff leave distribution data retrieved successfully", staffLeaveDistribution));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving staff leave distribution data");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving staff leave distribution data"));
            }
        }

        [Authorize]
        [HttpGet("live-notifications")]
        public async Task<ActionResult<ApiResponse>> GetLiveNotifications([FromQuery] int branchId = 0)
        {
            try
            {
                var instIdClaim = User.FindFirst("instid")?.Value;
                var userIdClaim = User.FindFirst("userid")?.Value;

                if (string.IsNullOrEmpty(instIdClaim) || !int.TryParse(instIdClaim, out int instituteId))
                {
                    return BadRequest(ApiResponse.Fail("Invalid institute information"));
                }

                int userId = 0;
                if (!string.IsNullOrEmpty(userIdClaim))
                {
                    int.TryParse(userIdClaim, out userId);
                }

                var currentDate = DateTime.Now.ToString("yyyy-MM-dd");

                var notifications = await _dashboardRepository.GetLiveNotificationsAsync(instituteId, branchId, userId, currentDate);

                return Ok(ApiResponse.Success("Live notifications retrieved successfully", notifications));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving live notifications");
                return StatusCode(500, ApiResponse.Fail("An error occurred while retrieving live notifications"));
            }
        }
    }
}
