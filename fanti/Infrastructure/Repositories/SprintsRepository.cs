using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class SprintsRepository :
        RepositoryBase<SprintsEntity>,
        ISprintsRepository
    {
        public SprintsRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
