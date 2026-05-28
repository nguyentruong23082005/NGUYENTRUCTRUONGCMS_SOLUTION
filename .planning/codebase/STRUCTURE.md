# STRUCTURE.md

**Date:** 2026-05-26

## Directory Layout
- `CMS.Backend/`
  - `Controllers/` - ASP.NET Core MVC Controllers
  - `Models/` - ViewModels and Data Transfer Objects
  - `Views/` - CSHTML Razor views
  - `Program.cs` - App entry point and DI configuration
- `CMS.Data/`
  - `Entities/` - Domain entities mapping to database tables (`Category`, `Product`, `Order`, etc.)
  - `Migrations/` - EF Core migration files
  - `ApplicationDbContext.cs` - EF Core context
- `CMS.Frontend/`
  - `src/` - React source code
    - `App.jsx` - Main React component using Polaris UI
    - `main.jsx` - React DOM entry
  - `package.json` - NPM dependencies
  - `vite.config.js` - Vite configuration
- `NGUYENTRUCTRUONGCMS_SOLUTION.sln` - Visual Studio solution file uniting Backend, Data, and Frontend.
