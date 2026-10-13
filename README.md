# Unstuck

**Less overthinking. More doing.**

Unstuck is an AI-powered planning app for people who feel overwhelmed by everything on their plate. You write down whatever is on your mind in your own words, choose how much time you have and how much energy you have, and Unstuck turns it into a realistic plan for today. It recommends up to three priorities that fit your available time, explains why each one was chosen and sets the rest aside for later.

## Features

- **Brain dump input.** Write in sentences, bullet points or whatever feels natural.
- **AI task extraction.** Messy text is turned into clear, actionable tasks with stated deadlines.
- **Realistic planning.** At most three tasks for today, always within your time budget.
- **Explanations.** Every task includes a short reason for where it was placed.
- **Progress tracking.** Mark tasks complete or reopen them. Progress is saved to the database.
- **Plan restoration.** Refreshing the page brings your plan back.
- **Text export.** Download the current plan as a `.txt` file.
- **Plan history.** Past plans are listed with their progress and can be reopened at any time.
- **Input validation and error handling.** Invalid input, AI failures, database errors and network problems show clear messages, and your draft is never lost.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite and Tailwind CSS |
| Backend | Python, FastAPI and Pydantic |
| Database | SQLite with SQLAlchemy 2.0 |
| AI | Claude (Anthropic API), using Claude Haiku 5.5 |

## Architecture

```
   ┌──────────────┐   HTTP/JSON   ┌──────────────────┐    SQL     ┌──────────┐
   │   Frontend   │ ────────────▶ │     Backend      │ ─────────▶ │ Database │
   │    React     │ ◀──────────── │     FastAPI      │ ◀───────── │  SQLite  │
   └──────────────┘               └──────────────────┘            └──────────┘
                                          │  ▲
                                          ▼  │
                                   ┌──────────────┐
                                   │  Claude API  │
                                   └──────────────┘
```

The frontend never talks to the AI or the database directly. Every request goes through the FastAPI backend, which keeps the API key private and keeps all validation in one place.

### How a plan is created

1. The user submits their brain dump, available time and energy level.
2. FastAPI validates the request with a Pydantic schema.
3. The AI service sends the text to Claude, which returns a structured list of tasks.
4. The planning service applies the rules: it removes blank and duplicate tasks, keeps at most three tasks for today, makes sure they fit the time budget and moves everything else to later.
5. The plan and its tasks are saved to SQLite in a single transaction.
6. The saved plan is returned to the frontend and displayed.

### Key design decisions

- **AI for interpretation, Python for correctness.** Claude is good at understanding messy language, but it is not guaranteed to follow every rule. The planning service enforces the important constraints deterministically, so the plan is always valid no matter what the AI returns.
- **Structured AI output.** Claude's response is constrained to a Pydantic schema, so the backend receives a validated object rather than free text.
- **The database is the source of truth.** The frontend only stores the plan ID in the browser. Every change is saved by the backend before it appears on screen.
- **Privacy.** The original brain dump is sent to the AI but never stored.
- **Prompt injection protection.** The user's text is clearly marked as data in the prompt, and the planning rules are enforced regardless of what the AI returns.
- **Simple by design.** SQLite needs no setup, and the database URL is configurable, so moving to PostgreSQL would only require a configuration change.

## Project Structure

```
backend/
  app/
    main.py              App setup, routes and error handling
    database.py          Database connection and sessions
    models.py            Database tables (Plan and Task)
    schemas.py           Request, response and AI output schemas
    routes/plans.py      API endpoints
    services/
      ai_service.py        Claude integration
      planning_service.py  Planning rules
      export_service.py    Text export
frontend/
  src/
    App.tsx              View switching and plan restoration
    api.ts               Backend API calls
    types.ts             Shared TypeScript types
    format.ts            Shared formatting helpers
    views/
      IntakeView.tsx     Brain dump form
      PlanView.tsx       Plan results
      PastPlans.tsx      List of past plans
```

## Getting Started

### Prerequisites

- Python 3.10 or newer
- Node.js 20 or newer
- An Anthropic API key

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Open `backend/.env`, add your Anthropic API key and set `ANTHROPIC_MODEL=claude-haiku-5-5`. Then start the server:

```powershell
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`, and interactive documentation is available at `http://localhost:8000/docs`.

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/plans` | Create a plan from a brain dump |
| GET | `/api/plans` | List past plans with their progress |
| GET | `/api/plans/{plan_id}` | Retrieve a saved plan |
| PATCH | `/api/plans/{plan_id}/tasks/{task_id}` | Mark a task complete or pending |
| GET | `/api/plans/{plan_id}/export` | Download the plan as a text file |

## Future Improvements

- Moving tasks between Today and Later
- JSON export and copy to clipboard
- Suggested first steps for each priority
- User accounts so plans are private to each user

## About This Project

I built Unstuck as a three-hour project.
