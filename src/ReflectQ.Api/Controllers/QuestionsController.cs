using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReflectQ.Api.Models;
using ReflectQ.Domain.Entities;
using ReflectQ.Domain.Enums;
using ReflectQ.Infrastructure.Data;

namespace ReflectQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOrAbove")]
public class QuestionsController : ControllerBase
{
    private readonly ReflectQDbContext _db;

    public QuestionsController(ReflectQDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// L2-08.1: GET /api/questions — paginated list with search, sort, and archive filter.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<QuestionResponse>>> GetQuestions(
        [FromQuery] string? search = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool includeArchived = false)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 1;
        if (pageSize > 100) pageSize = 100;

        IQueryable<Question> query = _db.Questions.Include(q => q.Options);

        // Exclude archived unless explicitly requested
        if (!includeArchived)
        {
            query = query.Where(q => q.Status != QuestionStatus.Archived);
        }

        // Search by title (case-insensitive)
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(q => q.Title.ToLower().Contains(search.ToLower()));
        }

        // Sorting
        var isDescending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        query = sortBy?.ToLowerInvariant() switch
        {
            "title" => isDescending ? query.OrderByDescending(q => q.Title) : query.OrderBy(q => q.Title),
            "status" => isDescending ? query.OrderByDescending(q => q.Status) : query.OrderBy(q => q.Status),
            "createdat" => isDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt),
            _ => query.OrderByDescending(q => q.CreatedAt) // default sort
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new PagedResult<QuestionResponse>
        {
            Items = items.Select(MapToResponse).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    /// <summary>
    /// L2-08.2: GET /api/questions/{id} — single question with options.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuestionResponse>> GetQuestion(Guid id)
    {
        var question = await _db.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question is null)
        {
            return NotFound();
        }

        return Ok(MapToResponse(question));
    }

    /// <summary>
    /// L2-08.3: POST /api/questions — create question.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<QuestionResponse>> CreateQuestion([FromBody] CreateQuestionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var question = new Question
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Body = request.Body,
            Type = request.Type,
            Status = QuestionStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Options is { Count: > 0 })
        {
            question.Options = request.Options.Select(o => new QuestionOption
            {
                Id = Guid.NewGuid(),
                QuestionId = question.Id,
                Text = o.Text,
                SortOrder = o.SortOrder
            }).ToList();
        }

        _db.Questions.Add(question);
        await _db.SaveChangesAsync();

        var response = MapToResponse(question);

        return CreatedAtAction(nameof(GetQuestion), new { id = question.Id }, response);
    }

    /// <summary>
    /// L2-08.4: PUT /api/questions/{id} — update question.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<QuestionResponse>> UpdateQuestion(Guid id, [FromBody] UpdateQuestionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var question = await _db.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question is null)
        {
            return NotFound();
        }

        if (request.Title is not null)
        {
            question.Title = request.Title;
        }

        if (request.Body is not null)
        {
            question.Body = request.Body;
        }

        if (request.Type.HasValue)
        {
            question.Type = request.Type.Value;
        }

        if (request.Options is not null)
        {
            // Remove existing options that are not in the update
            var incomingIds = request.Options
                .Where(o => o.Id.HasValue)
                .Select(o => o.Id!.Value)
                .ToHashSet();

            var optionsToRemove = question.Options
                .Where(o => !incomingIds.Contains(o.Id))
                .ToList();

            _db.QuestionOptions.RemoveRange(optionsToRemove);

            foreach (var optionRequest in request.Options)
            {
                if (optionRequest.Id.HasValue)
                {
                    // Update existing option
                    var existing = question.Options.FirstOrDefault(o => o.Id == optionRequest.Id.Value);
                    if (existing is not null)
                    {
                        existing.Text = optionRequest.Text;
                        existing.SortOrder = optionRequest.SortOrder;
                    }
                }
                else
                {
                    // Add new option
                    question.Options.Add(new QuestionOption
                    {
                        Id = Guid.NewGuid(),
                        QuestionId = question.Id,
                        Text = optionRequest.Text,
                        SortOrder = optionRequest.SortOrder
                    });
                }
            }
        }

        question.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(MapToResponse(question));
    }

    /// <summary>
    /// L2-08.5: PUT /api/questions/{id}/activate — set Active, deactivate any other active question.
    /// </summary>
    [HttpPut("{id:guid}/activate")]
    public async Task<ActionResult<QuestionResponse>> ActivateQuestion(Guid id)
    {
        var question = await _db.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question is null)
        {
            return NotFound();
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            // Deactivate any currently active questions
            var activeQuestions = await _db.Questions
                .Where(q => q.Status == QuestionStatus.Active && q.Id != id)
                .ToListAsync();

            foreach (var active in activeQuestions)
            {
                active.Status = QuestionStatus.Draft;
                active.UpdatedAt = DateTime.UtcNow;
            }

            question.Status = QuestionStatus.Active;
            question.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return Ok(MapToResponse(question));
    }

    /// <summary>
    /// L2-08.6: PUT /api/questions/{id}/archive — set Archived.
    /// </summary>
    [HttpPut("{id:guid}/archive")]
    public async Task<ActionResult<QuestionResponse>> ArchiveQuestion(Guid id)
    {
        var question = await _db.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (question is null)
        {
            return NotFound();
        }

        question.Status = QuestionStatus.Archived;
        question.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(MapToResponse(question));
    }

    private static QuestionResponse MapToResponse(Question question)
    {
        return new QuestionResponse
        {
            Id = question.Id,
            Title = question.Title,
            Body = question.Body,
            Type = question.Type,
            Status = question.Status,
            CreatedAt = question.CreatedAt,
            UpdatedAt = question.UpdatedAt,
            Options = question.Options
                .OrderBy(o => o.SortOrder)
                .Select(o => new QuestionOptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    SortOrder = o.SortOrder
                })
                .ToList()
        };
    }
}
