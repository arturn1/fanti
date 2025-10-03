using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExcelUtilityLib;
using System.ComponentModel;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize]
public class ExcelController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new
        {
            message = "Excel API funcionando!",
            package = "ReadExcelByArthur v1.0.4",
            customColumn = Environment.GetEnvironmentVariable("EXCEL_CUSTOM_COLUMN") ?? "N/A",
            customColumnName = Environment.GetEnvironmentVariable("EXCEL_CUSTOM_COLUMN_NAME") ?? "CustomField"
        });
    }

    /// <summary>
    /// Converte JSON para arquivo Excel
    /// </summary>
    /// <param name="jsonData">Dados em formato JSON para conversão</param>
    /// <returns>Arquivo Excel (.xlsx)</returns>
    /// <response code="200">Retorna o arquivo Excel gerado</response>
    /// <response code="400">Erro na conversão ou JSON inválido</response>
    [HttpPost("json-para-excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(400)]
    public IActionResult JsonParaExcel([FromBody] object jsonData)
    {
        try
        {
            var jsonString = System.Text.Json.JsonSerializer.Serialize(jsonData);
            var excelBytes = ExcelHandler.GenerateExcelFromJson(jsonString, "Dados");

            return File(excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"dados-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    /// <summary>
    /// Gera arquivo Excel com dados de exemplo
    /// </summary>
    /// <returns>Arquivo Excel (.xlsx) com dados pré-definidos</returns>
    /// <response code="200">Retorna o arquivo Excel com dados de exemplo</response>
    /// <response code="500">Erro interno do servidor</response>
    [HttpPost("dados-para-excel")]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(500)]
    public IActionResult DadosParaExcel()
    {
        try
        {
            // Dados de exemplo
            var dados = new List<Dictionary<string, object>>
            {
                new() { {"Nome", "Arthur"}, {"Idade", 30}, {"Cidade", "São Paulo"} },
                new() { {"Nome", "Maria"}, {"Idade", 25}, {"Cidade", "Rio de Janeiro"} }
            };

            var excelBytes = ExcelHandler.GenerateExcelFromData(dados, "Funcionarios");
            return File(excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"funcionarios-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}
