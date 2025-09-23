using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands.TasksCommands
{
  public class DeleteTaskCommand : ValidatableTypes, ICommand
  {
    public DeleteTaskCommand(Guid id)
    {
      this.Id = id;
    }

    public Guid Id { get; set; }

    public bool IsCommandValid()
    {
      return this.isValid;
    }
  }
}
