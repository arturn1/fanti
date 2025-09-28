using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class ProjectVersionHandler: IHandler<CreateProjectVersionCommand>, IHandler<UpdateProjectVersionCommand>
    {
        private readonly IProjectVersionRepository _ProjectVersionRepository;
        private readonly IMapper _mapper;
        public ProjectVersionHandler(IProjectVersionRepository ProjectVersionRepository, IMapper mapper)
        {
            _ProjectVersionRepository = ProjectVersionRepository;
            _mapper = mapper;
        }
        

        public async Task<ICommandResult> Handle(CreateProjectVersionCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            ProjectVersionEntity entity = new ();
            _mapper.Map(command, entity);

            await _ProjectVersionRepository.PostAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);
        }

        public async Task<ICommandResult> Handle(UpdateProjectVersionCommand command)
        {
            command.IsCommandValid();

            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }


            ProjectVersionEntity entity = await _ProjectVersionRepository.GetByIdAsync(command.Id);

            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);

            _mapper.Map(command, entity);

            await _ProjectVersionRepository.UpdateAsync(entity);

            return new CommandResult(entity, HttpStatusCode.Created);
            
        }

    }
}
