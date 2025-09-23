using System;

namespace Domain.Entities
{
    
    public class UsersEntity : BaseEntity 
    {
        public UsersEntity() 
        {
        }
        
        
        
        public string Email { get; set; }
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }

    }
}