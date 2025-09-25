using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }

        #region DbSet
        public DbSet<TasksPeriodEntity> TasksPeriod { get; set; }
        public DbSet<PeriodStaffEntity> PeriodStaff { get; set; }
        public DbSet<PeriodEntity> Period { get; set; }
        public DbSet<StaffEntity> Staff { get; set; }
        public DbSet<TeamEntity> Team { get; set; }
        public DbSet<TaskAssignmentsEntity> TaskAssignments { get; set; }
        public DbSet<TaskDependenciesEntity> TaskDependencies { get; set; }
        public DbSet<TasksEntity> Tasks { get; set; }
        public DbSet<SprintsEntity> Sprints { get; set; }
        public DbSet<ProjectsEntity> Projects { get; set; }
        public DbSet<UsersEntity> Users { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cascade delete for TasksPeriod when PeriodStaff is deleted
            modelBuilder.Entity<TasksPeriodEntity>()
                .HasOne(tp => tp.PeriodStaff)
                .WithMany()
                .HasForeignKey(tp => tp.PeriodStaffId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}