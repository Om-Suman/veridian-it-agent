import json
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Ticket, AuditLog, Employee
from ..schemas.ticket import (
    TicketResponse,
    TicketCreate,
    TicketUpdate,
    AuditLogResponse,
    EmployeeResponse,
    RequestPresetResponse
)

router = APIRouter(prefix="/api", tags=["tickets"])

@router.get("/tickets", response_model=List[TicketResponse])
def get_tickets(
    status: Optional[str] = None,
    historical: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    if historical is not None:
        query = query.filter(Ticket.historical_context == historical)
    tickets = query.order_by(Ticket.updated_at.desc()).all()

    result = []
    for t in tickets:
        sources_list = json.loads(t.sources_json) if t.sources_json else []
        result.append(TicketResponse(
            id=t.id,
            ticket_id=t.ticket_id,
            employee_name=t.employee_name,
            employee_email=t.employee_email,
            category=t.category,
            summary=t.summary,
            status=t.status,
            decision=t.decision,
            assigned_team=t.assigned_team,
            priority=t.priority,
            sources=sources_list,
            historical_context=t.historical_context,
            resolution_notes=t.resolution_notes,
            created_at=t.created_at,
            updated_at=t.updated_at
        ))
    return result

@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    t = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    sources_list = json.loads(t.sources_json) if t.sources_json else []
    return TicketResponse(
        id=t.id,
        ticket_id=t.ticket_id,
        employee_name=t.employee_name,
        employee_email=t.employee_email,
        category=t.category,
        summary=t.summary,
        status=t.status,
        decision=t.decision,
        assigned_team=t.assigned_team,
        priority=t.priority,
        sources=sources_list,
        historical_context=t.historical_context,
        resolution_notes=t.resolution_notes,
        created_at=t.created_at,
        updated_at=t.updated_at
    )

@router.post("/tickets", response_model=TicketResponse)
def create_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    tid = ticket_in.ticket_id
    if not tid:
        count = db.query(Ticket).count() + 1
        tid = f"TK-{2000 + count}"

    t = Ticket(
        ticket_id=tid,
        employee_name=ticket_in.employee_name,
        employee_email=ticket_in.employee_email,
        category=ticket_in.category,
        summary=ticket_in.summary,
        status=ticket_in.status or "OPEN",
        decision=ticket_in.decision,
        assigned_team=ticket_in.assigned_team,
        priority=ticket_in.priority or "Normal",
        sources_json=json.dumps(ticket_in.sources or []),
        historical_context=False,
        resolution_notes=ticket_in.resolution_notes or "",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(t)
    db.commit()
    db.refresh(t)

    return TicketResponse(
        id=t.id,
        ticket_id=t.ticket_id,
        employee_name=t.employee_name,
        employee_email=t.employee_email,
        category=t.category,
        summary=t.summary,
        status=t.status,
        decision=t.decision,
        assigned_team=t.assigned_team,
        priority=t.priority,
        sources=ticket_in.sources or [],
        historical_context=t.historical_context,
        resolution_notes=t.resolution_notes,
        created_at=t.created_at,
        updated_at=t.updated_at
    )

@router.patch("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: str, ticket_in: TicketUpdate, db: Session = Depends(get_db)):
    t = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket_in.status is not None:
        t.status = ticket_in.status
    if ticket_in.decision is not None:
        t.decision = ticket_in.decision
    if ticket_in.assigned_team is not None:
        t.assigned_team = ticket_in.assigned_team
    if ticket_in.priority is not None:
        t.priority = ticket_in.priority
    if ticket_in.resolution_notes is not None:
        t.resolution_notes = ticket_in.resolution_notes
    if ticket_in.sources is not None:
        t.sources_json = json.dumps(ticket_in.sources)

    t.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(t)

    sources_list = json.loads(t.sources_json) if t.sources_json else []
    return TicketResponse(
        id=t.id,
        ticket_id=t.ticket_id,
        employee_name=t.employee_name,
        employee_email=t.employee_email,
        category=t.category,
        summary=t.summary,
        status=t.status,
        decision=t.decision,
        assigned_team=t.assigned_team,
        priority=t.priority,
        sources=sources_list,
        historical_context=t.historical_context,
        resolution_notes=t.resolution_notes,
        created_at=t.created_at,
        updated_at=t.updated_at
    )

@router.get("/tickets/{ticket_id}/audit", response_model=List[AuditLogResponse])
def get_ticket_audit(ticket_id: str, db: Session = Depends(get_db)):
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.ticket_id == ticket_id)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )
    result = []
    for l in logs:
        s_ids = json.loads(l.source_ids_json) if l.source_ids_json else []
        result.append(AuditLogResponse(
            id=l.id,
            timestamp=l.timestamp,
            ticket_id=l.ticket_id,
            action=l.action,
            actor=l.actor,
            details=l.details,
            source_ids=s_ids
        ))
    return result

@router.get("/tickets/{ticket_id}/sources", response_model=List[str])
def get_ticket_sources(ticket_id: str, db: Session = Depends(get_db)):
    t = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return json.loads(t.sources_json) if t.sources_json else []

@router.get("/employees", response_model=List[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()

@router.get("/requests", response_model=List[RequestPresetResponse])
def get_requests():
    path = Path(__file__).resolve().parent.parent.parent / "data" / "requests.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

