using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ReflectQ.Api.Models;
using ReflectQ.Domain.Enums;

namespace ReflectQ.Api.Tests;

public class QuestionsControllerTests : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _adminClient;

    public QuestionsControllerTests()
    {
        _factory = new TestWebApplicationFactory();
        _adminClient = CreateAdminClient(_factory);
    }

    public void Dispose()
    {
        _adminClient.Dispose();
        _factory.Dispose();
    }

    private static HttpClient CreateAdminClient(TestWebApplicationFactory factory)
    {
        var client = factory.CreateClient();
        var token = TestAuthHelper.GenerateToken("Admin");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static HttpClient CreateViewerClient(TestWebApplicationFactory factory)
    {
        var client = factory.CreateClient();
        var token = TestAuthHelper.GenerateToken("Viewer");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static HttpClient CreateUnauthenticatedClient(TestWebApplicationFactory factory)
    {
        return factory.CreateClient();
    }

    private async Task<QuestionResponse> CreateQuestionViaApi(HttpClient client, string title = "Test Question", QuestionType type = QuestionType.FreeText)
    {
        var request = new CreateQuestionRequest
        {
            Title = title,
            Type = type,
            Body = "Test body"
        };
        var response = await client.PostAsJsonAsync("/api/questions", request, JsonOptions);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions))!;
    }

    // -----------------------------------------------------------------------
    // L2-08.3: POST /api/questions -- create question
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_08_3_Post_CreatesQuestion_Returns201WithLocation()
    {
        var request = new CreateQuestionRequest
        {
            Title = "What did you learn today?",
            Body = "Reflect on your learning.",
            Type = QuestionType.FreeText
        };

        var response = await _adminClient.PostAsJsonAsync("/api/questions", request, JsonOptions);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var body = await response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal("What did you learn today?", body.Title);
        Assert.Equal(QuestionType.FreeText, body.Type);
        Assert.Equal(QuestionStatus.Draft, body.Status);
        Assert.NotEqual(Guid.Empty, body.Id);
    }

    [Fact]
    public async Task L2_08_3_Post_MissingTitle_Returns400()
    {
        // Send JSON with empty/missing title
        var response = await _adminClient.PostAsJsonAsync("/api/questions",
            new { Title = (string?)null, Type = "FreeText" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // -----------------------------------------------------------------------
    // L2-08.2: GET /api/questions/{id} -- single question
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_08_2_GetById_ReturnsQuestion()
    {
        var created = await CreateQuestionViaApi(_adminClient, "Single question test");

        var response = await _adminClient.GetAsync($"/api/questions/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(created.Id, body.Id);
        Assert.Equal("Single question test", body.Title);
    }

    [Fact]
    public async Task L2_08_2_GetById_UnknownId_Returns404()
    {
        var response = await _adminClient.GetAsync($"/api/questions/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // -----------------------------------------------------------------------
    // L2-08.1: GET /api/questions -- paginated list
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_08_1_GetList_ReturnsPaginatedResults()
    {
        // Create 3 questions
        for (int i = 1; i <= 3; i++)
            await CreateQuestionViaApi(_adminClient, $"Paginated Q{i}");

        var response = await _adminClient.GetAsync("/api/questions?page=1&pageSize=2");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<PagedResult<QuestionResponse>>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(2, body.Items.Count);
        Assert.True(body.TotalCount >= 3);
        Assert.Equal(1, body.Page);
        Assert.Equal(2, body.PageSize);
    }

    [Fact]
    public async Task L2_08_1_GetList_SearchByTitle()
    {
        await CreateQuestionViaApi(_adminClient, "Alpha question");
        await CreateQuestionViaApi(_adminClient, "Beta question");
        await CreateQuestionViaApi(_adminClient, "Alpha special");

        var response = await _adminClient.GetAsync("/api/questions?search=alpha");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<QuestionResponse>>(JsonOptions);

        Assert.NotNull(body);
        Assert.True(body.TotalCount >= 2);
        Assert.All(body.Items, q => Assert.Contains("Alpha", q.Title, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task L2_08_1_GetList_SortByTitle()
    {
        // Use unique prefix to isolate from other tests sharing the same DB
        await CreateQuestionViaApi(_adminClient, "ZSort_Charlie");
        await CreateQuestionViaApi(_adminClient, "ZSort_Alpha");
        await CreateQuestionViaApi(_adminClient, "ZSort_Bravo");

        var response = await _adminClient.GetAsync("/api/questions?sortBy=title&sortDirection=asc&search=ZSort_");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<QuestionResponse>>(JsonOptions);

        Assert.NotNull(body);
        Assert.Equal(3, body.Items.Count);
        Assert.Equal("ZSort_Alpha", body.Items[0].Title);
        Assert.Equal("ZSort_Bravo", body.Items[1].Title);
        Assert.Equal("ZSort_Charlie", body.Items[2].Title);
    }

    [Fact]
    public async Task L2_08_1_GetList_ExcludesArchivedByDefault()
    {
        var q1 = await CreateQuestionViaApi(_adminClient, "Visible_Excl");
        var q2 = await CreateQuestionViaApi(_adminClient, "ToArchive_Excl");

        // Archive q2
        await _adminClient.PutAsync($"/api/questions/{q2.Id}/archive", null);

        var response = await _adminClient.GetAsync("/api/questions?search=_Excl");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<QuestionResponse>>(JsonOptions);

        Assert.NotNull(body);
        Assert.Single(body.Items);
        Assert.Equal("Visible_Excl", body.Items[0].Title);
    }

    [Fact]
    public async Task L2_08_1_GetList_IncludesArchivedWhenRequested()
    {
        await CreateQuestionViaApi(_adminClient, "Visible_Incl");
        var q2 = await CreateQuestionViaApi(_adminClient, "Archived_Incl");

        await _adminClient.PutAsync($"/api/questions/{q2.Id}/archive", null);

        var response = await _adminClient.GetAsync("/api/questions?includeArchived=true&search=_Incl");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<QuestionResponse>>(JsonOptions);

        Assert.NotNull(body);
        Assert.Equal(2, body.TotalCount);
    }

    // -----------------------------------------------------------------------
    // L2-08.4: PUT /api/questions/{id} -- update question
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_08_4_Put_UpdatesQuestion_Returns200()
    {
        var created = await CreateQuestionViaApi(_adminClient, "Original title");

        var updateRequest = new UpdateQuestionRequest
        {
            Title = "Updated title",
            Body = "Updated body"
        };

        var response = await _adminClient.PutAsJsonAsync($"/api/questions/{created.Id}", updateRequest, JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal("Updated title", body.Title);
        Assert.Equal("Updated body", body.Body);
    }

    [Fact]
    public async Task L2_08_4_Put_UnknownId_Returns404()
    {
        var updateRequest = new UpdateQuestionRequest { Title = "Nope" };

        var response = await _adminClient.PutAsJsonAsync($"/api/questions/{Guid.NewGuid()}", updateRequest, JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // -----------------------------------------------------------------------
    // L2-08.5: PUT /api/questions/{id}/activate -- activate question
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_08_5_Activate_SetsActiveStatus()
    {
        var created = await CreateQuestionViaApi(_adminClient, "To activate");

        var response = await _adminClient.PutAsync($"/api/questions/{created.Id}/activate", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(QuestionStatus.Active, body.Status);
    }

    [Fact]
    public async Task L2_08_5_Activate_DeactivatesOtherActiveQuestions()
    {
        var q1 = await CreateQuestionViaApi(_adminClient, "First_Act");
        var q2 = await CreateQuestionViaApi(_adminClient, "Second_Act");

        // Activate q1
        await _adminClient.PutAsync($"/api/questions/{q1.Id}/activate", null);

        // Activate q2 -- q1 should be deactivated
        await _adminClient.PutAsync($"/api/questions/{q2.Id}/activate", null);

        // Verify q1 is no longer active
        var q1Response = await _adminClient.GetAsync($"/api/questions/{q1.Id}");
        var q1Body = await q1Response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(q1Body);
        Assert.NotEqual(QuestionStatus.Active, q1Body.Status);

        // Verify q2 is active
        var q2Response = await _adminClient.GetAsync($"/api/questions/{q2.Id}");
        var q2Body = await q2Response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(q2Body);
        Assert.Equal(QuestionStatus.Active, q2Body.Status);
    }

    // -----------------------------------------------------------------------
    // L2-08.6: PUT /api/questions/{id}/archive -- archive question
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_08_6_Archive_SetsArchivedStatus()
    {
        var created = await CreateQuestionViaApi(_adminClient, "To archive");

        var response = await _adminClient.PutAsync($"/api/questions/{created.Id}/archive", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<QuestionResponse>(JsonOptions);
        Assert.NotNull(body);
        Assert.Equal(QuestionStatus.Archived, body.Status);
    }

    [Fact]
    public async Task L2_08_6_Archive_ExcludedFromDefaultListing()
    {
        var q1 = await CreateQuestionViaApi(_adminClient, "Keep_ArchTest");
        var q2 = await CreateQuestionViaApi(_adminClient, "ArchiveMe_ArchTest");

        await _adminClient.PutAsync($"/api/questions/{q2.Id}/archive", null);

        var response = await _adminClient.GetAsync("/api/questions?search=_ArchTest");
        var body = await response.Content.ReadFromJsonAsync<PagedResult<QuestionResponse>>(JsonOptions);

        Assert.NotNull(body);
        Assert.DoesNotContain(body.Items, q => q.Id == q2.Id);
        Assert.Contains(body.Items, q => q.Id == q1.Id);
    }

    // -----------------------------------------------------------------------
    // L2-12.3: Auth -- 401 without token, 403 for Viewer, success for Admin
    // -----------------------------------------------------------------------

    [Fact]
    public async Task L2_12_3_Auth_NoToken_Returns401()
    {
        using var client = CreateUnauthenticatedClient(_factory);

        var response = await client.GetAsync("/api/questions");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task L2_12_3_Auth_ViewerRole_Returns403()
    {
        using var client = CreateViewerClient(_factory);

        var response = await client.GetAsync("/api/questions");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task L2_12_3_Auth_AdminRole_Succeeds()
    {
        var response = await _adminClient.GetAsync("/api/questions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
