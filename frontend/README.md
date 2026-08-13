# 🚀 RepoPilot

**RepoPilot** is an AI-powered tool designed specifically for Hackathon students, open-source maintainers, and developers who need to create stunning project presentation videos in minutes.

## 💡 The Core Selling Point

RepoPilot **doesn't generate AI videos from scratch** (which often look uncanny and expensive). Instead, it acts as an intelligent **Demo Video Assistant**:
1. **GitHub Analysis:** It scans your repository to understand your tech stack, architecture, and features.
2. **AI Narrative Generation:** It crafts compelling, professional narratives tailored to your audience (e.g., Deep Technical Walkthrough, Short Reel Ad).
3. **Conversational Script Editing:** A built-in AI Chatbot helps you iterate on the script scene-by-scene until it's perfectly tailored to your project.
4. **AI Voiceover & Editable Export:** It generates studio-quality AI voiceovers for every scene and exports an **Editable MP4 Template**. 

This template features perfectly timed subtitles, your selected AI voiceover, and a **Chroma Key Green Screen** placeholder. You simply drop the MP4 into CapCut or Premiere, remove the green screen, and drop your own screen recordings underneath!

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, TailwindCSS, Remotion (for programmatic video rendering).
- **Backend:** FastAPI, Python, Google Gemini (LLM orchestration), `edge-tts` (Neural Voice Generation).

## 🚀 Getting Started

### 1. Run the Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Run the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and turn your GitHub repo into a cinematic masterpiece!
