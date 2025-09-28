using Domain.Commands.Contracts;
using Domain.Validation;
using System.Text.Json.Serialization;

namespace Domain.Commands
{

    public class CreateTaskDependenciesCommand : ValidatableTypes, ICommand
    {
        public CreateTaskDependenciesCommand(Guid PredecessorTaskId, Guid SuccessorTaskId)
        {

            this.PredecessorTaskId = PredecessorTaskId;
            this.SuccessorTaskId = SuccessorTaskId;

        }

        public Guid PredecessorTaskId { get; set; }

        public Guid SuccessorTaskId { get; set; }




        public bool IsCommandValid()
        {
            // Validar se as tarefas são diferentes
            if (PredecessorTaskId == SuccessorTaskId)
            {
                addError("Uma tarefa não pode depender de si mesma");
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