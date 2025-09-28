using Domain.Commands;
using Domain.Commands.TasksCommands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class TasksHandler : IHandler<CreateTasksCommand>,
     IHandler<UpdateTasksCommand>,
      IHandler<UpdateTaskFieldsCommand>,
        IHandler<CreateSubtaskCommand>,
         IHandler<DeleteTaskCommand>
    {
        private readonly ITasksRepository _TasksRepository;
        private readonly ITaskDependenciesRepository _TaskDependenciesRepository;
        private readonly IMapper _mapper;

        public TasksHandler(ITasksRepository TasksRepository, ITaskDependenciesRepository TaskDependenciesRepository, IMapper mapper)
        {
            _TasksRepository = TasksRepository;
            _TaskDependenciesRepository = TaskDependenciesRepository;
            _mapper = mapper;
        }

        public async Task<ICommandResult> Handle(CreateTasksCommand command)
        {

            try
            {
                command.IsCommandValid();
                if (!command.isValid)
                {
                    return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
                }
                TasksEntity entity = new();
                _mapper.Map(command, entity);
                await _TasksRepository.PostAsync(entity);
                return new CommandResult(entity, HttpStatusCode.Created);
            }
            catch (System.Exception e)
            {

                throw e;
            }

        }
        public async Task<ICommandResult> Handle(UpdateTasksCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            TasksEntity entity = await _TasksRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);

            entity.Type = command.Type.GetDisplayName();
            command.Type = null; // Limpar para evitar sobrescrever com nulo
            _mapper.Map(command, entity);
            await _TasksRepository.UpdateAsync(entity);

            // Atualizar tarefa pai se existir
            await UpdateParentTaskIfExists(entity);

            return new CommandResult(entity, HttpStatusCode.OK);
        }
        public async Task<ICommandResult> Handle(UpdateTaskFieldsCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);

            var entity = await _TasksRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return new CommandResult("Task not found", HttpStatusCode.NotFound);

            _mapper.Map(command, entity);
            await _TasksRepository.UpdateAsync(entity);

            // Atualizar tarefa pai se existir
            await UpdateParentTaskIfExists(entity);

            return new CommandResult(entity, HttpStatusCode.OK);
        }
        public async Task<ICommandResult> Handle(CreateSubtaskCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }

            // Buscar tarefa pai para herdar propriedades
            TasksEntity parentTask = await _TasksRepository.GetByIdAsync(command.ParentTaskId);
            if (parentTask == null)
                return new CommandResult("Tarefa pai não encontrada", HttpStatusCode.NotFound);

            // Criar subtarefa herdando propriedades da tarefa pai
            TasksEntity subtaskEntity = new TasksEntity
            {
                ProjectId = parentTask.ProjectId,
                SprintId = parentTask.SprintId,
                ParentTaskId = command.ParentTaskId,
                Title = command.Title,
                Description = command.Description,
                Status = command.Status,
                StartDate = command.StartDate,
                EndDate = command.EndDate,
                Progress = command.Progress,
                Category = command.Category,
                TeamId = command.TeamId,
                Type = command.Type.GetDisplayName(),
            };

            await _TasksRepository.PostAsync(subtaskEntity);

            // Atualizar tarefa pai após criar subtarefa
            await UpdateParentTaskIfExists(subtaskEntity);

            return new CommandResult(subtaskEntity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(DeleteTaskCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }

            var taskToDelete = await _TasksRepository.GetByIdAsync(command.Id);
            if (taskToDelete == null)
                return new CommandResult("Tarefa não encontrada", HttpStatusCode.NotFound);

            // 1. Buscar e deletar todas as tarefas filhas (recursivamente)
            await DeleteChildTasksRecursively(command.Id);

            // 2. Buscar e deletar todas as dependências relacionadas (onde a tarefa é predecessor ou sucessor)
            await DeleteTaskDependencies(command.Id);

            // 3. Deletar a tarefa principal
            _TasksRepository.DeleteObject(taskToDelete);
            _TasksRepository.SaveChanges();

            // 4. Atualizar tarefa pai se existir
            if (taskToDelete.ParentTaskId.HasValue)
            {
                var parentTask = await _TasksRepository.GetByIdAsync(taskToDelete.ParentTaskId.Value);
                if (parentTask != null)
                {
                    await UpdateParentTaskIfExists(parentTask);
                }
            }

            return new CommandResult("Tarefa deletada com sucesso", HttpStatusCode.OK);
        }
        private async Task UpdateParentTaskIfExists(TasksEntity childTask)
        {
            // Verificar se a tarefa tem pai
            if (childTask.ParentTaskId == null) return;

            // Buscar tarefa pai
            var parentTask = await _TasksRepository.GetByIdAsync(childTask.ParentTaskId.Value);
            if (parentTask == null) return;

            // Buscar todas as tarefas e filtrar os filhos do pai atual
            var allTasks = await _TasksRepository.GetAllAsync();
            var childTasks = allTasks.Where(t => t.ParentTaskId.HasValue &&
                                                 t.ParentTaskId.Value == childTask.ParentTaskId.Value).ToList();

            if (!childTasks.Any()) return;

            // Calcular progresso médio dos filhos
            var averageProgress = (int)childTasks.Average(t => (decimal)t.Progress);

            // Determinar status baseado nos filhos
            var newStatus = CalculateParentStatus(childTasks);

            // Atualizar tarefa pai apenas se houve mudança
            bool hasChanges = false;
            if (parentTask.Progress != averageProgress)
            {
                parentTask.Progress = averageProgress;
                hasChanges = true;
            }

            if (parentTask.Status != newStatus)
            {
                parentTask.Status = newStatus;
                hasChanges = true;
            }

            if (hasChanges)
            {
                parentTask.setUpdate(DateTime.UtcNow);
                await _TasksRepository.UpdateAsync(parentTask);

                // Recursivamente atualizar avô se existir
                await UpdateParentTaskIfExists(parentTask);
            }
        }
        private static Domain.Enum.TaskStatus CalculateParentStatus(IEnumerable<TasksEntity> childTasks)
        {
            var children = childTasks.ToList();
            if (!children.Any()) return Domain.Enum.TaskStatus.ToDo;

            // Contar status dos filhos
            var doneCount = children.Count(t => t.Status == Domain.Enum.TaskStatus.Done);
            var inProgressCount = children.Count(t => t.Status == Domain.Enum.TaskStatus.InProgress);
            var totalCount = children.Count;

            // Se todos estão concluídos, pai fica concluído
            if (doneCount == totalCount)
                return Domain.Enum.TaskStatus.Done;

            // Se pelo menos um está em progresso ou alguns estão concluídos, pai fica em progresso
            if (inProgressCount > 0 || doneCount > 0)
                return Domain.Enum.TaskStatus.InProgress;

            // Caso contrário, pai fica como "A Fazer"
            return Domain.Enum.TaskStatus.ToDo;
        }
        private async Task DeleteChildTasksRecursively(Guid parentTaskId)
        {
            // Buscar todas as tarefas filhas
            var allTasks = await _TasksRepository.GetAllAsync();
            var childTasks = allTasks.Where(t => t.ParentTaskId.HasValue && t.ParentTaskId.Value == parentTaskId).ToList();

            foreach (var childTask in childTasks)
            {
                // Recursivamente deletar netos
                await DeleteChildTasksRecursively(childTask.ID);

                // Deletar dependências da tarefa filha
                await DeleteTaskDependencies(childTask.ID);

                // Deletar a tarefa filha
                _TasksRepository.DeleteObject(childTask);
            }

            // Salvar todas as mudanças dos filhos de uma vez
            if (childTasks.Any())
            {
                _TasksRepository.SaveChanges();
            }
        }
        private async Task DeleteTaskDependencies(Guid taskId)
        {
            // Buscar todas as dependências onde a tarefa é predecessor ou sucessor
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var taskDependencies = allDependencies.Where(d =>
                d.PredecessorTaskId == taskId || d.SuccessorTaskId == taskId).ToList();

            foreach (var dependency in taskDependencies)
            {
                _TaskDependenciesRepository.DeleteObject(dependency);
            }

            // Salvar todas as mudanças das dependências de uma vez
            if (taskDependencies.Any())
            {
                _TaskDependenciesRepository.SaveChanges();
            }
        }

    }
}
