using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{
    public class GetTaskAssignmentsByTaskIdCommand : ValidatableTypes, ICommand
    {
        public GetTaskAssignmentsByTaskIdCommand(Guid taskId)
        {
            TaskId = taskId;
        }

        public Guid TaskId { get; set; }

        public bool IsCommandValid()
        {
            if (TaskId == Guid.Empty)
                addError("TaskId é obrigatório");
                
            return this.isValid;
        }
    }
}
