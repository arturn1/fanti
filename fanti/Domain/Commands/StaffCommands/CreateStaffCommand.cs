using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands
{

    public class CreateStaffCommand : ValidatableTypes, ICommand
    {
        public CreateStaffCommand(string Name, Guid TeamId, int AvailableHours)
        {

            this.Name = Name;
            this.TeamId = TeamId;
            this.AvailableHours = AvailableHours;

        }
        public string Name { get; set; }
        public Guid TeamId { get; set; }
        public int AvailableHours { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}