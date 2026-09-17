# Veridian Corp — Internal IT Service Agent

An enterprise-grade internal IT service agent and employee support portal designed to automate first-line IT operations with absolute policy fidelity.

The system processes employee IT support requests through a rigorous, grounded architecture:
**Natural Language Understanding & Entity Extraction → FAISS Semantic RAG Retrieval → Deterministic Policy Engine → Ticket Management → Audit Logging → React Enterprise Portal**.

---

## Key Design Principles & Architecture

```text
Employee
   ↓
React + Tailwind Frontend
   ↓
FastAPI Backend
   ↓
Agent Orchestrator
   ↓
Intent Classification & Entity Extraction
   ↓
FAISS Policy Retrieval (KB-01..KB-10, Asset Management Policy)
   ↓
Historical Ticket Context Retrieval (TK-1042..TK-1051)
   ↓
Deterministic Policy Engine (Strict Grounding: RESOLVE / FOLLOW_UP / ESCALATE)
   ↓
Ticket Manager (State Preservation & De-duplication)
   ↓
Audit Logger (Factual Action Tracking)
   ↓
Response + Source Attribution Badges
   ↓
React Frontend
```

### Critical Grounding Rules

1. **The LLM Never Invents or Overrides Policy**: The LLM / NLU parser extracts structured intent and parameters. The **Deterministic Policy Engine** evaluates strict rules and makes the final business decision.
2. **Policy vs. Historical Context Separation**: Historical tickets (`TK-1042` to `TK-1051`) serve as context only. They are never treated as universal policy.
3. **No Hallucinated Policies**: If a request falls outside documented policies (such as Admin Access in REQ-10), the system explicitly states that corporate policy does not define the process and escalates for human review.
4. **Safety & Incident Handling**: Phishing emails (KB-09) immediately route to `security@veridian-corp.example` and warn the employee never to forward suspicious emails.
5. **State Preservation**: Existing tickets in progression (e.g. printer technician assigned, waiting for employee screenshot) are updated without creating duplicate cases.

---

## Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2
- **Database & ORM**: SQLite (default, zero-config) / PostgreSQL-ready, SQLAlchemy 2.0
- **Vector Search & Embeddings**: FAISS (`faiss-cpu`), Sentence-Transformers (`all-MiniLM-L6-v2`) with deterministic fallback vectorizer
- **Testing**: Pytest, HTTPX TestClient
- **Containerization**: Docker, Docker Compose, Nginx Alpine

---

## Project Structure

```text
veridian-it-agent/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, CORS, lifespan
│   │   ├── agent/
│   │   │   ├── classifier.py        # Intent classification with LLM + fallback
│   │   │   ├── entity_extractor.py  # Structured entity & parameter extraction
│   │   │   ├── retriever.py         # FAISS vector store & RAG retrieval
│   │   │   ├── policy_engine.py     # Deterministic Veridian Corp policy engine
│   │   │   └── orchestrator.py      # End-to-end agent orchestrator
│   │   ├── api/
│   │   │   ├── chat.py              # POST /api/chat
│   │   │   ├── tickets.py           # GET/POST/PATCH /api/tickets, /api/requests, /api/employees
│   │   │   ├── sources.py           # GET /api/knowledge-base, /api/knowledge-base/{id}
│   │   │   └── audit.py             # GET /api/audit
│   │   ├── audit/
│   │   │   └── logger.py            # Audit logger for factual event streams
│   │   ├── database/
│   │   │   ├── database.py          # SQLite engine & database initialization/seeding
│   │   │   └── models.py            # SQLAlchemy models (Employee, Ticket, Policy, Audit, Chat)
│   │   └── schemas/
│   │       ├── agent.py             # Agent request/response Pydantic models
│   │       └── ticket.py            # Ticket, policy, and audit Pydantic models
│   ├── data/
│   │   ├── employees.json           # 15 seed employees
│   │   ├── requests.json            # REQ-01 to REQ-15 benchmark scenarios
│   │   └── tickets.json             # TK-1042 to TK-1051 historical tickets
│   ├── knowledge_base/              # 11 Authoritative Knowledge Base documents
│   │   ├── kb_01_password_reset.txt
│   │   ├── kb_02_vpn_access.txt
│   │   ├── kb_03_laptop_replacement.txt
│   │   ├── kb_04_software_installation.txt
│   │   ├── kb_05_printer.txt
│   │   ├── kb_06_mailbox_quota.txt
│   │   ├── kb_07_guest_wifi.txt
│   │   ├── kb_08_expense_access.txt
│   │   ├── kb_09_security_incident.txt
│   │   ├── kb_10_wfh_equipment.txt
│   │   └── asset_management_policy.txt
│   ├── tests/
│   │   ├── test_policy_engine.py    # 12 automated policy engine test scenarios
│   │   └── test_api.py              # API integration, seeding, and audit tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.jsx       # Header & tab navigation
│   │   │   ├── Chat/
│   │   │   │   ├── ChatWindow.jsx   # AI chat with context & live audit panel
│   │   │   │   ├── Message.jsx      # Message bubble with decision & source badges
│   │   │   │   └── InputBox.jsx     # Input with employee switcher
│   │   │   ├── Tickets/
│   │   │   │   ├── TicketList.jsx   # Filterable ticket queue table
│   │   │   │   └── TicketDetails.jsx# Ticket modal with audit trail
│   │   │   ├── Sources/
│   │   │   │   └── SourcePanel.jsx  # Authoritative policy reader modal
│   │   │   └── Audit/
│   │   │       └── AuditTimeline.jsx# Chronological action timeline
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Stats & 15-request interactive launcher
│   │   │   ├── Tickets.jsx          # Ticket management page
│   │   │   ├── KnowledgeBase.jsx    # Policy directory with category filters
│   │   │   └── AuditLogs.jsx        # Complete system audit trail
│   │   ├── services/
│   │   │   └── api.js               # Frontend API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Setup & Running Instructions

### Option 1: One-Command Docker Compose (Production Ready)

```bash
docker compose up --build
```

- **Frontend Portal**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend and create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend initializes SQLite database `veridian.db`, seeds 15 employees, 10 historical tickets (`TK-1042`..`TK-1051`), and indexes all 11 knowledge base documents into the FAISS vector index automatically on startup.

#### 2. Frontend Setup (React + Vite)

```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Running Automated Tests

