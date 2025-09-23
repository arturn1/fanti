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
    public class PeriodController : BaseController
    {
        private readonly IPeriodRepository _PeriodRepository;
        public PeriodController(IPeriodRepository PeriodRepository, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _PeriodRepository = PeriodRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _PeriodRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _PeriodRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]); 

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpPost]
        public async Task<IActionResult> CreatePeriodAsync([FromBody] CreatePeriodCommand command, [FromServices] PeriodHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePeriodAsync([FromBody] UpdatePeriodCommand command, [FromServices] PeriodHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(Guid id)
        {
            var entity = await _PeriodRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(_defaultDictionary.Response["NotFound"]); 
                
            _PeriodRepository.DeleteObject(entity);

            var result = new { data = "Removed success!!!" };

            return Ok(new CommandResult(result, HttpStatusCode.NoContent));
        }
    }
}