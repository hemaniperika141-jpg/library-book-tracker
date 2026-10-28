# Library Book Tracker

## 1. Project overview

Library Book Tracker is a beginner-friendly full-stack web application for a college library. A librarian can maintain a catalog, search and filter books, record borrowing, and record returns.

### Problem statement
Small libraries often track books manually, making it difficult to know which books are available and who has borrowed them. This application keeps the catalog and borrowing history in a PostgreSQL database.

## 2. Target users and role

- Librarian: logs in and manages books and borrowing/return records.

The MVP intentionally uses one role because a separate student account system is not required for the core tracker.

## 3. Implemented features

- Librarian login/logout.
- Add, edit, delete books.
- Search by title, author, ISBN, or category.
- Filter by available/borrowed status.
- Borrow a book for a member.
- Return a borrowed book.
- Dashboard statistics.
- Recent transaction history.
- Supabase PostgreSQL persistence.
- Backend validation and protected API routes.
- Responsive HTML/CSS interface.

## 4. Technology stack

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js
- Express.js
- Supabase PostgreSQL
- Git/GitHub
- npm packages: express, @supabase/supabase-js, dotenv, cookie-parser, helmet, bcryptjs

## 5. Folder structure

```text
library-book-tracker/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── backend/
│   ├── server.js
│   ├── supabase.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── transactions.js
│   │   └── stats.js
│   ├── middleware/
│   │   └── auth.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## 6. Prerequisites

Install:
- Visual Studio Code: https://code.visualstudio.com/
- Node.js LTS: https://nodejs.org/
- Git: https://git-scm.com/
- A free Supabase account: https://supabase.com/

## 7. Setup on Windows

### Step 1: Verify software

Open PowerShell or the VS Code terminal:

```powershell
node --version
npm --version
git --version
```

Each command should print a version number.

### Step 2: Create the project

Create the folder `library-book-tracker`, then reproduce the folder structure shown above.

### Step 3: Install backend dependencies

Open the terminal inside `library-book-tracker/backend`:

```powershell
npm install
```

### Step 4: Create the Supabase project

1. Sign in to Supabase.
2. Create a new project.
3. Open the project's SQL Editor.
4. Copy the complete contents of `database/schema.sql`.
5. Run the SQL.
6. Open Table Editor and confirm `users`, `books`, and `transactions` exist.

### Step 5: Get server credentials

In Supabase, open the project's API settings. Copy:
- Project URL -> `SUPABASE_URL`
- Server-only service-role key -> `SUPABASE_SERVICE_ROLE_KEY`

Never put the service-role key in frontend code or GitHub.

### Step 6: Configure `.env`

Edit `backend/.env`:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
SESSION_SECRET=replace-with-a-long-random-secret
```

For a random secret, run:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the result into `SESSION_SECRET`.

### Step 7: Start the server

From the `backend` folder:

```powershell
npm start
```

Expected output:

```text
Library Book Tracker running at http://localhost:3000
```

Open `http://localhost:3000`.

### Demo login

```text
Username: admin
Password: admin123
```

Change the demo password/hash before using the application beyond a classroom demonstration.

## 8. Architecture

```text
Browser
  |
  | fetch()
  v
Express REST API
  |
  | Supabase server client
  v
Supabase PostgreSQL
```

The browser never receives the privileged Supabase service-role key.

## 9. API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | Health check |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current session |
| GET | /api/books | List books |
| POST | /api/books | Create book |
| PUT | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |
| GET | /api/transactions | List recent transactions |
| POST | /api/transactions/borrow | Borrow a book |
| POST | /api/transactions/:id/return | Return a book |
| GET | /api/stats | Dashboard counts |

All book, transaction, and statistics endpoints require an authenticated librarian session.

## 10. Security

- Passwords are stored as bcrypt hashes.
- Sessions use an HTTP-only cookie.
- Protected routes require a valid server-side session.
- The service-role Supabase key stays on the backend.
- `.env` is ignored by Git.
- Input is validated on the backend.
- Destructive book deletion is blocked for currently borrowed books.
- Helmet provides basic security headers.

For a larger production system, use a persistent session store and stronger account-management features. This MVP keeps sessions in server memory to remain easy for first-year students to understand.

## 11. Manual testing

1. Visit `/api/health`; expect `{"status":"ok"}`.
2. Login with the demo account; dashboard should appear.
3. Add a book; it should appear in the list and Supabase.
4. Edit the book; changes should persist after refresh.
5. Search for the book; only matching records should appear.
6. Borrow an available book; its status should become `borrowed`.
7. Try borrowing the same book again; the API should reject it.
8. Return the book; status should become `available`.
9. Try deleting a borrowed book; deletion should be rejected.
10. Delete an available book; it should disappear.
11. Logout; protected data should no longer load.
12. Resize the browser; layout should remain usable on mobile.

## 12. Troubleshooting

### `SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required`
Check `backend/.env` and restart the server.

### Login fails
Confirm the `users` row exists and the SQL seed was executed.

### `Failed to fetch`
Confirm the Node server is running and use `http://localhost:3000`, not by opening `index.html` directly.

### Database errors
Open Supabase Table Editor and verify that all three tables were created. Check the server terminal for the actual error.

### Port already in use
Change `PORT` in `.env`, for example to `3001`, then open the matching localhost URL.

## 13. GitHub upload

From the project root:

```powershell
git init
git status
git add .
git status
git commit -m "Build project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Before `git add .`, verify:
- `backend/.env` is ignored.
- `backend/node_modules/` is ignored.
- `.env.example` is included.
- No real credentials are present in source code.

If a secret was already committed, simply adding it to `.gitignore` is not enough. Rotate the exposed credential and remove it from repository history.

## 14. Limitations and future improvements

- Persistent sessions are not implemented in this MVP.
- There is only a librarian role.
- No email notifications are included.
- No fine/late-fee calculation is included.
- A future version could add Supabase Auth, multiple librarians, student accounts, due dates, overdue reports, CSV export, and pagination.

## 15. License

Educational project for learning full-stack web development.
