using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands
{

    public class CreateProjectsCommand : ValidatableTypes, ICommand
    {
        public CreateProjectsCommand(string Name, string Description, DateTime StartDate, DateTime EndDate, string Status, string? url)
        {

            this.Name = Name;
            this.Description = Description;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Status = Status;
            this.url = url;

        }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public string? url { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}