using System;

namespace Domain.Entities
{
    
    public class TaskDependenciesEntity : BaseEntity 
    {
        public TaskDependenciesEntity() 
        {
        }
        
        
        
        public Guid PredecessorTaskId { get; set; }
        public Guid SuccessorTaskId { get; set; }
        public int Type { get; set; }
        public int Lag { get; set; }

    }
}