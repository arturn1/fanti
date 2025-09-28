using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class PeriodStaffHandler : IHandler<CreatePeriodStaffCommand>, IHandler<UpdatePeriodStaffCommand>
    {
        private readonly IPeriodStaffRepository _PeriodStaffRepository;
        private readonly IMapper _mapper;
        public PeriodStaffHandler(IPeriodStaffRepository PeriodStaffRepository, IMapper mapper)
        {
            _PeriodStaffRepository = PeriodStaffRepository;
            _mapper = mapper;
        }


        public async Task<ICommandResult> Handle(CreatePeriodStaffCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            PeriodStaffEntity entity = new();
            _mapper.Map(command, entity);

            await _PeriodStaffRepository.PostAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);
        }

        public async Task<ICommandResult> Handle(UpdatePeriodStaffCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            PeriodStaffEntity entity = await _PeriodStaffRepository.GetByIdAsync(command.Id);

            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);

            _mapper.Map(command, entity);

            await _PeriodStaffRepository.UpdateAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);

        }

    }
}
