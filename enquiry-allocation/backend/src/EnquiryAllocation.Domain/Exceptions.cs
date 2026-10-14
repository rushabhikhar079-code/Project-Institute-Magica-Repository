namespace EnquiryAllocation.Domain;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

public sealed class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message) { }
}

public sealed class ForbiddenException : DomainException
{
    public ForbiddenException(string message) : base(message) { }
}

public sealed class ConflictException : DomainException
{
    public ConflictException(string message) : base(message) { }
}

public sealed class UnauthorizedDomainException : DomainException
{
    public UnauthorizedDomainException(string message) : base(message) { }
}

public sealed class BusinessValidationException : DomainException
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public BusinessValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]> { ["request"] = [message] };
    }

    public BusinessValidationException(IReadOnlyDictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }
}
