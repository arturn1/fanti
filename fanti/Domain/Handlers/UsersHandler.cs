using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class UsersHandler: IHandler<CreateUsersCommand>, IHandler<UpdateUsersCommand>
    {
        private readonly IUsersRepository _UsersRepository;
        private readonly IMapper _mapper;
        public UsersHandler(IUsersRepository UsersRepository, IMapper mapper)
        {
            _UsersRepository = UsersRepository;
            _mapper = mapper;
        }
        
        public async Task<ICommandResult> Handle(CreateUsersCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            UsersEntity entity = new ();
            _mapper.Map(command, entity);
            await _UsersRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(UpdateUsersCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            UsersEntity entity = await _UsersRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);
            // Atualizar apenas campos não-nulos
            
            await _UsersRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }
    }
}
