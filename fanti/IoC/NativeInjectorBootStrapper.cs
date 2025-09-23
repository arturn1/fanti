using Application.Dictionary;
using Domain.Handlers;
using Domain.Helpers;
using Domain.Repositories;
using Infrastructure.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace IoC
{
    public class NativeInjectorBootStrapper
    {
        public static void RegisterServices(IServiceCollection services)
        {

            #region Repositories
            services.AddScoped<IPeriodStaffRepository, PeriodStaffRepository>();
            services.AddScoped<IPeriodRepository, PeriodRepository>();
            services.AddScoped<IStaffRepository, StaffRepository>();
            services.AddScoped<ITeamRepository, TeamRepository>();
            services.AddScoped<ITaskAssignmentsRepository, TaskAssignmentsRepository>();
            services.AddScoped<ITaskDependenciesRepository, TaskDependenciesRepository>();            services.AddScoped<ITasksRepository, TasksRepository>();
            services.AddScoped<ISprintsRepository, SprintsRepository>();            services.AddScoped<IProjectsRepository, ProjectsRepository>();
            services.AddScoped<IUsersRepository, UsersRepository>();
            #endregion

            #region Handlers
            services.AddTransient<PeriodStaffHandler>();
            services.AddTransient<PeriodHandler>();
            services.AddTransient<StaffHandler>();
            services.AddTransient<TeamHandler>();
            services.AddTransient<TaskAssignmentsHandler>();
            services.AddTransient<TaskDependenciesHandler>();
            services.AddTransient<TasksHandler>();
            services.AddTransient<SprintsHandler>();
            services.AddTransient<ProjectsHandler>();
            services.AddTransient<UsersHandler>();
            #endregion

            #region Services
            #endregion

            #region Dictionary
            services.AddSingleton<DefaultDictionary>();
            #endregion

            #region Helper
            services.AddScoped<IMapper, Mapper>();
            #endregion

        }
    }
}