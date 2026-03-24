# ReflectQ

ReflectQ is a real-time audience feedback platform for live sessions. Presenters display a question and QR code, attendees answer on their phones, and admins monitor responses live.

## At A Glance

- Backend: ASP.NET Core Web API with JWT auth, role-based authorization, SignalR, and EF Core.
- Frontend: Angular 21 workspace with reusable `api`, `domain`, and `components` libraries.
- Persistence: SQL Server via `ReflectQDbContext`.
- Specs: [L1 requirements](docs/specs/L1.md) and [L2 requirements](docs/specs/L2.md).
- Project docs: [CONTRIBUTING.md](CONTRIBUTING.md) and [MIT License](LICENSE).

## Current Status

| Area | Status |
| --- | --- |
| API | Most complete part of the repository. Question, response, and user management endpoints are implemented. |
| Real-time updates | SignalR hub at `/hubs/responses` broadcasts new responses and response counts. |
| Frontend | Angular workspace exists, but it is not a runnable app yet. It currently contains libraries only. |
| Database | SQL Server is configured, but EF Core migrations are not checked into the repository yet. |
| Tests | Frontend library tests run. The backend test suite is currently blocked by an existing compile issue. |

## Core Capabilities

- Create, list, search, sort, update, activate, and archive questions.
- Submit responses publicly through `POST /api/responses`.
- View, clear, and export question responses as CSV.
- Invite, update, list, and deactivate admin users.
- Enforce `AdminOrAbove` and `SuperAdmin` policies with JWT bearer tokens.

## Stack

- .NET 11 preview
- ASP.NET Core Web API
- Entity Framework Core + SQL Server
- SignalR
- Angular 21
- TypeScript + Vitest
- xUnit

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

## Quick Start

### Prerequisites

- .NET 11 SDK preview
- SQL Server or LocalDB
- Node.js and npm

### Run The API

1. Restore packages:

   ```powershell
   dotnet restore ReflectQ.slnx
   ```

2. Review development settings in [`src/ReflectQ.Api/appsettings.Development.json`](src/ReflectQ.Api/appsettings.Development.json).

   Current defaults:

   - `ConnectionStrings:DefaultConnection = Server=(localdb)\mssqllocaldb;Database=ReflectQ_Dev;Trusted_Connection=True;MultipleActiveResultSets=true`
   - `Jwt:Issuer = ReflectQ`
   - `Jwt:Audience = ReflectQ`

3. Start the API:

   ```powershell
   dotnet run --project src/ReflectQ.Api/ReflectQ.Api.csproj
   ```

4. Use the local URLs from the launch profile:

   - `http://localhost:5087`
   - `https://localhost:7250`

Notes:

- OpenAPI is enabled in Development.
- You can override configuration with environment variables such as `ConnectionStrings__DefaultConnection` and `Jwt__Key`.
- Because migrations are not committed yet, a real SQL-backed environment still needs schema setup work.

### Work With The Angular Workspace

The frontend is currently a multi-project Angular library workspace, not a runnable SPA.

Install dependencies:

```powershell
cd src/ReflectQ.Web
npm ci
```

Build individual libraries:

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

- `npm run build` fails by default because Angular needs an explicit project name in this workspace.
- `npm start` / `ng serve` is not useful yet because `angular.json` does not define an application project.

## API Access Model

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

## Validation

Commands verified against the current repository state:

- `dotnet build src/ReflectQ.Api/ReflectQ.Api.csproj`
- `npm test -- --watch=false` from `src/ReflectQ.Web`
- `npx ng build api`
- `npx ng build domain`
- `npx ng build components`

Known issue:

- `dotnet test ReflectQ.slnx` currently fails because [`tests/ReflectQ.Api.Tests/UsersControllerTests.cs`](tests/ReflectQ.Api.Tests/UsersControllerTests.cs) references `WebApplicationFactory<>` without the required namespace import.

## Near-Term Gaps

- The presenter, respondent, and admin frontend applications have not been built yet.
- The Angular libraries are still at scaffold level.
- EF Core migrations are not committed yet.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, validation, and pull request expectations.

## License

This project is licensed under the [MIT License](LICENSE).
