using System.ComponentModel.DataAnnotations;

namespace ReflectQ.Api.Models;

public class SubmitResponseRequest
{
    [Required]
    public Guid QuestionId { get; set; }

    [Required]
    [StringLength(2000)]
    public string Value { get; set; } = string.Empty;
}

public class ResponseDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Value { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
}
