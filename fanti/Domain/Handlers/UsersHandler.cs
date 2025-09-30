using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class UsersHandler : IHandler<CreateUsersCommand>, IHandler<UpdateUsersCommand>
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
            try
            {
                command.IsCommandValid();
                if (!command.isValid)
                {
                    return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
                }

                var allUsers = await _UsersRepository.GetAllAsync();
                if (allUsers.Any(u => u.Email == command.Email))
                {
                    var existingUser = allUsers.First(u => u.Email == command.Email);
                    // Lógica para lidar com usuário existente
                    if (command.Info != null)
                    {
                        existingUser.Info = new UserInfo();
                        _mapper.Map(command.Info, existingUser.Info);
                        command.Info = null; // Evita mapeamento duplicado
                    }
                    _mapper.Map(command, existingUser);
                    existingUser.setUpdate(DateTime.UtcNow);
                    await _UsersRepository.UpdateAsync(existingUser);
                    return new CommandResult(existingUser, HttpStatusCode.Created);
                }

                UsersEntity entity = new();
                // Corrige o mapeamento do Info (UserInfo) manualmente se necessário
                if (command.Info != null)
                {
                    entity.Info = new UserInfo();
                    _mapper.Map(command.Info, entity.Info);
                    command.Info = null; // Evita mapeamento duplicado
                }
                _mapper.Map(command, entity);
                await _UsersRepository.PostAsync(entity);
                return new CommandResult(entity, HttpStatusCode.Created);
            }
            catch (System.Exception e)
            {

                throw;
            }
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
