namespace Domain.Enum
{
    public enum UserRole
    {
        Admin = 1,
        ProductOwner = 2,
        ScrumMaster = 3,
        Developer = 4,
        Stakeholder = 5
    }

    public enum ProjectStatus
    {
        Active = 1,
        Completed = 2,
        OnHold = 3,
        Cancelled = 4
    }

    public enum ProjectRole
    {
        ProductOwner = 1,
        ScrumMaster = 2,
        Developer = 3,
        Stakeholder = 4
    }

    public enum SprintStatus
    {
        Planning = 1,
        Active = 2,
        Review = 3,
        Retrospective = 4,
        Completed = 5
    }

    public enum TaskStatus
    {
        Backlog = 1,
        ToDo = 2,
        InProgress = 3,
        InReview = 4,
        Testing = 5,
        Done = 6,
        Blocked = 7
    }

    public enum TaskPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    public enum TaskType
    {
        Epic = 1,
        Story = 2,
        Task = 3,
        Bug = 4,
        Improvement = 5,
        SubTask = 6,
        Milestone = 7,
        Project = 8
    }

    public enum DependencyType
    {
        FinishToStart = 1,
        StartToStart = 2,
        FinishToFinish = 3,
        StartToFinish = 4
    }

    public enum AssignmentRole
    {
        Owner = 1,
        Contributor = 2,
        Reviewer = 3,
        Observer = 4
    }

}