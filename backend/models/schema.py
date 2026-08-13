from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True) # Will store the NextAuth user ID
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    github_url = Column(String, index=True)
    live_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Link to the user who owns this project
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    owner = relationship("User", back_populates="projects")
    
    # Analysis outputs
    repo_analysis_json = Column(JSON, nullable=True)
    features_json = Column(JSON, nullable=True)
    story_json = Column(JSON, nullable=True)
    script_json = Column(JSON, nullable=True)
    video_json = Column(JSON, nullable=True)
    
    status = Column(String, default="pending") # pending, analyzing, generating, complete, failed
    progress = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
