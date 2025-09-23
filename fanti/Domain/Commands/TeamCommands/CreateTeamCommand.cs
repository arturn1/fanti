using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreateTeamCommand : ValidatableTypes, ICommand
    {
        public CreateTeamCommand(string Name, string Description)
        {
            
            this.Name = Name;
            this.Description = Description;

        }
        public string Name { get; set; }
        public string Description { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}