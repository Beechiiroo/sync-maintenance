# Sync Maintenance — Django Backend

Production-ready backend for the **sync-maintenance** React frontend. Mirrors the
Supabase schema 1-to-1 and exposes the exact REST surface the frontend (`src/lib/api/django.ts`) expects.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

Then in the frontend project root:
```bash
echo "VITE_DJANGO_API_URL=http://localhost:8000/api" > .env.local
```

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register/` | `{ email, password, full_name?, role? }` → `{ access, refresh, user }` |
| POST | `/api/auth/login/` | `{ email, password }` → `{ access, refresh, user }` |
| POST | `/api/auth/token/refresh/` | `{ refresh }` → `{ access }` |
| GET  | `/api/auth/me/` | Current user (Bearer JWT) |
| POST | `/api/auth/logout/` | Blacklist refresh |
| CRUD | `/api/equipment/` | |
| CRUD | `/api/interventions/` | `equipment_id`, `assigned_to` writable |
| CRUD | `/api/spare-parts/` | |
| CRUD | `/api/stock-movements/` | |
| CRUD | `/api/maintenance-schedules/` | |
| CRUD | `/api/tickets/` | |
| CRUD | `/api/contracts/` | |
| CRUD | `/api/notifications/` | scoped to current user |
| CRUD | `/api/messages/` | sender = current user |
| CRUD | `/api/profiles/` · `/api/user-roles/` | |
| GET/POST | `/api/audit-logs/` | append-only |
| POST | `/api/ai/chat/` | `{ messages, language }` → `{ content }` (uses `LOVABLE_API_KEY`) |

All list endpoints return **plain arrays** (no pagination wrapper) to match the frontend.

## Auth

JWT (SimpleJWT). Send `Authorization: Bearer <access>`. The frontend axios client
in `src/lib/api/client.ts` handles refresh automatically.

## Deployment (Render.com)

See `../DJANGO_DEPLOY.md` in the repo root. Build command:
`pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
Start command: `gunicorn core.wsgi --chdir backend`

## Compatibility

Models, enums and field names match `src/integrations/supabase/types.ts` exactly.
The frontend can swap `supabase.from(...)` calls for the matching `*Api` from
`src/lib/api/django.ts` with no payload changes.
