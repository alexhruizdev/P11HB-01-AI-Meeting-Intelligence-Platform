# P11HB-01 — AI Meeting Intelligence Platform

> **AI Automation Engineer Portfolio** | Business Process Automation

An end-to-end intelligent pipeline that transforms meeting transcripts into actionable executive dashboards with AI-powered insights and dual-context chat assistant.

---

## Live Demo

📹 **[Watch Demo Video](#)** — 3-5 min walkthrough
🌐 **[Live App](#)** — Coming soon

---

## What It Does

1. Drop a `.txt` meeting transcript into a folder
2. n8n automation reads, processes with a local LLM (Ollama + Llama 3.2), and stores structured data in PostgreSQL
3. A FastAPI REST API serves the data
4. A React dashboard visualizes KPIs, trends, decisions, risks, and tasks
5. A dual AI chat assistant answers questions — globally (all meetings) or scoped to a specific meeting

---

## Architecture

```
Meeting Transcripts (.txt)
    → n8n (Event-driven automation + Idempotent ETL)
    → Ollama / Llama 3.2 (Local LLM — Prompt Engineering)
    → PostgreSQL (Structured persistence)
    → FastAPI (RESTful API — Separation of concerns)
    → React + Tailwind (Component-driven SPA)
    → AI Chat (Context-scoped LLM assistant)
```

---

## Tech Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Automation  | n8n (Docker)                           |
| Database    | PostgreSQL                             |
| Backend     | FastAPI + Uvicorn + SQLAlchemy         |
| Frontend    | React + Vite + Tailwind CSS + Recharts |
| Local AI    | Ollama + Llama 3.2                     |
| HTTP Client | Axios                                  |
| Routing     | react-router-dom                       |

---

## Key Features

- **Idempotent ETL Pipeline** — run the workflow N times without duplicating data
- **Prompt Engineering** — LLM extracts structured JSON from free-form meeting text
- **Cross-Document Reconciliation** — tracks task and risk closure across multiple meetings of the same committee
- **Dual AI Chat** — CHAT-G (global context across all meetings) / CHAT-R (scoped to one meeting)
- **Executive Dashboard** — KPI cards with sub-metrics, donut charts, trend line charts, bar charts
- **Smart Meeting Table** — filter by committee, filter by pending status, progress bar with X/Y tasks
- **Business Rules** — PROGRAMMED and CANCELLED meetings show only agenda items, no operational data

---

## Dashboard Navigation

```
/ General Dashboard
│  ├── 4 KPI Cards (Meetings / Tasks / Risks / Decisions + sub-metrics)
│  ├── 4 Donut Charts (completion status per indicator)
│  ├── 3 Charts (task trends / risk trends / meetings by committee)
│  ├── Meetings Table (filter by committee + pending status + pagination)
│  ├── Decisions Table (paginated + committee filter)
│  ├── Risks Table (paginated + committee filter)
│  ├── Topics Table (paginated + committee filter)
│  └── AI Executive Chat — global context
│
/meeting/:id  Meeting Dashboard
│  ├── Contextual banner (PROGRAMMED=orange / CANCELLED=red)
│  ├── Executive Summary Card
│  ├── 3 Donut KPIs (Tasks / Risks / Decisions) — COMPLETED meetings only
│  ├── Tasks / Decisions / Risks / Topics tables
│  └── AI Meeting Chat — scoped to this meeting only
```

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Docker Desktop
- Ollama with `llama3.2:latest`

### 1. Clone the repository

```bash
git clone https://github.com/alexhruizdev/P11HB-01-AI-Meeting-Intelligence-Platform.git
cd P11HB-01-AI-Meeting-Intelligence-Platform
```

### 2. Database setup

```bash
psql -U postgres -c "CREATE DATABASE p11hb_01;"
```

### 3. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv requests
uvicorn app:app --reload
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Ollama

```bash
ollama pull llama3.2
ollama serve
```

### 6. n8n (Docker)

```bash
docker compose up -d
# Open http://localhost:5678
# Import workflow from n8n/workflows/ folder
```

### 7. Load sample data

Drop the `.txt` files from `meeting_files/` into the watched folder and trigger the n8n workflow manually.

---

## API Reference

| Method | Endpoint                  | Description                                       |
| ------ | ------------------------- | ------------------------------------------------- |
| GET    | `/meetings`               | All meetings with pending count and progress      |
| GET    | `/dashboard`              | Global KPIs with completion percentages           |
| GET    | `/dashboard/charts`       | Chart data (trends by meeting + by committee)     |
| GET    | `/meeting/{id}`           | Full meeting detail (restricted if not REALIZADA) |
| GET    | `/meeting/{id}/dashboard` | Meeting KPIs                                      |
| GET    | `/decisions`              | All decisions with committee context              |
| GET    | `/risks`                  | All risks with committee context                  |
| GET    | `/topics`                 | All topics with committee context                 |
| POST   | `/chat`                   | AI chat `{"question": "...", "meeting_id": null}` |

---

## Project Structure

```
P11HB-01/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── routes.py
│   ├── ai_routes.py
│   └── services/
│       ├── ai_service.py       ← Ollama integration + dual context
│       └── sql_service.py      ← All database queries
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   └── MeetingDashboard.jsx
│       └── components/
│           ├── DashboardCards.jsx
│           ├── DashboardSummary.jsx
│           ├── DashboardCharts.jsx
│           ├── MeetingTable.jsx
│           ├── DecisionList.jsx
│           ├── RiskList.jsx
│           ├── TopicList.jsx
│           ├── TaskList.jsx
│           └── AIChat.jsx
├── meeting_files/
│   └── (7 sample meeting transcripts .txt)
└── README.md
```

---

## Key Engineering Decisions

| Decision                      | Rationale                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Idempotent ETL                | Workflow can run N times safely — standard data engineering pattern                          |
| Local LLM (Ollama)            | No cloud API costs, data stays on-premise, no rate limits                                    |
| Dual chat context             | Global chat pollutes meeting-specific answers — isolation by design                          |
| Restricted meeting view       | PROGRAMMED/CANCELLED meetings have no operational data — business rule enforced at API level |
| Cross-document reconciliation | LLM reasons over meeting history to close tasks/risks — not just extraction                  |

---

## Roadmap — v2.0

- [ ] Global committee filter (Power BI style — full dashboard refresh on selection)
- [ ] Chat history persistence (PostgreSQL `chat_history` table)
- [ ] Committee Dashboard (third navigation level)
- [ ] Export reports: PDF / XLSX / DOCX from chat
- [ ] JWT Authentication + roles (Admin / Viewer / Committee Member)
- [ ] Multi-tenant architecture (schema per organization)
- [ ] Cloud deploy: Vercel + Railway + Supabase
- [ ] Groq API integration (cloud demo without local Ollama)
- [ ] Docker Compose full stack
- [ ] CI/CD with GitHub Actions

---

## Author

**Alex H. Ruiz** — AI Automation Engineer
Specialization: Business Process Automation & Higher Education AI

---

_Part of the **Proyecto 11HB** portfolio — AI Business Process Automation line._
_Next project: [P11HB-02 — Invoice Processing AI](#)_
