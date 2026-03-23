# Contributing to ReflectQ

## Scope

ReflectQ is currently backend-heavy. The .NET API is the most complete part of the repository, while the Angular workspace is still a set of scaffold-level libraries.

Contributions are most useful when they:

- improve or extend the API
- add tests for implemented behavior
- move the frontend toward runnable presenter, respondent, or admin applications
- tighten documentation and developer workflow

## Development Setup

### Prerequisites

- .NET 11 SDK preview
- SQL Server or LocalDB
- Node.js and npm

### Restore Dependencies

```powershell
dotnet restore ReflectQ.slnx
cd src/ReflectQ.Web
npm ci
```

## Local Validation

Run the checks that currently work in this repository:

### Backend

```powershell
dotnet build src/ReflectQ.Api/ReflectQ.Api.csproj
```

### Frontend

```powershell
cd src/ReflectQ.Web
npm test -- --watch=false
npx ng build api
npx ng build domain
npx ng build components
```

Known issue:

- `dotnet test ReflectQ.slnx` is currently blocked by an existing compile problem in `tests/ReflectQ.Api.Tests/UsersControllerTests.cs`.

## Coding Expectations

- Keep changes focused and small.
- Update tests when behavior changes.
- Update documentation when setup, architecture, or workflows change.
- Preserve the existing project structure unless there is a clear reason to reorganize it.
- Prefer pragmatic fixes over speculative abstractions.

## Pull Requests

Before opening a pull request:

- make sure the relevant build and test commands pass
- describe the user-visible or developer-visible impact
- call out any intentional follow-up work or known gaps
- include API examples or screenshots when the change benefits from them

PR descriptions should clearly state:

- what changed
- why it changed
- how it was validated

## Large Changes

For larger features or structural changes, align the work with the requirements in:

- `docs/specs/L1.md`
- `docs/specs/L2.md`

If implementation needs to diverge from those specs, document the reason in the pull request.
