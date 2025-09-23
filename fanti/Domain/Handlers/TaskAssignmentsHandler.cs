using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class TaskAssignmentsHandler: IHandler<CreateTaskAssignmentsCommand>, IHandler<UpdateTaskAssignmentsCommand>, IHandler<GetTaskAssignmentsByTaskIdCommand>
    {
        private readonly ITaskAssignmentsRepository _TaskAssignmentsRepository;
        private readonly IMapper _mapper;
        public TaskAssignmentsHandler(ITaskAssignmentsRepository TaskAssignmentsRepository, IMapper mapper)
        {
            _TaskAssignmentsRepository = TaskAssignmentsRepository;
            _mapper = mapper;
        }
        
        public async Task<ICommandResult> Handle(CreateTaskAssignmentsCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            TaskAssignmentsEntity entity = new ();
            _mapper.Map(command, entity);
            await _TaskAssignmentsRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(UpdateTaskAssignmentsCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            TaskAssignmentsEntity entity = await _TaskAssignmentsRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);
            // Atualizar apenas campos não-nulos
            
            await _TaskAssignmentsRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }

        public async Task<ICommandResult> Handle(GetTaskAssignmentsByTaskIdCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }

            var assignments = await _TaskAssignmentsRepository.GetAllByParamsAsync(x => x.TaskId.ID == command.TaskId);
            return new CommandResult(assignments, HttpStatusCode.OK);
        }
    }
}
