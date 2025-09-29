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
        public DbSet<ProjectVersionEntity> ProjectVersion { get; set; }
        public DbSet<TasksPeriodEntity> TasksPeriod { get; set; }
        public DbSet<PeriodStaffEntity> PeriodStaff { get; set; }
        public DbSet<PeriodEntity> Period { get; set; }
        public DbSet<StaffEntity> Staff { get; set; }
        public DbSet<TeamEntity> Team { get; set; }
        public DbSet<TaskDependenciesEntity> TaskDependencies { get; set; }
        public DbSet<TasksEntity> Tasks { get; set; }
        public DbSet<SprintsEntity> Sprints { get; set; }
        public DbSet<ProjectsEntity> Projects { get; set; }
        public DbSet<UsersEntity> Users { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<SprintsEntity>()
                .HasOne(tp => tp.projectsEntity)
                .WithMany()
                .HasForeignKey(tp => tp.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // modelBuilder.Entity<PeriodStaffEntity>()
            //     .HasOne(tp => tp.Period)
            //     .WithMany()
            //     .HasForeignKey(tp => tp.PeriodId)
            //     .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PeriodStaffEntity>()
                .HasOne(tp => tp.Staff)
                .WithMany()
                .HasForeignKey(tp => tp.StaffId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TasksPeriodEntity>()
                .HasOne(tp => tp.PeriodStaff)
                .WithMany()
                .HasForeignKey(tp => tp.PeriodStaffId)
                .OnDelete(DeleteBehavior.Cascade);

            // modelBuilder.Entity<TasksPeriodEntity>()
            // .HasOne(tp => tp.Project)
            // .WithMany()
            // .HasForeignKey(tp => tp.ProjectId)
            // .OnDelete(DeleteBehavior.Cascade);

            // modelBuilder.Entity<TasksEntity>()
            //     .HasOne(tp => tp.Project)
            //     .WithMany()
            //     .HasForeignKey(tp => tp.ProjectId)
            //     .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TasksEntity>()
                .HasOne(tp => tp.Sprint)
                .WithMany()
                .HasForeignKey(tp => tp.SprintId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskDependenciesEntity>()
            .HasOne(tp => tp.PredecessorTask)
            .WithMany()
            .HasForeignKey(tp => tp.PredecessorTaskId)
            .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
