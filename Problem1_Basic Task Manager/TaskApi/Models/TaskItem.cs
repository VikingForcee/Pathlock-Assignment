namespace TaskApi.Models
{
    public class TaskItem
    {
        public int Id { get; set; }                 // integer id for simplicity
        public string Title { get; set; } = "";    // short title
        public string? Description { get; set; }   // optional description
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
