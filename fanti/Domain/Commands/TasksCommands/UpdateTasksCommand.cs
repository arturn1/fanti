using Domain.Commands.Contracts;
using Domain.Enum;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands
{

    public class UpdateTasksCommand : ValidatableTypes, ICommand
    {
        public UpdateTasksCommand(Guid id, Guid? projectId, Guid? sprintId, Guid? parentTaskId, string title,
        string description, Enum.TaskStatus status, DateTime? startDate, DateTime? endDate,
        decimal progress, TaskType? type, TaskCategory? category, Guid? teamId)
        {
            this.Id = id;
            this.ProjectId = projectId;
            this.SprintId = sprintId;
            this.ParentTaskId = parentTaskId;
            this.Title = title;
            this.Description = description;
            this.Status = status;
            this.StartDate = startDate;
            this.EndDate = endDate;
            this.Progress = progress;
            this.Type = type;
            this.Category = category;
            this.TeamId = teamId;
        }

        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Enum.TaskStatus Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public TaskType? Type { get; set; }
        public TaskCategory? Category { get; set; }
        public Guid? TeamId { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}
