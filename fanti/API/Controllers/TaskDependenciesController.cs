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

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetByTaskIdAsync(Guid taskId)
        {
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var taskDependencies = allDependencies.Where(d =>
                d.PredecessorTaskId == taskId || d.SuccessorTaskId == taskId).ToList();

            return Ok(new CommandResult(taskDependencies, HttpStatusCode.OK));
        }

        [HttpGet("validate")]
        public async Task<IActionResult> ValidateDependencyAsync(Guid fromTaskId, Guid toTaskId)
        {
            // Verificar se as tarefas são iguais
            if (fromTaskId == toTaskId)
                return Ok(new CommandResult(new { isValid = false, reason = "Uma tarefa não pode depender de si mesma" }, HttpStatusCode.OK));

            // Verificar se já existe a dependência
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var exists = allDependencies.Any(d => d.PredecessorTaskId == fromTaskId && d.SuccessorTaskId == toTaskId);

            if (exists)
                return Ok(new CommandResult(new { isValid = false, reason = "Dependência já existe" }, HttpStatusCode.OK));

            // Verificar dependência circular (implementação simples)
            var wouldCreateCycle = allDependencies.Any(d =>
                d.PredecessorTaskId == toTaskId && d.SuccessorTaskId == fromTaskId);

            if (wouldCreateCycle)
                return Ok(new CommandResult(new { isValid = false, reason = "Criaria dependência circular" }, HttpStatusCode.OK));

            return Ok(new CommandResult(new { isValid = true }, HttpStatusCode.OK));
        }

        [HttpGet("chain/{taskId}")]
        public async Task<IActionResult> GetDependencyChainAsync(Guid taskId)
        {
            var allDependencies = await _TaskDependenciesRepository.GetAllAsync();
            var chain = new List<TaskDependenciesEntity>();
            var visited = new HashSet<Guid>();

            BuildDependencyChain(taskId, allDependencies, chain, visited);

            return Ok(new CommandResult(chain, HttpStatusCode.OK));
        }

        private void BuildDependencyChain(Guid taskId, IEnumerable<TaskDependenciesEntity> allDependencies, List<TaskDependenciesEntity> chain, HashSet<Guid> visited)
        {
            if (visited.Contains(taskId))
                return;

            visited.Add(taskId);

            var dependencies = allDependencies.Where(d => d.PredecessorTaskId == taskId || d.SuccessorTaskId == taskId);

            foreach (var dependency in dependencies)
            {
                if (!chain.Contains(dependency))
                {
                    chain.Add(dependency);
                    var nextTaskId = dependency.PredecessorTaskId == taskId ? dependency.SuccessorTaskId : dependency.PredecessorTaskId;
                    BuildDependencyChain(nextTaskId, allDependencies, chain, visited);
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTaskDependenciesAsync([FromBody] CreateTaskDependenciesCommand command, [FromServices] TaskDependenciesHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPost("simple")]
        public async Task<IActionResult> CreateSimpleTaskDependencyAsync([FromBody] CreateTaskDependencyByTasksCommand command, [FromServices] TaskDependenciesHandler handler)
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

        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveTaskDependencyAsync([FromBody] DeleteTaskDependencyCommand command, [FromServices] TaskDependenciesHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(Guid id)
        {
            var entity = await _TaskDependenciesRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            _TaskDependenciesRepository.DeleteObject(entity);

            var result = new { data = "Removed success!!!" };

            return Ok(new CommandResult(result, HttpStatusCode.NoContent));
        }
    }
}