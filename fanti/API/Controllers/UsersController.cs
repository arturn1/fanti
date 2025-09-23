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
    public class UsersController : BaseController
    {
        private readonly IUsersRepository _UsersRepository;
        public UsersController(IUsersRepository UsersRepository, DefaultDictionary defaultDictionary) : base(defaultDictionary)
        {
            _UsersRepository = UsersRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAsync()
        {
            var models = await _UsersRepository.GetAllAsync();

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
        {
            var models = await _UsersRepository.GetByIdAsync(id);
            if (models == null) return NotFound(_defaultDictionary.Response["NotFound"]); 

            return Ok(new CommandResult(models, HttpStatusCode.OK));
        }

        [HttpPost]
        public async Task<IActionResult> CreateUsersAsync([FromBody] CreateUsersCommand command, [FromServices] UsersHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateUsersAsync([FromBody] UpdateUsersCommand command, [FromServices] UsersHandler handler)
        {
            var handle = await handler.Handle(command);

            return Ok(handle);
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteByIdAsync(Guid id)
        {
            var entity = await _UsersRepository.GetByIdAsync(id);
            if (entity == null) return NotFound(_defaultDictionary.Response["NotFound"]); 
                
            _UsersRepository.DeleteObject(entity);

            var result = new { data = "Removed success!!!" };

            return Ok(new CommandResult(result, HttpStatusCode.NoContent));
        }
    }
}