using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands
{

    public class CreateUsersCommand : ValidatableTypes, ICommand
    {

        public CreateUsersCommand(
            string email,
            string name,
            string? avatar,
            string role,
            bool isActive,
            UserInfo info
        )
        {
            this.Email = email;
            this.Name = name;
            this.Avatar = avatar;
            this.Role = role;
            this.IsActive = isActive;
            this.Info = info;
        }

        public string Email { get; set; }
        public string Name { get; set; }
        public string? Avatar { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
        public UserInfo Info { get; set; }

        // Espelha a estrutura de UserInfo da entidade
        public class UserInfo
        {
            public Guid? Id { get; set; }
            public Guid? Sub { get; set; }
            public string? Email { get; set; }
            public string? Name { get; set; }
            public string? Role { get; set; }
            public string? Avatar { get; set; }
            public string? InternalCategory { get; set; }
            public string? JobTitle { get; set; }
            public string? Manager { get; set; }
            public List<string>? Amr { get; set; }
            public string? Area { get; set; }
            public string? AtHash { get; set; }
            public string? Audience { get; set; }
            public long? AuthTime { get; set; }
            public long? Expiration { get; set; }
            public string? GivenName { get; set; }
            public List<string>? Group { get; set; }
            public List<string>? GroupsAreas { get; set; }
            public long? IssuedAt { get; set; }
            public string? IdentityProvider { get; set; }
            public string? Issuer { get; set; }
            public string? LastName { get; set; }
            public long? NotBefore { get; set; }
            public string? Nonce { get; set; }
            public string? PreferredLanguage { get; set; }
            public string? PreferredUsername { get; set; }
            public string? SHash { get; set; }
            public string? SessionId { get; set; }
            public List<string>? Roles { get; set; }
            public string? EmailAddress { get; set; }
            public string? ClaimGivenName { get; set; }
            public string? ClaimName { get; set; }
            public string? ClaimSurname { get; set; }
            public string? Upn { get; set; }
        }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}