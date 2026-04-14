# TaskFlow — Daily Task Management

A clean, minimal, and polished task management app designed for daily productivity tracking. Built with a modern stack, responsive design, and real-time sync across devices.

![Stack](https://img.shields.io/badge/Next.js_14-black?style=flat&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma)

---

## Features

- **Daily Task View** — Today's tasks are front and center
- **Full CRUD** — Create, edit, delete, and track tasks
- **Priority Levels** — Low, medium, high with visual indicators
- **Completion Tracking** — Mark tasks done with smooth animations
- **Date Navigation** — Browse past and future days easily
- **Streaks & Stats** — Track your completion streaks and weekly progress
- **User Authentication** — Secure login so you can access tasks from anywhere
- **Responsive Design** — Mobile-first, works beautifully on any screen size
- **Near Real-Time Sync** — Auto-refreshes data every 30 seconds
- **Optimistic Updates** — Instant UI feedback on every action

---

## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Framework  | Next.js 14 (App Router)        |
| Language   | TypeScript                     |
| Styling    | Tailwind CSS                   |
| Database   | SQLite (dev) / PostgreSQL (prod) |
| ORM        | Prisma                         |
| Auth       | NextAuth.js (Credentials)      |
| Data Fetch | SWR (stale-while-revalidate)   |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Setup

```bash
# 1. Navigate to the project directory
cd task-flow

# 2. Install dependencies
npm install

# 3. Copy the environment file
cp .env.example .env

# 4. Generate Prisma client & create the local SQLite database
npm run db:push

# 5. Optional: load demo data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Or use the one-liner:
```bash
npm run setup
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="file:../dev.db"         # SQLite for local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"     # Generate with: openssl rand -base64 32
```

### Demo Account

If you run `npm run db:seed`, you can sign in with:

```txt
Email: demo@taskflow.local
Password: demo1234
```

### Prisma Workflow

The project now supports both SQLite and PostgreSQL without editing the schema by hand.

- `npm run db:generate` picks the correct Prisma schema based on `DATABASE_URL`
- `npm run db:push` does the same for local or cloud database sync
- `npm run build` automatically regenerates the Prisma client before building
- `prisma/schema.sqlite.prisma` is used for local SQLite
- `prisma/schema.postgresql.prisma` is used for Render/Vercel deployments

---

## Deployment Guide

### Recommended: Vercel App + Render PostgreSQL

This is the best setup for this repo:

1. Create a **Render PostgreSQL** database.
2. Copy its external connection string into Vercel as `DATABASE_URL`.
3. Deploy the app from the `task-flow` directory on Vercel.

#### Vercel settings

- Framework preset: `Next.js`
- Root Directory: `task-flow`
- Install Command: `npm install`
- Build Command: `npm run build`

#### Vercel environment variables

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/task_flow?sslmode=require
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=generate-a-long-random-secret
```

#### Production database sync

Run this once against your production database before the first login:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/task_flow?sslmode=require" npm run db:push:postgres
```

### Full Render Deployment

If you want the whole app on Render instead of Vercel:

1. Push the repo with the root-level `render.yaml` file.
2. Create a new Blueprint in Render from the repo root.
3. Render will provision:
   - a Node web service rooted at `task-flow`
   - a PostgreSQL database named `task-flow-db`
4. After the service is created, set:

```env
NEXTAUTH_URL=https://your-render-service.onrender.com
```

`NEXTAUTH_SECRET` is generated automatically by the blueprint.

### Important Notes

- Vercel must point to the `task-flow` subdirectory because this repository contains another app.
- The app build already runs `npm run db:generate`, so Prisma client generation is handled during deployment.
- The root `render.yaml` is for Render detection. The app-level `vercel.json` is inside `task-flow`.

---

## Architecture

```
task-flow/
├── prisma/
│   └── schema.prisma          # Database schema (User + Task models)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Root redirect (auth check)
│   │   ├── globals.css        # Tailwind + custom styles
│   │   ├── dashboard/         # Main app view
│   │   ├── (auth)/            # Login & register pages
│   │   └── api/               # REST API routes
│   │       ├── auth/          # NextAuth handler
│   │       ├── register/      # User registration
│   │       ├── tasks/         # Task CRUD endpoints
│   │       └── stats/         # Completion statistics
│   ├── components/            # React components
│   │   ├── Header.tsx         # Top navigation bar
│   │   ├── Sidebar.tsx        # Date picker + stats overview
│   │   ├── TaskItem.tsx       # Individual task (view/edit)
│   │   ├── TaskForm.tsx       # New task creation form
│   │   ├── DateNav.tsx        # Date navigation with progress
│   │   ├── Stats.tsx          # Weekly chart + streak stats
│   │   └── Providers.tsx      # Session provider wrapper
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Date formatting helpers
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── middleware.ts          # Route protection
```

### Design Decisions

- **Next.js App Router**: Server components for the auth check on the root page, client components for interactive dashboard. One project = frontend + backend.
- **SQLite + PostgreSQL**: SQLite stays great for local development, while PostgreSQL is used for cloud deployments through schema-aware scripts.
- **SWR with polling**: Auto-revalidates every 30 seconds, giving near real-time sync across devices without WebSocket complexity.
- **Optimistic updates**: Every action updates the UI instantly before the API call completes, making the app feel snappy.
- **Credential auth**: Simple email/password auth with bcrypt hashing. Easy to extend with OAuth providers via NextAuth.
- **Date-string indexed tasks**: Tasks use `YYYY-MM-DD` strings for daily grouping, making date queries fast and timezone-simple.

---

## API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| POST   | /api/register     | Create a new account     |
| GET    | /api/tasks?date=  | Get tasks for a date     |
| POST   | /api/tasks        | Create a task            |
| PATCH  | /api/tasks/:id    | Update a task            |
| DELETE | /api/tasks/:id    | Delete a task            |
| GET    | /api/stats        | Get streaks & stats      |

All task endpoints require authentication via session cookie.
