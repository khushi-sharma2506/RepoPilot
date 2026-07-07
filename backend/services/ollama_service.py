import requests
import json
import re

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:4b"


def extract_json(text: str):
    text = text.strip()

    # remove markdown code block if present
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()

    # find first JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)

    return json.loads(text)


def generate_project_summary(manifest: dict):
    prompt = f"""
You are RepoPilot, an AI technical product storyteller.

Analyze this software project manifest.

Return ONLY raw valid JSON.
Do not use markdown.
Do not add explanation.
Do not wrap output in ```json.

Project Manifest:
{json.dumps(manifest, indent=2)}

Return exactly this JSON structure:
{{
  "project_summary": "",
  "main_purpose": "",
  "target_users": "",
  "technical_overview": "",
  "key_features": [],
  "demo_story_angle": ""
}}
"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()

    raw_output = response.json()["response"]

    try:
        return extract_json(raw_output)
    except Exception:
        return {
            "project_summary": raw_output,
            "main_purpose": "",
            "target_users": "",
            "technical_overview": "",
            "key_features": [],
            "demo_story_angle": ""
        }