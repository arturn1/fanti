using System.Net;
using Domain.Commands;
using Domain.Entities;
using Domain.Handlers;
using Domain.Repositories;
using Application.Dictionary;
using API.Controllers.Contract;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskDependenciesController : BaseController
    {
        private readonly ITaskDependenciesRepository _TaskDependenciesRepository;
        public TaskDependenciesController(ITaskDependenciesRepository TaskDependenciesRepository, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _TaskDependenciesRepository = TaskDependenciesRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _TaskDependenciesRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _TaskDependenciesRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("taskDependencies/{taskId}")]
        public async Task<IActionResult> GetDependenciesByTaskIdAsync(Guid taskId)
        {
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var taskDependencies = allDependencies.Where(d =>
                d.PredecessorTaskId == taskId || d.SuccessorTaskId == taskId).ToList();

            return Ok(new CommandResult(taskDependencies, HttpStatusCode.OK));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTaskDependenciesAsync([FromBody] CreateTaskDependenciesCommand command, [FromServices] TaskDependenciesHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateTaskDependenciesAsync([FromBody] UpdateTaskDependenciesCommand command, [FromServices] TaskDependenciesHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpDelete]
        public async Task<IActionResult> RemoveTaskDependencyAsync([FromBody] DeleteTaskDependencyCommand command, [FromServices] TaskDependenciesHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

    }
}