# Roadmapper Development Instructions

## Project
Roadmapper is a personal learning-roadmap web application.

## Technology
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- React Flow
- Lucide React
- Supabase
- PostgreSQL
- Supabase Storage
- Browser Notification API

## Important Rules
- Use JavaScript, NOT TypeScript.
- Keep the architecture simple.
- Do not create unnecessary backend services.
- Do not use Express unless absolutely required.
- Supabase is the backend.
- Do not introduce microservices.
- Do not add AI features.
- Do not add unnecessary libraries.
- Reuse existing components and utilities.
- Do not rewrite working code unnecessarily.
- Keep components modular and understandable.
- Follow existing project conventions.
- Do not implement features outside the current phase.
- Before making major changes, inspect the existing code.
- Never delete working functionality without a clear reason.
- Run lint/build checks after significant changes.

## Product
Roadmapper allows users to:
- Create learning roadmaps
- Build visual topic roadmaps
- Track topic progress
- Add notes/questions/checklists
- Bookmark and mark important topics
- Add learning resources
- Upload attachments
- Set reminders
- Use a study timer
- Create goals
- View progress
- Share public roadmaps
- Import/export JSON
- Export roadmap as PDF

## Development Strategy
Implement the project phase-by-phase.

Never rebuild completed phases.

Always inspect:
1. AGENTS.md
2. ROADMAP_PLAN.md
3. Existing source code

before continuing development.