using System;

namespace Domain.Entities
{
    
    public class ProjectsEntity : BaseEntity 
    {
        public ProjectsEntity() 
        {
        }
        
        
        
        public string Name { get; set; }
        public string Description { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Status { get; set; }
        public Guid OwnerId { get; set; }
        public string? url { get; set; }

    }
}