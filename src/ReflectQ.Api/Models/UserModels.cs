using System.ComponentModel.DataAnnotations;
using ReflectQ.Domain.Enums;

namespace ReflectQ.Api.Models;

public class InviteUserRequest
{
    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}

public class UpdateUserRequest
{
    [StringLength(200)]
    public string? Name { get; set; }

    public UserRole? Role { get; set; }
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
