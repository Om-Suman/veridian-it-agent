from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum

class DecisionType(str, Enum):
    RESOLVE = "RESOLVE"
    FOLLOW_UP = "FOLLOW_UP"
    ESCALATE = "ESCALATE"

class IntentType(str, Enum):
    PASSWORD_RESET = "PASSWORD_RESET"
    VPN_ACCESS = "VPN_ACCESS"
    LAPTOP_REPLACEMENT = "LAPTOP_REPLACEMENT"
    SOFTWARE_INSTALLATION = "SOFTWARE_INSTALLATION"
    PRINTER_TROUBLESHOOTING = "PRINTER_TROUBLESHOOTING"
    MAILBOX_QUOTA = "MAILBOX_QUOTA"
    GUEST_WIFI = "GUEST_WIFI"
    EXPENSE_ACCESS = "EXPENSE_ACCESS"
    SECURITY_INCIDENT = "SECURITY_INCIDENT"
    WFH_EQUIPMENT = "WFH_EQUIPMENT"
    ADMIN_ACCESS = "ADMIN_ACCESS"
    UNKNOWN = "UNKNOWN"

class SourceReference(BaseModel):
    id: str
    title: str
    source_type: str = "policy"
    content: Optional[str] = None

class HistoricalTicketContext(BaseModel):
    ticket_id: str
    employee_name: Optional[str] = None
    summary: str
    status: str
    resolution_notes: Optional[str] = None

class ExtractedEntities(BaseModel):
    issue: Optional[str] = None
    category: Optional[str] = None
    device_or_service: Optional[str] = None
    duration_years: Optional[float] = None
    attempt_count: Optional[int] = None
    software_name: Optional[str] = None
    is_catalog_software: Optional[bool] = None
    is_contractor: Optional[bool] = None
    days_remote_per_week: Optional[int] = None
    quota_requested_gb: Optional[int] = None
    printer_queue_checked: Optional[bool] = None
    print_spooler_restarted: Optional[bool] = None
    raw_details: Dict[str, Any] = Field(default_factory=dict)

class AgentClassification(BaseModel):
    intent: IntentType
    confidence: float = 1.0
    entities: ExtractedEntities = Field(default_factory=ExtractedEntities)

class AgentDecisionResult(BaseModel):
    intent: str
    entities: Dict[str, Any] = Field(default_factory=dict)
    decision: DecisionType
    assigned_team: Optional[str] = None
    response: str
    sources: List[SourceReference] = Field(default_factory=list)
    historical_context: List[HistoricalTicketContext] = Field(default_factory=list)
    requires_follow_up: bool = False
    ticket_action: str = "NONE"  # CREATE | UPDATE | NONE
    ticket_id: Optional[str] = None
    ticket_status: Optional[str] = None
    follow_up_prompt: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default-session"
    employee_name: Optional[str] = "Aditi Sharma"
    employee_email: Optional[str] = "aditi.sharma@veridian-corp.example"
    ticket_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    decision: DecisionType
    intent: str
    entities: Dict[str, Any]
    assigned_team: Optional[str]
    ticket_id: Optional[str]
    ticket_status: Optional[str]
    sources: List[SourceReference]
    historical_context: List[HistoricalTicketContext]
    requires_follow_up: bool
    audit_events: List[Dict[str, Any]] = Field(default_factory=list)

