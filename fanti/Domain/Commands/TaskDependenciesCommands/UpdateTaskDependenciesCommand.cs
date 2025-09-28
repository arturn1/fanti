using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class UpdateTaskDependenciesCommand : ValidatableTypes, ICommand
    {
        public UpdateTaskDependenciesCommand(Guid id, Guid PredecessorTaskId, Guid SuccessorTaskId, int Type)
        {
            this.Id = id;
            this.PredecessorTaskId = PredecessorTaskId;
            this.SuccessorTaskId = SuccessorTaskId;
            this.Type = Type;

        }

        public Guid Id { get; set; }
        public Guid PredecessorTaskId { get; set; }
        public Guid SuccessorTaskId { get; set; }
        public int Type { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}