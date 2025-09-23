using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class TaskDependenciesHandler: IHandler<CreateTaskDependenciesCommand>, IHandler<UpdateTaskDependenciesCommand>, IHandler<DeleteTaskDependencyCommand>, IHandler<CreateTaskDependencyByTasksCommand>
    {
        private readonly ITaskDependenciesRepository _TaskDependenciesRepository;
        private readonly ITasksRepository _tasksRepository;
        private readonly IMapper _mapper;
        
        public TaskDependenciesHandler(
            ITaskDependenciesRepository TaskDependenciesRepository, 
            ITasksRepository tasksRepository,
            IMapper mapper)
        {
            _TaskDependenciesRepository = TaskDependenciesRepository;
            _tasksRepository = tasksRepository;
            _mapper = mapper;
        }
        
        public async Task<ICommandResult> Handle(CreateTaskDependenciesCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);

            // Verificar se as tarefas existem
            var predecessorTask = await _tasksRepository.GetByIdAsync(command.PredecessorTaskId);
            var successorTask = await _tasksRepository.GetByIdAsync(command.SuccessorTaskId);

            if (predecessorTask == null)
                return new CommandResult("Tarefa predecessora não encontrada", HttpStatusCode.NotFound);

            if (successorTask == null)
                return new CommandResult("Tarefa sucessora não encontrada", HttpStatusCode.NotFound);

            // Verificar se já existe uma dependência entre essas tarefas
            var existingDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var isDuplicate = existingDependencies.Any(d => 
                d.PredecessorTaskId == command.PredecessorTaskId && 
                d.SuccessorTaskId == command.SuccessorTaskId);

            if (isDuplicate)
                return new CommandResult("Dependência já existe entre essas tarefas", HttpStatusCode.BadRequest);

            // Verificar dependência circular
            if (await HasCircularDependency(command.PredecessorTaskId, command.SuccessorTaskId))
                return new CommandResult("Esta dependência criaria um ciclo", HttpStatusCode.BadRequest);

            var entity = new TaskDependenciesEntity();
            _mapper.Map(command, entity);
            
            await _TaskDependenciesRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(UpdateTaskDependenciesCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);

            var entity = await _TaskDependenciesRepository.GetByIdAsync(command.Id);
            if (entity == null)
                return new CommandResult("Dependência não encontrada", HttpStatusCode.NotFound);

            // Verificar dependência circular apenas se as tarefas mudaram
            if (entity.PredecessorTaskId != command.PredecessorTaskId || 
                entity.SuccessorTaskId != command.SuccessorTaskId)
            {
                if (await HasCircularDependency(command.PredecessorTaskId, command.SuccessorTaskId))
                    return new CommandResult("Esta dependência criaria um ciclo", HttpStatusCode.BadRequest);
            }

            _mapper.Map(command, entity);
            await _TaskDependenciesRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }

        public async Task<ICommandResult> Handle(DeleteTaskDependencyCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);

            // Buscar a dependência existente
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var existingDependency = allDependencies.FirstOrDefault(d => 
                d.PredecessorTaskId == command.PredecessorTaskId && 
                d.SuccessorTaskId == command.SuccessorTaskId);

            if (existingDependency == null)
                return new CommandResult("Dependência não encontrada", HttpStatusCode.NotFound);

            _TaskDependenciesRepository.DeleteObject(existingDependency);
            _TaskDependenciesRepository.SaveChanges();
            return new CommandResult("Dependência removida com sucesso", HttpStatusCode.OK);
        }

        public async Task<ICommandResult> Handle(CreateTaskDependencyByTasksCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);

            // Verificar se as tarefas existem
            var predecessorTask = await _tasksRepository.GetByIdAsync(command.PredecessorTaskId);
            var successorTask = await _tasksRepository.GetByIdAsync(command.SuccessorTaskId);

            if (predecessorTask == null)
                return new CommandResult("Tarefa predecessora não encontrada", HttpStatusCode.NotFound);

            if (successorTask == null)
                return new CommandResult("Tarefa sucessora não encontrada", HttpStatusCode.NotFound);

            // Verificar se já existe uma dependência entre essas tarefas
            var existingDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var isDuplicate = existingDependencies.Any(d => 
                d.PredecessorTaskId == command.PredecessorTaskId && 
                d.SuccessorTaskId == command.SuccessorTaskId);

            if (isDuplicate)
                return new CommandResult("Dependência já existe entre essas tarefas", HttpStatusCode.BadRequest);

            // Verificar dependência circular
            if (await HasCircularDependency(command.PredecessorTaskId, command.SuccessorTaskId))
                return new CommandResult("Esta dependência criaria um ciclo", HttpStatusCode.BadRequest);

            var entity = new TaskDependenciesEntity();
            _mapper.Map(command, entity);
            
            await _TaskDependenciesRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }

        private async Task<bool> HasCircularDependency(Guid fromTaskId, Guid toTaskId)
        {
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var visited = new HashSet<Guid>();
            
            return HasCircularDependencyRecursive(toTaskId, fromTaskId, allDependencies, visited);
        }

        private bool HasCircularDependencyRecursive(
            Guid currentTaskId, 
            Guid targetTaskId, 
            IEnumerable<TaskDependenciesEntity> dependencies,
            HashSet<Guid> visited)
        {
            if (currentTaskId == targetTaskId)
                return true;

            if (visited.Contains(currentTaskId))
                return false;

            visited.Add(currentTaskId);

            var childDependencies = dependencies.Where(d => d.PredecessorTaskId == currentTaskId);
            
            foreach (var dependency in childDependencies)
            {
                if (HasCircularDependencyRecursive(dependency.SuccessorTaskId, targetTaskId, dependencies, visited))
                    return true;
            }

            return false;
        }
    }
}
