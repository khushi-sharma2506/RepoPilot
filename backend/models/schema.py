from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    github_url = Column(String, index=True)
    live_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Analysis outputs
    repo_analysis_json = Column(JSON, nullable=True)
    features_json = Column(JSON, nullable=True)
    story_json = Column(JSON, nullable=True)
    script_json = Column(JSON, nullable=True)
    video_json = Column(JSON, nullable=True)
    
    status = Column(String, default="pending") # pending, analyzing, generating, complete, failed
    progress = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
