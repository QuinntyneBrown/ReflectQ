using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using ReflectQ.Api.Models;
using ReflectQ.Domain.Entities;
using ReflectQ.Domain.Enums;
using ReflectQ.Infrastructure.Data;

namespace ReflectQ.Api.Tests;

public class ResponsesControllerTests : IDisposable
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ResponsesControllerTests()
    {
        _factory = new TestWebApplicationFactory();
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    private async Task<(Question activeQuestion, Question draftQuestion)> SeedQuestionsAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ReflectQDbContext>();

        var activeQuestion = new Question
        {
            Id = Guid.NewGuid(),
            Title = "Active Question",
            Type = QuestionType.FreeText,
            Status = QuestionStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var draftQuestion = new Question
        {
            Id = Guid.NewGuid(),
            Title = "Draft Question",
            Type = QuestionType.FreeText,
            Status = QuestionStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Questions.AddRange(activeQuestion, draftQuestion);
        await db.SaveChangesAsync();

        return (activeQuestion, draftQuestion);
    }

    private async Task SeedResponsesAsync(Guid questionId, params (string Value, DateTime SubmittedAt)[] responses)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ReflectQDbContext>();

        foreach (var (value, submittedAt) in responses)
        {
            db.Responses.Add(new Response
            {
                Id = Guid.NewGuid(),
                QuestionId = questionId,
                Value = value,
                SubmittedAt = submittedAt
            });
        }

        await db.SaveChangesAsync();
    }

    private void SetAdminAuth()
    {
        var token = TestAuthHelper.GenerateToken("Admin");
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    private void ClearAuth()
    {
        _client.DefaultRequestHeaders.Authorization = null;
    }

    // L2-09.1: POST /api/responses succeeds without auth token (AllowAnonymous); returns 201
    [Fact]
    public async Task PostResponse_WithoutAuth_ReturnsCreated()
    {
        var (activeQuestion, _) = await SeedQuestionsAsync();
        ClearAuth();

        var request = new { QuestionId = activeQuestion.Id, Value = "My response" };
        var response = await _client.PostAsJsonAsync("/api/responses", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<ResponseDto>(_jsonOptions);
        Assert.NotNull(body);
        Assert.Equal(activeQuestion.Id, body!.QuestionId);
        Assert.Equal("My response", body.Value);
        Assert.NotEqual(Guid.Empty, body.Id);
    }

    // L2-09.1: Validates question exists and is active; returns 400 for non-active question
    [Fact]
    public async Task PostResponse_ForDraftQuestion_ReturnsBadRequest()
    {
        var (_, draftQuestion) = await SeedQuestionsAsync();
        ClearAuth();

        var request = new { QuestionId = draftQuestion.Id, Value = "My response" };
        var response = await _client.PostAsJsonAsync("/api/responses", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // L2-09.1: Returns 400 for non-existent question
    [Fact]
    public async Task PostResponse_ForNonExistentQuestion_ReturnsBadRequest()
    {
        ClearAuth();

        var request = new { QuestionId = Guid.NewGuid(), Value = "My response" };
        var response = await _client.PostAsJsonAsync("/api/responses", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // L2-12.4: POST /api/responses works without any auth token (public endpoint)
    [Fact]
    public async Task PostResponse_PublicEndpoint_NoAuthRequired()
    {
        var (activeQuestion, _) = await SeedQuestionsAsync();
        ClearAuth();

        var request = new { QuestionId = activeQuestion.Id, Value = "Anonymous response" };
        var response = await _client.PostAsJsonAsync("/api/responses", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    // L2-09.2: GET /api/questions/{id}/responses returns responses ordered by timestamp desc (requires Admin token)
    [Fact]
    public async Task GetResponses_WithAdminToken_ReturnsOrderedByTimestampDesc()
    {
        var (activeQuestion, _) = await SeedQuestionsAsync();

        await SeedResponsesAsync(activeQuestion.Id,
            ("First", DateTime.UtcNow.AddMinutes(-10)),
            ("Second", DateTime.UtcNow.AddMinutes(-5)),
            ("Third", DateTime.UtcNow));

        SetAdminAuth();
        var httpResponse = await _client.GetAsync($"/api/questions/{activeQuestion.Id}/responses");

        Assert.Equal(HttpStatusCode.OK, httpResponse.StatusCode);

        var responses = await httpResponse.Content.ReadFromJsonAsync<List<ResponseDto>>(_jsonOptions);
        Assert.NotNull(responses);
        Assert.Equal(3, responses!.Count);

        // Verify descending order by timestamp
        Assert.Equal("Third", responses[0].Value);
        Assert.Equal("Second", responses[1].Value);
        Assert.Equal("First", responses[2].Value);
    }

    // L2-12.1: GET /api/questions/{id}/responses returns 401 without token
    [Fact]
    public async Task GetResponses_WithoutToken_ReturnsUnauthorized()
    {
        var (activeQuestion, _) = await SeedQuestionsAsync();
        ClearAuth();

        var response = await _client.GetAsync($"/api/questions/{activeQuestion.Id}/responses");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // L2-09.3: DELETE /api/questions/{id}/responses returns 204 and clears all responses (requires Admin token)
    [Fact]
    public async Task DeleteResponses_WithAdminToken_ReturnsNoContentAndClearsAll()
    {
        var (activeQuestion, _) = await SeedQuestionsAsync();

        await SeedResponsesAsync(activeQuestion.Id,
            ("R1", DateTime.UtcNow),
            ("R2", DateTime.UtcNow));

        SetAdminAuth();
        var deleteResponse = await _client.DeleteAsync($"/api/questions/{activeQuestion.Id}/responses");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Verify responses are cleared by fetching them
        var getResponse = await _client.GetAsync($"/api/questions/{activeQuestion.Id}/responses");
        var responses = await getResponse.Content.ReadFromJsonAsync<List<ResponseDto>>(_jsonOptions);
        Assert.NotNull(responses);
        Assert.Empty(responses!);
    }

    // L2-09.4: GET /api/questions/{id}/responses/export returns CSV with correct content-type and columns
    [Fact]
    public async Task ExportResponses_WithAdminToken_ReturnsCsvWithCorrectFormat()
    {
        var (activeQuestion, _) = await SeedQuestionsAsync();

        // Seed a known response
        var responseId = Guid.NewGuid();
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ReflectQDbContext>();
            db.Responses.Add(new Response
            {
                Id = responseId,
                QuestionId = activeQuestion.Id,
                Value = "Test value",
                SubmittedAt = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
        }

        SetAdminAuth();
        var response = await _client.GetAsync($"/api/questions/{activeQuestion.Id}/responses/export");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/csv", response.Content.Headers.ContentType?.MediaType);

        var csvContent = await response.Content.ReadAsStringAsync();
        var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        // Verify header row has expected columns
        Assert.StartsWith("ResponseId,Value,SubmittedAt", lines[0].Trim());

        // Verify data row exists and contains the response id
        Assert.True(lines.Length >= 2, "CSV should have at least a header and one data row");
        Assert.Contains(responseId.ToString(), lines[1]);
    }
}
