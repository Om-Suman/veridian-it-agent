import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import init_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    init_db()

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_tickets(client):
    response = client.get("/api/tickets")
    assert response.status_code == 200
    tickets = response.json()
    assert len(tickets) >= 10
    # Check that TK-1042 through TK-1051 are seeded
    ticket_ids = [t["ticket_id"] for t in tickets]
    assert "TK-1042" in ticket_ids
    assert "TK-1050" in ticket_ids

def test_get_knowledge_base(client):
    response = client.get("/api/knowledge-base")
    assert response.status_code == 200
    policies = response.json()
    assert len(policies) >= 11
    policy_ids = [p["source_id"] for p in policies]
    assert "KB-01" in policy_ids
    assert "KB-07" in policy_ids
    assert "Asset Management Policy" in policy_ids

def test_chat_guest_wifi(client):
    response = client.post("/api/chat", json={
        "message": "Can I get Wi-Fi access for a guest visiting tomorrow?",
        "employee_name": "Vikram Chawla",
        "employee_email": "vikram.chawla@veridian-corp.example"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "RESOLVE"
    assert any(s["id"] == "KB-07" for s in data["sources"])
    assert "24 hours" in data["response"]

def test_chat_phishing_escalation(client):
    response = client.post("/api/chat", json={
        "message": "I received a suspicious phishing email asking for password",
        "employee_name": "Ananya Reddy",
        "employee_email": "ananya.reddy@veridian-corp.example"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "ESCALATE"
    assert data["assigned_team"] == "SECURITY"
    assert any(s["id"] == "KB-09" for s in data["sources"])
    assert "security@veridian-corp.example" in data["response"]

def test_audit_log_generation(client):
    response = client.get("/api/audit")
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) > 0
    actions = [l["action"] for l in logs]
    assert "REQUEST_RECEIVED" in actions or "TICKET_CREATED" in actions

