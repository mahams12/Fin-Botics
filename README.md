# FinBotics

An AI-powered CPA assistant for small businesses and freelancers. FinBotics helps automate expense tracking, answer tax questions, and generate tax-ready financial reports through a conversational AI chat interface.

The application lives in [`cpa-ai-bot/`](cpa-ai-bot/) and consists of a React frontend, a FastAPI backend, MongoDB, and Redis — all orchestrable with Docker Compose.

## Features

- **AI Chat Assistant** — Ask tax and bookkeeping questions, get help categorizing expenses, powered by the OpenAI API
- **Expense Tracking** — Create, categorize, and manage business expenses with receipt photo uploads
- **Financial Reports** — Monthly and annual reports, tax estimation, and downloadable documents (PDF/Excel via ReportLab and OpenPyXL)
- **Dashboard & Analytics** — Interactive charts of income and spending patterns (Recharts)
- **Google OAuth Login** — Sign in with a Google account
- **Profile & Settings** — Account management, profile picture uploads, theme support, and notifications

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18 (CRA), Tailwind CSS, React Router v6, React Query, Axios, Recharts, Lucide icons |
| Backend | FastAPI, Motor (async MongoDB), Pydantic, OpenAI SDK, Google Auth, Pillow |
| Database | MongoDB |
| Cache | Redis |
| Infra | Docker Compose, Nginx (production profile) |

## Project Structure

```
FinBotics/
└── cpa-ai-bot/
    ├── frontend/              # React app (port 3000)
    │   ├── src/
    │   │   ├── components/    # chat, expenses, reports, auth, common UI
    │   │   ├── pages/         # Home, Login, Dashboard, Chat, Expenses,
    │   │   │                  # Reports, Notifications, Profile, Settings
    │   │   ├── context/       # Auth, Chat, Theme providers
    │   │   ├── hooks/         # useApi, useAuth, useChat, useExpenses
    │   │   └── services/      # API client modules
    │   └── package.json
    ├── backend/               # FastAPI app (port 8000)
    │   ├── app/
    │   │   ├── api/v1/        # auth, users, expenses, chat, reports, admin
    │   │   ├── config/        # settings, database connection
    │   │   ├── models/        # user, expense, chat, report
    │   │   ├── schemas/       # Pydantic schemas
    │   │   ├── services/      # AI, auth, chat, expense, report, tax logic
    │   │   └── main.py        # app entry point
    │   ├── tests/             # pytest suite
    │   └── requirements.txt
    └── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker & Docker Compose (recommended)
- A Google Cloud OAuth 2.0 Client ID/Secret
- An OpenAI API key

### Environment Variables

Create a `.env` in `cpa-ai-bot/` (used by Docker Compose) and/or in `cpa-ai-bot/backend/` (read via `python-decouple`):

```env
MONGODB_URL=mongodb://localhost:27017/cpa_ai_bot
DATABASE_NAME=cpa_ai_bot
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

For the frontend, set `REACT_APP_API_URL=http://localhost:8000/api/v1` and `REACT_APP_GOOGLE_CLIENT_ID`.

To configure Google OAuth, create OAuth 2.0 credentials in the [Google Cloud Console](https://console.cloud.google.com/) and add `http://localhost:3000/auth/callback` as an authorized redirect URI.

### Run with Docker (recommended)

```bash
cd cpa-ai-bot
docker-compose up -d
```

This starts the frontend, backend, MongoDB, and Redis.

### Run manually

**Backend:**

```bash
cd cpa-ai-bot/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd cpa-ai-bot/frontend
npm install
npm start
```

**MongoDB & Redis** (if not using Compose):

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
docker run -d -p 6379:6379 --name redis redis:7.2-alpine
```

### Access

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Interactive API docs (when `DEBUG=True`): http://localhost:8000/docs

## API Overview

All routes are prefixed with `/api/v1`:

| Router | Endpoints |
|--------|-----------|
| `/auth` | Google OAuth login, current user |
| `/users` | User profile management |
| `/expenses` | CRUD for expenses, receipt uploads |
| `/chat` | AI assistant messaging |
| `/reports` | Monthly/annual reports, tax estimation |
| `/admin` | Admin operations |

## Testing

```bash
# Backend
cd cpa-ai-bot/backend
pytest tests/ -v

# Frontend
cd cpa-ai-bot/frontend
npm test
```

## Deployment

A production Nginx reverse proxy is available via the `production` Compose profile:

```bash
cd cpa-ai-bot
docker-compose --profile production up -d
```

Set `DEBUG=False` in production — this disables the `/docs` and `/redoc` endpoints.

## License

This project is licensed under the MIT License.
