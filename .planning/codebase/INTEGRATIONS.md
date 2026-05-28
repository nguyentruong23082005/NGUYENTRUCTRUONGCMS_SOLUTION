# INTEGRATIONS.md

**Date:** 2026-05-26

## Databases
- **SQL Server:** The backend relies on Microsoft SQL Server via `Microsoft.EntityFrameworkCore.SqlServer`. Configuration is expected in `appsettings.json` under `DefaultConnection`.

## External APIs
- None explicitly defined yet.

## Authentication Providers
- Currently internal or default ASP.NET Core identity. No external OAuth/OIDC providers are explicitly configured in `Program.cs`.
