using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class TeamRepository :
        RepositoryBase<TeamEntity>,
        ITeamRepository
    {
        public TeamRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
