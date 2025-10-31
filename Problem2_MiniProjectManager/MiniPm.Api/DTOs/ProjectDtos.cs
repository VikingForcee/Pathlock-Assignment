using System;
using System.ComponentModel.DataAnnotations;

namespace MiniPm.Api.DTOs
{
    public class ProjectCreateDto
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = null!;
        [MaxLength(500)]
        public string? Description { get; set; }
    }

    public class ProjectDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
