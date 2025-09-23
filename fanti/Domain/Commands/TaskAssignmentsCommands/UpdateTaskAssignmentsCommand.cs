using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class UpdateTaskAssignmentsCommand : ValidatableTypes, ICommand
    {
        public UpdateTaskAssignmentsCommand(Guid id, TasksEntity TaskId, UsersEntity UserId, int Role, decimal HoursAllocated, DateTime AssignedAt)
        {
            this.Id = id;
            this.TaskId = TaskId;
            this.UserId = UserId;
            this.Role = Role;
            this.HoursAllocated = HoursAllocated;
            this.AssignedAt = AssignedAt;

        }

        public Guid Id { get; set; }
        public TasksEntity TaskId { get; set; }
        public UsersEntity UserId { get; set; }
        public int Role { get; set; }
        public decimal HoursAllocated { get; set; }
        public DateTime AssignedAt { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}