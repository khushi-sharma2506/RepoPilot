import os
import json
import re
import base64
import requests as http_requests
from dotenv import load_dotenv
from google import genai

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-flash-latest"

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

def _github_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers

def parse_github_url(github_url: str):
    """Extract owner and repo from a GitHub URL."""
    github_url = github_url.rstrip("/").replace(".git", "")
    parts = github_url.replace("https://github.com/", "").split("/")
    return parts[0], parts[1]

def fetch_repo_tree(owner: str, repo: str) -> list:
    """Fetch the full file tree via GitHub API (no cloning needed)."""
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
    res = http_requests.get(url, headers=_github_headers(), timeout=30)
    res.raise_for_status()
    data = res.json()
    return [item["path"] for item in data.get("tree", []) if item["type"] == "blob"]

def fetch_file_content(owner: str, repo: str, path: str) -> str:
    """Fetch a single file's content from GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    res = http_requests.get(url, headers=_github_headers(), timeout=15)
    if res.status_code != 200:
        return ""
    data = res.json()
    try:
        content = base64.b64decode(data.get("content", "")).decode("utf-8", errors="ignore")
        return content[:5000]
    except Exception:
        return ""

def fetch_repo_metadata(owner: str, repo: str) -> dict:
    """Fetch basic repo metadata (description, topics, stars)."""
    url = f"https://api.github.com/repos/{owner}/{repo}"
    res = http_requests.get(url, headers=_github_headers(), timeout=15)
    if res.status_code != 200:
        return {}
    return res.json()

def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()
    match = re.search(r"\{.*\}|\[.*\]", text, re.DOTALL)
    if match:
        text = match.group(0)
    return json.loads(text)

def _call_gemini(prompt: str, max_retries=3):
    import time
    models_to_try = [MODEL, "gemini-flash-lite-latest", "gemini-pro-latest"]
    
    for model_name in models_to_try:
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(model=model_name, contents=prompt)
                return extract_json(response.text)
            except Exception as e:
                error_str = str(e)
                if "503" in error_str or "UNAVAILABLE" in error_str or "overloaded" in error_str.lower():
                    wait_time = (attempt + 1) * 3  # 3s, 6s, 9s
                    print(f"Gemini {model_name} unavailable (attempt {attempt+1}/{max_retries}), retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    print(f"Gemini error with {model_name}: {e}")
                    break  # Non-retryable error, try next model
        print(f"Model {model_name} failed, trying next fallback...")
    
    raise Exception("All Gemini models failed after retries. Please try again in a few minutes.")

def generate_project_summary(manifest: dict):
    prompt = f"""You are RepoPilot, an AI technical product storyteller.
Analyze this software project manifest and return ONLY valid JSON with no markdown.

Manifest:
{json.dumps(manifest, indent=2)[:3000]}

Return this exact JSON:
{{
  "project_summary": "2-3 sentence summary",
  "main_purpose": "one line",
  "target_users": "who uses this",
  "technical_overview": "tech stack overview",
  "key_features": ["feature1", "feature2", "feature3"],
  "demo_story_angle": "best angle for demo video"
}}"""
    return _call_gemini(prompt)

def generate_features(summary: dict, project_name: str = ""):
    prompt = f"""You are the Feature Agent for RepoPilot.
The project is called "{project_name}". Always refer to it by this name.
Extract the 3-5 best features to showcase in a demo video.
Return ONLY valid JSON array, no markdown.

Summary:
{json.dumps(summary)[:2000]}

Return:
[{{ "name": "Feature Name", "description": "Short description of what it does" }}]"""
    return _call_gemini(prompt)

def generate_story(features: list, project_name: str = ""):
    prompt = f"""You are the Story Agent for RepoPilot.
The project is called "{project_name}". Always refer to it by this exact name, never call it RepoPilot.
Create exactly 3 distinct narrative angles for a demo video based on these features.
Make them very different so the user has clear choices (e.g. 1. A short, punchy Reel/Shorts-style ad. 2. A deep technical walkthrough for developers. 3. A user journey story focused on the problem it solves).
Return ONLY valid JSON array, no markdown.

Features:
{json.dumps(features)[:2000]}

