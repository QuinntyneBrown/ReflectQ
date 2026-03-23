namespace ReflectQ.Domain.Entities;

public class Response
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Value { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    public Question Question { get; set; } = null!;
}
