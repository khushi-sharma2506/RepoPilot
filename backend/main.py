from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from models import database, schema
from agents.repository_agent import analyze_repository
from services.llm_service import generate_features, generate_story, generate_script
from services.auth_service import get_current_user
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

schema.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="RepoPilot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoRequest(BaseModel):
    github_url: str
    live_url: Optional[str] = None

@app.get("/")
def home():
    return {"message": "RepoPilot backend is running"}

@app.post("/api/projects")
def create_project(
    request: RepoRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(database.get_db),
    current_user: schema.User = Depends(get_current_user)
):
    project = schema.Project(
        github_url=request.github_url, 
        live_url=request.live_url, 
        status="analyzing",
        owner_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    background_tasks.add_task(run_analysis, project.id, request.github_url)
    return project

def run_analysis(project_id: int, github_url: str):
    db = database.SessionLocal()
    try:
        project = db.query(schema.Project).filter(schema.Project.id == project_id).first()
        if not project: return
        
        project.progress = "Fetching repository & extracting files..."
        db.commit()
        
        result = analyze_repository(github_url)
        if result.get("status") == "success":
            project.repo_analysis_json = result
            project_name = result.get("manifest", {}).get("project_name", "Unknown")
            
            project.progress = "Extracting key features..."
            db.commit()
            
            features = generate_features(result.get("ai_summary", {}), project_name)
            project.features_json = features
            
            project.progress = "Writing narrative demo scripts..."
            db.commit()
            
            story = generate_story(features, project_name)
            project.story_json = story
            
            project.status = "complete"
            project.progress = "Complete"
        else:
            project.status = "failed"
            project.error_message = result.get("error", "Unknown error during repository analysis.")
            project.repo_analysis_json = {"error": result.get("error"), "traceback": result.get("traceback")}
            
        db.commit()
    except Exception as e:
        print(f"Analysis failed: {e}")
        project.status = "failed"
        project.error_message = str(e)
        db.commit()
    finally:
        db.close()

@app.get("/api/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(database.get_db), current_user: schema.User = Depends(get_current_user)):
    project = db.query(schema.Project).filter(schema.Project.id == project_id, schema.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

class StorySelection(BaseModel):
    story_index: int

@app.post("/api/projects/{project_id}/script")
def generate_project_script(project_id: int, selection: StorySelection, db: Session = Depends(database.get_db), current_user: schema.User = Depends(get_current_user)):
    project = db.query(schema.Project).filter(schema.Project.id == project_id, schema.Project.owner_id == current_user.id).first()
    if not project or not project.story_json:
        raise HTTPException(status_code=404, detail="Project or stories not found")
    
    selected_story = project.story_json[selection.story_index]
    project_name = (project.repo_analysis_json or {}).get("manifest", {}).get("project_name", "Project")
    script = generate_script(selected_story, project.features_json, project_name)
    
    project.script_json = script
    db.commit()
    return script

class SceneUpdate(BaseModel):
    scenes: list

@app.put("/api/projects/{project_id}/script")
def update_script(project_id: int, update: SceneUpdate, db: Session = Depends(database.get_db), current_user: schema.User = Depends(get_current_user)):
    project = db.query(schema.Project).filter(schema.Project.id == project_id, schema.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.script_json = {"scenes": update.scenes}
    db.commit()
    return project.script_json

class ChatPrompt(BaseModel):
    prompt: str
    history: list = []

class VoiceSettings(BaseModel):
    voice_id: str = "en-US-ChristopherNeural"
    pitch: str = "+0Hz"

@app.post("/api/projects/{project_id}/chat")
def chat_with_script(project_id: int, chat: ChatPrompt, db: Session = Depends(database.get_db), current_user: schema.User = Depends(get_current_user)):
    project = db.query(schema.Project).filter(schema.Project.id == project_id, schema.Project.owner_id == current_user.id).first()
    if not project or not project.script_json:
        raise HTTPException(status_code=404, detail="Project or script not found")
    
    project_name = (project.repo_analysis_json or {}).get("manifest", {}).get("project_name", "Project")
    
    from services.llm_service import refine_script
    response_data = refine_script(project.script_json, chat.history, chat.prompt, project_name)
    
    if not isinstance(response_data, dict):
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
    updated_script = response_data.get("updated_script")
    if updated_script:
        project.script_json = updated_script
        db.commit()
        
    return response_data

@app.post("/api/projects/{project_id}/voice")
def generate_project_voice(project_id: int, settings: VoiceSettings, db: Session = Depends(database.get_db), current_user: schema.User = Depends(get_current_user)):
    project = db.query(schema.Project).filter(schema.Project.id == project_id, schema.Project.owner_id == current_user.id).first()
    if not project or not project.script_json:
        raise HTTPException(status_code=404, detail="Project or script not found")
    
    from services.tts_service import generate_audio
    
    script = project.script_json
    scenes = script.get("scenes", [])
    
    for scene in scenes:
        narration = scene.get("narration", "")
        if narration:
            audio_url = generate_audio(narration, settings.voice_id, settings.pitch)
            scene["audio_url"] = audio_url
            
    project.script_json = script
    flag_modified(project, "script_json")
    db.commit()
    
    return script

@app.get("/api/voices")
def get_voices():
    from services.tts_service import get_available_voices
    voices = get_available_voices()
    return {"voices": voices}

@app.post("/api/voice-preview")
def preview_voice(settings: VoiceSettings):
    from services.tts_service import generate_audio
    text = "Hello, this is a demo of how I sound. I hope you like my voice!"
    audio_url = generate_audio(text, settings.voice_id, settings.pitch)
    return {"audio_url": audio_url}