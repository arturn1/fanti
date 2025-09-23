using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreateProjectsCommand : ValidatableTypes, ICommand
    {
        public CreateProjectsCommand(string Name, string Description, string StartDate, string EndDate, string Status, Guid OwnerId, string? url)
        {
            
            this.Name = Name;
            this.Description = Description;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Status = Status;
            this.OwnerId = OwnerId;
            this.url = url;

        }
        public string Name { get; set; }
        public string Description { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Status { get; set; }
        public Guid OwnerId { get; set; }
        public string? url { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}