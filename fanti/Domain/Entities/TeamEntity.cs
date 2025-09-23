using System;

namespace Domain.Entities
{
    
    public class TeamEntity : BaseEntity 
    {
        public TeamEntity() 
        {
        }
        
        
        
        public string Name { get; set; }
        public string Description { get; set; }

    }
}