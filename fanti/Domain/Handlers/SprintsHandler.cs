using Domain.Commands;
using Domain.Commands.SprintsCommands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class SprintsHandler : IHandler<CreateSprintsCommand>,
        IHandler<UpdateSprintsCommand>
    // IHandler<UpdateSprintDatesCommand>
    {
        private readonly ISprintsRepository _SprintsRepository;
        private readonly ITasksRepository _TasksRepository;
        private readonly IMapper _mapper;

        public SprintsHandler(ISprintsRepository SprintsRepository, ITasksRepository TasksRepository, IMapper mapper)
        {
            _SprintsRepository = SprintsRepository;
            _TasksRepository = TasksRepository;
            _mapper = mapper;
        }


        public async Task<ICommandResult> Handle(CreateSprintsCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            SprintsEntity entity = new();
            _mapper.Map(command, entity);

            await _SprintsRepository.PostAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);
        }

        public async Task<ICommandResult> Handle(UpdateSprintsCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            SprintsEntity entity = await _SprintsRepository.GetByIdAsync(command.Id);

            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);

            _mapper.Map(command, entity);

            await _SprintsRepository.UpdateAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);

        }

        // public async Task<ICommandResult> Handle(UpdateSprintDatesCommand command)
        // {
        //     command.IsCommandValid();

        //     if (!command.isValid)
        //     {
        //         return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
        //     }

        //     var sprintEntity = await _SprintsRepository.GetByIdAsync(command.SprintId);
        //     if (sprintEntity == null) 
        //         return new CommandResult("Sprint not found", HttpStatusCode.NotFound);

        //     // Buscar todas as tarefas da sprint
        //     var allTasks = await _TasksRepository.GetAllAsync();
        //     var sprintTasks = allTasks.Where(t => t.SprintId.HasValue && 
        //                                           t.SprintId.Value == command.SprintId).ToList();

        //     if (sprintTasks.Any())
        //     {
        //         // Calcular nova data de início (menor StartDate das tarefas)
        //         var tasksWithStartDate = sprintTasks.Where(t => t.StartDate.HasValue).ToList();
        //         DateTime? earliestStartDate = tasksWithStartDate.Any() 
        //             ? tasksWithStartDate.Min(t => t.StartDate!.Value)
        //             : null;

        //         // Calcular nova data de fim (maior EndDate das tarefas)
        //         var tasksWithEndDate = sprintTasks.Where(t => t.EndDate.HasValue).ToList();
        //         DateTime? latestEndDate = tasksWithEndDate.Any()
        //             ? tasksWithEndDate.Max(t => t.EndDate!.Value)
        //             : null;

        //         // Atualizar apenas se as datas mudaram
        //         bool hasChanges = false;

        //         if (earliestStartDate.HasValue)
        //         {
        //             var newStartDateString = earliestStartDate.Value;
        //             if (sprintEntity.StartDate != newStartDateString)
        //             {
        //                 sprintEntity.StartDate = newStartDateString;
        //                 hasChanges = true;
        //             }
        //         }

        //         if (latestEndDate.HasValue)
        //         {
        //             var newEndDateString = latestEndDate.Value;
        //             if (sprintEntity.EndDate != newEndDateString)
        //             {
        //                 sprintEntity.EndDate = newEndDateString;
        //                 hasChanges = true;
        //             }
        //         }

        //         if (hasChanges)
        //         {
        //             sprintEntity.setUpdate(DateTime.UtcNow);
        //             await _SprintsRepository.UpdateAsync(sprintEntity);
        //         }
        //     }

        //     return new CommandResult("Sprint dates updated successfully", HttpStatusCode.OK);
        // }

    }
}
