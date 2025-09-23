using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class TeamHandler : IHandler<CreateTeamCommand>, IHandler<UpdateTeamCommand>
    {
        private readonly ITeamRepository _TeamRepository;
        private readonly IMapper _mapper;
        public TeamHandler(ITeamRepository TeamRepository, IMapper mapper)
        {
            _TeamRepository = TeamRepository;
            _mapper = mapper;
        }

        public async Task<ICommandResult> Handle(CreateTeamCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            TeamEntity entity = new();
            _mapper.Map(command, entity);
            await _TeamRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(UpdateTeamCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            TeamEntity entity = await _TeamRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);
            // Atualizar apenas campos não-nulos
            _mapper.Map(command, entity);

            await _TeamRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }
    }
}
