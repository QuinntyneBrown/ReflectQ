# ReflectQ

ReflectQ is a QR-driven audience feedback platform for live sessions. Presenters display a question and QR code, attendees respond on their phones, and admins monitor incoming answers in real time.

> Current state: the .NET backend is the most complete part of the repo. The Angular workspace currently contains reusable libraries, not a runnable browser app.

## Quick Links

- [L1 requirements](docs/specs/L1.md)
- [L2 requirements](docs/specs/L2.md)
- [Contributing guide](CONTRIBUTING.md)
- [MIT License](LICENSE)

## What Is In This Repository

- `ReflectQ.Api`: ASP.NET Core API with JWT auth, role-based authorization, SignalR, and Entity Framework Core.
- `ReflectQ.Domain`: shared domain entities and enums.
- `ReflectQ.Infrastructure`: EF Core `DbContext` and SQL Server persistence configuration.
- `ReflectQ.Web`: Angular 21 workspace with three libraries: `api`, `domain`, and `components`.
- `ReflectQ.Api.Tests`: xUnit integration tests for questions, responses, and user-management endpoints.
- `docs/specs`: L1 and L2 product requirements.

## Implemented Backend Capabilities

- Question management API: create, list, search, sort, update, activate, and archive questions.
- Response collection API: public response submission endpoint plus admin-only response listing, clearing, and CSV export.
- Real-time updates: SignalR hub at `/hubs/responses` broadcasts new responses and response counts.
- User management API: list, invite, update, and deactivate admin users.
- Authentication and authorization: JWT bearer auth with `AdminOrAbove` and `SuperAdmin` policies.
- Persistence: EF Core is configured for SQL Server and models `Question`, `QuestionOption`, `Response`, and `User`.

## Tech Stack

- .NET 11 preview
- ASP.NET Core Web API
- Entity Framework Core + SQL Server
- SignalR
- xUnit
- Angular 21
- TypeScript + Vitest

## Repository Layout

```text
.
|- docs/
|  `- specs/
|- src/
|  |- ReflectQ.Api/
|  |- ReflectQ.Domain/
|  |- ReflectQ.Infrastructure/
|  `- ReflectQ.Web/
`- tests/
   `- ReflectQ.Api.Tests/
```

## Getting Started

### Prerequisites

- .NET 11 SDK preview
- SQL Server or LocalDB
- Node.js and npm

### Run The API

1. Restore packages:

   ```powershell
   dotnet restore ReflectQ.slnx
   ```

2. Review API configuration in [`src/ReflectQ.Api/appsettings.Development.json`](src/ReflectQ.Api/appsettings.Development.json).

   The repo currently defaults to:

   - `ConnectionStrings:DefaultConnection = Server=(localdb)\mssqllocaldb;Database=ReflectQ_Dev;Trusted_Connection=True;MultipleActiveResultSets=true`
   - `Jwt:Issuer = ReflectQ`
   - `Jwt:Audience = ReflectQ`

3. Start the API:

   ```powershell
   dotnet run --project src/ReflectQ.Api/ReflectQ.Api.csproj
   ```

4. Use the development launch profile URLs:

   - `http://localhost:5087`
   - `https://localhost:7250`

Notes:

- OpenAPI is enabled in Development.
- Configuration can also be supplied via environment variables such as `ConnectionStrings__DefaultConnection` and `Jwt__Key`.
- No EF Core migrations are currently checked into the repository, so you will need to create/apply schema changes before using a real SQL database.

### Work With The Angular Workspace

The frontend workspace is currently a multi-project Angular library workspace, not a runnable SPA.

Install dependencies:

```powershell
cd src/ReflectQ.Web
npm ci
```

Build a specific library:

```powershell
npx ng build api
npx ng build domain
npx ng build components
```

Run frontend tests:

```powershell
npm test -- --watch=false
```

Notes:

- `npm run build` fails by default because Angular needs a specific project name in this multi-project workspace.
- `npm start` / `ng serve` is not useful yet because there is no application project defined in `angular.json`.

## API Overview

### Public

- `POST /api/responses`

### Admin Or SuperAdmin

- `GET /api/questions`
- `GET /api/questions/{id}`
- `POST /api/questions`
- `PUT /api/questions/{id}`
- `PUT /api/questions/{id}/activate`
- `PUT /api/questions/{id}/archive`
- `GET /api/questions/{questionId}/responses`
- `DELETE /api/questions/{questionId}/responses`
- `GET /api/questions/{questionId}/responses/export`

### SuperAdmin

- `GET /api/users`
- `POST /api/users/invite`
- `PUT /api/users/{id}`
- `PUT /api/users/{id}/deactivate`

## Testing

Verified working commands in the current repository state:

- `dotnet build src/ReflectQ.Api/ReflectQ.Api.csproj`
- `npm test -- --watch=false` from `src/ReflectQ.Web`
- `npx ng build api`
- `npx ng build domain`
- `npx ng build components`

Current known issue:

- `dotnet test ReflectQ.slnx` currently fails because [`tests/ReflectQ.Api.Tests/UsersControllerTests.cs`](tests/ReflectQ.Api.Tests/UsersControllerTests.cs) references `WebApplicationFactory<>` without the required namespace import.

## Near-Term Gaps

- The Angular admin, presenter, and respondent applications have not been built yet.
- The Angular workspace still contains scaffold-level library components.
- EF Core migrations are not committed yet.

## Contributing

Contributions are welcome. For local setup, validation commands, and pull request expectations, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](LICENSE).
