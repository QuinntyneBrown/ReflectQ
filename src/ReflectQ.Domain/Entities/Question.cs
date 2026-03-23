using ReflectQ.Domain.Enums;

namespace ReflectQ.Domain.Entities;

public class Question
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public QuestionType Type { get; set; }
    public QuestionStatus Status { get; set; } = QuestionStatus.Draft;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<QuestionOption> Options { get; set; } = new();
    public List<Response> Responses { get; set; } = new();
}
