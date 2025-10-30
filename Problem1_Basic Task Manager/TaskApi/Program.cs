using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TaskApi.Models;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Allow JSON serializer options (optional)
builder.Services.Configure<JsonOptions>(options =>
{
    // Ensure all JSON property names are camelCase (frontend-friendly)
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
});

// Simple in-memory list registered as a singleton service
builder.Services.AddSingleton<ITaskRepository, InMemoryTaskRepository>();

// Allow CORS so frontend (running on another port) can call API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5173",
                "https://localhost:5174") // change port if your frontend uses different port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowLocalhost");

// Define endpoints
app.MapGet("/api/tasks", (ITaskRepository repo) =>
{
    return Results.Ok(repo.GetAll());
});

app.MapGet("/api/tasks/{id:int}", (int id, ITaskRepository repo) =>
{
    var item = repo.Get(id);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

app.MapPost("/api/tasks", async (TaskCreateDto dto, ITaskRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
        return Results.BadRequest(new { error = "Title is required" });

    var created = repo.Create(new TaskItem
    {
        Title = dto.Title,
        Description = dto.Description
    });

    return Results.Created($"/api/tasks/{created.Id}", created);
});

app.MapPut("/api/tasks/{id:int}/toggle", (int id, ITaskRepository repo) =>
{
    var toggled = repo.ToggleCompleted(id);
    return toggled is null ? Results.NotFound() : Results.Ok(toggled);
});

app.MapDelete("/api/tasks/{id:int}", (int id, ITaskRepository repo) =>
{
    var ok = repo.Delete(id);
    return ok ? Results.NoContent() : Results.NotFound();
});

app.Run();

// DTOs and repository interfaces/impl
public record TaskCreateDto(string Title, string? Description);

public interface ITaskRepository
{
    IEnumerable<TaskItem> GetAll();
    TaskItem? Get(int id);
    TaskItem Create(TaskItem item);
    TaskItem? ToggleCompleted(int id);
    bool Delete(int id);
}

// Very simple thread-safe in-memory repo
public class InMemoryTaskRepository : ITaskRepository
{
    private readonly List<TaskItem> _items = new();
    private int _nextId = 1;
    private readonly object _lock = new();

    public IEnumerable<TaskItem> GetAll()
    {
        lock (_lock) return _items.OrderByDescending(i => i.CreatedAt).ToList();
    }

    public TaskItem? Get(int id)
    {
        lock (_lock) return _items.FirstOrDefault(i => i.Id == id);
    }

    public TaskItem Create(TaskItem item)
    {
        lock (_lock)
        {
            item.Id = _nextId++;
            item.CreatedAt = DateTime.UtcNow;
            _items.Add(item);
            return item;
        }
    }

    public TaskItem? ToggleCompleted(int id)
    {
        lock (_lock)
        {
            var it = _items.FirstOrDefault(i => i.Id == id);
            if (it is null) return null;
            it.IsCompleted = !it.IsCompleted;
            return it;
        }
    }

    public bool Delete(int id)
    {
        lock (_lock)
        {
            var it = _items.FirstOrDefault(i => i.Id == id);
            if (it is null) return false;
            _items.Remove(it);
            return true;
        }
    }
}
