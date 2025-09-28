using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands
{

    public class UpdateStaffCommand : ValidatableTypes, ICommand
    {
        public UpdateStaffCommand(Guid id, string Name, Guid TeamId)
        {
            this.Id = id;
            this.Name = Name;
            this.TeamId = TeamId;

        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid TeamId { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}