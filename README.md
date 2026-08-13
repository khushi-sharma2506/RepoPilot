<div align="center">

<img src="https://github.com/khushi-sharma2506/RepoPilot/blob/main/frontend/public/logo.png?raw=true" width="80" height="80" style="border-radius: 50%;" alt="RepoPilot Logo" />

# RepoPilot

**Turn any GitHub repository into a cinematic, voice-narrated demo video — in minutes.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-repo--pilot--nine--nu.vercel.app-blue?style=for-the-badge&logo=vercel)](https://repo-pilot-nine-nu.vercel.app)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/AI-Gemini-8E44AD?style=for-the-badge&logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## What is RepoPilot?

RepoPilot is an AI-powered studio that eliminates the friction of creating high-quality developer demo videos. Just paste a GitHub URL — our AI agents will analyze your codebase, craft a compelling narrative, generate a studio-quality voiceover, and produce a video ready for YouTube, Product Hunt, TikTok, or your portfolio.

No video editing skills required.

---

## Features

| Feature | Description |
|---|---|
| **Autonomous Codebase Analysis** | Deep-dives into your repo via the GitHub API to understand features, architecture, and value |
| **AI Narrative Generation** | Creates tailored story angles — "The Setup", "Feature Deep-Dive", "The Origin Story" — and writes synchronized scripts |
| **Neural Voiceovers** | Generates studio-quality TTS audio with multiple voice profiles and adjustable pitch |
| **Live Preview Engine** | Interactive Remotion-powered player — preview timing, text overlays, and audio in real-time |
| **Green Screen Export** | Exports a pristine `#00FF00` chroma-key MP4 ready to drop into Premiere Pro, CapCut, or DaVinci |
| **Multi-Format Rendering** | Landscape (16:9) for YouTube/ProductHunt or Portrait (9:16) for TikTok/Reels |
| **Secure OAuth** | Sign in with Google or GitHub — no passwords stored, ever |

---

## Architecture

RepoPilot is built on a modern, decoupled stack designed for heavy AI workloads.

```
┌─────────────────────────────────────────────┐
│                   USER                       │
└──────────────────┬──────────────────────────┘
                   │  HTTPS
       ┌───────────▼───────────┐
       │   Next.js Frontend    │  ← Vercel
       │   (App Router, React) │
       │   Remotion Player     │
       │   NextAuth (OAuth)    │
       └───────────┬───────────┘
                   │  REST API + JWT Auth
       ┌───────────▼───────────┐
       │   FastAPI Backend     │  ← Render.com
       │   Python AI Agents    │
       │   Gemini LLM          │
       │   Edge TTS            │
       └───────────┬───────────┘
                   │  SQLAlchemy (pg8000)
       ┌───────────▼───────────┐
       │   Supabase (Postgres) │  ← Cloud DB
       └───────────────────────┘
```

### Frontend Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth.js with Google & GitHub OAuth providers
- **Video Engine**: Remotion for live preview and MP4 bundling
- **Animations**: Framer Motion / Motion React
- **Styling**: Vanilla CSS with a custom dark-mode design system

### Backend Stack
- **API**: FastAPI with async task handling
- **AI Engine**: Google Gemini via `google-genai` SDK
- **TTS Engine**: Edge TTS for free, high-quality neural voices
- **Database**: PostgreSQL via Supabase, SQLAlchemy ORM + pg8000 driver
- **Auth**: JWT verification using `python-jose`

---

## Local Development

You'll need both the Python backend and Next.js frontend running simultaneously.

### Prerequisites
- Python 3.9+
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Gemini API key](https://ai.google.dev)

### 1. Clone the repository
```bash
git clone https://github.com/khushi-sharma2506/RepoPilot.git
cd RepoPilot
```

### 2. Configure the Backend
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql+pg8000://postgres:[password]@[host]:5432/postgres
NEXTAUTH_SECRET=your_secret_here
```

```bash
# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

### 3. Configure the Frontend
```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
```

```bash
# Start the Next.js dev server
npm run dev
```

### 4. Open the Studio
Navigate to `http://localhost:3000`, sign in, paste any public GitHub URL, and let RepoPilot do the rest!

---

## How to Use the Green Screen Export

1. Paste a GitHub URL and click **Analyze**.
2. Pick a narrative angle from the AI-generated story options.
3. Review and refine the script using the AI chat editor.
4. Choose your voice, pitch, and aspect ratio in the Studio settings.
5. Click **Generate Voiceover** to attach audio to each scene.
6. Click **Export MP4** to download your rendered video.
7. Drop the `.mp4` into **CapCut**, **Premiere Pro**, or **DaVinci Resolve**.
8. Apply a **Chroma Key** filter — the green background disappears instantly.
9. Place your screen recordings or visuals on the layer underneath. Done!

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Set root directory to `frontend` |
| Backend | [Render](https://render.com) | Set root directory to `backend`, start command: `uvicorn main:app --host 0.0.0.0 --port 10000` |
| Database | [Supabase](https://supabase.com) | Use the **Session Pooler** URL for Render compatibility |

> **Important**: Remember to update your Google and GitHub OAuth redirect URIs to include your production domain after deployment.

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Developed by [Khushi Sharma](https://github.com/khushi-sharma2506)

</div>
