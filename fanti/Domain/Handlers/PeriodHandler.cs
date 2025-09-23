using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class PeriodHandler : IHandler<CreatePeriodCommand>, IHandler<UpdatePeriodCommand>
    {
        private readonly IPeriodRepository _PeriodRepository;
        private readonly IPeriodStaffRepository _PeriodStaffRepository;
        private readonly IMapper _mapper;
        public PeriodHandler(IPeriodRepository PeriodRepository, IPeriodStaffRepository PeriodStaffRepository, IMapper mapper)
        {
            _PeriodRepository = PeriodRepository;
            _PeriodStaffRepository = PeriodStaffRepository;
            _mapper = mapper;
        }

        public async Task<ICommandResult> Handle(CreatePeriodCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            PeriodEntity entity = new();
            _mapper.Map(command, entity);
            await _PeriodRepository.PostAsync(entity);

            // Create PeriodStaffEntity records if staff IDs provided
            if (command.Staffs != null && command.Staffs.Count > 0)
            {
                foreach (var staffId in command.Staffs)
                {
                    var periodStaff = new PeriodStaffEntity
                    {
                        PeriodId = entity.ID,
                        StaffId = staffId,
                        TotalHours = 0,
                        TaskNumber = 0
                    };
                    await _PeriodStaffRepository.PostAsync(periodStaff);
                }
            }

            return new CommandResult(entity, HttpStatusCode.Created);
        }

        public async Task<ICommandResult> Handle(UpdatePeriodCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            PeriodEntity entity = await _PeriodRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);
            // Atualizar apenas campos não-nulos

            await _PeriodRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }
    }
}
