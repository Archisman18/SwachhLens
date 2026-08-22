# SwachhLens

> **AI-Powered Civic Waste Response & Municipal Decision Support System**  
> *Built for rapid urban triage, automated waste classification, and priority-driven dispatch.*

---

## Architecture Overview

```
SwachhLens/
├── backend/                      FastAPI Async REST Service
│   ├── app/
│   │   ├── main.py               App entrypoint, CORS, routers & startup migrations
│   │   ├── core/
│   │   │   ├── config.py         Pydantic settings (SQLite default / Postgres option)
│   │   │   └── database.py       Async SQLAlchemy engine & table lifecycle
│   │   ├── models/               SQLAlchemy ORM models (complaint.py)
│   │   ├── schemas/              Pydantic validation schemas
│   │   ├── api/routes/           REST routes: /complaints, /dashboard
│   │   └── services/
│   │       ├── classifier.py         Zero-shot CLIP waste category classification
│   │       ├── volume_estimator.py   Spatial volume ratio bucketing
│   │       ├── duplicate_detector.py Haversine proximity & time-window duplicate filter
│   │       ├── priority_scorer.py    Weighted urgency & priority score engine
│   │       └── dispatch_recommender.py Rule engine for team & vehicle allocation
│   └── requirements.txt          Python dependencies
├── frontend/
│   ├── citizen-app/              React 18 + Vite — Minimalist Editorial Citizen Portal
│   │   ├── src/
│   │   │   ├── pages/            HomePage, ReportPage, ConfirmationPage, MyReportsPage
│   │   │   ├── components/       Layout, CameraCapture, StatusTracker
│   │   │   └── api/              Client service & local storage tracker
│   │   └── index.css             Editorial Design System (Cream/Maroon palette, Playfair Display)
│   └── admin-dashboard/          React 18 + Vite + Tailwind + Leaflet — Municipal Control Room
│       ├── src/
│       │   ├── pages/            DashboardPage, ComplaintDetailPage
│       │   ├── components/       MapView (CartoDB Voyager), ComplaintQueue, ComplaintCard
│       │   └── api/              Client API consumer
│       └── tailwind.config.js    Custom design tokens matching the editorial palette
└── db/
    └── schema.sql                Optional Postgres + PostGIS schema for cloud deployment
```

---

## Key Features

### 1. Citizen Portal (`http://localhost:5173`)
- **Minimal Editorial Design**: Warm cream tones, serif typography (`Playfair Display`), announcement marquee ticker, and subtle micro-interactions.
- **Geotagged Photo Reporting**: Native camera / upload with automatic GPS coordinates capture.
- **Real-Time AI Breakdown**: Instant feedback on detected waste type, volume bucket, priority score, and assigned municipal team.
- **Citizen Contribution Tracker**: Local history of submitted reports with dynamic resolution status.

### 2. Automated AI & Triage Pipeline
- **Category Classification**: Zero-shot detection for *Overflowing Bins*, *Plastic Waste*, *Illegal Dumps*, *Hazardous/E-Waste*, *Construction Debris*, and *Organic Waste*.
- **Volume Ratio Estimation**: Bucketing into *Small*, *Medium*, *Large*, or *Very Large*.
- **Duplicate Detection**: Merges reports within a 50-meter radius submitted within a 48-hour window.
- **Priority Scoring**: Multi-factor scoring (Volume weight + Location sensitivity + Report frequency + Age).
- **Automated Dispatch Recommendation**: Recommends appropriate crew (e.g. *Hazard Response Unit*, *Sanitation Crew A*) and vehicle type (*Mini Truck*, *Specialized Van*, *Handcart*).

### 3. Municipal Control Room (`http://localhost:5174`)
- **Live Interactive Map**: Clean CartoDB map tiles with urgency-colored markers and inspection popups.
- **Priority Queue Sidebar**: Search and tabbed filtering (*All Queue*, *🚨 Urgent*, *Pending Review*, *Dispatched*).
- **Incident Inspector**: Two-column view with full photograph, citizen notes, one-click crew assignment presets, and lifecycle status updater (*Reported* → *Assigned* → *Cleaned* → *Verified*).

---

## Quickstart Guide

### Prerequisites
- Python 3.10+ (Python 3.13 supported)
- Node.js 18+ & npm

---

### Step 1: Start Backend API

```powershell
cd backend

# Create & activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # On Windows (or 'source .venv/bin/activate' on Linux/macOS)

# Install dependencies
python -m pip install -r requirements.txt

# Start the server (SQLite database is created automatically)
python -m uvicorn app.main:app --reload
```

- Backend runs at: `http://localhost:8000`
- Interactive Swagger API docs: `http://localhost:8000/docs`

> **Note on Database**: Defaults to zero-setup local SQLite (`swachhlens.db`). To connect Supabase or PostgreSQL instead, set `DATABASE_URL=postgresql+asyncpg://...` in `backend/.env`.

---

### Step 2: Start Citizen Portal

```powershell
cd frontend/citizen-app
npm install
npm run dev
```

- Portal opens at: `http://localhost:5173`

---

### Step 3: Start Municipal Control Room

```powershell
cd frontend/admin-dashboard
npm install
npm run dev
```

- Control room opens at: `http://localhost:5174`

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/complaints` | Submit new citizen report (runs AI triage pipeline) |
| `GET` | `/complaints` | List complaints (supports `?status=` filter) |
| `GET` | `/complaints/{id}` | Get single complaint details |
| `PATCH` | `/complaints/{id}/assign` | Assign response team and vehicle |
| `PATCH` | `/complaints/{id}/status` | Update resolution status (`reported`, `assigned`, `cleaned`, `verified`) |
| `GET` | `/dashboard/hotspots` | Active complaint points for the map layer |
| `GET` | `/dashboard/queue` | Priority-sorted triage queue for authorities |

---

## Environment Variables

### Backend (`backend/.env`)
```ini
DATABASE_URL=sqlite+aiosqlite:///./swachhlens.db
ENV=development
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_STORAGE_BUCKET=waste-photos
```

### Citizen App (`frontend/citizen-app/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Admin Dashboard (`frontend/admin-dashboard/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000
```
