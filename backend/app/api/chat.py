from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..schemas.agent import ChatRequest, ChatResponse
from ..agent.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api", tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        orchestrator = AgentOrchestrator(db=db)
        response = orchestrator.process_request(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

