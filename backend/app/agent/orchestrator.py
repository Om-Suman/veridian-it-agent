import json
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from ..schemas.agent import (
    ChatRequest,
    ChatResponse,
    IntentType,
    DecisionType,
    SourceReference,
    HistoricalTicketContext
)
from ..database.models import Ticket, Employee, ConversationMessage, AuditLog
from ..audit.logger import AuditLogger
from .classifier import RequestClassifier
from .entity_extractor import EntityExtractor
from .retriever import RAGRetriever
from .policy_engine import DeterministicPolicyEngine

# Shared singleton instances to ensure zero latency and reused FAISS index
_shared_retriever: Optional[RAGRetriever] = None
_shared_classifier: Optional[RequestClassifier] = None
_shared_extractor: Optional[EntityExtractor] = None

def get_shared_retriever() -> RAGRetriever:
    global _shared_retriever
    if _shared_retriever is None:
        _shared_retriever = RAGRetriever()
    return _shared_retriever

class AgentOrchestrator:
    def __init__(
        self,
        db: Session,
        retriever: Optional[RAGRetriever] = None,
        classifier: Optional[RequestClassifier] = None,
        extractor: Optional[EntityExtractor] = None,
        policy_engine: Optional[DeterministicPolicyEngine] = None
    ):
        global _shared_classifier, _shared_extractor
        self.db = db
        self.retriever = retriever or get_shared_retriever()
        
        if classifier:
            self.classifier = classifier
        else:
            if _shared_classifier is None:
                _shared_classifier = RequestClassifier()
            self.classifier = _shared_classifier

        if extractor:
            self.extractor = extractor
        else:
            if _shared_extractor is None:
                _shared_extractor = EntityExtractor()
            self.extractor = _shared_extractor

        self.policy_engine = policy_engine or DeterministicPolicyEngine(self.retriever)
        self.audit_logger = AuditLogger(self.db)

    def process_request(self, request: ChatRequest) -> ChatResponse:
        now = datetime.now(timezone.utc)
        session_id = request.session_id or str(uuid.uuid4())
        audit_events = []

        # 1. Log employee conversation message
        msg_record = ConversationMessage(
            session_id=session_id,
            sender="employee",
            content=request.message,
            timestamp=now
        )
        self.db.add(msg_record)
        self.db.commit()

        # 2. Check for existing active ticket
        existing_ticket = None
        if request.ticket_id:
            existing_ticket = self.db.query(Ticket).filter(Ticket.ticket_id == request.ticket_id).first()
        elif request.employee_email:
            existing_ticket = (
                self.db.query(Ticket)
                .filter(
                    Ticket.employee_email == request.employee_email,
                    Ticket.status.notin_(["RESOLVED", "CLOSED"])
                )
                .first()
            )

        # 3. Log REQUEST_RECEIVED
        ticket_ref = existing_ticket.ticket_id if existing_ticket else request.ticket_id
        evt1 = self.audit_logger.log_event(
            action="REQUEST_RECEIVED",
            details=f"Request received from {request.employee_name or request.employee_email}: '{request.message}'",
            ticket_id=ticket_ref,
            actor="Employee"
        )
        audit_events.append({"action": evt1.action, "details": evt1.details, "timestamp": evt1.timestamp.isoformat()})

        # 4. Classify Intent
        intent = self.classifier.classify(request.message)
        evt2 = self.audit_logger.log_event(
            action="INTENT_CLASSIFIED",
            details=f"Intent classified as {intent.value}",
            ticket_id=ticket_ref,
            actor="Agent"
        )
        audit_events.append({"action": evt2.action, "details": evt2.details, "timestamp": evt2.timestamp.isoformat()})

        # 5. Extract Entities
        entities = self.extractor.extract(request.message, intent)

        # 6. Retrieve relevant policies and historical context via FAISS RAG
        retrieved_policies = self.retriever.search_policies(request.message, top_k=2)
        retrieved_history = self.retriever.search_historical_tickets(request.message, top_k=1)
        policy_ids = [p.id for p in retrieved_policies]

        evt3 = self.audit_logger.log_event(
            action="POLICY_RETRIEVED",
            details=f"Retrieved policies: {', '.join(policy_ids) if policy_ids else 'None'}",
            ticket_id=ticket_ref,
            actor="Agent",
            source_ids=policy_ids
        )
        audit_events.append({"action": evt3.action, "details": evt3.details, "timestamp": evt3.timestamp.isoformat()})

        # 7. Evaluate through Deterministic Policy Engine
        existing_status = existing_ticket.status if existing_ticket else None
        eval_result = self.policy_engine.evaluate(
            intent=intent,
            entities=entities,
            raw_text=request.message,
            retrieved_sources=retrieved_policies,
            historical_context=retrieved_history,
            existing_ticket_status=existing_status
        )

        final_source_ids = [s.id for s in eval_result.sources]

        # 8. Log DECISION_MADE
        evt4 = self.audit_logger.log_event(
            action="DECISION_MADE",
            details=f"Deterministic decision: {eval_result.decision.value} for intent {eval_result.intent}",
            ticket_id=ticket_ref,
            actor="PolicyEngine",
            source_ids=final_source_ids
        )
        audit_events.append({"action": evt4.action, "details": evt4.details, "timestamp": evt4.timestamp.isoformat()})

        # 9. Handle Ticket Action
        active_ticket_id = ticket_ref
        active_ticket_status = eval_result.ticket_status

        if eval_result.ticket_action != "NONE":
            if existing_ticket:
                # Update existing ticket while preserving state
                if eval_result.ticket_status and existing_ticket.status != "CLOSED":
                    if existing_ticket.status != "WAITING_FOR_EMPLOYEE" or eval_result.ticket_status != "WAITING_FOR_EMPLOYEE":
                        existing_ticket.status = eval_result.ticket_status
                if eval_result.assigned_team:
                    existing_ticket.assigned_team = eval_result.assigned_team
                existing_ticket.decision = eval_result.decision.value
                existing_ticket.updated_at = datetime.now(timezone.utc)
                existing_ticket.sources_json = json.dumps(final_source_ids)
                self.db.commit()

                active_ticket_id = existing_ticket.ticket_id
                active_ticket_status = existing_ticket.status

                evt_t = self.audit_logger.log_event(
                    action="TICKET_UPDATED",
                    details=f"Ticket {active_ticket_id} updated. Status: {active_ticket_status}, Decision: {existing_ticket.decision}",
                    ticket_id=active_ticket_id,
                    actor="TicketManager",
                    source_ids=final_source_ids
                )
                audit_events.append({"action": evt_t.action, "details": evt_t.details, "timestamp": evt_t.timestamp.isoformat()})
            else:
                # Create new ticket
                new_num = self.db.query(Ticket).count() + 1
                gen_id = f"TK-{2000 + new_num}"
                category_label = entities.category or intent.value.replace("_", " ").title()
                summary_text = request.message[:80] + ("..." if len(request.message) > 80 else "")

                new_ticket = Ticket(
                    ticket_id=gen_id,
                    employee_name=request.employee_name or "Employee",
                    employee_email=request.employee_email or "employee@veridian-corp.example",
                    category=category_label,
                    summary=summary_text,
                    status=eval_result.ticket_status or "OPEN",
                    decision=eval_result.decision.value,
                    assigned_team=eval_result.assigned_team,
                    priority="High" if eval_result.intent == "SECURITY_INCIDENT" else "Normal",
                    sources_json=json.dumps(final_source_ids),
                    historical_context=False,
                    resolution_notes="",
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                self.db.add(new_ticket)
                self.db.commit()

                active_ticket_id = gen_id
                active_ticket_status = new_ticket.status

                evt_t = self.audit_logger.log_event(
                    action="TICKET_CREATED",
                    details=f"Ticket {active_ticket_id} created for {new_ticket.employee_name}: {summary_text}",
                    ticket_id=active_ticket_id,
                    actor="TicketManager",
                    source_ids=final_source_ids
                )
                audit_events.append({"action": evt_t.action, "details": evt_t.details, "timestamp": evt_t.timestamp.isoformat()})

        # 10. Specific Escalation / Resolution / Follow-up audit event
        if eval_result.decision == DecisionType.ESCALATE:
            evt_esc = self.audit_logger.log_event(
                action="ESCALATED",
                details=f"Escalated to team: {eval_result.assigned_team or 'IT'}",
                ticket_id=active_ticket_id,
                actor="Agent",
                source_ids=final_source_ids
            )
            audit_events.append({"action": evt_esc.action, "details": evt_esc.details, "timestamp": evt_esc.timestamp.isoformat()})
        elif eval_result.decision == DecisionType.RESOLVE:
            evt_res = self.audit_logger.log_event(
                action="RESOLVED",
                details=f"Request resolved per policy: {', '.join(final_source_ids) if final_source_ids else 'Standard procedure'}",
                ticket_id=active_ticket_id,
                actor="Agent",
                source_ids=final_source_ids
            )
            audit_events.append({"action": evt_res.action, "details": evt_res.details, "timestamp": evt_res.timestamp.isoformat()})
        elif eval_result.decision == DecisionType.FOLLOW_UP:
            evt_fu = self.audit_logger.log_event(
                action="FOLLOW_UP_REQUESTED",
                details=f"Follow-up prompt: {eval_result.follow_up_prompt or 'More details requested'}",
                ticket_id=active_ticket_id,
                actor="Agent",
                source_ids=final_source_ids
            )
            audit_events.append({"action": evt_fu.action, "details": evt_fu.details, "timestamp": evt_fu.timestamp.isoformat()})

        # 11. SOURCE_DISPLAYED
        if final_source_ids:
            evt_src = self.audit_logger.log_event(
                action="SOURCE_DISPLAYED",
                details=f"Displayed policy sources: {', '.join(final_source_ids)}",
                ticket_id=active_ticket_id,
                actor="Agent",
                source_ids=final_source_ids
            )
            audit_events.append({"action": evt_src.action, "details": evt_src.details, "timestamp": evt_src.timestamp.isoformat()})

        # 12. Record Agent response message
        agent_msg = ConversationMessage(
            session_id=session_id,
            sender="agent",
            content=eval_result.response,
            timestamp=datetime.now(timezone.utc),
            metadata_json=json.dumps({
                "decision": eval_result.decision.value,
                "ticket_id": active_ticket_id,
                "sources": final_source_ids
            })
        )
        self.db.add(agent_msg)
        self.db.commit()

        return ChatResponse(
            response=eval_result.response,
            decision=eval_result.decision,
            intent=eval_result.intent,
            entities=eval_result.entities,
            assigned_team=eval_result.assigned_team,
            ticket_id=active_ticket_id,
            ticket_status=active_ticket_status,
            sources=eval_result.sources,
            historical_context=eval_result.historical_context,
            requires_follow_up=eval_result.requires_follow_up,
            audit_events=audit_events
        )

