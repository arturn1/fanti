using Domain.Commands;
using Domain.Commands.Contracts;
using Domain.Entities;
using Domain.Handlers.Contracts;
using Domain.Helpers;
using Domain.Repositories;
using System.Net;

namespace Domain.Handlers
{
    public class ProjectsHandler: IHandler<CreateProjectsCommand>, IHandler<UpdateProjectsCommand>
    {
        private readonly IProjectsRepository _ProjectsRepository;
        private readonly IMapper _mapper;
        public ProjectsHandler(IProjectsRepository ProjectsRepository, IMapper mapper)
        {
            _ProjectsRepository = ProjectsRepository;
            _mapper = mapper;
        }
        
        public async Task<ICommandResult> Handle(CreateProjectsCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            ProjectsEntity entity = new ();
            _mapper.Map(command, entity);
            await _ProjectsRepository.PostAsync(entity);
            return new CommandResult(entity, HttpStatusCode.Created);
        }
        public async Task<ICommandResult> Handle(UpdateProjectsCommand command)
        {
            command.IsCommandValid();
            if (!command.isValid)
            {
                return new CommandResult(command.Errors, HttpStatusCode.BadRequest);
            }
            ProjectsEntity entity = await _ProjectsRepository.GetByIdAsync(command.Id);
            if (entity == null) return new CommandResult("Entity not found", HttpStatusCode.NotFound);
            // Atualizar apenas campos não-nulos
            _mapper.Map(command, entity);
            
            await _ProjectsRepository.UpdateAsync(entity);
            return new CommandResult(entity, HttpStatusCode.OK);
        }
    }
}
