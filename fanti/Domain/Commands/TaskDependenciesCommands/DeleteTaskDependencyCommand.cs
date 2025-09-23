using Domain.Commands.Contracts;
using Domain.Validation;
using System.Text.Json.Serialization;

namespace Domain.Commands 
{
    public class DeleteTaskDependencyCommand : ValidatableTypes, ICommand
    {
        public DeleteTaskDependencyCommand(Guid predecessorTaskId, Guid successorTaskId)
        {
            this.PredecessorTaskId = predecessorTaskId;
            this.SuccessorTaskId = successorTaskId;
        }
        
        [JsonPropertyName("predecessorTaskId")]
        public Guid PredecessorTaskId { get; set; }
        
        [JsonPropertyName("successorTaskId")]
        public Guid SuccessorTaskId { get; set; }

        public bool IsCommandValid()
        {
            // Validar GUIDs
            if (PredecessorTaskId == Guid.Empty)
            {
                addError("ID da tarefa predecessora é obrigatório");
            }

            if (SuccessorTaskId == Guid.Empty)
            {
                addError("ID da tarefa sucessora é obrigatório");
            }

            // Validar se as tarefas são diferentes
            if (PredecessorTaskId == SuccessorTaskId)
            {
                addError("Uma tarefa não pode depender de si mesma");
            }

            return this.isValid;
        }
    }
}
