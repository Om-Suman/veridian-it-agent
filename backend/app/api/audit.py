import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import AuditLog
from ..schemas.ticket import AuditLogResponse

router = APIRouter(prefix="/api", tags=["audit"])

@router.get("/audit", response_model=List[AuditLogResponse])
def get_audit_trail(
    ticket_id: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if ticket_id:
        query = query.filter(AuditLog.ticket_id == ticket_id)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

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

