using EnquiryAllocation.Application.DTOs;
using EnquiryAllocation.Domain;
using FluentValidation;

namespace EnquiryAllocation.Application.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class CreateEnquiryRequestValidator : AbstractValidator<CreateEnquiryRequest>
{
    public CreateEnquiryRequestValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(160);
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(240);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Source).Must(s => AllocationRules.Sources.Contains(s)).WithMessage("Invalid source.");
        RuleFor(x => x.Priority).Must(s => AllocationRules.Priorities.Contains(s)).WithMessage("Invalid priority.");
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email));
        RuleFor(x => x.Phone).Matches(@"^[0-9+\-()\s]{7,32}$").When(x => !string.IsNullOrWhiteSpace(x.Phone));
        RuleFor(x => x).Must(x => !string.IsNullOrWhiteSpace(x.Email) || !string.IsNullOrWhiteSpace(x.Phone))
            .WithMessage("Provide an email address or a phone number.");
    }
}

public sealed class AllocateRequestValidator : AbstractValidator<AllocateRequest>
{
    public AllocateRequestValidator()
    {
        RuleFor(x => x.AssignedEmployeeId).NotEmpty();
        RuleFor(x => x.RowVersion).GreaterThan(0);
        RuleFor(x => x.Remarks).MaximumLength(1000);
    }
}

public sealed class ReassignRequestValidator : AbstractValidator<ReassignRequest>
{
    public ReassignRequestValidator()
    {
        RuleFor(x => x.NewEmployeeId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.RowVersion).GreaterThan(0);
    }
}

public sealed class RejectRequestValidator : AbstractValidator<RejectRequest>
{
    public RejectRequestValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.RowVersion).GreaterThan(0);
    }
}

public sealed class BulkAllocateRequestValidator : AbstractValidator<BulkAllocateRequest>
{
    public BulkAllocateRequestValidator()
    {
        RuleFor(x => x.EnquiryIds).NotEmpty().Must(ids => ids.Count <= 100)
            .WithMessage("Bulk allocation is limited to 100 enquiries.");
        RuleFor(x => x.AssignedEmployeeId).NotEmpty();
    }
}
