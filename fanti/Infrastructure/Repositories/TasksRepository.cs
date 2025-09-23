using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class TasksRepository :
        RepositoryBase<TasksEntity>,
        ITasksRepository
    {
        public TasksRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
