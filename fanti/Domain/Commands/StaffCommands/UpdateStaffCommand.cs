using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class UpdateStaffCommand : ValidatableTypes, ICommand
    {
        public UpdateStaffCommand(Guid id, string Name, TeamEntity Team, int AvailableHours)
        {
            this.Id = id;
            this.Name = Name;
            this.Team = Team;
            this.AvailableHours = AvailableHours;

        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public TeamEntity Team { get; set; }
        public int AvailableHours { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}