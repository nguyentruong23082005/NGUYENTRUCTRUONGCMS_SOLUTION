# CONCERNS.md

**Date:** 2026-05-26

## Technical Debt & Issues
- **Lack of Tests:** No unit, integration, or E2E tests are configured for either the backend or frontend.
- **Mixed UI Paradigm:** The backend is configured as an MVC app (`AddControllersWithViews`, `Views/` folder) while there is also a robust Vite+React frontend application. It's unclear if the project intends to be an API for the React app or a Server-Rendered MVC app.
- **Hardcoded Data:** The React frontend (`App.jsx`) currently uses hardcoded mock data for products instead of fetching from the backend API.
- **Missing Authentication/Security:** No obvious authentication/authorization setup (like JWT or Identity) is visible in `Program.cs` or the React app.

## Action Items
- Clarify the role of `CMS.Backend/Views` vs `CMS.Frontend`. If `CMS.Frontend` is the main UI, the backend should expose standard REST/GraphQL APIs instead of using MVC Views.
- Setup testing frameworks (xUnit for .NET, Vitest for React).
- Implement real API integration in the React frontend.
