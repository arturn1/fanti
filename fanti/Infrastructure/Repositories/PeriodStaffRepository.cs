using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories.Contracts;

namespace Infrastructure.Repositories
{
    public class PeriodStaffRepository :
        RepositoryBase<PeriodStaffEntity>,
        IPeriodStaffRepository
    {
        public PeriodStaffRepository(ApplicationDbContext context, bool SaveChanges = true) : base(context, SaveChanges) { }
    }
}
