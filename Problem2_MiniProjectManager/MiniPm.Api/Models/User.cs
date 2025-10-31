using System;
using System.Collections.Generic;

namespace MiniPm.Api.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
