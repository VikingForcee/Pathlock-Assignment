using Microsoft.EntityFrameworkCore;
using MiniPm.Api.Models;

namespace MiniPm.Api.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<TaskItem> Tasks => Set<TaskItem>();

        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        protected override void OnModelCreating(ModelBuilder mb)
        {
            mb.Entity<User>().HasIndex(u => u.Email).IsUnique();
            mb.Entity<Project>().HasOne(p => p.User).WithMany(u => u.Projects).HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
            mb.Entity<TaskItem>().HasOne(t => t.Project).WithMany(p => p.Tasks).HasForeignKey(t => t.ProjectId).OnDelete(DeleteBehavior.Cascade);
            base.OnModelCreating(mb);
        }
    }
}
