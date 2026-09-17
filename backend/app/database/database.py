import os
import json
import glob
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .models import Base, Employee, Ticket, PolicyDocument, AuditLog

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./veridian.db")

# For SQLite, enable check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_employees(db)
        _seed_policies(db)
        _seed_tickets(db)
    finally:
        db.close()

def _seed_employees(db: Session):
    if db.query(Employee).count() > 0:
        return

    data_path = Path(__file__).resolve().parent.parent.parent / "data" / "employees.json"
    if not data_path.exists():
        return

    with open(data_path, "r", encoding="utf-8") as f:
        employees_data = json.load(f)

    for emp_data in employees_data:
        emp = Employee(
            id=emp_data["id"],
            name=emp_data["name"],
            email=emp_data["email"],
            department=emp_data.get("department"),
            role=emp_data.get("role")
        )
        db.add(emp)
    db.commit()

def _seed_policies(db: Session):
    if db.query(PolicyDocument).count() > 0:
        return

    kb_dir = Path(__file__).resolve().parent.parent.parent / "knowledge_base"
    if not kb_dir.exists():
        return

    txt_files = list(kb_dir.glob("*.txt"))
    for file_path in txt_files:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f.readlines()]

        source_id = ""
        title = ""
        category = ""
        last_updated = ""
        content_lines = []
        is_content = False

        for line in lines:
            if line.startswith("Document ID:"):
                source_id = line.replace("Document ID:", "").strip()
            elif line.startswith("Title:"):
                title = line.replace("Title:", "").strip()
            elif line.startswith("Category:"):
                category = line.replace("Category:", "").strip()
            elif line.startswith("Last updated:") or line.startswith("Last Updated:"):
                last_updated = line.split(":", 1)[1].strip()
            elif line.startswith("Content:"):
                is_content = True
            elif is_content:
                content_lines.append(line)

        content = "\n".join(content_lines).strip()
        if not source_id:
            source_id = file_path.stem.upper()
        if not title:
            title = source_id

        doc = PolicyDocument(
            source_id=source_id,
            title=title,
            category=category,
            source_type="policy",
            content=content,
            last_updated=last_updated
        )
        db.add(doc)

    db.commit()

def _seed_tickets(db: Session):
    if db.query(Ticket).count() > 0:
        return

    data_path = Path(__file__).resolve().parent.parent.parent / "data" / "tickets.json"
    if not data_path.exists():
        return

    with open(data_path, "r", encoding="utf-8") as f:
        tickets_data = json.load(f)

    for t_data in tickets_data:
        created_at_dt = datetime.fromisoformat(t_data["created_at"]) if "created_at" in t_data else datetime.utcnow()
        updated_at_dt = datetime.fromisoformat(t_data["updated_at"]) if "updated_at" in t_data else datetime.utcnow()

        ticket = Ticket(
            ticket_id=t_data["ticket_id"],
            employee_name=t_data["employee_name"],
            employee_email=t_data["employee_email"],
            category=t_data["category"],
            summary=t_data["summary"],
            status=t_data["status"],
            decision=t_data.get("decision", "RESOLVE"),
            assigned_team=t_data.get("assigned_team", "IT"),
            priority=t_data.get("priority", "Normal"),
            sources_json=json.dumps(t_data.get("sources", [])),
            historical_context=t_data.get("historical_context", False),
            resolution_notes=t_data.get("resolution_notes", ""),
            created_at=created_at_dt,
            updated_at=updated_at_dt
        )
        db.add(ticket)

        # Also add initial seed audit log for historical tickets
        audit = AuditLog(
            timestamp=created_at_dt,
            ticket_id=t_data["ticket_id"],
            action="TICKET_CREATED",
            actor="System",
            details=f"Historical ticket {t_data['ticket_id']} recorded for {t_data['employee_name']}: {t_data['summary']}",
            source_ids_json=json.dumps(t_data.get("sources", []))
        )
        db.add(audit)

    db.commit()

