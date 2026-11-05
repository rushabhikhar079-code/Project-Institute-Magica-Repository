using System.Data;

namespace IM_backend.Interfaces
{
    public interface IWhatsAppService
    {
        Task SendStudentRegistrationWhatsAppAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string username, string password, string regDate, string regNo = "");
        Task SendEnquiryWhatsAppAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string regDate);
    }
}