Run the full automated test suite covering all 12 core company support scenarios and API integration routes:

```bash
# From repository root (or inside backend/)
backend/venv/Scripts/pytest backend/tests -v
```

### Verified Test Cases:

1. `test_01_guest_wifi`: KB-07 -> Decision `RESOLVE`, front-desk kiosk 24h validity, no ticket required.
2. `test_02_password_lockout_after_6_attempts`: KB-01 -> Decision `ESCALATE`, threshold exceeded, manual IT unlock required.
3. `test_03_expired_vpn_credentials`: KB-02 -> Decision `RESOLVE`, 90-day renewal cycle.
4. `test_04_contractor_vpn`: KB-02 -> Decision `ESCALATE`, manager approval via access request form required.
5. `test_05_non_catalog_software`: KB-04 -> Decision `ESCALATE`, IT Security review (3–5 business days).
6. `test_06_phishing_email`: KB-09 -> Decision `ESCALATE` to SECURITY, report to `security@veridian-corp.example`, do not forward.
7. `test_07_mailbox_quota`: KB-06 -> Decision `RESOLVE`, default 25GB, archive mail, manager approval for quota increase, max 50GB.
8. `test_08_wfh_monitor`: KB-10 -> Decision `ESCALATE`, remote >3 days, manager sign-off + Finance processing.
9. `test_09_admin_access_no_policy`: Decision `ESCALATE`, no current policy, TK-1050 context only, do not invent approval process.
10. `test_10_unclear_request`: Decision `FOLLOW_UP`, ask what is not working without guessing.
11. `test_11_laptop_3_point_5_years`: KB-03 + Asset Management Policy -> Decision `ESCALATE`, recognize 4-year cycle interaction, Finance sign-off + IT approval.
12. `test_12_expense_software_login`: KB-08 -> Decision `FOLLOW_UP`, preserve waiting state, Finance owns access, IT assists with login if account exists.
13. `test_health_endpoint`, `test_get_tickets`, `test_get_knowledge_base`, `test_chat_guest_wifi`, `test_chat_phishing_escalation`, `test_audit_log_generation`.

---

## Environment Variables

Copy `.env.example` to `.env`:

| Variable         | Description                                            | Default                                                  |
| :--------------- | :----------------------------------------------------- | :------------------------------------------------------- |
| `DATABASE_URL`   | SQLAlchemy connection URI (SQLite or PostgreSQL)       | `sqlite:///./veridian.db`                                |
| `ENV`            | Environment identifier (`development` or `production`) | `development`                                            |
| `HOST`           | Backend server host                                    | `0.0.0.0`                                                |
| `PORT`           | Backend server port                                    | `8000`                                                   |
| `GEMINI_API_KEY` | Optional external LLM API key for NLU parsing          | _(Empty — offline deterministic engine runs by default)_ |
| `OPENAI_API_KEY` | Optional external LLM API key alternative              | _(Empty)_                                                |
| `VITE_API_URL`   | Backend URL for React frontend                         | `http://localhost:8000`                                  |

---

## Authoritative Policy Matrix

| Policy ID        | Title                       | Core Rule                                                                                            |
| :--------------- | :-------------------------- | :--------------------------------------------------------------------------------------------------- |
| **KB-01**        | Password Reset              | Self-service portal at any time. If locked out after 5 attempts, contact IT for manual unlock.       |
| **KB-02**        | VPN Access                  | Full-time employees automatic. Contractors require manager approval via access form. 90-day renewal. |
| **KB-03**        | Laptop Replacement          | Eligible after 3 years of service or verified hardware failure. 2 weeks advance notice.              |
| **Asset Policy** | Asset Refresh Cycle         | Standard 4-year refresh cycle. Early replacement requires Finance sign-off + IT approval.            |
| **KB-04**        | Software Installation       | Catalog software self-installed. Non-catalog requires IT Security review (3–5 business days).        |
| **KB-05**        | Printer Troubleshooting     | 1. Check queue. 2. Restart print spooler. 3. Log ticket with asset tag.                              |
| **KB-06**        | Email Mailbox Quota         | Default 25GB. Quota increase requires manager approval. Maximum 50GB.                                |
| **KB-07**        | Guest Wi-Fi Access          | Valid for 24 hours. Front-desk kiosk. No IT ticket required.                                         |
| **KB-08**        | Expense Software Access     | Access granted by Finance, not IT. IT assists with login/tech issues if account exists.              |
| **KB-09**        | Security Incident Reporting | Report phishing/malware to `security@veridian-corp.example`. Never forward to employees.             |
| **KB-10**        | WFH Equipment               | Remote >3 days/wk eligible for chair/monitor allowance. Manager sign-off + Finance processing.       |

---

## License

Proprietary — Veridian Corp Internal IT Systems.
