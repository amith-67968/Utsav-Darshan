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

To populate an empty or partially populated project with sample content, run `npm run seed:demo` from `backend` with `ALLOW_DEMO_SEED=true` set for that command. In PowerShell:

```powershell
$env:ALLOW_DEMO_SEED = "true"
npm run seed:demo
Remove-Item Env:ALLOW_DEMO_SEED
```

The seed ensures the six requested categories and 32 upcoming `[DEMO]` events across all 28 Indian states. Descriptions state that dates, venue details, cultural notes, and stock poster images are illustrative and unverified. State names are included in event locations because the current events schema has no separate state column. Records are inserted as approved so public pages can display them. The script creates a locked attribution account because the current events schema requires `created_by`; it skips existing event names, only adds missing state labels to its own marked demo records, and never changes or deletes unrelated events. It can be rerun safely. Dates are set when each record is first inserted.

To grant an administrator, set `profiles.role = 'admin'` for the corresponding authenticated user's UUID from the Supabase SQL editor. Admin endpoints re-check the role against the database on each request.

## Deployment

### Render API

Create a Render Web Service from the repository, set the root directory to `backend`, build command to `npm install`, and start command to `npm start`. Configure `PORT` (Render also provides it), `FRONTEND_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Set `FRONTEND_URL` to the deployed Vercel origin.

### Vercel frontend

Import the same repository into Vercel and set the root directory to `frontend`. Add `NEXT_PUBLIC_API_URL` pointing to the Render API origin plus `/api`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Deploy. Add the Vercel origin to `FRONTEND_URL` on Render.

Configure Supabase Auth's site URL and allowed redirect URLs for local development and the deployed Vercel origin. Never put the service-role key in frontend variables.

## Product scope

The initial implementation includes public discovery, city/category/date filtering, event details, month and week calendar views, Supabase login and registration, contributor submission/history, reporting, admin review and category management APIs, dashboard summaries, and a Leaflet/OpenStreetMap view when coordinates are present. Public event records are restricted to approved events.
