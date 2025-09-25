using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class TasksPeriodRepository :
        RepositoryBase<TasksPeriodEntity>,
        ITasksPeriodRepository
    {
        public TasksPeriodRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
