# CPA AI Bot 🤖

An intelligent CPA assistant that helps automate expense tracking, tax preparation, and financial reporting using AI technology.

## 🚀 Features

- **AI-Powered Chat Assistant** - Get instant answers to tax questions and expense categorization help
- **Smart Expense Tracking** - Automatically categorize and track business expenses with OCR receipt scanning
- **Tax-Ready Reports** - Generate comprehensive reports ready for tax filing and compliance
- **Financial Analytics** - Visualize spending patterns and identify tax-saving opportunities
- **Google OAuth Authentication** - Secure login with Google accounts
- **Real-time Dashboard** - Monitor your financial health with interactive charts and KPIs

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Recharts** - Charts and data visualization
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor (async driver)
- **Google OAuth** - Authentication without JWT
- **OpenAI API** - AI-powered chat functionality
- **Pydantic** - Data validation and serialization

### Infrastructure
- **Docker** - Containerization
- **Redis** - Caching and session storage
- **Nginx** - Reverse proxy (production)

## 📦 Project Structure

```
cpa-ai-bot/
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API calls
│   │   ├── context/         # React Context
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS files
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── main.py          # FastAPI app entry point
│   └── requirements.txt
├── docker-compose.yml        # Docker services
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Google Cloud Platform account (for OAuth)
- OpenAI API key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cpa-ai-bot.git
cd cpa-ai-bot
```

### 2. Environment Configuration

Create environment files:

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
```

**Frontend (.env)**
```bash
cp frontend/.env.example frontend/.env
```

Update the environment variables with your actual values:

- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- Database URLs
- Other configuration options

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Identity services
4. Create OAuth 2.0 Client ID credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - Your production domain callback URL
6. Copy Client ID and Secret to your `.env` files

### 4. Development Setup

#### Option A: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option B: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Database:**
```bash
# MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Redis
docker run -d -p 6379:6379 --name redis redis:7.2-alpine
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Lint code
```

### Backend Development

```bash
cd backend
uvicorn app.main:app --reload  # Start with auto-reload
pytest                         # Run tests
black .                        # Format code
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it mongodb mongosh

# View Redis data
docker exec -it redis redis-cli
```

## 📚 API Documentation

The API documentation is automatically generated and available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Key API endpoints:
- `POST /api/v1/auth/google` - Google OAuth login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/expenses` - List expenses
- `POST /api/v1/expenses` - Create expense
- `POST /api/v1/chat/message` - Send chat message
- `GET /api/v1/reports/monthly` - Generate monthly report

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend Docker image
cd backend
docker build -t cpa-ai-bot-backend .
```

### Docker Production

```bash
# Start production services
docker-compose --profile production up -d
```

### Environment Variables (Production)

Ensure these are set in production:
- `ENVIRONMENT=production`
- `DEBUG=False`
- `SECURE_COOKIES=true`
- Proper database URLs
- SSL certificates for HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@cpa-ai-bot.com
- 💬 Discord: [Join our community](https://discord.gg/cpa-ai-bot)
- 📖 Documentation: [docs.cpa-ai-bot.com](https://docs.cpa-ai-bot.com)

## 🙏 Acknowledgments

- OpenAI for GPT API
- FastAPI team for the amazing framework
- React team for the frontend library
- All open source contributors

---

**Built with ❤️ for modern businesses**