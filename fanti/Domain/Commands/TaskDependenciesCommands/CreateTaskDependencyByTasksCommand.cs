using Domain.Commands.Contracts;
using Domain.Validation;
using System.Text.Json.Serialization;

namespace Domain.Commands 
{
    public class CreateTaskDependencyByTasksCommand : ValidatableTypes, ICommand
    {
        public CreateTaskDependencyByTasksCommand(Guid predecessorTaskId, Guid successorTaskId)
        {
            this.PredecessorTaskId = predecessorTaskId;
            this.SuccessorTaskId = successorTaskId;
            this.Type = 1; // FinishToStart por padrão
            this.Lag = 0;
        }
        
        [JsonPropertyName("predecessorTaskId")]
        public Guid PredecessorTaskId { get; set; }
        
        [JsonPropertyName("successorTaskId")]
        public Guid SuccessorTaskId { get; set; }
        
        [JsonPropertyName("type")]
        public int Type { get; set; }
        
        [JsonPropertyName("lag")]
        public int Lag { get; set; }

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

            // Validar tipo de dependência
            if (Type < 1 || Type > 4)
            {
                addError("Tipo de dependência deve ser entre 1 e 4");
            }

            return this.isValid;
        }
    }
}