Return:
[{{ "title": "Story Title", "theme": "e.g. Technical, Reel Ad, User Journey", "description": "2-3 sentence story outline explaining exactly what this video will look like." }}]"""
    return _call_gemini(prompt)

def generate_script(story: dict, features: list, project_name: str = "", target_duration_seconds: int = 75):
    # Calculate scene count: avg 7s/scene narration pace (~2.5 words/sec, ~18 words/scene)
    scene_count = max(5, min(20, round(target_duration_seconds / 7)))
    words_per_scene = max(10, round(target_duration_seconds * 2.5 / scene_count))
    
    prompt = f"""You are the Script Agent for RepoPilot.
The project is called "{project_name}". ALWAYS refer to it as "{project_name}" in every scene, NEVER call it RepoPilot.
Write a professional demo video script with EXACTLY {scene_count} scenes totalling approximately {target_duration_seconds} seconds.
Each scene narration should be {words_per_scene-5} to {words_per_scene+5} words long so that when spoken by an AI voice at natural pace it fills the scene duration.
Do NOT use overly short narrations — they must genuinely fill the time.
Return ONLY valid JSON, no markdown.

Story: {json.dumps(story)[:1000]}
Features: {json.dumps(features)[:1000]}

Return:
{{
  "scenes": [
    {{
      "scene_number": 1,
      "visual_hint": "Detailed description of what to show on screen",
      "narration": "What the narrator says ({words_per_scene-5}-{words_per_scene+5} words)",
      "duration_seconds": {round(target_duration_seconds / scene_count, 1)}
    }}
  ]
}}
"""
    return _call_gemini(prompt)

def refine_script(current_script: dict, chat_history: list, user_prompt: str, project_name: str = ""):
    history_text = "\n".join([f"{msg.get('role', 'user')}: {msg.get('text', '')}" for msg in chat_history[-6:]])
    
    # Calculate current total duration for context
    scenes = current_script.get("scenes", [])
    current_total = sum(s.get("duration_seconds", 8) for s in scenes)
    current_scene_count = len(scenes)
    
    prompt = f"""You are the Director Agent for RepoPilot — an expert, conversational AI script editor.
The project is called "{project_name}".
You are chatting with the user to help them perfect their video script.

Current script has {current_scene_count} scenes totalling ~{round(current_total)}s.

Recent Chat History:
{history_text}

User's latest message:
{user_prompt}

Current Script (full):
{json.dumps(current_script)[:3000]}

Your instructions:
1. DURATION REQUEST (e.g. "make it 30 seconds", "I need 2 minutes", "trim to 1 min"):
   - Calculate the new required scene count: target_seconds / avg_scene_duration
   - Rewrite narrations so they are appropriately short or long for the target
   - Set duration_seconds per scene to target_seconds / scene_count
   - Set proposed_script to the new script
   - In reply say: "I've rewritten your script to fit ~X seconds across Y scenes. Does this look good? Reply YES to apply it, or tell me what to change."

2. PER-SCENE REQUEST (e.g. "make scene 2 more exciting", "rewrite scene 4 to focus on the API"):
   - Only modify that specific scene, preserve all others exactly
   - Set updated_script (auto-applies immediately, no confirmation needed)
   - In reply explain what you changed in that scene.

3. FULL REWRITE (e.g. "change the whole tone to be more technical", "rewrite everything from a user's perspective"):
   - Rewrite all scenes
   - Set proposed_script (requires YES confirmation before applying)
   - In reply summarize what changed and ask for confirmation.

4. VAGUE / UNCLEAR request:
   - Ask a smart clarifying question. Do NOT modify the script.
   - Set both updated_script and proposed_script to null.
   - Optionally proactively recommend something (e.g. "Your script is currently 90s — want me to trim it for a 60s hackathon demo?").

5. After EVERY response that modifies the script, add a short proactive recommendation at the end of your reply, like:
   - "💡 Tip: Scene 3 has a long narration (~35 words). Want me to trim it?"
   - "💡 Your script is {round(current_total)}s total — perfect for a 1-minute demo!"

Return ONLY valid JSON in this exact schema — no markdown:
{{
  "reply": "Your conversational response here, including any tips.",
  "updated_script": null OR {{ "scenes": [ ... ] }},
  "proposed_script": null OR {{ "scenes": [ ... ] }}
}}

Rules:
- "updated_script" = apply immediately without confirmation (per-scene edits only)
- "proposed_script" = show to user with YES/NO confirmation before applying (rewrites/duration changes)
- Never set BOTH to non-null at the same time
- Always refer to the project as "{project_name}", never as RepoPilot
"""
    return _call_gemini(prompt)
