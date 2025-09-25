using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace API.Middleware;

public class ResponseCleaningMiddleware
{
    private readonly RequestDelegate _next;

    public ResponseCleaningMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        var originalBodyStream = context.Response.Body;

        using (var responseBody = new MemoryStream())
        {
            context.Response.Body = responseBody;

            await _next(context);

            context.Response.Body.Seek(0, SeekOrigin.Begin);

            var responseText = await new StreamReader(context.Response.Body).ReadToEndAsync();

            if (context.Response.ContentType?.Contains("application/json") == true && !string.IsNullOrEmpty(responseText))
            {
                try
                {
                    var jObject = JObject.Parse(responseText);
                    CleanObject(jObject);
                    responseText = jObject.ToString();
                }
                catch
                {
                    // If parsing fails, leave as is
                }
            }

            context.Response.Body = originalBodyStream;
            await context.Response.WriteAsync(responseText);
        }
    }

    private void CleanObject(JObject jObject)
    {
        var propertiesToRemove = new[] { "created", "update", "errors", "isValid" };

        foreach (var prop in propertiesToRemove)
        {
            jObject.Remove(prop);
        }

        // Remove properties with null values
        var nullProps = jObject.Properties().Where(p => p.Value.Type == JTokenType.Null).ToList();
        foreach (var prop in nullProps)
        {
            prop.Remove();
        }

        // Recursively clean nested objects and arrays
        foreach (var property in jObject.Properties())
        {
            if (property.Value is JObject obj)
            {
                CleanObject(obj);
            }
            else if (property.Value is JArray array)
            {
                foreach (var item in array)
                {
                    if (item is JObject itemObj)
                    {
                        CleanObject(itemObj);
                    }
                }
            }
        }
    }
}