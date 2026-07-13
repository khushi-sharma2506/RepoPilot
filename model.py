from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True)
    password = Column(String(255))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String(10))
    path = Column(String(255))
    client_ip = Column(String(100))
    status_code = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)