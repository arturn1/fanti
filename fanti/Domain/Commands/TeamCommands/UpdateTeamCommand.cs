using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class UpdateTeamCommand : ValidatableTypes, ICommand
    {
        public UpdateTeamCommand(Guid id, string Name, string Description)
        {
            this.Id = id;
            this.Name = Name;
            this.Description = Description;

        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}