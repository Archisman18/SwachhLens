# SwachhLens

> **AI-Powered Civic Waste Triage & Municipal Decision Support System**  
> *Built for rapid urban triage, automated waste classification, and priority-driven dispatch.*

---

## 🏛️ Architecture Overview

```
SwachhLens/
├── backend/                      FastAPI Async REST Service
│   ├── app/
│   │   ├── main.py               App entrypoint, CORS, routers & startup migrations
│   │   ├── core/
│   │   │   ├── config.py         Pydantic settings (SQLite default / Postgres option)
│   │   │   └── database.py       Async SQLAlchemy engine (NullPool, SSL & dialect switching)
│   │   ├── models/               SQLAlchemy ORM models (complaint.py with native UUID & Enums)
│   │   ├── schemas/              Pydantic validation schemas (complaint.py)
│   │   ├── api/routes/           REST routes: /complaints, /dashboard
│   │   └── services/
│   │       ├── classifier.py         Groq Cloud AI + Zero-shot CLIP waste classification & non-waste rejection
│   │       ├── volume_estimator.py   Spatial volume ratio bucketing
│   │       ├── duplicate_detector.py Haversine proximity & time-window duplicate filter
│   │       ├── geocoder.py           OpenStreetMap Nominatim reverse geocoder for location sensitivity
│   │       ├── notifier.py           Status transition notification dispatcher
│   │       ├── priority_scorer.py    Weighted urgency & priority score engine
│   │       └── dispatch_recommender.py Rule engine for team & vehicle allocation
│   ├── requirements.txt          Python dependencies
│   └── .env.example              Backend environment template
├── frontend/
│   ├── citizen-app/              React 18 + Vite — Minimalist Editorial Citizen Portal
│   │   ├── src/
│   │   │   ├── pages/            HomePage, ReportPage, ConfirmationPage, MyReportsPage
│   │   │   ├── components/       Layout, CameraCapture, StatusTracker
│   │   │   └── api/              Client API, offline queueing & Supabase storage integration
│   │   └── index.css             Editorial Design System (Cream/Maroon/Forest palette, Playfair Display)
│   └── admin-dashboard/          React 18 + Vite + Tailwind + Leaflet — Municipal Control Room
│       ├── src/
│       │   ├── pages/            DashboardPage (with Live Analytics Charts), ComplaintDetailPage
│       │   ├── components/       MapView (CartoDB Voyager), ComplaintQueue, ComplaintCard
│       │   └── api/              Client API consumer & photo proof verification
│       └── tailwind.config.js    Design tokens matching the editorial palette
└── db/
    └── schema.sql                Supabase Postgres + PostGIS schema, Triggers & Storage RLS policies
```

---

## ✨ Key Features

### 1. 📱 Citizen Portal (`http://localhost:5173`)
- **Minimal Editorial Design**: Warm cream tones, serif typography (`Playfair Display`), announcement marquee ticker, and smooth scroll navigation.
- **Geotagged Photo Reporting**: Native camera capture and photo upload with automatic GPS coordinates.
- **Real-Time AI Triage**: Instant feedback on detected waste type, volume bucket, priority score, and assigned municipal team.
- **Authenticity & Non-Waste Rejection**: Rejects selfies, pets, and clean photos from triggering false emergency dispatches.
- **Offline Queuing**: Gracefully captures reports when offline and auto-submits once connection is restored.
- **Citizen Contribution Tracker**: Local history of submitted reports with dynamic resolution status.

### 2. 🧠 Automated AI & Triage Pipeline
- **Category Classification**: High-speed Groq AI triage (`qwen/qwen3.6-27b`) with CLIP zero-shot fallback (*Overflowing Bins*, *Plastic Waste*, *Illegal Dumps*, *Hazardous/E-Waste*, *Construction Debris*, *Organic Waste*).
- **Volume Ratio Estimation**: Spatial area heuristics bucketing into *Small*, *Medium*, *Large*, or *Very Large*.
- **Reverse Geocoding Sensitivity**: OpenStreetMap Nominatim reverse geocoding to prioritize hotspots near schools, hospitals, and water bodies.
- **Duplicate Detection**: Merges reports within a 50-meter radius submitted within a 48-hour window using Haversine calculation.
- **Priority Scoring**: Transparent weighted scoring formula:
  $$\text{Priority Score} = (3.0 \times \text{Volume}) + (2.0 \times \text{Sensitivity}) + (1.5 \times \text{Frequency}) + (0.05 \times \text{Age})$$
- **Automated Dispatch Recommendation**: Recommends appropriate crew (e.g. *Hazard Response Unit*, *Extra Sanitation Crew*) and vehicle type (*Mini Truck*, *Specialized Van*, *Handcart*).

### 3. 🗺️ Municipal Control Room (`http://localhost:5174`)
- **Live Interactive Map**: Clean CartoDB map tiles with urgency-colored markers and inspection popups.
- **Real-Time Analytics Dashboard**: Visual distribution charts for waste types, resolution status, and 30-day reporting trends.
- **Priority Queue Sidebar**: Search and tabbed filtering (*All Queue*, *🚨 Urgent*, *Pending Review*, *Dispatched*).
- **Incident Inspector & Photo Proof Verification**: Two-column view with full photograph, citizen notes, one-click crew assignment presets, and enforced before/after clean photo proof verification.

---

## 🚀 Quickstart Guide

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
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Backend runs at: `http://localhost:8000`
- Interactive Swagger API docs: `http://localhost:8000/docs`

> **Note on Database**: Defaults to zero-setup local SQLite (`swachhlens.db`). To connect to Supabase PostgreSQL, set `DATABASE_URL=postgresql+asyncpg://...` in `backend/.env`.

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
npm run dev -- --port 5174
```

- Control room opens at: `http://localhost:5174`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/complaints` | Submit new citizen report (runs AI triage pipeline) |
| `GET` | `/complaints` | List complaints (supports `?status=` filter) |
| `GET` | `/complaints/{id}` | Get single complaint details |
| `PATCH` | `/complaints/{id}/assign` | Assign response team and vehicle |
| `PATCH` | `/complaints/{id}/status` | Update resolution status (`reported`, `assigned`, `cleaned`, `verified`) with optional `resolution_photo_url` |
| `GET` | `/dashboard/hotspots` | Active complaint points for the map layer |
| `GET` | `/dashboard/queue` | Priority-sorted triage queue for authorities |
| `GET` | `/dashboard/analytics` | Waste breakdown, status distributions, and daily trends |

---

## 🔐 Environment Configuration

### Backend (`backend/.env`)
```ini
# Database: SQLite default or Supabase Postgres
DATABASE_URL=sqlite+aiosqlite:///./swachhlens.db
# DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres

# Groq Cloud AI API Key
GROQ_API_KEY=your_groq_api_key

# Supabase Storage (for waste photos)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=waste-photos
ENV=development
```

### Citizen App (`frontend/citizen-app/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin Dashboard (`frontend/admin-dashboard/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📜 License
MIT License. Developed for the Swachh Bharat urban municipal innovation initiative.
