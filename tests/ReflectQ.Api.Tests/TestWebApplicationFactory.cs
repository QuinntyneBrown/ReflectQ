using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using ReflectQ.Infrastructure.Data;

namespace ReflectQ.Api.Tests;

public class TestWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = "TestDb_" + Guid.NewGuid().ToString();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Jwt:Key", TestAuthHelper.JwtKey);
        builder.UseSetting("Jwt:Issuer", TestAuthHelper.JwtIssuer);
        builder.UseSetting("Jwt:Audience", TestAuthHelper.JwtAudience);

        builder.ConfigureServices(services =>
        {
            // Remove the app's DbContext registration (SqlServer)
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ReflectQDbContext>));
            if (descriptor != null) services.Remove(descriptor);

            // Remove all EF-related services to avoid dual-provider conflict
            var efDescriptors = services
                .Where(d => d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true)
                .ToList();
            foreach (var d in efDescriptors) services.Remove(d);

            // Re-add with InMemory provider
            services.AddDbContext<ReflectQDbContext>(options =>
                options.UseInMemoryDatabase(_dbName)
                       .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)));
        });
    }
}
