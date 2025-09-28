using Domain.Commands.Contracts;
using Domain.Enum;
using Domain.Validation;
using System.Collections.Generic;

namespace Domain.Commands
{

    public class CreateTasksCommand : ValidatableTypes, ICommand
    {
        public CreateTasksCommand(Guid? ProjectId, Guid? SprintId,
        string Title, string Description, Enum.TaskStatus Status, DateTime? StartDate,
        DateTime? EndDate)
        {

            this.ProjectId = ProjectId;
            this.SprintId = SprintId;
            this.Title = Title;
            this.Description = Description;
            this.Status = Status;
            this.StartDate = StartDate;
            this.EndDate = EndDate;

        }
        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Enum.TaskStatus Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }



        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}