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
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class PeriodStaffController : BaseController
    {
        private readonly IPeriodStaffRepository _PeriodStaffRepository;
        public PeriodStaffController(IPeriodStaffRepository PeriodStaffRepository, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _PeriodStaffRepository = PeriodStaffRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _PeriodStaffRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _PeriodStaffRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("period/{id}")]
        public async Task<IActionResult> GetByPeriodIdAsync(Guid id)
        {
            var models = await _PeriodStaffRepository.GetByParamsAsync(x => x.PeriodId == id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("staff/{id}")]
        public async Task<IActionResult> GetByStaffIdAsync(Guid id)
        {
            var models = await _PeriodStaffRepository.GetByParamsAsync(x => x.StaffId == id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpPost]
        public async Task<IActionResult> CreatePeriodStaffAsync([FromBody] CreatePeriodStaffCommand command, [FromServices] PeriodStaffHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePeriodStaffAsync([FromBody] UpdatePeriodStaffCommand command, [FromServices] PeriodStaffHandler handler)
        {
            command.Id = Guid.Parse((string)RouteData.Values["id"]);
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(Guid id)
        {
            var entity = await _PeriodStaffRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(_defaultDictionary.Response["NotFound"]);

            _PeriodStaffRepository.DeleteObject(entity);

            var result = new { data = "Removed success!!!" };

            return Ok(new CommandResult(result, HttpStatusCode.NoContent));
        }
    }
}
