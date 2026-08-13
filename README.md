# 🎬 RepoPilot

**RepoPilot** is an AI-powered studio that instantly turns any GitHub repository into a cinematic, voice-narrated promotional demo video. 

Built for hackathons, open-source maintainers, and indie hackers, RepoPilot eliminates the friction of creating high-quality demo videos. Just paste a GitHub URL, and our AI agents will analyze your codebase, write compelling scripts, generate studio-quality voiceovers, and render a final green-screen video template ready for your editing timeline.

![RepoPilot Banner](https://github.com/khushi-sharma2506/RepoPilot/assets/repo-pilot-banner.png) *(Placeholder for your actual banner)*

---

## 🚀 Features

- **🧠 Autonomous Codebase Analysis**: Deep-dives into your repository via the GitHub API to understand your project's features, architecture, and value proposition.
- **✍️ AI Storytelling**: Generates tailored narrative angles (e.g., "The Developer Setup," "The Feature Deep-Dive," "The Origin Story") and writes synchronized video scripts.
- **🎙️ Neural AI Voiceovers**: Seamlessly generates natural-sounding TTS (Text-to-Speech) voiceovers with adjustable pitch and multiple voice profiles.
- **🎥 Studio Preview Engine**: A fully interactive React-based preview interface (powered by Remotion) where you can preview the timing, text overlays, and audio in real-time.
- **🟩 Green Screen (Chroma Key) Export**: Exports your final video as an MP4 with a pristine `#00FF00` green background. Drop it into Premiere Pro or CapCut, key out the green, and place your actual app recordings underneath!
- **📱 Multi-Platform Aspect Ratios**: Render your demo in Landscape (16:9) for YouTube/ProductHunt, or Portrait (9:16) for TikTok/Reels.

---

## 🛠️ Architecture

RepoPilot uses a modern, decoupled stack to handle heavy video processing and AI generation.

### **Frontend** (Next.js + TailwindCSS + Remotion)
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS for a sleek, dark-mode studio interface.
- **Video Engine**: [Remotion](https://www.remotion.dev/) handles both the live studio preview and the final MP4 bundling.
- **State Management**: Persists session states across refreshes.

### **Backend** (FastAPI + Python Agents)
- **API**: FastAPI for highly concurrent asynchronous task handling.
- **AI Engine**: Leverages LLMs for scriptwriting and repository summarization.
- **TTS Engine**: Edge TTS integration for free, high-quality neural voices.
- **Git Integration**: Directly interfaces with GitHub's tree/blob APIs for rapid code analysis.

---

## 💻 Local Development Setup

To run RepoPilot locally, you'll need both the Python backend and the Next.js frontend running simultaneously.

### 1. Clone the repository
```bash
git clone https://github.com/khushi-sharma2506/RepoPilot.git
cd RepoPilot
```

### 2. Start the Backend
You will need Python 3.9+ installed.

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*Note: Make sure you have your AI Provider API keys set up in an `.env` file in the backend directory!*

### 3. Start the Frontend
You will need Node.js 18+ installed.

```bash
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

### 4. Open the Studio
Navigate to `http://localhost:3000` in your browser. Paste a public GitHub URL and let RepoPilot do the rest!

---

## 🎨 How to use the Green Screen Export

1. Enter your GitHub URL and generate a script.
2. Go to the **Studio Render** page.
3. Select your voice and aspect ratio.
4. Click **Export MP4**. The backend will bundle and render a pristine video file.
5. Drag the downloaded `.mp4` into your video editor of choice (CapCut, Premiere Pro, DaVinci Resolve).
6. Apply a **Chroma Key** (Green Screen) filter to remove the green background.
7. Place your actual screen recordings or background visuals on the layer underneath!

---

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you want to add new features, fix bugs, or improve the documentation.

## 📄 License

This project is licensed under the MIT License.
