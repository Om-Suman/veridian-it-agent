from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import PolicyDocument
from ..schemas.ticket import PolicyResponse

router = APIRouter(prefix="/api", tags=["knowledge-base"])

@router.get("/knowledge-base", response_model=List[PolicyResponse])
def list_knowledge_base(db: Session = Depends(get_db)):
    docs = db.query(PolicyDocument).all()
    return docs

@router.get("/knowledge-base/{source_id}", response_model=PolicyResponse)
def get_policy(source_id: str, db: Session = Depends(get_db)):
    doc = db.query(PolicyDocument).filter(
        (PolicyDocument.source_id.ilike(source_id)) | 
        (PolicyDocument.title.ilike(source_id))
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Policy not found")
    return doc

