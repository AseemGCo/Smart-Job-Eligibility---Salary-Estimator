# 🎯 TalentScope — Full-Stack Smart Job Eligibility & Salary Estimator

A production-ready **HR-tech platform** that evaluates job candidates, estimates
salary ranges, scores eligibility, and tracks recruitment analytics — now with
**user authentication, a REST API, and a MySQL database**.

> Evolved from a pure Vanilla-JS challenge app into a complete full-stack
> application: **Vanilla JS frontend + Node/Express API + MySQL + JWT auth**.

---

## 📐 Architecture

```
┌──────────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│        FRONTEND          │   ───────────────────────► │         BACKEND          │
│  HTML5 · CSS3 · Vanilla  │    Authorization: Bearer   │  Node.js · Express       │
│  JS (no frameworks)      │ ◄───────────────────────── │  JWT · bcrypt · Helmet   │
│  Hosted on Vercel        │        JSON responses      │  Hosted on Render/Railway│
└──────────────────────────┘                            └─────────────┬────────────┘
                                                                       │ mysql2 (pooled,
                                                                       │ parameterized)
                                                              ┌────────▼─────────┐
                                                              │      MySQL 8     │
                                                              │  users           │
                                                              │  candidates (FK) │
                                                              └──────────────────┘
```

- **Business rules run on the backend** (eligibility, salary, confidence,
  ranking, suggestions) so results are consistent and tamper-proof.
- **JWT** secures the API; passwords are stored only as **bcrypt hashes**.
- **One user → many candidates** with a foreign-key relationship.

---

## 📁 Folder Structure

```
project-root/
├── frontend/                    # Static site (deploy to Vercel)
│   ├── index.html               # Landing page
│   ├── login.html               # Login
│   ├── register.html            # Registration (+ password strength)
│   ├── dashboard.html           # User/Admin dashboard
│   ├── candidates.html          # Evaluate & manage candidates
│   ├── profile.html             # Profile + activity
│   ├── admin.html               # Admin-only management
│   ├── vercel.json
│   ├── css/styles.css
│   └── js/
│       ├── config.js            # API base URL config
│       ├── ui.js                # Toasts, theme, helpers
│       ├── api.js               # fetch wrapper + auth header
│       ├── auth.js              # session, route guards, app chrome
│       ├── landing.js login.js register.js
│       ├── dashboard.js candidates.js profile.js admin.js
│
├── backend/                     # REST API (deploy to Render/Railway)
│   ├── server.js                # App entry (helmet, cors, rate limit, routes)
│   ├── package.json
│   ├── .env.example
│   ├── config/db.js             # MySQL pool + connection test
│   ├── middleware/
│   │   ├── auth.js              # JWT validation + requireAdmin
│   │   ├── validation.js        # express-validator rule sets
│   │   └── errorHandler.js      # 404 + central error handler
│   ├── routes/                  # auth · candidate · dashboard
│   ├── controllers/             # thin HTTP layer
│   ├── services/                # auth · candidate · eligibility (rules engine)
│   ├── models/                  # user · candidate (parameterized SQL)
│   ├── utils/                   # jwt · apiResponse
│   └── scripts/migrate.js       # create schema, seed, default admin
│
├── database/
│   ├── schema.sql               # Tables, keys, indexes
│   ├── sample_data.sql          # Demo users + candidates
│   └── erd.md                   # Entity-relationship diagram
│
├── docs/
│   └── API.md                   # Full API documentation
│
└── README.md
```

---

## ✨ Features

### Authentication & Security
- Registration with name/email/password + **password strength indicator** & confirm-match.
- Login with **JWT**, “remember me” (7-day token), logout, **protected routes**.
- Passwords hashed with **bcrypt** (never stored in plain text).
- **Roles**: regular user & admin (role-based access).
- **Helmet**, **CORS** allow-list, **rate limiting**, input validation & sanitization, parameterized SQL (**SQL-injection safe**), secrets via **`.env`**.

### Candidate Engine (server-side)
- Eligibility · Priority status · Salary range (with relocation & PG bonuses) ·
  Confidence level · **Ranking score** `(skill × 0.7) + (projects × 5)` · Improvement suggestions.

### Product
- **Dashboards** with totals, eligible/priority counts, average skill score, and **Top Performer**.
- Candidate **CRUD**, **search**, **filter** (status), **sort** (skill/salary/projects/rank), and **report export**.
- **Admin dashboard**: total users, all candidates, search/filter/delete.
- SaaS-style UI: glassmorphism, gradients, **dark/light mode**, loaders, toasts, empty/error states, fully responsive.

---

## 🧠 Business Logic

| Rule | Detail |
| --- | --- |
| **Eligible** | Age ≥ 18 **and** Skill ≥ 60 **and** Projects ≥ 2 |
| **Priority** | Eligible **and** Skill ≥ 80 **and** Projects ≥ 3 |
| **Not Eligible** | Skill < 60 (or age/project minimums unmet) |

| Skill | Base Salary | Bonuses |
| --- | --- | --- |
| 60–70 | ₹4–6 LPA | **Relocate = Yes** → +₹1 LPA both ends |
| 71–85 | ₹6–10 LPA | **Postgraduate** → +₹1 LPA both ends |
| 86–100 | ₹10–18 LPA | |

| Projects | Confidence |
| --- | --- |
| ≥ 4 | High (90%) |
| 2–3 | Medium (60%) |
| < 2 | Low (30%) |

