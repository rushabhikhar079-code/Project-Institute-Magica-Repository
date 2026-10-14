using EnquiryAllocation.Application.Interfaces;
using EnquiryAllocation.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace EnquiryAllocation.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<Validators.CreateEnquiryRequestValidator>();
        services.AddScoped<IEnquiryService, EnquiryService>();
        services.AddScoped<IAllocationService, AllocationService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDashboardService, DashboardService>();
        return services;
    }
}
