# Utsav Darshan

A city festival and cultural calendar for discovering verified local events and sharing community knowledge.

## Repository structure

- `frontend/`: Next.js App Router application, JavaScript and Tailwind CSS.
- `backend/`: Express REST API, Supabase Auth verification and PostgreSQL access.
- `supabase/migrations/`: database schema, role policies and storage bucket setup.

## Local development

1. Create a Supabase project. In its SQL editor, run `supabase/migrations/001_initial_schema.sql`.
2. In Supabase Storage, the migration creates a public `event-posters` bucket with authenticated upload policies.
3. Copy `frontend/.env.example` to `frontend/.env.local` and `backend/.env.example` to `backend/.env`; fill in the Supabase URL and anon key in both, and the service role key only in the backend.
4. In one terminal, run `cd backend && npm install && npm run dev`.
5. In another terminal, run `cd frontend && npm install && npm run dev`.
6. Open `http://localhost:3000`. The backend health endpoint is `http://localhost:4000/api/health`.

To grant an administrator, set `profiles.role = 'admin'` for the corresponding authenticated user's UUID from the Supabase SQL editor. Admin endpoints re-check the role against the database on each request.

## Deployment

### Render API

Create a Render Web Service from the repository, set the root directory to `backend`, build command to `npm install`, and start command to `npm start`. Configure `PORT` (Render also provides it), `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Set `FRONTEND_URL` to the deployed Vercel origin.

### Vercel frontend

Import the same repository into Vercel and set the root directory to `frontend`. Add `NEXT_PUBLIC_API_URL` pointing to the Render API origin plus `/api`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Deploy. Add the Vercel origin to `FRONTEND_URL` on Render.

Configure Supabase Auth's site URL and allowed redirect URLs for local development and the deployed Vercel origin. Never put the service-role key in frontend variables.

## Product scope

The initial implementation includes public discovery, city/category/date filtering, event details, a monthly calendar, Supabase login and registration, contributor submission/history, reporting, admin review and category management APIs, and dashboard summaries. Public event records are restricted to approved events. Map coordinates are stored and event locations link to OpenStreetMap; a Leaflet map view can be enabled as the event location data and client-side map component are completed.
