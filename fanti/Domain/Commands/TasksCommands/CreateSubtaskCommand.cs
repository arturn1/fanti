using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands.TasksCommands
{
    public class CreateSubtaskCommand : ValidatableTypes, ICommand
    {
        public CreateSubtaskCommand(Guid parentTaskId, string title, string description, 
            int priority, int status, decimal estimatedHours, DateTime? startDate, 
            DateTime? endDate, string? color, string? tags)
        {
            ParentTaskId = parentTaskId;
            Title = title;
            Description = description;
            Priority = priority;
            Status = status;
            EstimatedHours = estimatedHours;
            StartDate = startDate;
            EndDate = endDate;
            Color = color;
            Tags = tags;
            Progress = 0;
            Assignees = new List<string>();
            Dependencies = new List<string>();
            IsDisabled = false;
            HideChildren = false;
        }

        public Guid ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public decimal EstimatedHours { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public List<string> Assignees { get; set; }
        public List<string> Dependencies { get; set; }
        public string? Color { get; set; }
        public bool IsDisabled { get; set; }
        public bool HideChildren { get; set; }
        public string? Tags { get; set; }

        // Propriedades herdadas da tarefa pai (serão preenchidas pelo handler)
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid AssigneeId { get; set; }

        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}
