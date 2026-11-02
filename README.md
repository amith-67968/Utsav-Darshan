# Utsav Darshan

A city festival and cultural calendar for discovering verified local events and sharing community knowledge.

## Repository structure

- `frontend/`: Next.js App Router application, JavaScript and Tailwind CSS.
- `backend/`: Express REST API, Supabase Auth verification and PostgreSQL access.
- `supabase/migrations/`: database schema, role policies and storage bucket setup.

## Local development

1. Create a Supabase project. In its SQL editor, run `supabase/migrations/001_initial_schema.sql`, then `supabase/migrations/002_secure_role_policies.sql`.
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

## Production deployment guide

This repository deploys as three parts: Supabase (database, auth and poster storage), an Express API (Render), and the Next.js website (Vercel). Deploy the API and website as separate services from the same Git repository.

### 1. Prepare Supabase

1. Create a production Supabase project and keep its database backups enabled.
2. In the Supabase SQL Editor, review and run `supabase/migrations/001_initial_schema.sql` first, then `supabase/migrations/002_secure_role_policies.sql`. The first migration creates the tables, initial categories, RLS policies and `event-posters` storage bucket. The second migration replaces recursive profile role checks.
3. In **Authentication → URL Configuration**, set the Site URL to the production website origin (for example, `https://your-site.vercel.app`). Add the exact production origin and any local/preview origins you need to the allowed redirect URLs. Avoid broad wildcards for production. Supabase requires the redirect target to be allow-listed.
4. Keep the project URL, publishable/anon key, and service-role/secret key available for the environment variables below. The service-role key bypasses RLS, so it belongs only in the API service and must never have a `NEXT_PUBLIC_` prefix.

### 2. Deploy the Express API to Render

1. Create a **Web Service** connected to the repository.
2. Set **Root Directory** to `backend`, **Build Command** to `npm ci`, and **Start Command** to `npm start`. The server listens on Render's `PORT` environment variable.
3. Add these environment variables in the Render service settings:

   | Variable | Value |
   | --- | --- |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_ANON_KEY` | Supabase publishable/anon key (used to verify Auth tokens) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role/secret key; keep private |
   | `FRONTEND_URL` | Exact website origin, e.g. `https://your-site.vercel.app` |

   `PORT` is provided by Render; the API defaults to `4000` for local development. `FRONTEND_URL` accepts comma-separated origins when you need a separate preview website.
4. Deploy and confirm `https://YOUR-API.onrender.com/api/health` returns `{"status":"ok"}`. Save the API origin without `/api`; the website variable below adds that path.

### 3. Deploy the Next.js frontend to Vercel

1. Import the repository into Vercel and set **Root Directory** to `frontend`. Vercel detects Next.js; use `npm ci` for installation and `npm run build` as the build command if custom commands are needed.
2. Add these environment variables for the Production environment (and Preview/Development separately if those deployments need to work):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api` |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |

3. Deploy. If you change an environment variable later, create a new deployment so the Next.js build receives the updated value.
4. Copy the resulting Vercel origin into Render's `FRONTEND_URL`, save, and redeploy the API if needed. Add that same origin to Supabase Auth's allowed redirect URLs.

### 4. Set up the first administrator

1. Register the intended admin account through the website, then sign in.
2. In the Supabase SQL Editor, promote that account by email. Replace the example address before running:

   ```sql
   update public.profiles p
   set role = 'admin', updated_at = now()
   from auth.users u
   where p.id = u.id
     and lower(u.email) = lower('admin@example.com');
   ```

3. Sign in with that account. The backend checks the profile role for each admin API request; registration and browser requests cannot grant the admin role.

### 5. Optional demonstration events

For a demo or staging project, run the seed script locally against that project's backend `.env` **after** applying the migrations. In PowerShell:

```powershell
cd backend
$env:ALLOW_DEMO_SEED = "true"
npm run seed:demo
Remove-Item Env:ALLOW_DEMO_SEED
```

This inserts approved, clearly labeled demonstration records for public-page previews. Do not seed production unless you intend to show sample data to visitors. For production, enter reviewed event information through the moderation workflow.

### 6. Verify the deployment

- Open `/explore` and `/calendar` while signed out. Event discovery should work without an account; only approved records should appear.
- Open an event detail page and confirm city/category filters and the calendar load from the API.
- Click **Submit an Event** signed out. Sign in and confirm the app returns to the form.
- Submit a test listing and confirm it appears under **My submissions** with **Pending** status, while remaining absent from public discovery.
- Confirm a regular account gets an access-denied screen at `/admin` and a non-admin response from admin API endpoints.
- Confirm the admin account can review and approve/reject the test listing, then verify only an approved listing becomes public.
- Upload a small JPG, PNG or WebP poster and confirm it displays from the `event-posters` bucket.
- Log out and verify the account menu returns to the signed-out state.

For local-only checks, the API health endpoint is `http://localhost:4000/api/health`; the frontend runs at `http://localhost:3000`.

## Product scope

The initial implementation includes public discovery, city/category/date filtering, event details, month and week calendar views, Supabase login and registration, contributor submission/history, reporting, admin review and category management APIs, dashboard summaries, and a Leaflet/OpenStreetMap view when coordinates are present. Public event records are restricted to approved events.
