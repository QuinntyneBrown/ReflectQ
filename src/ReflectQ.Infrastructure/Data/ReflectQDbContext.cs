using Microsoft.EntityFrameworkCore;
using ReflectQ.Domain.Entities;

namespace ReflectQ.Infrastructure.Data;

public class ReflectQDbContext : DbContext
{
    public ReflectQDbContext(DbContextOptions<ReflectQDbContext> options) : base(options) { }

    public DbSet<Question> Questions => Set<Question>();
    public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
    public DbSet<Response> Responses => Set<Response>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(q => q.Id);
            entity.Property(q => q.Title).IsRequired().HasMaxLength(500);
            entity.Property(q => q.Body).HasMaxLength(2000);
            entity.Property(q => q.Type).HasConversion<string>().HasMaxLength(50);
            entity.Property(q => q.Status).HasConversion<string>().HasMaxLength(50);
            entity.HasMany(q => q.Options).WithOne(o => o.Question).HasForeignKey(o => o.QuestionId).OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(q => q.Responses).WithOne(r => r.Question).HasForeignKey(r => r.QuestionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.Text).IsRequired().HasMaxLength(500);
        });

        modelBuilder.Entity<Response>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Value).IsRequired().HasMaxLength(2000);
            entity.HasIndex(r => r.QuestionId);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Name).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(50);
            entity.Property(u => u.Status).HasConversion<string>().HasMaxLength(50);
        });
    }
}
