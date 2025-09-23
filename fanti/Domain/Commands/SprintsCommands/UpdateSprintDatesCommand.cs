using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands.SprintsCommands
{
    public class UpdateSprintDatesCommand : ValidatableTypes, ICommand
    {
        public UpdateSprintDatesCommand(Guid sprintId)
        {
            this.SprintId = sprintId;
        }

        public Guid SprintId { get; set; }

        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(SprintId, "SprintId");
            
            return this.isValid;
        }
    }
}
