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
    public class TaskAssignmentsController : BaseController
    {
        private readonly ITaskAssignmentsRepository _TaskAssignmentsRepository;
        public TaskAssignmentsController(ITaskAssignmentsRepository TaskAssignmentsRepository, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _TaskAssignmentsRepository = TaskAssignmentsRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _TaskAssignmentsRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _TaskAssignmentsRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]); 

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetByTaskIdAsync(Guid taskId, [FromServices] TaskAssignmentsHandler handler)
        {
            var command = new GetTaskAssignmentsByTaskIdCommand(taskId);
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTaskAssignmentsAsync([FromBody] CreateTaskAssignmentsCommand command, [FromServices] TaskAssignmentsHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateTaskAssignmentsAsync([FromBody] UpdateTaskAssignmentsCommand command, [FromServices] TaskAssignmentsHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(Guid id)
        {
            var entity = await _TaskAssignmentsRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(_defaultDictionary.Response["NotFound"]); 
                
            _TaskAssignmentsRepository.DeleteObject(entity);

            var result = new { data = "Removed success!!!" };

            return Ok(new CommandResult(result, HttpStatusCode.NoContent));
        }
    }
}