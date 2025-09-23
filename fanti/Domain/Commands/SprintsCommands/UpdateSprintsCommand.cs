using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class UpdateSprintsCommand : ValidatableTypes, ICommand
    {

        public UpdateSprintsCommand() { }
        public UpdateSprintsCommand(Guid id, Guid ProjectId, string Name, string Description, string StartDate, string EndDate, string Goal, string Status)
        {
            this.Id = id;
            this.ProjectId = ProjectId;
            this.Name = Name;
            this.Description = Description;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Goal = Goal;
            this.Status = Status;

        }

        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string? Goal { get; set; }
        public string Status { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}