using Domain.Commands.Contracts;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands
{

    public class UpdateTasksCommand : ValidatableTypes, ICommand
    {
        public UpdateTasksCommand(Guid id, Guid? ProjectId, Guid? SprintId, Guid? ParentTaskId, string Title, string Description, string Status, DateTime? StartDate, DateTime? EndDate, decimal Progress, string? Type, string? Category, Guid? TeamId)
        {
            this.Id = id;
            this.ProjectId = ProjectId;
            this.SprintId = SprintId;
            this.ParentTaskId = ParentTaskId;
            this.Title = Title;
            this.Description = Description;
            this.Status = Status;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Progress = Progress;
            this.Type = Type;
            this.Category = Category;
            this.TeamId = TeamId;
        }

        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public string? Type { get; set; }
        public string? Category { get; set; }
        public Guid? TeamId { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}