using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class ProjectVersionRepository :
        RepositoryBase<ProjectVersionEntity>,
        IProjectVersionRepository
    {
        public ProjectVersionRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
