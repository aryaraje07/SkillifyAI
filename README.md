# SkillifyAI

SkillifyAI is an AI-assisted competency and assessment platform for official-statistics learning workflows. It combines a Next.js learner/trainer interface with an Express and MongoDB backend, role-based diagnostics, proctored assessments, competency evidence, skill-gap recommendations, learning materials, and optional blockchain result verification.

## Documentation

Complete project documentation is available in [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md).

## Quick Start

Requirements:

- Node.js 18 or newer
- MongoDB or MongoDB Atlas
- Ollama with the configured Qwen model for quiz and diagnostic generation

Install dependencies:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

Create `backend/.env` from [backend/.env.example](backend/.env.example), then set at least:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=<mongodb-connection-string>
DB_NAME=skillify_sih
JWT_SECRET=<strong-secret>
AI_PRIVATE_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
GEMINI_FALLBACK_ENABLED=false
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start Ollama, backend, and frontend in separate terminals:

```powershell
ollama run qwen2.5:7b
```

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

Backend:

```powershell
npm run dev
npm start
npm test
npm run create-admin
npm run seed:sih
```

Frontend:

```powershell
npm run dev
npm run type-check
npm run build
npm start
```

Never commit `.env`, `.env.local`, credentials, private keys, or `node_modules`.
