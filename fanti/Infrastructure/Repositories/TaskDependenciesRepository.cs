using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class TaskDependenciesRepository :
        RepositoryBase<TaskDependenciesEntity>,
        ITaskDependenciesRepository
    {
        public TaskDependenciesRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
