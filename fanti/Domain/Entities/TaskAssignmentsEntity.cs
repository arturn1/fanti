using System;

namespace Domain.Entities
{
    
    public class TaskAssignmentsEntity : BaseEntity 
    {
        public TaskAssignmentsEntity() 
        {
        }
        
        
        
        public TasksEntity TaskId { get; set; }
        public UsersEntity UserId { get; set; }
        public int Role { get; set; }
        public decimal HoursAllocated { get; set; }
        public DateTime AssignedAt { get; set; }

    }
}