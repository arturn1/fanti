using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class StaffHandler : IHandler<CreateStaffCommand>, IHandler<UpdateStaffCommand>
    {
        private readonly IStaffRepository _StaffRepository;
        private readonly IMapper _mapper;
        public StaffHandler(IStaffRepository StaffRepository, IMapper mapper)
        {
            _StaffRepository = StaffRepository;
            _mapper = mapper;
        }

        public async Task<ICommandResult> Handle(CreateStaffCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            StaffEntity entity = new();
            _mapper.Map(command, entity);
            await _StaffRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(UpdateStaffCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            StaffEntity entity = await _StaffRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);
            // Atualizar apenas campos não-nulos
            _mapper.Map(command, entity);

            await _StaffRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }
    }
}
