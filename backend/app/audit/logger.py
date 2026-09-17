import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from ..database.models import AuditLog

class AuditLogger:
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def log_event(
        self,
        action: str,
        details: str,
        ticket_id: Optional[str] = None,
        actor: str = "Agent",
        source_ids: Optional[List[str]] = None,
        timestamp: Optional[datetime] = None
    ) -> AuditLog:
        if timestamp is None:
            timestamp = datetime.utcnow()
        if source_ids is None:
            source_ids = []

        log_entry = AuditLog(
            timestamp=timestamp,
            ticket_id=ticket_id,
            action=action,
            actor=actor,
            details=details,
            source_ids_json=json.dumps(source_ids)
        )

        if self.db:
            self.db.add(log_entry)
            self.db.commit()
            self.db.refresh(log_entry)

        return log_entry

    def get_logs(self, ticket_id: Optional[str] = None, limit: int = 100) -> List[AuditLog]:
        if not self.db:
            return []
        query = self.db.query(AuditLog)
        if ticket_id:
            query = query.filter(AuditLog.ticket_id == ticket_id)
        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

