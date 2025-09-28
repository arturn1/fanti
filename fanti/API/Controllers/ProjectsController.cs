using System.Net;
using Domain.Commands;
using Domain.Handlers;
using Domain.Repositories;
using Application.Dictionary;
using API.Controllers.Contract;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : BaseController
    {
        private readonly IProjectsRepository _ProjectsRepository;
        private readonly IProjectVersionRepository _ProjectVersionRepository;

        public ProjectsController(
            IProjectsRepository ProjectsRepository,
            IProjectVersionRepository ProjectVersionRepository,
            DefaultDictionary defaultDictionary
        ) : base(defaultDictionary)
        {
            _ProjectsRepository = ProjectsRepository;
            _ProjectVersionRepository = ProjectVersionRepository;
        }
        
        [HttpGet("with-versions")]
        public async Task<IActionResult> GetAllWithVersionsAsync()
        {
            var projects = await _ProjectsRepository.GetAllAsync();
            var versions = await _ProjectVersionRepository.GetAllAsync();

            var result = projects.Select(p => new ProjectWithVersionsDto
            {
                Id = p.ID,
                Name = p.Name,
                Description = p.Description,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status,
                url = p.url,
                Versions = versions
                    .Where(v => v.ProjectId == p.ID)
                    .Select(v => new ProjectVersionDto
                    {
                        Id = v.ID,
                        Version = v.Version,
                        DeployDate = v.DeployDate
                    })
                    .ToList()
            }).ToList();

            return Ok(new CommandResult(result, HttpStatusCode.OK));
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _ProjectsRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _ProjectsRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpPost]
        public async Task<IActionResult> CreateProjectsAsync([FromBody] CreateProjectsCommand command, [FromServices] ProjectsHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProjectsAsync([FromBody] UpdateProjectsCommand command, [FromServices] ProjectsHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(Guid id)
        {
            var entity = await _ProjectsRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            _ProjectsRepository.DeleteObject(entity);

            var result = new { data = "Removed success!!!" };

            return Ok(new CommandResult(result, HttpStatusCode.NoContent));
        }
    }
}