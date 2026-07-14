# Campus Portal

A full-stack college management system with role-based access for **admins**, **faculty**, and **students**. Admins manage users and classes, faculty run their courses (materials, assignments, exams, attendance), and students access coursework, submit assignments, and track their own attendance and results.

Built with **FastAPI** (async Python) and **React + TypeScript**, backed by **PostgreSQL** and **AWS S3**.



## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- An AWS S3 bucket + IAM user (for file uploads)

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# ...then edit .env with your database URL, JWT secret, and AWS credentials

# Apply database migrations
alembic upgrade head

# Seed the first admin (one-time)
python -m app.scripts.create_first_admin

# Run the dev server
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend

```bash
cd frontend/campus-portal

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# VITE_API_URL defaults to http://127.0.0.1:8000

# Run the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

### 3. AWS S3 setup (for file uploads)

- Create a private S3 bucket (block all public access).
- Add a CORS policy allowing `GET`/`PUT` from your frontend origin.
- Create an IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on the bucket, and put its keys in the backend `.env`.

---

## Project Structure

```
campus-portal/
├── backend/
│   ├── app/
│   │   ├── auth/               # JWT security, login/logout, role dependencies
│   │   ├── database/           # SQLAlchemy models & async connection
│   │   ├── routers/            # admin / student / faculty endpoints + schemas
│   │   ├── scripts/            # one-time admin bootstrap
│   │   ├── s3.py               # presigned URL helpers
│   │   ├── config.py           # pydantic settings from .env
│   │   └── main.py             # app entry, CORS, router registration
│   ├── migrations/             # Alembic migration history
│   └── requirements.txt
└── frontend/campus-portal/
    └── src/
        ├── pages/              # Admin / Faculty / Student dashboards, login
        ├── hooks/              # useAuthGuard (server-side session check)
        └── ...


---


## Features

### Admin
- Create user accounts for any role (students, faculty, other admins) - there is **no public self-registration**
- Auto-generated enrollment numbers (`STU00001`) and employee IDs (`FAC00001`)
- Soft-delete (deactivate/reactivate) users
- Create classes and assign faculty / enroll students
- Dashboard with live user and class statistics

### Faculty
- View assigned classes with enrolled-student counts
- Upload course materials to S3, or attach external links (Google Drive, etc.)
- Create assignments and review student submissions
- Grade submissions with marks and feedback
- Create exams, enter per-student results, and view class performance analytics
- Mark attendance per class per date, with a summary dashboard highlighting at-risk students

### Student
- View enrolled courses, materials, and assignments
- Submit assignments (direct-to-S3 upload) and re-submit before grading
- View grades, exam results with class rank, and per-subject attendance
- Attendance dashboard that computes the 75% exam-eligibility rule and shows plain-English guidance ("you can miss 2 more classes")

---

## Tech Stack

**Backend**
- FastAPI (async) + Uvicorn
- SQLAlchemy 2.0 (async ORM) + asyncpg
- Alembic (schema migrations)
- Pydantic v2 (validation & settings)
- PyJWT + bcrypt (auth)
- SlowAPI (rate limiting)
- boto3 (AWS S3)

**Frontend**
- React 19 + TypeScript
- Vite (build tooling)
- Tailwind CSS v4
- React Router
- Recharts (data visualization)

**Infrastructure**
- PostgreSQL (database)
- AWS S3 (file storage via presigned URLs)

---

## Architecture

```
┌──────────────┐        httpOnly cookie          ┌──────────────┐
│              │  ─────────────────────────────► │              │
│   React SPA  │        JSON over HTTPS           │   FastAPI    │
│  (Vite/TS)   │  ◄───────────────────────────── │   backend    │
│              │                                  │              │
└──────┬───────┘                                  └──────┬───────┘
       │                                                 │
       │  direct upload/download                         │  async SQLAlchemy
       │  via presigned URLs                             │
       ▼                                                 ▼
┌──────────────┐                                  ┌──────────────┐
│   AWS S3     │                                  │  PostgreSQL  │
│  (files)     │                                  │  (data)      │
└──────────────┘                                  └──────────────┘
```

Files never pass through the backend. The server issues short-lived **presigned URLs** and the browser uploads/downloads directly to/from S3 - no memory pressure on the API, no upload size limits.

---

## Security Design

Security was treated as a first-class concern rather than an afterthought:

- **httpOnly cookies for auth.** JWTs are stored in `httpOnly`, `SameSite=Lax` cookies, not `localStorage` - so they're invisible to JavaScript and can't be exfiltrated via XSS. The `Secure` flag is toggled on in production.
- **Server-side role enforcement.** Every protected route re-derives the user and role from the cookie's JWT on each request. The client's claimed role is never trusted; a tampered request is rejected at the dependency layer before any handler runs.
- **No public registration.** Account creation is admin-only. The first admin is seeded via a one-time CLI script that writes directly to the database, breaking the chicken-and-egg problem without exposing an open endpoint.
- **Ownership checks at the data layer.** Faculty can only touch their own classes/materials/exams; students can only submit to classes they're enrolled in - verified via DB queries, not just UI gating.
- **Rate limiting** on the login endpoint (SlowAPI) to blunt brute-force attempts.
- **Least-privilege IAM.** The S3 IAM user is scoped to `PutObject`/`GetObject`/`DeleteObject` on a single bucket, not `AmazonS3FullAccess`.
- **Password hashing** with bcrypt.
- **Explicit CORS** - specific methods and headers, not wildcards.

---


## API Overview

Roughly 45 endpoints across four routers. A selection:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate, sets httpOnly cookie |
| `GET`  | `/auth/me` | Verify session, return current user |
| `POST` | `/admin/users` | Create a user (admin only) |
| `POST` | `/admin/classes/{id}/students/{uid}` | Enroll a student |
| `POST` | `/faculty/courses/{id}/materials/presign` | Get S3 upload URL |
| `POST` | `/faculty/courses/{id}/exams` | Create an exam |
| `GET`  | `/faculty/courses/{id}/attendance/summary` | Class attendance analytics |
| `POST` | `/student/assignments/{id}/submit/confirm` | Confirm a submission |
| `GET`  | `/student/attendance/summary` | Per-subject attendance vs 75% rule |
| `GET`  | `/student/results` | Exam results with class rank |

Full interactive documentation is auto-generated at `/docs`.

---

## Notable Engineering Decisions

**Presigned URLs over server-proxied uploads.** The backend never handles file bytes - it signs a URL and the browser talks to S3 directly. This keeps the API stateless and cheap, and sidesteps request-size limits. Stored view URLs are regenerated on each read since presigned GETs expire.

**Attendance denominator = sessions held, not calendar days.** A "session" exists only when attendance was actually taken, so holidays and un-held classes never dilute the percentage. This avoids building a separate holiday-calendar feature while keeping the 75% math honest.

**Normalized exams/results schema.** Exams and results live in separate tables, enabling aggregation across either axis - class performance per exam, or one student's trend across exams - which a flat grades table can't express cleanly.

**Migrations, not `create_all`.** Schema is managed exclusively through Alembic, so changes are versioned and reversible rather than silently applied at startup.

**Business logic on the server.** Computed values like attendance status, "classes you can miss," pass/fail counts, and class rank are calculated in the API and sent to the frontend as ready-to-render data - keeping the logic testable and the UI thin.

---

## License

This project was built as a personal/portfolio project.
