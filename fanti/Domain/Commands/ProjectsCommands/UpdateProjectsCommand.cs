using Domain.Commands.Contracts;
using Domain.Enum;
using Domain.Validation;

namespace Domain.Commands
{

    public class UpdateProjectsCommand : ValidatableTypes, ICommand
    {
        public UpdateProjectsCommand(Guid id, string Name, string Description, DateTime StartDate, DateTime EndDate, ProjectStatus Status, string? url)
        {
            this.Id = id;
            this.Name = Name;
            this.Description = Description;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Status = Status;
            this.url = url;

        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        public string? url { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");

            return this.isValid;
        }
    }
}