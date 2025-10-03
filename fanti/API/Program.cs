using API.Configurations;
using API.Middleware;
using Infrastructure.Configuration;
using OfficeOpenXml;

var builder = WebApplication.CreateBuilder(args);

// Configurar licença do EPPlus para uso não comercial
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

builder.Services.AddIoc();
builder.Services.AddControllers();

var configurationBuilder = new ConfigurationBuilder();
configurationBuilder.AddEnvironment(builder.Environment);
var configuration = configurationBuilder.Build();
builder.Services.AddSwagger(configuration);


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

string connectionString = Environment.GetEnvironmentVariable("APP_DATABASE_URL", EnvironmentVariableTarget.Machine) ?? builder.Configuration.GetConnectionString("DefaultConnectionMssql");
builder.Services.AddDatabaseConfiguration(connectionString);
builder.Services.AddJwtBearerAuthentication(builder.Configuration);

#region Builder
#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(builder =>
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader());

app.UseMiddleware<ErrorHandlingMiddleware>();
// app.UseMiddleware<ResponseCleaningMiddleware>();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

#region Apps
#endregion

app.Run();
