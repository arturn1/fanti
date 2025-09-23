using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class TaskAssignmentsRepository :
        RepositoryBase<TaskAssignmentsEntity>,
        ITaskAssignmentsRepository
    {
        public TaskAssignmentsRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
