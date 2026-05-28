# CONVENTIONS.md

**Date:** 2026-05-26

## Code Style
- **C# / .NET:** Follows standard C# naming conventions (PascalCase for classes/methods/properties). Uses C# 10/11 features like implicit usings and nullable reference types (`<Nullable>enable</Nullable>`).
- **JavaScript / React:** Uses modern JS (ES6+) and functional components with React Hooks (`useState`, `useCallback`).

## Patterns
- **Repository/Data Access:** EF Core `DbContext` injected via dependency injection in `Program.cs`.
- **UI:** Uses Shopify Polaris components for standardized admin interfaces (`Page`, `Layout`, `IndexTable`).

## Error Handling
- Uses ASP.NET Core's default exception handler `/Home/Error` in production, and standard development error pages.
