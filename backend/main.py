#ollama serve
#python -m uvicorn main:app --reload
from fastapi import FastAPI
from pydantic import BaseModel
from agents.repository_agent import analyze_repository

app = FastAPI(title="RepoPilot Backend")


class RepoRequest(BaseModel):
    github_url: str


@app.get("/")
def home():
    return {
        "message": "RepoPilot backend is running"
    }


@app.post("/analyze")
def analyze_repo(request: RepoRequest):
    result = analyze_repository(request.github_url)
    return result