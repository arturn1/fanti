using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreateSprintsCommand : ValidatableTypes, ICommand
    {
        public CreateSprintsCommand(Guid ProjectId, string Name, string Description, DateTime StartDate, DateTime EndDate, string Goal, string Status)
        {
            
            this.ProjectId = ProjectId;
            this.Name = Name;
            this.Description = Description;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Goal = Goal;
            this.Status = Status;

        }
        public Guid ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Goal { get; set; }
        public string Status { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}