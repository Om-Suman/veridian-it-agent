from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    department = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String(50), unique=True, index=True, nullable=False)
    employee_name = Column(String(100), nullable=False)
    employee_email = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    summary = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="OPEN")
    decision = Column(String(50), nullable=True)
    assigned_team = Column(String(100), nullable=True)
    priority = Column(String(20), nullable=False, default="Normal")
    sources_json = Column(Text, nullable=False, default="[]")
    historical_context = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PolicyDocument(Base):
    __tablename__ = "policy_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    source_type = Column(String(50), default="policy")
    content = Column(Text, nullable=False)
    last_updated = Column(String(50), nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ticket_id = Column(String(50), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    actor = Column(String(100), nullable=False, default="Agent")
    details = Column(Text, nullable=False)
    source_ids_json = Column(Text, nullable=False, default="[]")

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(100), index=True, nullable=False)
    sender = Column(String(50), nullable=False)  # "employee" | "agent" | "system"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, nullable=True)

