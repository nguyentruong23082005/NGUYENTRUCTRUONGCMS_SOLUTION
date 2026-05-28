# ARCHITECTURE.md

**Date:** 2026-05-26

## Overview
The application follows a standard N-Tier architecture with a monolithic backend separating web logic from data access, alongside a standalone SPA frontend.

## Layers
1. **Presentation Layer (Frontend):** 
   - Standalone Vite + React application (`CMS.Frontend`).
   - Uses Shopify Polaris for UI components.
2. **Web Layer (Backend API/MVC):** 
   - ASP.NET Core MVC application (`CMS.Backend`).
   - Contains Controllers (e.g., `CategoryController`, `ProductController`, `OrderController`) which handle HTTP requests.
   - Includes Views (Razor pages/CSHTML) suggesting it might serve some server-rendered pages as well.
3. **Data Access Layer:** 
   - Class library (`CMS.Data`).
   - Defines EF Core `ApplicationDbContext` and Entities (Models).

## Data Flow
Frontend (React) -> (Likely API calls, or server-rendered Razor pages for some parts) -> ASP.NET Core Controllers -> EF Core DbContext -> SQL Server.
