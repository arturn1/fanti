using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands.TasksCommands
{
    public class EditTaskCommand : ValidatableTypes, ICommand
    {
        public EditTaskCommand(Guid id, string title, string description, int priority,
            int status, decimal estimatedHours, DateTime? startDate, DateTime? endDate,
            decimal progress, string? color, string? tags, string? category, Guid? teamId)
        {
            Id = id;
            Title = title;
            Description = description;
            Priority = priority;
            Status = status;
            EstimatedHours = estimatedHours;
            StartDate = startDate;
            EndDate = endDate;
            Progress = progress;
            Color = color;
            Tags = tags;
            Category = category;
            TeamId = teamId;
        }

        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public decimal EstimatedHours { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public string? Color { get; set; }
        public string? Tags { get; set; }
        public string? Category { get; set; }
        public Guid? TeamId { get; set; }

        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}
