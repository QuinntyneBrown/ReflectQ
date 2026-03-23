using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReflectQ.Api.Models;
using ReflectQ.Infrastructure.Data;

namespace ReflectQ.Api.Controllers;

[ApiController]
[Route("api/questions/{questionId}/responses")]
[Authorize(Policy = "AdminOrAbove")]
public class QuestionResponsesController : ControllerBase
{
    private readonly ReflectQDbContext _db;

    public QuestionResponsesController(ReflectQDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// GET /api/questions/{questionId}/responses — list all responses ordered by timestamp desc.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetResponses(Guid questionId)
    {
        var questionExists = await _db.Questions.AnyAsync(q => q.Id == questionId);
        if (!questionExists)
            return NotFound(new { error = "Question not found." });

        var responses = await _db.Responses
            .Where(r => r.QuestionId == questionId)
            .OrderByDescending(r => r.SubmittedAt)
            .Select(r => new ResponseDto
            {
                Id = r.Id,
                QuestionId = r.QuestionId,
                Value = r.Value,
                SubmittedAt = r.SubmittedAt
            })
            .ToListAsync();

        return Ok(responses);
    }

    /// <summary>
    /// DELETE /api/questions/{questionId}/responses — clear all responses for a question.
    /// </summary>
    [HttpDelete]
    public async Task<IActionResult> ClearResponses(Guid questionId)
    {
        var questionExists = await _db.Questions.AnyAsync(q => q.Id == questionId);
        if (!questionExists)
            return NotFound(new { error = "Question not found." });

        var responses = await _db.Responses
            .Where(r => r.QuestionId == questionId)
            .ToListAsync();

        _db.Responses.RemoveRange(responses);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// GET /api/questions/{questionId}/responses/export — export responses as CSV.
    /// </summary>
    [HttpGet("export")]
    public async Task<IActionResult> ExportResponses(Guid questionId)
    {
        var questionExists = await _db.Questions.AnyAsync(q => q.Id == questionId);
        if (!questionExists)
            return NotFound(new { error = "Question not found." });

        var responses = await _db.Responses
            .Where(r => r.QuestionId == questionId)
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("ResponseId,Value,SubmittedAt");

        foreach (var r in responses)
        {
            var escapedValue = "\"" + r.Value.Replace("\"", "\"\"") + "\"";
            sb.AppendLine($"{r.Id},{escapedValue},{r.SubmittedAt:O}");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", $"responses-{questionId}.csv");
    }
}
