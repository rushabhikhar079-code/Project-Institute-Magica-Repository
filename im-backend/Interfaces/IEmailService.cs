using IM_backend.Models;
using System.Data;

namespace IM_backend.Interfaces
{
    public interface IEmailService
    {
        Task SendRegistrationEmailAsync(string username, string emailId, string instituteName, string address, string contactPerson, string phone, string email, string remarks, string ipAddress, string noOfStudents, string coachingFor);
        Task SendPasswordResetEmailAsync(string userEmail, string userName, string resetToken, EmailSettings emailSettings);
        Task SendBranchCreationEmailAsync(int instituteId, int branchId, string branchName, string instituteName);
        Task SendStudentRegistrationEmailAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentEmail, string courseName, string instituteName, string username, string password, string regDate, int allowStudModule = 0);
        Task SendEnquiryEmailAsync(IDbConnection db, int instituteId, int branchId, string studentName, string studentEmail, string courseName, string instituteName, string regDate);
        Task SendUsernamePasswordEmailAsync(IDbConnection db, int instituteId, int branchId, string studentName, string email, string username, string password, string instituteName);
        Task SendEnquiryAllocationEmailAsync(IDbConnection db, int instituteId, int branchId, string userId, string userName);
    }
}