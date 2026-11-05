using IM_backend.Data;
using IM_backend.Interfaces;
using IM_backend.Logging;
using IM_backend.Repositories;
using IM_backend.Services;


namespace IM_backend.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddSingleton<IDbConnectionFactory, MySqlDbConnectionFactory>();
            services.AddSingleton<IFileLogger, FileLogger>();
            services.AddScoped<ICommonRepository, CommonRepository>();
            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<ILoginRepository, LoginRepository>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();
            services.AddScoped<IInstituteRepository, InstituteRepository>();
            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<IBranchRepository, BranchRepository>();
            services.AddScoped<ICurriculumRepository, CurriculumRepository>();
            services.AddScoped<ICourseRepository, CourseRepository>();
            services.AddScoped<ISubjectRepository, SubjectRepository>();
            services.AddScoped<ITopicRepository, TopicRepository>();
            services.AddScoped<IStudyMaterialRepository, StudyMaterialRepository>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ISMSService, SMSService>();
            services.AddScoped<IWhatsAppService, WhatsAppService>();
            services.AddScoped<IExcelService, ExcelService>();
            services.AddScoped<IStudyMaterialRepository, StudyMaterialRepository>();
            return services;
        }
    }
}