---

## 🛠️ Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (no frameworks/libraries)
**Backend:** Node.js, Express.js
**Database:** MySQL 8+
**Auth/Security:** JWT, bcryptjs, Helmet, CORS, express-rate-limit, express-validator, dotenv

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1) Clone
```bash
git clone https://github.com/<your-username>/talentscope.git
cd talentscope
```

### 2) Database setup
Make sure MySQL is running, then either run the SQL files manually:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample_data.sql   # optional demo data
```
…**or** use the backend helper script (after step 3 configures `.env`):
```bash
cd backend
npm run db:migrate      # creates schema + default admin
npm run db:seed         # schema + sample data + default admin
```

### 3) Backend
```bash
cd backend
cp .env.example .env          # then edit with your real values
npm install
npm run dev                   # http://localhost:4000
```

Edit `.env`:
```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=talentscope
JWT_SECRET=<generate a long random string>
```
Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4) Frontend
```bash
cd ../frontend
# serve statically (any of these):
python3 -m http.server 5173        # http://localhost:5173
# or:  npx serve .                  # or VS Code "Live Server"
```
> Keep the frontend on the port listed in the backend's `CORS_ORIGIN`.

### Demo accounts (after seeding)
| Email | Password | Role |
| --- | --- | --- |
| `priya@example.com` | `Password@123` | user |
| `karan@example.com` | `Password@123` | user |
| `demoadmin@example.com` | `Password@123` | admin |
| `admin@talentscope.com` | from `.env` `ADMIN_PASSWORD` | admin |

---

## 💻 Local Development

- Backend: `npm run dev` (uses Node's `--watch` to auto-restart).
- Frontend: any static server; it auto-targets `http://localhost:4000/api` on localhost.
- Health check: `GET http://localhost:4000/api/health`.

---

## 🌐 Deployment Guide

### Frontend → Vercel
1. Push the repo to GitHub.
2. On [vercel.com/new](https://vercel.com/new), import the repo and set
   **Root Directory = `frontend`**. Framework preset: **Other**. No build command.
3. In `frontend/js/config.js`, set `PROD_API_BASE` to your deployed backend URL
   (e.g. `https://talentscope-api.onrender.com/api`). Commit & redeploy.

### Backend → Render
1. New **Web Service** → connect repo → **Root Directory = `backend`**.
2. Build command: `npm install` · Start command: `npm start`.
3. Add environment variables (from `.env.example`), including `DB_*`, `JWT_SECRET`,
   and `CORS_ORIGIN=https://<your-vercel-domain>`.

### Backend → Railway
1. New Project → Deploy from repo → set **Root Directory = `backend`**.
2. Add a **MySQL** plugin; copy its credentials into the service variables.
3. Set `DB_SSL=true` if the provider requires SSL. Add `JWT_SECRET` & `CORS_ORIGIN`.

### Database → Managed MySQL
- Use Railway MySQL, PlanetScale, AWS RDS, etc.
- Run `database/schema.sql` (and optionally `sample_data.sql`) against it,
  or run `npm run db:migrate` with the production `.env`.

### Environment variables (summary)
| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `CORS_ORIGIN` | Comma-separated allowed frontend origins |
| `DB_HOST/PORT/USER/PASSWORD/NAME` | MySQL connection |
| `DB_SSL` | `true` for managed MySQL requiring SSL |
| `JWT_SECRET` | Signing secret (**required**) |
| `JWT_EXPIRES_IN` / `JWT_REMEMBER_EXPIRES_IN` | Token lifetimes |
| `BCRYPT_SALT_ROUNDS` | Hashing cost |
| `ADMIN_*` | Default admin created by the migrate script |

---

## 📡 API Documentation

Full reference in **[docs/API.md](docs/API.md)**. Quick map:

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | Create account |
| POST | `/api/auth/login` | public | Log in (JWT) |
| POST | `/api/auth/logout` | user | Log out |
| GET | `/api/auth/profile` | user | Current user |
| GET | `/api/candidates` | user | List (search/filter/sort) |
| GET | `/api/candidates/:id` | user | Get one |
| POST | `/api/candidates` | user | Evaluate + create |
| PUT | `/api/candidates/:id` | user | Update (re-evaluate) |
| DELETE | `/api/candidates/:id` | user | Delete |
| GET | `/api/dashboard/stats` | user | Analytics (admin = global) |

---

## 🗄️ Database

See **[database/erd.md](database/erd.md)** for the full ERD.

- `users` — `id, name, email (unique), password_hash, role, created_at, updated_at`
- `candidates` — `id, user_id (FK→users.id, CASCADE), candidate_name, age, education, skill_score, projects, relocate, eligibility, priority_status, confidence_level, salary_min, salary_max, ranking_score, suggestions (JSON), created_at`

---

## 🔒 Security Features

- bcrypt password hashing · JWT authentication · token-validation middleware.
- Role-based authorization (`requireAdmin`).
- SQL-injection protection via parameterized queries + ORDER BY whitelist.
- Input validation & sanitization (express-validator) + output escaping on the client.
- Helmet security headers · CORS allow-list · global + auth rate limiting.
- Secrets via `.env` (never hardcoded; `.env` is git-ignored).

---

## 📄 License

MIT — free to use, modify, and learn from.

<p align="center">Built with <strong>HTML5 · CSS3 · Vanilla JS · Node.js · Express · MySQL</strong></p>
