from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TicketBase(BaseModel):
    ticket_id: str
    employee_name: str
    employee_email: str
    category: str
    summary: str
    status: str
    decision: Optional[str] = None
    assigned_team: Optional[str] = None
    priority: str = "Normal"
    sources: List[str] = Field(default_factory=list)
    historical_context: bool = False
    resolution_notes: Optional[str] = None

class TicketCreate(BaseModel):
    ticket_id: Optional[str] = None
    employee_name: str
    employee_email: str
    category: str
    summary: str
    status: Optional[str] = "OPEN"
    decision: Optional[str] = None
    assigned_team: Optional[str] = None
    priority: Optional[str] = "Normal"
    sources: Optional[List[str]] = Field(default_factory=list)
    resolution_notes: Optional[str] = None

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    decision: Optional[str] = None
    assigned_team: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None
    sources: Optional[List[str]] = None

class TicketResponse(TicketBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    ticket_id: Optional[str] = None
    action: str
    actor: str
    details: str
    source_ids: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class PolicyResponse(BaseModel):
    id: int
    source_id: str
    title: str
    category: Optional[str] = None
    source_type: str
    content: str
    last_updated: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EmployeeResponse(BaseModel):
    id: str
    name: str
    email: str
    department: Optional[str] = None
    role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RequestPresetResponse(BaseModel):
    request_id: str
    employee_name: str
    employee_email: str
    date: str
    request_text: str
    initial_action: str
    relevant_policies: List[str]
    expected_decision: str
    category: str
    expected_handling: str

