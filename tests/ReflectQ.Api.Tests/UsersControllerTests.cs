using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using ReflectQ.Api.Models;
using ReflectQ.Domain.Entities;
using ReflectQ.Domain.Enums;
using ReflectQ.Infrastructure.Data;

namespace ReflectQ.Api.Tests;

public class UsersControllerTests : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public UsersControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() => Task.CompletedTask;
    public Task DisposeAsync()
    {
        _client.Dispose();
        return Task.CompletedTask;
    }

    private void SetSuperAdminToken()
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestAuthHelper.GenerateToken("SuperAdmin"));
    }

    private void SetAdminToken()
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestAuthHelper.GenerateToken("Admin"));
    }

    private void ClearToken()
    {
        _client.DefaultRequestHeaders.Authorization = null;
    }

    /// <summary>
    /// Creates an isolated factory + client + seeded DB for tests that need data.
    /// </summary>
    private (HttpClient client, WebApplicationFactory<Program> factory) CreateIsolatedClientWithData(Action<ReflectQDbContext> seed)
    {
        var dbName = "TestDb_" + Guid.NewGuid();
        var factory = _factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove all DbContext registrations
                var descriptors = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<ReflectQDbContext>))
                    .ToList();
                foreach (var d in descriptors) services.Remove(d);

                services.AddDbContext<ReflectQDbContext>(options =>
                    options.UseInMemoryDatabase(dbName)
                           .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)));
            });
        });

        // Build the host and seed data
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", TestAuthHelper.GenerateToken("SuperAdmin"));

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ReflectQDbContext>();
            seed(db);
            db.SaveChanges();
        }

        return (client, factory);
    }

    // ---------------------------------------------------------------
    // L2-12.2: Returns 401 without token
    // ---------------------------------------------------------------
    [Fact]
    public async Task GetUsers_WithoutToken_Returns401()
    {
        ClearToken();
        var response = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task InviteUser_WithoutToken_Returns401()
    {
        ClearToken();
        var response = await _client.PostAsJsonAsync("/api/users/invite", new { Email = "a@b.com", Role = 0 });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // ---------------------------------------------------------------
    // L2-12.2: Returns 403 for Admin role (requires SuperAdmin)
    // ---------------------------------------------------------------
    [Fact]
    public async Task GetUsers_WithAdminToken_Returns403()
    {
        SetAdminToken();
        var response = await _client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task InviteUser_WithAdminToken_Returns403()
    {
        SetAdminToken();
        var response = await _client.PostAsJsonAsync("/api/users/invite", new { Email = "a@b.com", Role = 0 });
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    // ---------------------------------------------------------------
    // L2-11.1: GET /api/users returns paginated list; supports sorting
    // ---------------------------------------------------------------
    [Fact]
    public async Task GetUsers_ReturnsPaginatedList()
    {
        var (client, factory) = CreateIsolatedClientWithData(db =>
        {
            for (int i = 0; i < 25; i++)
            {
                db.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    Name = $"Paginated {i:D3}",
                    Email = $"paged{i:D3}@test.com",
                    Role = UserRole.Viewer,
                    Status = UserStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-25 + i)
                });
            }
        });

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/users?page=1&pageSize=10");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<PagedResult<UserResponse>>(_jsonOptions);
            Assert.NotNull(result);
            Assert.Equal(25, result.TotalCount);
            Assert.Equal(10, result.Items.Count);
            Assert.Equal(1, result.Page);
            Assert.Equal(10, result.PageSize);
        }
    }

    [Fact]
    public async Task GetUsers_Page3_ReturnsRemainingItems()
    {
        var (client, factory) = CreateIsolatedClientWithData(db =>
        {
            for (int i = 0; i < 25; i++)
            {
                db.Users.Add(new User
                {
                    Id = Guid.NewGuid(),
                    Name = $"Page {i:D3}",
                    Email = $"page_{i:D3}@test.com",
                    Role = UserRole.Viewer,
                    Status = UserStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-25 + i)
                });
            }
        });

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/users?page=3&pageSize=10");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<PagedResult<UserResponse>>(_jsonOptions);
            Assert.NotNull(result);
            Assert.Equal(25, result.TotalCount);
            Assert.Equal(5, result.Items.Count);
        }
    }

    [Fact]
    public async Task GetUsers_SortByNameAsc_ReturnsSortedList()
    {
        var (client, factory) = CreateIsolatedClientWithData(db =>
        {
            db.Users.Add(new User { Id = Guid.NewGuid(), Name = "Charlie", Email = "charlie@test.com", Role = UserRole.Viewer, CreatedAt = DateTime.UtcNow });
            db.Users.Add(new User { Id = Guid.NewGuid(), Name = "Alice", Email = "alice@test.com", Role = UserRole.Viewer, CreatedAt = DateTime.UtcNow });
            db.Users.Add(new User { Id = Guid.NewGuid(), Name = "Bob", Email = "bob@test.com", Role = UserRole.Viewer, CreatedAt = DateTime.UtcNow });
        });

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/users?sortBy=name&sortDirection=asc");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<PagedResult<UserResponse>>(_jsonOptions);
            Assert.NotNull(result);
            Assert.Equal(3, result.Items.Count);
            Assert.Equal("Alice", result.Items[0].Name);
            Assert.Equal("Bob", result.Items[1].Name);
            Assert.Equal("Charlie", result.Items[2].Name);
        }
    }

    [Fact]
    public async Task GetUsers_SortByEmailDesc_ReturnsSortedList()
    {
        var (client, factory) = CreateIsolatedClientWithData(db =>
        {
            db.Users.Add(new User { Id = Guid.NewGuid(), Name = "A", Email = "z@test.com", Role = UserRole.Viewer, CreatedAt = DateTime.UtcNow });
            db.Users.Add(new User { Id = Guid.NewGuid(), Name = "B", Email = "a@test.com", Role = UserRole.Viewer, CreatedAt = DateTime.UtcNow });
            db.Users.Add(new User { Id = Guid.NewGuid(), Name = "C", Email = "m@test.com", Role = UserRole.Viewer, CreatedAt = DateTime.UtcNow });
        });

        using (factory)
        using (client)
        {
            var response = await client.GetAsync("/api/users?sortBy=email&sortDirection=desc");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<PagedResult<UserResponse>>(_jsonOptions);
            Assert.NotNull(result);
            Assert.Equal("z@test.com", result.Items[0].Email);
            Assert.Equal("m@test.com", result.Items[1].Email);
            Assert.Equal("a@test.com", result.Items[2].Email);
        }
    }

    // ---------------------------------------------------------------
    // L2-11.2: POST /api/users/invite creates user, returns 201
    // ---------------------------------------------------------------
    [Fact]
    public async Task InviteUser_ValidRequest_Returns201WithUser()
    {
        SetSuperAdminToken();

        var request = new InviteUserRequest { Email = $"newuser_{Guid.NewGuid():N}@example.com", Role = UserRole.Admin };

        var response = await _client.PostAsJsonAsync("/api/users/invite", request);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>(_jsonOptions);
        Assert.NotNull(user);
        Assert.Equal(request.Email, user.Email);
        Assert.Equal(UserRole.Admin, user.Role);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.NotEqual(Guid.Empty, user.Id);
    }

    // ---------------------------------------------------------------
    // L2-11.2: Returns 409 for duplicate email
    // ---------------------------------------------------------------
    [Fact]
    public async Task InviteUser_DuplicateEmail_Returns409()
    {
        SetSuperAdminToken();

        var uniqueEmail = $"dup_{Guid.NewGuid():N}@example.com";
        var request = new InviteUserRequest { Email = uniqueEmail, Role = UserRole.Viewer };

        // First invite succeeds
        var first = await _client.PostAsJsonAsync("/api/users/invite", request);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);

        // Second invite with same email returns 409
        var second = await _client.PostAsJsonAsync("/api/users/invite", request);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    // ---------------------------------------------------------------
    // L2-11.2: Validates email format
    // ---------------------------------------------------------------
    [Theory]
    [InlineData("not-an-email")]
    [InlineData("")]
    [InlineData("missing-at-sign.com")]
    public async Task InviteUser_InvalidEmail_Returns400(string email)
    {
        SetSuperAdminToken();

        var request = new { Email = email, Role = 0 };

        var response = await _client.PostAsJsonAsync("/api/users/invite", request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ---------------------------------------------------------------
    // L2-11.3: PUT /api/users/{id} updates name/role, returns 200
    // ---------------------------------------------------------------
    [Fact]
    public async Task UpdateUser_ValidRequest_Returns200WithUpdatedUser()
    {
        SetSuperAdminToken();

        // Create a user via the API
        var uniqueEmail = $"update_{Guid.NewGuid():N}@test.com";
        var createResponse = await _client.PostAsJsonAsync("/api/users/invite",
            new InviteUserRequest { Email = uniqueEmail, Role = UserRole.Viewer });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<UserResponse>(_jsonOptions);
        Assert.NotNull(created);

        var updateRequest = new UpdateUserRequest { Name = "Updated Name", Role = UserRole.Admin };
        var response = await _client.PutAsJsonAsync($"/api/users/{created.Id}", updateRequest);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<UserResponse>(_jsonOptions);
        Assert.NotNull(updated);
        Assert.Equal("Updated Name", updated.Name);
        Assert.Equal(UserRole.Admin, updated.Role);
    }

    // ---------------------------------------------------------------
    // L2-11.3: PUT /api/users/{id} returns 404 for unknown
    // ---------------------------------------------------------------
    [Fact]
    public async Task UpdateUser_UnknownId_Returns404()
    {
        SetSuperAdminToken();
        var unknownId = Guid.NewGuid();
        var updateRequest = new UpdateUserRequest { Name = "Ghost" };

        var response = await _client.PutAsJsonAsync($"/api/users/{unknownId}", updateRequest);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // ---------------------------------------------------------------
    // L2-11.4: PUT /api/users/{id}/deactivate sets Deactivated status
    // ---------------------------------------------------------------
    [Fact]
    public async Task DeactivateUser_ExistingUser_Returns200WithDeactivatedStatus()
    {
        SetSuperAdminToken();

        // Create a user via the API
        var uniqueEmail = $"deactivate_{Guid.NewGuid():N}@test.com";
        var createResponse = await _client.PostAsJsonAsync("/api/users/invite",
            new InviteUserRequest { Email = uniqueEmail, Role = UserRole.Viewer });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var created = await createResponse.Content.ReadFromJsonAsync<UserResponse>(_jsonOptions);
        Assert.NotNull(created);

        var response = await _client.PutAsync($"/api/users/{created.Id}/deactivate", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<UserResponse>(_jsonOptions);
        Assert.NotNull(result);
        Assert.Equal(UserStatus.Deactivated, result.Status);
        Assert.Equal(created.Id, result.Id);
    }

    // ---------------------------------------------------------------
    // L2-11.4: PUT /api/users/{id}/deactivate returns 404 for unknown
    // ---------------------------------------------------------------
    [Fact]
    public async Task DeactivateUser_UnknownId_Returns404()
    {
        SetSuperAdminToken();
        var unknownId = Guid.NewGuid();

        var response = await _client.PutAsync($"/api/users/{unknownId}/deactivate", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
