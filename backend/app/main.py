import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .database.database import init_db
from .api import chat, tickets, sources, audit

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed policies, employees, tickets
    init_db()
    # Pre-warm retriever and FAISS index
    from .agent.orchestrator import get_shared_retriever
    get_shared_retriever()
    yield

app = FastAPI(
    title="Veridian Corp — Internal IT Service Agent API",
    version="1.0.0",
    description="Enterprise IT Support Service Agent with Deterministic Policy Engine and RAG",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(tickets.router)
app.include_router(sources.router)
app.include_router(audit.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Veridian Corp Internal IT Agent",
        "environment": os.getenv("ENV", "development"),
        "timestamp": "2026-09-21T00:00:00Z"
    }

@app.get("/")
def root():
    return {
        "message": "Veridian Corp Internal IT Service Agent API",
        "docs": "/docs",
        "health": "/health"
    }

