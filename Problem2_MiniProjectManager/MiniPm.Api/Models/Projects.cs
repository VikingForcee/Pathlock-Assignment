using System;
using System.Collections.Generic;

namespace MiniPm.Api.Models
{
    public class Project
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}
