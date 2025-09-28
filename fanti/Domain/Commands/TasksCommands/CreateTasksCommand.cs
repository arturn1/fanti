using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands
{

    public class CreateTasksCommand : ValidatableTypes, ICommand
    {
        public CreateTasksCommand(Guid? ProjectId, Guid? SprintId, Guid? ParentTaskId, string Title, string Description, string Priority, string Status, DateTime? StartDate, DateTime? EndDate, decimal Progress, bool IsDisabled, string? Type, string? Category, Guid? TeamId)
        {

            this.ProjectId = ProjectId;
            this.SprintId = SprintId;
            this.ParentTaskId = ParentTaskId;
            this.Title = Title;
            this.Description = Description;
            this.Priority = Priority;
            this.Status = Status;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Progress = Progress;
            this.IsDisabled = IsDisabled;
            this.Type = Type;
            this.Category = Category;
            this.TeamId = TeamId;

        }
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public bool IsDisabled { get; set; }
        public string? Type { get; set; }
        public string? Category { get; set; }
        public Guid? TeamId { get; set; }



        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}