using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreateUsersCommand : ValidatableTypes, ICommand
    {
        public CreateUsersCommand(string Email, string Name, string? Avatar, string Role, bool IsActive)
        {
            
            this.Email = Email;
            this.Name = Name;
            this.Avatar = Avatar;
            this.Role = Role;
            this.IsActive = IsActive;

        }
        public string Email { get; set; }
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}