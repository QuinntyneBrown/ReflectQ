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
[Authorize(Policy = "SuperAdmin")]
public class UsersController : ControllerBase
{
    private readonly ReflectQDbContext _db;

    public UsersController(ReflectQDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// L2-11.1: GET /api/users — paginated list with sorting.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<UserResponse>>> GetUsers(
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] string? sortDirection = "desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        IQueryable<User> query = _db.Users.AsNoTracking();

        query = ApplySort(query, sortBy ?? "CreatedAt", sortDirection ?? "desc");

        var totalCount = await query.CountAsync();

        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => MapToResponse(u))
            .ToListAsync();

        return Ok(new PagedResult<UserResponse>
        {
            Items = users,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    /// <summary>
    /// L2-11.2: POST /api/users/invite — create user with email and role.
    /// </summary>
    [HttpPost("invite")]
    public async Task<ActionResult<UserResponse>> InviteUser([FromBody] InviteUserRequest request)
    {
        var emailExists = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (emailExists)
        {
            return Conflict(new { message = "A user with this email already exists." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Role = request.Role,
            Status = UserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsers), null, MapToResponse(user));
    }

    /// <summary>
    /// L2-11.3: PUT /api/users/{id} — update name and/or role.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserResponse>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (request.Name is not null)
        {
            user.Name = request.Name;
        }

        if (request.Role.HasValue)
        {
            user.Role = request.Role.Value;
        }

        await _db.SaveChangesAsync();

        return Ok(MapToResponse(user));
    }

    /// <summary>
    /// L2-11.4: PUT /api/users/{id}/deactivate — deactivate user.
    /// </summary>
    [HttpPut("{id:guid}/deactivate")]
    public async Task<ActionResult<UserResponse>> DeactivateUser(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.Status = UserStatus.Deactivated;
        await _db.SaveChangesAsync();

        return Ok(MapToResponse(user));
    }

    private static IQueryable<User> ApplySort(IQueryable<User> query, string sortBy, string sortDirection)
    {
        var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);

        return sortBy.ToLowerInvariant() switch
        {
            "name" => descending ? query.OrderByDescending(u => u.Name) : query.OrderBy(u => u.Name),
            "email" => descending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
            "role" => descending ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role),
            "status" => descending ? query.OrderByDescending(u => u.Status) : query.OrderBy(u => u.Status),
            "lastloginat" => descending ? query.OrderByDescending(u => u.LastLoginAt) : query.OrderBy(u => u.LastLoginAt),
            _ => descending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
        };
    }

    private static UserResponse MapToResponse(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        Status = user.Status,
        LastLoginAt = user.LastLoginAt,
        CreatedAt = user.CreatedAt
    };
}
