using System.Net;
using Domain.Commands;
using Domain.Commands.TasksCommands;
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
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class TasksController : BaseController
    {
        private readonly ITasksRepository _TasksRepository;
        public TasksController(ITasksRepository TasksRepository, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _TasksRepository = TasksRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _TasksRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _TasksRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTasksAsync([FromBody] CreateTasksCommand command, [FromServices] TasksHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateTasksAsync([FromBody] UpdateTasksCommand command, [FromServices] TasksHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateTaskFieldsAsync([FromBody] UpdateTaskFieldsCommand command, [FromServices] TasksHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }


        [HttpPost("subtask")]
        public async Task<IActionResult> CreateSubtaskAsync([FromBody] CreateSubtaskCommand command, [FromServices] TasksHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpGet("subtasks/{parentTaskId}")]
        public async Task<IActionResult> GetSubtasksByParentIdAsync(Guid parentTaskId)
        {
            var models = await _TasksRepository.GetAllAsync();
            var subtasks = models.Where(t => t.ParentTaskId == parentTaskId).ToList();

            return Ok(new CommandResult(subtasks, HttpStatusCode.OK));
        }

        [HttpGet("sprint/{sprintId}")]
        public async Task<IActionResult> GetSubtasksBySprintIdAsync(Guid sprintId)
        {
            var models = await _TasksRepository.GetAllAsync();
            var subtasks = models.Where(t => t.SprintId == sprintId).ToList();

            return Ok(new CommandResult(subtasks, HttpStatusCode.OK));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaskAsync(Guid id, [FromServices] TasksHandler handler)
        {
            var command = new DeleteTaskCommand(id);
            var handle = await handler.Handle(command);

            return Ok(handle);
        }
    }
}
