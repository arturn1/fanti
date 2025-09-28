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
        private readonly IHandler<CreatePeriodStaffCommand> _periodStaffHandler;
        private readonly IPeriodRepository _PeriodRepository;
        private readonly IMapper _mapper;
        private readonly IPeriodStaffRepository _periodStaffRepository;
        public PeriodHandler(IPeriodRepository PeriodRepository, IMapper mapper, IHandler<CreatePeriodStaffCommand> periodStaffHandler, IPeriodStaffRepository periodStaffRepository)
        {
            _PeriodRepository = PeriodRepository;
            _mapper = mapper;
            _periodStaffHandler = periodStaffHandler;
            _periodStaffRepository = periodStaffRepository;
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
            var v = entity;
            await _PeriodRepository.PostAsync(entity);

            // Create PeriodStaffEntity records if staff IDs provided
            if (command.Staffs != null && command.Staffs.Count > 0)
            {
                foreach (var staffId in command.Staffs)
                {
                    var commandStaff = new CreatePeriodStaffCommand(staffId, entity.ID, 0);
                    await _periodStaffHandler.Handle(commandStaff);
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

            _mapper.Map(command, entity);
            await _PeriodRepository.UpdateAsync(entity);

            // Sincronizar PeriodStaffs
            if (command.Staffs != null)
            {
                var existingPeriodStaffs = await _periodStaffRepository.GetAllByParamsAsync(x => x.PeriodId == entity.ID);
                var existingStaffIds = existingPeriodStaffs.Select(ps => ps.StaffId).ToList();
                var newStaffIds = command.Staffs;

                // Adicionar novos
                var toAdd = newStaffIds.Except(existingStaffIds).ToList();
                foreach (var staffId in toAdd)
                {
                    var commandStaff = new CreatePeriodStaffCommand(staffId, entity.ID, 0);
                    await _periodStaffHandler.Handle(commandStaff);
                }

                // Remover os que não estão mais
                var toRemove = existingStaffIds.Except(newStaffIds).ToList();
                foreach (var staffId in toRemove)
                {
                    var periodStaff = existingPeriodStaffs.FirstOrDefault(ps => ps.StaffId == staffId);
                    if (periodStaff != null)
                    {
                        _periodStaffRepository.DeleteObject(periodStaff);
                    }
                }
            }

            return new CommandResult(entity, HttpStatusCode.OK);
        }
    }
}
