# Todo — Multi-User Kanban Todo Application

A production-grade, multi-user Kanban Todo application built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **ShadCN UI principles**, **PostgreSQL**, and **Sequelize ORM**, styled with a custom modern design system.

Designed specifically as an interview take-home assignment demonstrating:
- Secure authentication with **bcrypt** and **HttpOnly signed session cookies**
- Ownership-based personal Kanban boards with 3 lifecycle columns (**Todo**, **In Progress**, **Done**)
- Granular, server-enforced **shared board access control** (`BoardAccess` model)
- Zero exposure of sensitive hashes with strict request-level input validation via **Zod**
- Bespoke UI built with custom tokens, Navigation Rail, KPI metrics cards, dot-matrix dynamic grid, and segmented verification tabs
- Production-readiness for **Vercel** with **Neon / Supabase / Vercel PostgreSQL**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Design System & Aesthetics](#design-system--aesthetics)
3. [Key Features](#key-features)
4. [Tech Stack](#tech-stack)
5. [Database Schema & Associations](#database-schema--associations)
6. [Authentication Approach](#authentication-approach)
7. [Board Sharing & Access-Control Design](#board-sharing--access-control-design)
8. [Folder Structure](#folder-structure)
9. [Environment Variables](#environment-variables)
10. [Local Setup & Migration Instructions](#local-setup--migration-instructions)
11. [Demo Credentials & Quick-Fill](#demo-credentials--quick-fill)
12. [Vercel Deployment Guide](#vercel-deployment-guide)
13. [Manual & Automated Testing Checklist](#manual--automated-testing-checklist)

---

## Project Overview

In standard collaborative work, individuals require an organized workflow for their daily responsibilities while teammates must be able to inspect progress without risking accidental modifications.

This application provides:
1. **Personal Task Management**: Logged-in users manage their own tasks across a 3-column Kanban board with real-time status transitions and priority levels.
2. **Collaborative Visibility**: An authenticated user can explicitly grant another authenticated user permission to view their board.
3. **Strict Backend Authorization**: No unauthorized users can peek at private boards, and shared viewers have strictly read-only access (no task edits, deletes, or status shifts).
4. **No Unnecessary Admin Bloat**: Adheres strictly to the requirement without introducing complex or unnecessary admin roles.

---

## Design System & Aesthetics

The application adopts custom design tokens and modern UI patterns:
- **Brand Palette**: Deep royal primary (`#1E1035`), vibrant electric violet accent (`#9723FF`), and soft purple tints (`#F4E8FF`).
- **Dynamic Flashlight Dot-Matrix**: Radial gradient background (`.orb-dot-grid`) with interactive mouse coordinates.
- **Desktop Navigation Rail (`.orb-rail`)**: Fixed 84px left rail with icon boxes, active state glows, and workspace switching.
- **KPI Metrics Cards (`.orb-kpi`)**: Metric overview cards displaying Total Tasks, In Progress velocity, Completed counts, and High Priority urgency.
- **Verification Tabs (`.orb-tabs`)**: Pill-shaped segmented controls with semantic status colors (`.active-brand`, `.active-pass`, `.active-fail`, `.active-weak`).
- **Diagnostic Badges (`.orb-badge`)**: Color-coded badges for priorities (`HIGH`, `MEDIUM`, `LOW`) and access levels (`OWNER`, `VIEWER`, `RESTRICTED`).
- **Interactive Micro-Animations**: Smooth elevation on card hover, quick-action status movers, and drop-zone indicators.

---

## Key Features

- **3-Column Kanban Board**: Organized into `Todo`, `In Progress`, and `Done` with dynamic task counts and drag-and-drop drop-zones.
- **Priority Indicators**: Color-coded badges for `High` (Orange/Red), `Medium` (Yellow), and `Low` (Pass Green).
- **Fast Status Shift Controls**: Reliable left/right status transition controls and drag-and-drop support.
- **Task Search & Filtering**: Real-time client-side search by title/description and priority filtering.
- **Board Sharing Management**: Dedicated modal allowing owners to grant view access to colleagues by email, review active permissions, or revoke access with one click.
- **Read-Only Viewer Experience**: Shared boards clearly display an informative banner identifying the owner, while all mutation actions (create, edit, delete, status shift) are safely stripped and blocked with backend 403 enforcement.
- **Evaluator-Friendly Quick Login**: One-click demo credentials for User 1 (board owner) and User 2 (authorized viewer). An additional unauthorized account remains available to access-control tests.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Server Components & Route Handlers) |
| **Language** | TypeScript (Strict mode enabled) |
| **Design System** | Custom Tokens + Tailwind CSS v4 + Radix UI Primitives |
| **Database** | PostgreSQL (Tested with PostgreSQL 18 & Neon Cloud Postgres) |
| **ORM** | Sequelize ORM v6 with `pg` driver & connection pooling |
| **Auth** | bcryptjs (password hashing) + JOSE (universal JWT in HttpOnly cookies) |
| **Validation** | Zod v4 (type-safe runtime validation schemas) |
| **Deployment** | Vercel Serverless with SSL auto-detection |

---

## Database Schema & Associations

### 1. User Model (`users`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key, UUIDV4 | Unique user ID |
| `name` | STRING | NOT NULL | User's display name |
| `email` | STRING | NOT NULL, UNIQUE, isEmail | User's unique login email |
| `passwordHash` | STRING | NOT NULL | bcrypt hash of password |
| `createdAt` | TIMESTAMP | NOT NULL | Auto timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Auto timestamp |

### 2. Todo Model (`todos`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key, UUIDV4 | Unique task ID |
| `title` | STRING(255) | NOT NULL | Task title (1–120 chars) |
| `description` | TEXT | NULLABLE | Detailed description |
| `status` | ENUM | NOT NULL, Default: `'TODO'` | `'TODO'`, `'IN_PROGRESS'`, `'DONE'` |
| `priority` | ENUM | NOT NULL, Default: `'MEDIUM'` | `'LOW'`, `'MEDIUM'`, `'HIGH'` |
| `ownerId` | UUID | NOT NULL, FK -> `users.id` | Foreign key referencing owner |
| `createdAt` | TIMESTAMP | NOT NULL | Auto timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Auto timestamp |

*Indexes: `[ownerId]`, `[status]`*

### 3. BoardAccess Model (`board_accesses`)
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | Primary Key, UUIDV4 | Unique access record ID |
| `ownerId` | UUID | NOT NULL, FK -> `users.id` | The board owner granting access |
| `viewerId` | UUID | NOT NULL, FK -> `users.id` | Authenticated viewer receiving access |
| `canView` | BOOLEAN | NOT NULL, Default: `true` | View permission flag |
| `createdAt` | TIMESTAMP | NOT NULL | Auto timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Auto timestamp |

*Indexes: Unique composite on `[ownerId, viewerId]`, index on `[viewerId]`*

### Model Associations
```ts
// User <-> Todo (One-to-Many)
User.hasMany(Todo, { foreignKey: "ownerId", as: "todos", onDelete: "CASCADE" });
Todo.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// User <-> BoardAccess (Granted Accesses: user is the owner)
User.hasMany(BoardAccess, { foreignKey: "ownerId", as: "grantedAccesses", onDelete: "CASCADE" });
BoardAccess.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// User <-> BoardAccess (Received Accesses: user is the viewer)
User.hasMany(BoardAccess, { foreignKey: "viewerId", as: "receivedAccesses", onDelete: "CASCADE" });
BoardAccess.belongsTo(User, { foreignKey: "viewerId", as: "viewer" });
```

---

## Authentication Approach

1. **Password Security**: Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (10 rounds) during registration and seed creation.
2. **Session Token**: On successful authentication (`/api/auth/login` or `/api/auth/register`), a JSON Web Token (JWT) is issued with `{ userId, email, name }`.
3. **Cookie Attributes**:
   - `httpOnly: true` (prevents JavaScript/XSS extraction)
   - `secure: true` in production (enforces HTTPS)
   - `sameSite: "lax"` (mitigates CSRF)
   - `path: "/"`
   - `maxAge: 7 days`
4. **Server-Side Session Extraction**: `getSessionUser()` cryptographically validates the token on the server using `jose`. The frontend never dictates user identity; `userId` is derived exclusively from the verified token.

---

## Board Sharing & Access-Control Design

Access control is strictly validated in backend API route handlers and server components. The frontend never acts as the security boundary.

```
Request to Access/Modify Resource
               │
               ▼
   [ Authenticated Session? ] ──(No)──► 401 Unauthorized
               │ (Yes)
               ▼
        Resource Type?
        ┌──────┴──────────────────────────┐
        ▼                                 ▼
   [ Board / Todos View ]          [ Todo Mutation (POST/PATCH/DELETE) ]
        │                                 │
   Is sessionUser == ownerId?             ├─ POST: ownerId forced from session
   ├── (Yes) ──► Allow (isOwner: true)    └─ PATCH/DELETE:
   └── (No)                                    Fetch Todo from DB.
        │                                      Is todo.ownerId == sessionUser?
   Does BoardAccess exist with                 ├── (Yes) ──► Allow mutation
   ownerId & viewerId == sessionUser           └── (No)  ──► 403 Forbidden
   and canView == true?
   ├── (Yes) ──► Allow (isOwner: false, read-only)
   └── (No)  ──► 403 Forbidden (Access Denied)
```

### Core Rules Enforced:
1. **Ownership**: Authenticated users always have full read and write access to their own board and tasks.
2. **Zero Ingestion of Untrusted IDs**: On `POST /api/todos`, any client-provided `ownerId` is discarded; `ownerId` is explicitly set to `session.userId`.
3. **Read-Only Viewer**: An authenticated viewer can only access another user's board if an active `BoardAccess` record exists where `viewerId == session.userId` and `canView == true`.
4. **Modification Guard**: On `PATCH /api/todos/:id` and `DELETE /api/todos/:id`, the system loads the todo from the database and checks `todo.ownerId === session.userId`. If not the owner, the request fails with **403 Forbidden**. Viewers can never alter or delete an owner's task.

---

## Folder Structure

```
todo_app/
├── scripts/
│   ├── migrate.ts            # Schema migration (Sequelize sync)
│   ├── seed.ts               # Demo data seeder (User 1, User 2, and an unauthorized test user)
│   ├── reset.ts              # Drop tables, recreate, and re-seed
│   ├── test-auth-access.ts   # Automated unit-level access control tests
│   └── test-e2e-http.ts      # Live HTTP test suite against running server
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx        # Login page with dot-grid & demo personas
│   │   │   └── register/page.tsx     # Registration page
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts    # POST /api/auth/login
│   │   │   │   ├── logout/route.ts   # POST /api/auth/logout
│   │   │   │   ├── me/route.ts       # GET /api/auth/me
│   │   │   │   └── register/route.ts # POST /api/auth/register
│   │   │   ├── boards/
│   │   │   │   ├── [ownerId]/todos/route.ts # GET board todos (with access check)
│   │   │   │   ├── access/
│   │   │   │   │   ├── route.ts             # GET / POST board sharing permissions
│   │   │   │   │   └── [viewerId]/route.ts  # DELETE revoke sharing permission
│   │   │   │   └── shared/route.ts          # GET boards shared with current user
│   │   │   └── todos/
│   │   │       ├── route.ts                 # GET / POST personal todos
│   │   │       └── [id]/route.ts            # GET / PATCH / DELETE todo (owner only)
│   │   ├── board/
│   │   │   ├── page.tsx                     # My Personal Board (Server Component)
│   │   │   └── [ownerId]/page.tsx           # Shared Board Viewer / 403 screen
│   │   ├── shared/
│   │   │   └── page.tsx                     # Shared Boards List (Server Component)
│   │   ├── globals.css                      # Design Tokens & CSS system
│   │   ├── layout.tsx                       # Root layout & MouseTracker setup
│   │   └── page.tsx                         # Root redirect (/board or /login)
│   ├── components/
│   │   ├── ui/                              # Shadcn UI primitives
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── separator.tsx
│   │   ├── ConfirmDeleteModal.tsx           # Delete confirmation dialog
│   │   ├── KanbanBoard.tsx                  # 3-column Kanban board with KPI cards
│   │   ├── KanbanColumn.tsx                 # Column container & drop-zone
│   │   ├── MouseTracker.tsx                 # Mouse coordinate tracker for flashlight grid
│   │   ├── Navbar.tsx                       # Navigation Rail & mobile header
│   │   ├── ShareBoardModal.tsx              # Board access management modal
│   │   ├── TodoCard.tsx                     # Task card with status badges & controls
│   │   └── TodoModal.tsx                    # Task modal with segmented tabs
│   ├── lib/
│   │   ├── db/
│   │   │   ├── models/
│   │   │   │   ├── BoardAccess.ts           # BoardAccess Sequelize model
│   │   │   │   ├── Todo.ts                  # Todo Sequelize model
│   │   │   │   ├── User.ts                  # User Sequelize model
│   │   │   │   └── index.ts                 # Model associations setup
│   │   │   └── index.ts                     # Sequelize singleton & SSL config
│   │   ├── auth.ts                          # JWT, password hashing & cookies
│   │   ├── types.ts                         # TypeScript definitions
│   │   ├── utils.ts                         # Tailwind clsx/merge & date helpers
│   │   └── validations.ts                   # Zod request validation schemas
│   └── middleware.ts                        # Route protection & redirects
├── .env.example                             # Environment variable template
├── next.config.ts                           # Next.js config with serverExternalPackages
├── package.json                             # Dependencies & scripts
└── tsconfig.json                            # TypeScript configuration
```

---

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Local Default | Production Example (Neon) |
|---|---|---|---|
| `NODE_ENV` | Environment mode | `development` | `production` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for the optional Supabase clients | — | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase key used by browser/server clients | — | Supabase publishable key |
| `JWT_SECRET` | Secret key for signing session tokens | `your-secret-key` | `crypto.randomBytes(32).toString('hex')` |
| `DATABASE_URL` | Full PostgreSQL connection URI | *(optional)* | `postgresql://user:pass@ep-name.neon.tech/neondb?sslmode=require` |
| `DB_HOST` | Database host (if not using `DATABASE_URL`) | `localhost` | — |
| `DB_PORT` | Database port | `5432` | — |
| `DB_NAME` | Database name | `todo_db` | — |
| `DB_USER` | Database username | `postgres` | — |
| `DB_PASS` | Database password | `password` | — |
| `DB_SSL` | Force SSL mode | `false` | `true` |

The Supabase client helpers and session refresh proxy are available for Supabase features. The existing application login and Sequelize/PostgreSQL data layer remain unchanged. Configure the two `NEXT_PUBLIC_SUPABASE_*` variables in `.env.local` for local development and in the deployment environment for production.

---

## Local Setup & Migration Instructions

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v22)
- PostgreSQL (local instance or cloud database like Neon)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Migrations & Seed
Run database migration to initialize all tables and associations:
```bash
npm run db:migrate
```

Seed the database with sample users, todos, and shared permissions:
```bash
npm run db:seed
```

*(Optional)* To reset the database cleanly at any point:
```bash
npm run db:reset
```

### 4. Start the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials & Quick-Fill

The login page features **one-click autofill buttons** for the two demo accounts:

| User | Email | Password | Role / Purpose |
|---|---|---|---|
| **User 1** | `user1@gmail.com` | `Password123!` | **Board Owner**: Owns 5 everyday sample tasks across Todo, In Progress, and Done. Has shared their board with User 2. |
| **User 2** | `user2@gmail.com` | `Password123!` | **Authorized Viewer**: Owns 2 everyday sample tasks and has read-only access to User 1's board. |

The seed data also creates an internal unauthorized test account (`charlie@example.com`) for verifying 403 Forbidden access. It is not shown among the login-page demo users.

---

## Vercel Deployment Guide

Deploying this application to Vercel is seamless:

### 1. Provision a Serverless PostgreSQL Database
- Create a free database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
- Copy the provided connection string (e.g., `postgresql://...neon.tech/neondb?sslmode=require`).

### 2. Set Up Vercel Project
1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **New Project** and import the repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure random 32-character string.
   - `NODE_ENV`: `production`

### 3. Run Migrations & Seed on the Production DB
Run the migration and seed scripts locally targeting your cloud database:
```bash
DATABASE_URL="your_neon_connection_string" npm run db:migrate
DATABASE_URL="your_neon_connection_string" npm run db:seed
```

### 4. Deploy
Click **Deploy** in Vercel. The production build uses `serverExternalPackages: ["sequelize", "pg", "pg-hstore", "bcryptjs"]` configured in `next.config.ts` to ensure compatibility with Vercel Serverless Functions.

---

## Manual & Automated Testing Checklist

### Running Automated Test Suites
This repository includes two automated test suites:
1. **Access Control & Model Unit Tests**:
   ```bash
   npm run test:access
   ```
   *Verifies password hashing, owner permissions, BoardAccess authorization, and viewer mutation blocking.*

2. **Live HTTP Route & Security Tests**:
   ```bash
   npm run test:e2e
   ```
   *Sends live HTTP requests with session cookies to test authentication, todo creation, status updates, shared board retrieval, and 403 Forbidden security rejections.*
