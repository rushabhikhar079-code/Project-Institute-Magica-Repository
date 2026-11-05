using System.Data;

namespace IM_backend.Interfaces
{
    public interface ISMSService
    {
        Task SendStudentRegistrationSMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string username, string password, string regDate);
        Task SendEnquirySMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentMobile, string courseName, string instituteName, string regDate);
        Task SendCourseEnrollSMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string courseName, string instituteName);
        Task SendUsernamePasswordSMSAsync(IDbConnection db, int instituteId, int branchId, string studentName, string mobileNo, string username, string password, string instituteName);
    }
}
