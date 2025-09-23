using Domain.Commands.Contracts;
using Domain.Validation;
using System.Text.Json.Serialization;

namespace Domain.Commands 
{

    public class CreateTaskDependenciesCommand : ValidatableTypes, ICommand
    {
        public CreateTaskDependenciesCommand(Guid PredecessorTaskId, Guid SuccessorTaskId, int Type, int Lag)
        {
            
            this.PredecessorTaskId = PredecessorTaskId;
            this.SuccessorTaskId = SuccessorTaskId;
            this.Type = Type;
            this.Lag = Lag;

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
            // Validar se as tarefas são diferentes
            if (PredecessorTaskId == SuccessorTaskId)
            {
                addError("Uma tarefa não pode depender de si mesma");
            }

            // Validar se o tipo de dependência é válido (1-4 conforme enum DependencyType)
            if (Type < 1 || Type > 4)
            {
                addError("Tipo de dependência inválido");
            }

            // Validar GUIDs
            if (PredecessorTaskId == Guid.Empty && SuccessorTaskId == Guid.Empty)
            {
                addError("ID da tarefa predecessora e ID da tarefa sucessora são obrigatórios");
            }

            return this.isValid;
        }
    }
}