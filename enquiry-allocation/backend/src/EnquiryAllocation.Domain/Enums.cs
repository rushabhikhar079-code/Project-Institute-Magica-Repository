namespace EnquiryAllocation.Domain;

public enum EnquirySource
{
    Website = 1,
    Email = 2,
    Telephone = 3,
    Referral = 4,
    ManualEntry = 5,
    Other = 6
}

public enum EnquiryPriority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

public enum AllocationStatus
{
    Unallocated = 1,
    Allocated = 2,
    Accepted = 3,
    Rejected = 4,
    Reassigned = 5
}

public enum AllocationEventType
{
    Created = 1,
    Allocated = 2,
    Accepted = 3,
    Rejected = 4,
    Reassigned = 5,
    Cancelled = 6,
    PriorityChanged = 7
}
