using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class TasksPeriodHandler: IHandler<CreateTasksPeriodCommand>, IHandler<UpdateTasksPeriodCommand>
    {
        private readonly ITasksPeriodRepository _TasksPeriodRepository;
        private readonly IMapper _mapper;
        public TasksPeriodHandler(ITasksPeriodRepository TasksPeriodRepository, IMapper mapper)
        {
            _TasksPeriodRepository = TasksPeriodRepository;
            _mapper = mapper;
        }
        

        public async Task<ICommandResult> Handle(CreateTasksPeriodCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            TasksPeriodEntity entity = new ();
            _mapper.Map(command, entity);

            await _TasksPeriodRepository.PostAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);
        }

        public async Task<ICommandResult> Handle(UpdateTasksPeriodCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            TasksPeriodEntity entity = await _TasksPeriodRepository.GetByIdAsync(command.Id);

            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);

            _mapper.Map(command, entity);

            await _TasksPeriodRepository.UpdateAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);
            
        }

    }
}
