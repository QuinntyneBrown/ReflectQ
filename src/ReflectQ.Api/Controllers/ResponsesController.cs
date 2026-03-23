using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ReflectQ.Api.Hubs;
using ReflectQ.Api.Models;
using ReflectQ.Domain.Entities;
using ReflectQ.Domain.Enums;
using ReflectQ.Infrastructure.Data;

namespace ReflectQ.Api.Controllers;

[ApiController]
[Route("api/responses")]
public class ResponsesController : ControllerBase
{
    private readonly ReflectQDbContext _db;
    private readonly IHubContext<ResponseHub> _hubContext;

    public ResponsesController(ReflectQDbContext db, IHubContext<ResponseHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    /// <summary>
    /// POST /api/responses — submit a response to an active question.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitResponse([FromBody] SubmitResponseRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var question = await _db.Questions
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId);

        if (question is null)
            return BadRequest(new { error = "Question not found." });

        if (question.Status != QuestionStatus.Active)
            return BadRequest(new { error = "Question is not active." });

        var response = new Response
        {
            Id = Guid.NewGuid(),
            QuestionId = request.QuestionId,
            Value = request.Value,
            SubmittedAt = DateTime.UtcNow
        };

        _db.Responses.Add(response);
        await _db.SaveChangesAsync();

        var dto = new ResponseDto
        {
            Id = response.Id,
            QuestionId = response.QuestionId,
            Value = response.Value,
            SubmittedAt = response.SubmittedAt
        };

        // Broadcast to SignalR clients
        await _hubContext.Clients.All.SendAsync("NewResponse", dto);

        var count = await _db.Responses.CountAsync(r => r.QuestionId == request.QuestionId);
        await _hubContext.Clients.All.SendAsync("ResponseCountUpdated", new { questionId = request.QuestionId, count });

        return CreatedAtAction(nameof(SubmitResponse), new { id = response.Id }, dto);
    }
}
