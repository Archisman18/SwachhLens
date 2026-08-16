# SwachhLens

AI-powered waste response decision support system — TechNova Hackathon 2026.
See the PRD for full context, priorities, and build plan.

## Repo structure

```
swachhlens/
├── backend/                  FastAPI service
│   └── app/
│       ├── main.py           app entrypoint, CORS, routers
│       ├── core/              config.py (env settings), database.py (async engine/session)
│       ├── models/            SQLAlchemy models (complaint.py)
│       ├── schemas/           Pydantic request/response schemas
│       ├── api/routes/        complaints.py, dashboard.py
│       └── services/          classifier.py, volume_estimator.py, duplicate_detector.py,
│                               priority_scorer.py, dispatch_recommender.py
├── frontend/
│   ├── citizen-app/           React+Vite PWA — photo+GPS report flow
│   └── admin-dashboard/       React+Tailwind+Leaflet — map + priority queue
└── db/
    └── schema.sql             Postgres + PostGIS schema (run on Supabase or local Postgres)
```

## Backend setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL / Supabase keys
uvicorn app.main:app --reload
```

API docs at `http://localhost:8000/docs` once running.

## Database setup

Run `db/schema.sql` against your Postgres/Supabase project (Supabase: SQL Editor → paste → run).

## Frontend setup

```bash
cd frontend/citizen-app
npm install
npm run dev        # http://localhost:5173

cd ../admin-dashboard
npm install
npm run dev         # http://localhost:5174
```

Both frontends read `VITE_API_BASE_URL` (defaults to `http://localhost:8000`) — set it in a `.env` file in each frontend folder if your backend runs elsewhere.

## What's stubbed vs wired

- **Wired end-to-end**: report submission → DB write → duplicate check → priority score → dispatch recommendation → dashboard map/queue.
- **Stubbed (see TODOs)**: actual waste-classification model inference (`services/classifier.py`), volume-estimation model inference (`services/volume_estimator.py`), and photo upload to storage (currently a placeholder URL in `ReportForm.jsx`).

Wire those three and the pipeline is fully live.
