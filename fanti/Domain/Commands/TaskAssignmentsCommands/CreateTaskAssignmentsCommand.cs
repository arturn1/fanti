using Domain.Commands.Contracts;
using Domain.Validation;
using Domain.Entities;

namespace Domain.Commands 
{

    public class CreateTaskAssignmentsCommand : ValidatableTypes, ICommand
    {
        public CreateTaskAssignmentsCommand(TasksEntity TaskId, UsersEntity UserId, int Role, decimal HoursAllocated, DateTime AssignedAt)
        {
            
            this.TaskId = TaskId;
            this.UserId = UserId;
            this.Role = Role;
            this.HoursAllocated = HoursAllocated;
            this.AssignedAt = AssignedAt;

        }
        public TasksEntity TaskId { get; set; }
        public UsersEntity UserId { get; set; }
        public int Role { get; set; }
        public decimal HoursAllocated { get; set; }
        public DateTime AssignedAt { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}