using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands
{

    public class UpdateProjectVersionCommand : ValidatableTypes, ICommand
    {
        public UpdateProjectVersionCommand(Guid id, string Version)
        {
            this.Id = id;
            this.Version = Version;

        }

        public Guid Id { get; set; }
        public string Version { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}