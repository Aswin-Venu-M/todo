# Todo

A small Kanban-style task manager built with Next.js. Users can manage tasks on their own board and share a board with another registered user, with view and edit access controlled separately.

## What it does

- Organizes tasks into **Todo**, **In Progress**, and **Done** columns.
- Stores a task title, optional description, status, and priority.
- Supports search, priority filtering, drag-and-drop status changes, and task editing.
- Lets a board owner grant another registered user view access, edit access, or both.
- Checks board and task permissions in the server-side route handlers.

## Stack

- Next.js App Router and React
- TypeScript
- PostgreSQL with Sequelize
- Tailwind CSS and Radix UI
- Zod for request validation
- bcryptjs and signed JWT cookies for the app's login flow

## Run locally

You'll need Node.js, npm, and a PostgreSQL database.

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root. The app uses the Supabase URL and publishable key in its request proxy, and a PostgreSQL connection for its Sequelize data layer:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   JWT_SECRET=replace-with-a-long-random-secret
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=todo_db
   DB_USER=postgres
   DB_PASS=your-local-database-password
   DB_SSL=false
   ```

   Instead of the individual `DB_*` settings, you can set `DATABASE_URL` or `POSTGRES_URL` to a PostgreSQL connection string. Set `DB_SSL=true` when your database requires SSL. The app's login and data models use the local JWT and Sequelize/PostgreSQL flow; Supabase is not the source of Todo data.

3. Create/update the database tables:

   ```bash
   npm run db:migrate
   ```

   This command calls Sequelize `sync({ alter: true })`; the project does not currently use versioned migration files.

4. Optionally load the demo records:

   ```bash
   npm run db:seed
   ```

   **Warning:** the seed script removes existing access grants, todos, and users before creating its demo data. Do not run it against a database whose records you need to keep. `npm run db:reset` drops and recreates the schema, then seeds it.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Demo accounts

After running the seed script, these accounts are available:

| Email | Password | Use |
|---|---|---|
| `user1@gmail.com` | `Password123!` | Owns sample tasks and shares their board with User 2. |
| `user2@gmail.com` | `Password123!` | Owns sample tasks and has access to User 1's board. |
| `charlie@example.com` | `Password123!` | Has no access grant to User 1's board; used by the HTTP test script. |

These are public demo credentials from the seed script, not suitable for a deployed environment.

## Board access

Each access grant connects a board owner to a viewer and stores two booleans: `canView` and `canEdit`.

- Owners can view, create, update, and delete their own tasks.
- A user needs a `canView` grant to read someone else's board.
- A user needs both `canView` and `canEdit` to create or update tasks on another user's board.
- Only the board owner can delete tasks from that board.
- Owners can update or revoke grants they created.

The grant API looks up the recipient by email. There can be only one grant for a given owner/viewer pair. More detail on the tables and associations is in [ER-Diagram.md](ER-Diagram.md).

## API routes

| Route | Methods | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register a user. |
| `/api/auth/login` | `POST` | Sign in and set the session cookie. |
| `/api/auth/logout` | `POST` | Sign out. |
| `/api/auth/me` | `GET` | Get the current session user. |
| `/api/todos` | `GET`, `POST` | List the current user's tasks or create a task. A user with edit access can also create tasks on a shared board by supplying its `ownerId`. |
| `/api/todos/[id]` | `GET`, `PATCH`, `DELETE` | Read, update, or delete a task, subject to the access rules above. |
| `/api/boards/[ownerId]/todos` | `GET` | Read a user's board if it belongs to the caller or has been shared with them. |
| `/api/boards/access` | `GET`, `POST` | List grants made by the current user or grant/update access by email. |
| `/api/boards/access/[viewerId]` | `PATCH`, `DELETE` | Change a viewer's edit setting or revoke their grant. |
| `/api/boards/shared` | `GET` | List boards shared with the current user. |

## Data model

The database has three Sequelize models:

- **User** (`users`): account name, unique email, password hash, and timestamps.
- **Todo** (`todos`): title, optional description, status, priority, owner foreign key, and timestamps.
- **BoardAccess** (`board_accesses`): owner and viewer foreign keys, view/edit flags, and timestamps. Each owner/viewer pair is unique.

Task statuses are `TODO`, `IN_PROGRESS`, and `DONE`; priorities are `LOW`, `MEDIUM`, and `HIGH`. Deleting a user cascades to their tasks and board access records. See [ER-Diagram.md](ER-Diagram.md) for fields, constraints, and the ER diagram.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server. |
| `npm run build` | Build the app for production. |
| `npm start` | Run the production build. |
| `npm run lint` | Run ESLint. |
| `npm run db:migrate` | Sync the Sequelize models to the database using `alter: true`. |
| `npm run db:seed` | Clear existing application records and insert demo data. |
| `npm run db:reset` | Drop and recreate the tables, then load demo data. |
| `npm run test:access` | Run database-backed access checks against seeded accounts. |
| `npm run test:e2e` | Run HTTP checks against a server at `http://localhost:3000`. |

For the access checks, seed the database first. For the HTTP checks, start the app and seed the same database before running the script:

```bash
npm run dev
```

In another terminal:

```bash
npm run test:e2e
```

## Project layout

```text
src/
  app/
    (auth)/              Login and registration pages
    api/                 Authentication, Todo, and board-sharing routes
    board/               Personal and shared board pages
    shared/              List of boards shared with the current user
  components/            Kanban board, task dialogs, navigation, and UI
  lib/
    db/models/           Sequelize models and associations
    auth.ts              Password helpers, JWTs, and session cookies
    validations.ts       Zod request schemas
scripts/                 Database and test scripts
ER-Diagram.md            Database documentation
```
