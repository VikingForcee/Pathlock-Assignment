using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniPm.Api.Data;
using MiniPm.Api.Models;
using MiniPm.Api.DTOs;
using System.Security.Claims;

namespace MiniPm.Api.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // Helper to get current user
        private Guid CurrentUserId
        {
            get
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(claim))
                    throw new UnauthorizedAccessException("User ID not found in token");
                return Guid.Parse(claim);
            }
        }

        // ✅ Get all tasks for a given project
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid projectId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == CurrentUserId);

            if (project == null)
                return Forbid("You do not own this project");

            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();

            return Ok(tasks);
        }

        // ✅ Add a new task to a project
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskCreateDto dto)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Title))
                    return BadRequest("Task title is required");

                // Check if project exists and user owns it
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == dto.ProjectId && p.UserId == CurrentUserId);

                if (project == null)
                    return NotFound("Project not found or you don't have access");

                var task = new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = dto.Title,
                    DueDate = dto.DueDate,
                    IsCompleted = false,
                    ProjectId = dto.ProjectId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();
                
                return Ok(task);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Error creating task: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "Failed to create task", details = ex.Message });
            }
        }

        // ✅ Toggle completion (PATCH method)
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id && t.Project.UserId == CurrentUserId);

                if (task == null)
                    return NotFound("Task not found");

                task.IsCompleted = !task.IsCompleted;
                await _context.SaveChangesAsync();

                return Ok(task);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error toggling task: {ex.Message}");
                return StatusCode(500, new { error = "Failed to toggle task", details = ex.Message });
            }
        }

        // ✅ Update task (PUT method)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] TaskUpdateDto dto)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id && t.Project.UserId == CurrentUserId);

                if (task == null)
                    return NotFound("Task not found");

                // Update fields
                if (!string.IsNullOrWhiteSpace(dto.Title))
                    task.Title = dto.Title;
                
                task.DueDate = dto.DueDate;
                task.IsCompleted = dto.IsCompleted;

                await _context.SaveChangesAsync();
                return Ok(task);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating task: {ex.Message}");
                return StatusCode(500, new { error = "Failed to update task", details = ex.Message });
            }
        }

        // ✅ Delete a task
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id && t.Project.UserId == CurrentUserId);

                if (task == null)
                    return NotFound("Task not found");

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting task: {ex.Message}");
                return StatusCode(500, new { error = "Failed to delete task", details = ex.Message });
            }
        }
    }
}