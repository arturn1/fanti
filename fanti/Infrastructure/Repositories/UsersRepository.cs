using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class UsersRepository :
        RepositoryBase<UsersEntity>,
        IUsersRepository
    {
        public UsersRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
