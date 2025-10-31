using System;
using System.ComponentModel.DataAnnotations;

namespace MiniPm.Api.DTOs
{
    // For creating a new task
    public class TaskCreateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }

        [Required]
        public Guid ProjectId { get; set; }
    }

    // For updating an existing task
    public class TaskUpdateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }

        public bool IsCompleted { get; set; }
    }

    // For returning task data
    public class TaskDto
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }

        public bool IsCompleted { get; set; }

        [Required]
        public Guid ProjectId { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}