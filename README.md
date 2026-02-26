# Travel Planner Frontend

Next.js dashboard for managing travel projects and places. This app talks to your backend API and also proxies Art Institute search requests.

## Prerequisites

- Node.js `>=20` (required by Next tooling)
- Backend API running (default: `http://localhost:8000`)

You can use any package manager (`npm`, `pnpm`, `yarn`, or `bun`).
Examples below use `npm`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Start dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build & Start

Build production bundle:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Lint:

```bash
npm run lint
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

## Troubleshooting

- If project list/create fails, verify backend is running on `API_BASE_URL`.
- If artwork search fails, check internet access and Art Institute API availability.
- If Next warns about multiple lockfiles, keep using this project root and one package manager consistently.
