using Domain.Commands.Contracts;
using Domain.Enum;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands.TasksCommands
{
    public class CreateSubtaskCommand : ValidatableTypes, ICommand
    {
        public CreateSubtaskCommand(Guid parentTaskId, string title, string description,
            Enum.TaskStatus status, DateTime? startDate,
            DateTime? endDate, TaskCategory? category, Guid? teamId, Guid? projectId, Guid? sprintId,
            TaskType? type)
        {
            ParentTaskId = parentTaskId;
            Title = title;
            Description = description;
            Status = status;
            StartDate = startDate;
            EndDate = endDate;
            Progress = 0;
            Category = category;
            TeamId = teamId;
            ProjectId = projectId;
            SprintId = sprintId;
            Type = type;
        }

        public Guid ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Enum.TaskStatus Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public TaskCategory? Category { get; set; }
        public Guid? TeamId { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public TaskType? Type { get; set; }

        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}
