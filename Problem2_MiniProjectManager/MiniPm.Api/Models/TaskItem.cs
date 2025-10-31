using System;

namespace MiniPm.Api.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public string Title { get; set; } = null!;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Project Project { get; set; } = null!;
        // optional: public double EstimatedHours { get; set; } = 1.0;
    }
}
