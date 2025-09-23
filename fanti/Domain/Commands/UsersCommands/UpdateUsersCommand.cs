using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class UpdateUsersCommand : ValidatableTypes, ICommand
    {
        public UpdateUsersCommand(Guid id, string Email, string Name, string? Avatar, string Role, bool IsActive)
        {
            this.Id = id;
            this.Email = Email;
            this.Name = Name;
            this.Avatar = Avatar;
            this.Role = Role;
            this.IsActive = IsActive;

        }

        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}