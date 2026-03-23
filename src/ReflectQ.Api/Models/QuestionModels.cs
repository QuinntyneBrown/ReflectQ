using System.ComponentModel.DataAnnotations;
using ReflectQ.Domain.Enums;

namespace ReflectQ.Api.Models;

public class CreateQuestionRequest
{
    [Required]
    [StringLength(500)]
    public string Title { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Body { get; set; }

    [Required]
    public QuestionType Type { get; set; }

    public List<CreateQuestionOptionRequest>? Options { get; set; }
}

public class CreateQuestionOptionRequest
{
    [Required]
    [StringLength(500)]
    public string Text { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class UpdateQuestionRequest
{
    [StringLength(500)]
    public string? Title { get; set; }

    [StringLength(2000)]
    public string? Body { get; set; }

    public QuestionType? Type { get; set; }

    public List<UpdateQuestionOptionRequest>? Options { get; set; }
}

public class UpdateQuestionOptionRequest
{
    public Guid? Id { get; set; }

    [Required]
    [StringLength(500)]
    public string Text { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class QuestionResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public QuestionType Type { get; set; }
    public QuestionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<QuestionOptionDto> Options { get; set; } = new();
}

public class QuestionOptionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
