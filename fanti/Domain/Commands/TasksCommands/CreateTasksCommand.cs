using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands
{

    public class CreateTasksCommand : ValidatableTypes, ICommand
    {
        public CreateTasksCommand(Guid? ProjectId, Guid? SprintId, Guid? ParentTaskId, Guid AssigneeId, string Title, string Description, string Priority, string Status, decimal EstimatedHours, DateTime? StartDate, DateTime? EndDate, decimal Progress, List<string>? Assignees, List<string>? Dependencies, string? Color, bool IsDisabled, bool HideChildren, DateTime? CompletedDate, string? Tags, string? Type, string? Category, Guid TeamId)
        {

            this.ProjectId = ProjectId;
            this.SprintId = SprintId;
            this.ParentTaskId = ParentTaskId;
            this.AssigneeId = AssigneeId;
            this.Title = Title;
            this.Description = Description;
            this.Priority = Priority;
            this.Status = Status;
            this.EstimatedHours = EstimatedHours;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Progress = Progress;
            this.Assignees = Assignees;
            this.Dependencies = Dependencies;
            this.Color = Color;
            this.IsDisabled = IsDisabled;
            this.HideChildren = HideChildren;
            this.CompletedDate = CompletedDate;
            this.Tags = Tags;
            this.Type = Type;
            this.Category = Category;
            this.TeamId = TeamId;

        }
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public Guid AssigneeId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public decimal EstimatedHours { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public List<string>? Assignees { get; set; }
        public List<string>? Dependencies { get; set; }
        public string? Color { get; set; }
        public bool IsDisabled { get; set; }
        public bool HideChildren { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Tags { get; set; }
        public string? Type { get; set; }
        public string? Category { get; set; }
        public Guid TeamId { get; set; }



        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}