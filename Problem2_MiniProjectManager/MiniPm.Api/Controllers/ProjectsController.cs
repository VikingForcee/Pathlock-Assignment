using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniPm.Api.Data;
using MiniPm.Api.DTOs;
using MiniPm.Api.Models;
using MiniPm.Api.Services;
using System.IdentityModel.Tokens.Jwt;


[Authorize]
[ApiController]
[Route("api/v1/projects")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ISchedulerService _scheduler;

    public ProjectsController(AppDbContext db, ISchedulerService scheduler) { _db = db; _scheduler = scheduler; }

    private Guid CurrentUserId
    {
        get
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

            if (string.IsNullOrEmpty(idClaim))
                throw new UnauthorizedAccessException("User ID claim missing in token.");

            return Guid.Parse(idClaim);
        }
    }


    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.Projects
            .Where(p => p.UserId == CurrentUserId)
            .Select(p => new ProjectDto { Id = p.Id, Title = p.Title, Description = p.Description, CreatedAt = p.CreatedAt })
            .ToListAsync();
        return Ok(projects);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ProjectCreateDto dto)
    {
        var project = new Project { Id = Guid.NewGuid(), UserId = CurrentUserId, Title = dto.Title, Description = dto.Description };
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, new ProjectDto { Id = project.Id, Title = project.Title, Description = project.Description, CreatedAt = project.CreatedAt });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var project = await _db.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == id && p.UserId == CurrentUserId);
        if (project == null) return NotFound();
        // map to DTO including tasks
        var tasks = project.Tasks.Select(t => new TaskDto { Id = t.Id, Title = t.Title, DueDate = t.DueDate, IsCompleted = t.IsCompleted, CreatedAt = t.CreatedAt }).ToList();
        return Ok(new { Id = project.Id, Title = project.Title, Description = project.Description, CreatedAt = project.CreatedAt, Tasks = tasks });
    }

    // ✅ NEW: Delete a project
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == CurrentUserId);
        if (project == null) return NotFound("Project not found");

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        
        return NoContent();
    }

    [HttpPost("{projectId}/schedule")]
    public async Task<IActionResult> Schedule(Guid projectId, [FromBody] SchedulerRequestDto req)
    {
        var project = await _db.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == CurrentUserId);
        if (project == null) return NotFound();
        var result = _scheduler.GenerateSchedule(project.Tasks, req);
        result.ProjectId = project.Id;
        return Ok(result);
    }
}