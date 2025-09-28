using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands
{

    public class CreateProjectVersionCommand : ValidatableTypes, ICommand
    {
        public CreateProjectVersionCommand(Guid ProjectId, string Version, DateTime DeployDate)
        {

            this.ProjectId = ProjectId;
            this.Version = Version;
            this.DeployDate = DeployDate;

        }
        public Guid ProjectId { get; set; }
        public string Version { get; set; }
        public DateTime DeployDate { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}