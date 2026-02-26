# Travel Planner Frontend

Next.js dashboard for managing travel projects and places. This app talks to your backend API and also proxies Art Institute search requests.

## Prerequisites

- Bun `>=1.0`
- Node.js `>=20` (required by Next tooling)
- Backend API running (default: `http://localhost:8000`)

## Setup

1. Install dependencies:

```bash
bun install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Build & Start

Build production bundle:

```bash
bun run build
```

Start production server:

```bash
bun run start
```

Lint:

```bash
bun run lint
```

## Environment Variables

Create `.env.local`:

```bash
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=/api
```

Notes:
- `API_BASE_URL`: used on Next server routes (proxy to your backend).
- `NEXT_PUBLIC_API_BASE_URL`: used by browser client; default `/api` is recommended.

## Routes

- `/` - list travel projects
- `/new` - create a new project with places
- `/api/projects` - Next proxy for backend projects API
- `/api/artworks/search?q=<query>` - Next proxy for Art Institute search

## Example Requests

List projects through frontend proxy:

```bash
curl "http://localhost:3000/api/projects"
```

Create a project through frontend proxy:

```bash
curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chicago Weekend",
    "description": "Art walk plan",
    "start_date": "2026-03-20",
    "places": [
      {"external_id": 129884, "notes": "Start early"}
    ]
  }'
```

Search artworks:

```bash
curl "http://localhost:3000/api/artworks/search?q=monet"
```

## Troubleshooting

- If project list/create fails, verify backend is running on `API_BASE_URL`.
- If artwork search fails, check internet access and Art Institute API availability.
- If Next warns about multiple lockfiles, keep using this project root and Bun scripts.
