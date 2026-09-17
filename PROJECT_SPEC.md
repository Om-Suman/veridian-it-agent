# Veridian Corp — Internal IT Service Agent
## Assignment 2 Project Specification

> **IMPORTANT**
>
> This document is the authoritative project context for implementation.
> The agent must use **ONLY** the policy, employee request, and ticket data
> contained in this document.
>
> Do **NOT** invent company policies, approval workflows, departments,
> SLAs, permissions, ticket states, or procedures that are not explicitly
> supported by this document.

---

# 1. Project Overview

Build an internal employee-support agent for **Veridian Corp**.

The agent is an **Internal IT Service Agent** that handles employee IT support
requests.

The system must:

1. Understand the employee's issue.
2. Find the relevant company policy or resolution.
3. Ask sensible follow-up questions when information is insufficient.
4. Resolve simple requests when the supplied policies allow it.
5. Escalate risky, unsupported, or unclear requests to the appropriate human team.
6. Create or update a structured support ticket.
7. Show the source/policy used for the answer.
8. Maintain an audit trail of agent actions.
9. Preserve existing ticket state and historical context.
10. Never fabricate information outside the supplied source data.

---

# 2. Time Context

The exercise is set during:

**Monday, 21 September 2026 – Friday, 25 September 2026**

Dates in the supplied employee requests and ticket records should be interpreted
within this period.

---

# 3. Recommended Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- Python
- FastAPI

## AI / Agent Layer

- LLM for natural-language understanding
- RAG for policy retrieval
- Deterministic policy/routing engine for final decisions

## Vector Search

Preferred:

- FAISS

Alternative:

- Chroma

## Database

Development:

- SQLite

Production/demo alternative:

- PostgreSQL

## Deployment

The project should support:

- Docker
- Docker Compose

The final project should ideally be runnable using one command.

Example:

```bash
docker compose up --build
```

---

# 4. Core Architecture

```text
                    ┌───────────────────────────┐
                    │       Employee/User       │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │      React Frontend       │
                    │                           │
                    │ • Chat Interface          │
                    │ • Ticket Status           │
                    │ • Sources / Policy Panel  │
                    │ • Audit Trail             │
                    └─────────────┬─────────────┘
                                  │
                              REST API
                                  │
                                  ▼
              ┌──────────────────────────────────────┐
              │          FastAPI Backend              │
              │                                      │
              │  ┌────────────────────────────────┐  │
              │  │       Agent Orchestrator       │  │
              │  └───────────────┬────────────────┘  │
              │                  │                   │
              │       ┌──────────┴──────────┐        │
              │       ▼                     ▼        │
              │ ┌─────────────┐      ┌─────────────┐ │
              │ │ Intent /    │      │ RAG Policy  │ │
              │ │ Entity      │      │ Retrieval   │ │
              │ │ Extraction  │      │ FAISS       │ │
              │ └─────────────┘      └──────┬──────┘ │
              │                              │        │
              │                       ┌──────▼──────┐ │
              │                       │ Knowledge   │ │
              │                       │ Base        │ │
              │                       └─────────────┘ │
              │                                      │
              │  ┌────────────────────────────────┐  │
              │  │    Deterministic Policy Engine │  │
              │  └───────────────┬────────────────┘  │
              │                  │                   │
              │          ┌───────┴────────┐          │
              │          ▼                ▼          │
              │      RESOLVE          ESCALATE      │
              │          │                │          │
              │          └───────┬────────┘          │
              │                  ▼                   │
              │          FOLLOW-UP / ACTION         │
              │                  │                   │
              │          ┌───────┴────────┐          │
              │          ▼                ▼          │
              │     Ticket Manager    Audit Logger   │
              └────────────┬─────────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Database   │
                    └──────────────┘
```

---

# 5. Agent Design Principle

The system must NOT allow the LLM to independently invent decisions.

Use:

```text
LLM
 ↓
Understand request
 ↓
Extract intent/entities
 ↓
RAG
 ↓
Retrieve relevant policy
 ↓
Policy Engine
 ↓
Determine action
 ↓
Ticket Manager
 ↓
Audit Logger
 ↓
Response + Sources
```

Responsibilities:

### LLM

Responsible for:

- Understanding natural language.
- Classifying the request.
- Extracting relevant entities.
- Generating a natural-language response based on verified information.
- Identifying when information is missing.

### RAG

Responsible for:

- Finding relevant policies.
- Finding relevant historical ticket context.
- Providing evidence to the agent.

### Policy Engine

Responsible for:

- Applying explicit policy rules.
- Determining whether the request can be resolved.
- Determining whether follow-up information is required.
- Determining whether human escalation is required.

### Ticket Manager

Responsible for:

- Creating tickets.
- Updating existing tickets.
- Maintaining status.

### Audit Logger

Responsible for:

- Recording agent actions.
- Recording decisions.
- Recording policy sources used.
- Recording ticket changes.

---

# 6. Decision Types

The agent should use three primary decision categories.

## RESOLVE

Use when the supplied policy gives a clear action that the agent can
communicate or perform directly.

Example:

```text
Guest Wi-Fi request
→ KB-07
→ Employee can generate credentials from front-desk kiosk
→ No IT ticket required
```

## FOLLOW_UP

Use when the employee's request does not contain enough information to determine
the correct action.

Example:

```text
"hey can you help, its not working"

→ Unknown issue
→ Ask employee what service/device is affected.
```

The agent must NOT guess the issue.

## ESCALATE

Use when:

- Human approval is explicitly required.
- A security incident is involved.
- The supplied policies do not define a safe resolution.
- The request requires another department.
- The request requires human investigation.
- The issue is unclear and cannot be resolved through a sensible follow-up.

---

# 7. Knowledge Base / Policies

## KB-01 — Password Reset

Employees can reset their own password via the self-service portal at any time.

If locked out after **5 failed attempts**, contact IT to unlock the account
manually.

No approval required.

---

## KB-02 — VPN Access

VPN access is granted automatically to all full-time employees.

Contractors require manager approval submitted via the access request form.

VPN credentials expire every **90 days** and must be renewed by the employee.

---

## KB-03 — Laptop Replacement

Laptops are eligible for replacement after **3 years of service**, or earlier
in case of **verified hardware failure**.

Requests must be raised at least **2 weeks in advance** of intended replacement.

---

## KB-04 — Software Installation

Standard software listed in the approved catalog can be self-installed.

Non-catalog software requires **IT Security review**.

Security review takes **3–5 business days**.

---

## KB-05 — Printer Troubleshooting

For printer issues:

1. Check the printer queue.
2. Restart the print spooler.
3. If the issue persists after restart, log a ticket with the printer's asset tag.

Do not invent additional troubleshooting steps.

---

## KB-06 — Email Mailbox Quota

Default mailbox quota is **25GB**.

Employees nearing quota should archive old mail.

Quota increases beyond 25GB require manager approval.

Maximum quota is **50GB**.

---

## KB-07 — Guest Wi-Fi Access

Guest Wi-Fi credentials are valid for **24 hours**.

Any employee can generate guest Wi-Fi credentials from the front-desk kiosk.

No IT ticket required.

---

## KB-08 — Expense Software Access

Access to the expense management tool is granted by **Finance**, not IT.

IT can only assist with login/technical issues once an account already exists.

---

## KB-09 — Security Incident Reporting

Any suspected:

- phishing email
- malware
- unauthorized access attempt

must be reported to:

```text
security@veridian-corp.example
```

immediately.

The suspected security email/message should **not be forwarded to other
employees**.

---

## KB-10 — Work-From-Home Equipment

Employees working remotely more than **3 days/week** are eligible for a
one-time home office equipment allowance.

Eligible equipment includes:

- chair
- monitor

Requires:

1. Manager sign-off
2. Finance processing

IT only handles the equipment shipping request once approved.

---

# 8. Asset Management Policy

**Asset Management Policy Extract**

Issued by:

Finance & Assets

Last updated:

Q2 2026

All company-issued hardware, including:

- laptops
- monitors

follows a standard **4-year refresh cycle from date of issue**.

Early replacement outside this cycle requires:

- Finance sign-off
- IT approval

---

# 9. Important Policy Interaction

There is an important distinction between:

```text
KB-03:
Laptop replacement eligibility after 3 years,
or earlier for verified hardware failure.

Asset Management Policy:
Standard hardware refresh cycle = 4 years.
Early replacement outside this cycle requires
Finance sign-off + IT approval.
```

For a laptop between 3 and 4 years old:

- KB-03 indicates replacement eligibility.
- The Asset Management Policy establishes the standard 4-year refresh cycle.
- If replacement occurs before the standard 4-year cycle, Finance sign-off and
  IT approval are required.

For hardware failure:

- KB-03 allows earlier replacement when the hardware failure is verified.
- Do not claim that replacement is automatically approved.
- Apply the Asset Management Policy requirements where applicable.

---

# 10. Employee Requests

## REQ-01

**Employee:** Aditi Sharma  
**Email:** aditi.sharma@veridian-corp.example  
**Date:** Monday, 21 September 2026

**Request:**

> My laptop won't turn on at all, it's completely dead, had it about 3.5 years now.

**Initial Action:** Not started

**Relevant policies:**

- KB-03
- Asset Management Policy

**Expected handling:**

The laptop is 3.5 years old.

Do not simply say "replacement approved."

The system should recognize the interaction between KB-03 and the 4-year Asset
Management Policy.

The device may also require verification of hardware failure.

Human/IT involvement is appropriate.

---

## REQ-02

**Employee:** Vikram Chawla  
**Email:** vikram.chawla@veridian-corp.example  
**Date:** Monday, 21 September 2026

**Request:**

> Can I get Wi-Fi access for a guest visiting our office tomorrow?

**Initial Action:** Not started

**Relevant policy:** KB-07

**Expected handling:**

Resolve.

Employee can generate guest Wi-Fi credentials from the front-desk kiosk.

Credentials are valid for 24 hours.

No IT ticket is required.

---

## REQ-03

**Employee:** Karan Mehta  
**Email:** karan.mehta@veridian-corp.example  
**Date:** Monday, 21 September 2026

**Request:**

> I'm locked out of my account, tried my password 6 times.

**Initial Action:** In progress — reset queued

**Relevant policy:** KB-01

**Expected handling:**

Because the employee attempted the password 6 times, this exceeds the 5-failed-
attempt threshold.

Manual IT unlock is required.

No approval is required.

Do not incorrectly tell the employee to simply retry the password.

---

## REQ-04

**Employee:** Ritu Bhatia  
**Email:** ritu.bhatia@veridian-corp.example  
**Date:** Tuesday, 22 September 2026

**Request:**

> Need approval to install a data-analysis tool that's not in the software catalog.

**Initial Action:** Waiting on Security review

**Relevant policy:** KB-04

**Expected handling:**

Security review is required.

Expected duration:

**3–5 business days.**

Do not claim approval has been granted.

---

## REQ-05

**Employee:** Sanjay Oberoi  
**Email:** sanjay.oberoi@veridian-corp.example  
**Date:** Tuesday, 22 September 2026

**Request:**

> My VPN stopped working this morning, says credentials expired.

**Initial Action:** Not started

**Relevant policy:** KB-02

**Expected handling:**

VPN credentials expire every 90 days and must be renewed by the employee.

Provide renewal guidance based only on KB-02.

---

## REQ-06

**Employee:** Meera Iyer  
**Email:** meera.iyer@veridian-corp.example  
**Date:** Tuesday, 22 September 2026

**Request:**

> Printer on the 3rd floor keeps showing "paper jam" even though there's no jam.

**Initial Action:** Investigating — technician assigned

**Relevant policy:** KB-05

**Expected handling:**

The supplied troubleshooting process is:

1. Check printer queue.
2. Restart print spooler.
3. If issue persists, log a ticket using the printer asset tag.

A technician is already assigned.

Do not create a duplicate ticket unnecessarily.

Do not invent additional printer troubleshooting procedures.

---

## REQ-07

**Employee:** Farhan Ali  
**Email:** farhan.ali@veridian-corp.example  
**Date:** Wednesday, 23 September 2026

**Request:**

> I've started working from home 4 days a week, how do I get a monitor?

**Initial Action:** Not started

**Relevant policy:** KB-10

**Expected handling:**

The employee works remotely more than 3 days/week.

They are eligible for a one-time home office equipment allowance.

Monitor is an eligible item.

However:

- Manager sign-off required.
- Finance processing required.
- IT handles shipping only after approval.

Do not say IT directly approves the equipment allowance.

---

## REQ-08

**Employee:** Ananya Reddy  
**Email:** ananya.reddy@veridian-corp.example  
**Date:** Wednesday, 23 September 2026

**Request:**

> I think I got a phishing email asking for my login — forwarding it to a few teammates to check.

**Initial Action:** Escalated to Security (auto-flagged)

**Relevant policy:** KB-09

**Expected handling:**

Escalate to Security.

Tell the employee:

```text
Report the suspected phishing email immediately to:

security@veridian-corp.example
```

Also tell them:

```text
Do not forward it to other employees.
```

This is a security incident.

---

## REQ-09

**Employee:** Rohit Desai  
**Email:** rohit.desai@veridian-corp.example  
**Date:** Wednesday, 23 September 2026

**Request:**

> My mailbox is full and I can't send emails.

**Initial Action:** Not started

**Relevant policy:** KB-06

**Expected handling:**

Default mailbox quota is 25GB.

Employee should archive old mail.

If they require a quota increase beyond 25GB:

- Manager approval required.
- Maximum quota = 50GB.

Do not promise a quota increase.

---

## REQ-10

**Employee:** Kavya Pillai  
**Email:** kavya.pillai@veridian-corp.example  
**Date:** Wednesday, 23 September 2026

**Request:**

> Can someone give me admin access to the finance reporting server? Need it urgently for month-end.

**Initial Action:** Not started

**Relevant current policy:**

No explicit admin-access policy is provided.

**Historical ticket:**

TK-1050

**Historical result:**

Admin access request rejected because no business justification was provided.

**Expected handling:**

Do NOT invent an admin-access approval process.

Escalate for human review because the supplied policies do not define the required
process.

The historical ticket can be shown as context, but must not automatically be
treated as a universal policy.

---

## REQ-11

**Employee:** Nikhil Bansal  
**Email:** nikhil.bansal@veridian-corp.example  
**Date:** Thursday, 24 September 2026

**Request:**

> New contractor joining my team next week, they'll need VPN access.

**Initial Action:** Not started

**Relevant policy:** KB-02

**Expected handling:**

Contractors require manager approval submitted through the access request form.

Do not state that contractor VPN access is automatic.

---

## REQ-12

**Employee:** Sneha Kulkarni  
**Email:** sneha.kulkarni@veridian-corp.example  
**Date:** Thursday, 24 September 2026

**Request:**

> I can't log into the expense tool, keeps saying invalid credentials.

**Initial Action:** Waiting on employee response — asked for screenshot, no reply yet

**Relevant policy:** KB-08

**Expected handling:**

Expense tool access is granted by Finance, not IT.

However, IT can assist with login/technical issues once the account already exists.

The existing request is already waiting for employee information.

Do not unnecessarily create a duplicate ticket.

---

## REQ-13

**Employee:** Aman Gupta  
**Email:** aman.gupta@veridian-corp.example  
**Date:** Thursday, 24 September 2026

**Request:**

> Laptop screen is flickering on and off, had it 2 years, might just need a fix not a replacement.

**Initial Action:** Not started

**Relevant policy:** KB-03

**Expected handling:**

The laptop is only 2 years old.

Normal 3-year replacement eligibility has not been reached.

The employee is asking for a possible repair rather than replacement.

The supplied policies do not provide a screen-flickering troubleshooting procedure.

Do not invent troubleshooting steps.

Route to IT for diagnosis.

---

## REQ-14

**Employee:** Tanya Chopra  
**Email:** tanya.chopra@veridian-corp.example  
**Date:** Friday, 25 September 2026

**Request:**

> Requesting approval to install a browser extension for productivity tracking.

**Initial Action:** Not started

**Relevant policy:** KB-04

**Important:**

The supplied data does not establish whether this browser extension is in the
approved software catalog.

Therefore, do not assume that it is approved or non-approved.

Ask whether it is listed in the approved software catalog.

If it is non-catalog software:

→ IT Security review

→ 3–5 business days.

---

## REQ-15

**Employee:** Rahul Menon  
**Email:** rahul.menon@veridian-corp.example  
**Date:** Friday, 25 September 2026

**Request:**

> hey can you help, its not working

**Initial Action:** Not started

**Expected handling:**

FOLLOW_UP.

The request is too vague.

Ask the employee what is not working.

Possible clarification categories can include:

- laptop
- VPN
- email
- printer
- account/login
- software
- another IT service

Do not assume which issue the employee means.

---

# 11. Existing Ticket Queue

The ticket queue is separate from the employee request list.

Every ticket marked:

- Resolved
- Rejected
- Approved

is considered closed unless explicitly stated otherwise.

All other tickets are active/open.

Closed tickets remain available as historical context.

---

## TK-1042

**Employee:** R. Verma  
**Issue:** VPN credential expired  
**Status:** Resolved (closed)

Use as historical context only.

---

## TK-1043

**Employee:** S. Iyer  
**Issue:** Laptop replacement (3.2 years old)  
**Status:** Approved — pending fulfillment (active)

This ticket can be used as historical context.

Do not automatically assume this means all laptop replacements are approved.

---

## TK-1044

**Employee:** A. Khan  
**Issue:** Non-catalog software request  
**Status:** Pending Security review (active)

Relevant to KB-04.

---

## TK-1045

**Employee:** P. Joshi  
**Issue:** Mailbox quota increase  
**Status:** Approved at 35GB (closed)

Relevant historical precedent for a quota increase.

Do not infer that every quota increase is automatically approved.

---

## TK-1046

**Employee:** M. Das  
**Issue:** Printer paper jam, floor 2  
**Status:** Resolved (closed)

Historical printer case.

---

## TK-1047

**Employee:** K. Singh  
**Issue:** Home office equipment request  
**Status:** Pending Finance (active)

Relevant to KB-10.

---

## TK-1048

**Employee:** T. Rao  
**Issue:** Phishing email reported  
**Status:** Escalated to Security — under investigation (active)

Relevant to KB-09.

---

## TK-1049

**Employee:** V. Nambiar  
**Issue:** Password reset  
**Status:** Resolved (closed)

Historical password reset case.

---

## TK-1050

**Employee:** J. Fernandes  
**Issue:** Admin access request  
**Status:** Rejected — no business justification provided (closed)

Historical context only.

Do not convert this single historical case into a universal admin-access policy.

---

## TK-1051

**Employee:** L. Menon  
**Issue:** Guest Wi-Fi issued  
**Status:** Resolved (closed)

Historical guest Wi-Fi case.

---

# 12. Ticket Status Model

Recommended statuses:

```text
OPEN
IN_PROGRESS
WAITING_FOR_EMPLOYEE
WAITING_FOR_APPROVAL
WAITING_FOR_SECURITY
WAITING_FOR_FINANCE
ESCALATED
RESOLVED
CLOSED
```

Only use a status when supported by the current request and source information.

Do not invent additional business statuses unnecessarily.

---

# 13. Ticket Data Model

Recommended structure:

```json
{
  "ticket_id": "REQ-01",
  "employee_name": "Aditi Sharma",
  "employee_email": "aditi.sharma@veridian-corp.example",
  "category": "Laptop",
  "summary": "Laptop will not power on",
  "status": "ESCALATED",
  "decision": "ESCALATE",
  "assigned_team": "IT",
  "priority": "Normal",
  "sources": [
    "KB-03",
    "Asset Management Policy"
  ],
  "created_at": "2026-09-21",
  "updated_at": "2026-09-21"
}
```

Do not invent priority rules.

If priority is not defined by the supplied data, use a neutral default or omit
the field.

---

# 14. Audit Trail

Every significant agent action must be logged.

Example:

```text
AUDIT LOG

18:21:03
Request received
REQ-08

18:21:04
Intent classified
SECURITY_INCIDENT

18:21:05
Policy retrieved
KB-09

18:21:05
Security incident identified

18:21:06
Decision
ESCALATE

18:21:06
Assigned team
SECURITY

18:21:07
Response generated

18:21:07
Source displayed
KB-09
```

Audit events should include:

```text
timestamp
ticket_id
action
actor
details
source_ids
```

Possible actions:

```text
REQUEST_RECEIVED
INTENT_CLASSIFIED
POLICY_RETRIEVED
FOLLOW_UP_REQUESTED
DECISION_MADE
TICKET_CREATED
TICKET_UPDATED
ESCALATED
RESOLVED
SOURCE_DISPLAYED
```

---

# 15. Source Attribution

Every policy-based response must show its source.

Example:

```text
Answer:
Your VPN credentials expire every 90 days and must be renewed by you.

Sources:
KB-02 — VPN Access
```

For multiple sources:

```text
Sources:
KB-03 — Laptop Replacement
Asset Management Policy — Finance & Assets
```

Historical ticket sources should be clearly distinguished from policies.

Example:

```text
Policy:
KB-04 — Software Installation

Historical Context:
TK-1044 — Non-catalog software request
```

Never present a historical ticket as if it were a current policy.

---

# 16. RAG Pipeline

Implement:

```text
Knowledge Documents
        ↓
Document Loading
        ↓
Chunking
        ↓
Embeddings
        ↓
FAISS Vector Store
        ↓
Semantic Retrieval
        ↓
Top Relevant Sources
        ↓
Agent Context
```

Knowledge documents should contain the KB entries and Asset Management Policy.

Employee requests and ticket records may be stored separately as structured data.

---

# 17. Recommended Agent Pipeline

For every user message:

```text
1. Receive request
        ↓
2. Identify employee
        ↓
3. Classify intent
        ↓
4. Extract relevant entities
        ↓
5. Retrieve relevant policies
        ↓
6. Retrieve relevant ticket/history context
        ↓
7. Evaluate policy
        ↓
8. Determine:
       RESOLVE
       FOLLOW_UP
       ESCALATE
        ↓
9. Create/update ticket if appropriate
        ↓
10. Record audit event
        ↓
11. Generate response
        ↓
12. Display sources
```

---

# 18. Structured Agent Output

The internal agent should produce structured JSON.

Example:

```json
{
  "intent": "VPN_ACCESS",
  "entities": {
    "issue": "credentials_expired"
  },
  "decision": "RESOLVE",
  "assigned_team": "IT",
  "response": "Your VPN credentials have expired. According to KB-02, VPN credentials expire every 90 days and must be renewed by the employee.",
  "sources": [
    {
      "id": "KB-02",
      "title": "VPN Access"
    }
  ],
  "requires_follow_up": false,
  "ticket_action": "CREATE_OR_UPDATE"
}
```

For an unclear request:

```json
{
  "intent": "UNKNOWN",
  "entities": {},
  "decision": "FOLLOW_UP",
  "response": "Could you describe what is not working?",
  "sources": [],
  "requires_follow_up": true,
  "ticket_action": "CREATE_OR_UPDATE"
}
```

For escalation:

```json
{
  "intent": "SECURITY_INCIDENT",
  "entities": {
    "type": "phishing"
  },
  "decision": "ESCALATE",
  "assigned_team": "SECURITY",
  "response": "Please report the suspected phishing email immediately to security@veridian-corp.example and do not forward it to other employees.",
  "sources": [
    {
      "id": "KB-09",
      "title": "Security Incident Reporting"
    }
  ],
  "requires_follow_up": false,
  "ticket_action": "CREATE_OR_UPDATE"
}
```

---

# 19. Frontend Requirements

Build a professional internal support dashboard.

Recommended layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ VERIDIAN CORP IT SUPPORT                                    │
├───────────────┬──────────────────────────────┬───────────────┤
│               │                              │               │
│ Dashboard     │       AI Support Agent       │ Ticket        │
│               │                              │ Details       │
│ My Tickets    │ Employee conversation       │               │
│               │                              │ REQ-01        │
│ Knowledge     │ AI response                 │ Status        │
│ Base          │                              │               │
│               │                              │ Decision      │
│ Audit Logs    │ [ Type your issue... ]      │               │
│               │                              │ Sources       │
├───────────────┴──────────────────────────────┴───────────────┤
│ Source: KB-03 | Asset Management Policy                     │
└──────────────────────────────────────────────────────────────┘
```

---

# 20. Required UI Features

## Chat

Employee can:

- enter issue
- receive response
- answer follow-up questions
- continue conversation

## Ticket Panel

Show:

- Ticket ID
- Employee
- Category
- Status
- Decision
- Assigned team
- Created date
- Updated date

## Sources Panel

Show:

- Source ID
- Source title
- Relevant policy text
- Historical ticket context where applicable

## Audit Panel

Show chronological events:

```text
Request received
↓
Intent classified
↓
Policy retrieved
↓
Decision made
↓
Ticket updated
↓
Response generated
```

---

# 21. Backend API

Recommended endpoints:

```text
POST /api/chat
```

Process employee request.

```text
GET /api/tickets
```

Return tickets.

```text
GET /api/tickets/{ticket_id}
```

Return ticket details.

```text
GET /api/tickets/{ticket_id}/audit
```

Return audit history.

```text
GET /api/tickets/{ticket_id}/sources
```

Return sources used.

```text
GET /api/knowledge-base
```

Return available policies.

---

# 22. Suggested Backend Structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── chat.py
│   │   ├── tickets.py
│   │   ├── sources.py
│   │   └── audit.py
│   │
│   ├── agent/
│   │   ├── orchestrator.py
│   │   ├── classifier.py
│   │   ├── entity_extractor.py
│   │   ├── retriever.py
│   │   ├── policy_engine.py
│   │   └── response_generator.py
│   │
│   ├── database/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── repositories.py
│   │
│   ├── audit/
│   │   └── logger.py
│   │
│   └── schemas/
│       ├── agent.py
│       └── ticket.py
│
├── knowledge_base/
│   ├── kb_01_password_reset.txt
│   ├── kb_02_vpn_access.txt
│   ├── kb_03_laptop_replacement.txt
│   ├── kb_04_software_installation.txt
│   ├── kb_05_printer.txt
│   ├── kb_06_mailbox_quota.txt
│   ├── kb_07_guest_wifi.txt
│   ├── kb_08_expense_access.txt
│   ├── kb_09_security_incident.txt
│   ├── kb_10_wfh_equipment.txt
│   └── asset_management_policy.txt
│
├── data/
│   ├── employees.json
│   ├── requests.json
│   └── tickets.json
│
├── requirements.txt
└── Dockerfile
```

---

# 23. Suggested Frontend Structure

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Message.jsx
│   │   │   └── InputBox.jsx
│   │   │
│   │   ├── Tickets/
│   │   │   ├── TicketList.jsx
│   │   │   └── TicketDetails.jsx
│   │   │
│   │   ├── Sources/
│   │   │   └── SourcePanel.jsx
│   │   │
│   │   └── Audit/
│   │       └── AuditTimeline.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Tickets.jsx
│   │   └── KnowledgeBase.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── Dockerfile
```

---

# 24. Demo Scenarios

The final prototype should demonstrate at least these scenarios.

## Scenario 1 — Guest Wi-Fi

Input:

```text
I need Wi-Fi for a guest tomorrow.
```

Expected:

```text
Decision: RESOLVE

Source: KB-07

Action:
Generate guest Wi-Fi credentials from the front-desk kiosk.

Validity:
24 hours.

IT ticket:
Not required.
```

---

## Scenario 2 — Security Incident

Input:

```text
I received a suspicious email asking for my login.
```

Expected:

```text
Decision: ESCALATE

Team:
Security

Source:
KB-09

Action:
Report immediately to:
security@veridian-corp.example

Do not forward the suspicious email to other employees.
```

---

## Scenario 3 — Unclear Request

Input:

```text
Hey, it's not working.
```

Expected:

```text
Decision: FOLLOW_UP

Response:
Could you describe what is not working?
```

---

## Scenario 4 — Laptop Replacement

Input:

```text
My laptop is 3.5 years old and completely dead.
```

Expected:

```text
Decision:
ESCALATE / HUMAN REVIEW

Sources:
KB-03
Asset Management Policy

Reason:
The laptop is beyond the 3-year eligibility threshold in KB-03,
but still before the standard 4-year refresh cycle.

Verified hardware failure may support early replacement.

Early replacement outside the standard cycle requires:
Finance sign-off + IT approval.
```

---

## Scenario 5 — Contractor VPN

Input:

```text
A contractor joining my team needs VPN access.
```

Expected:

```text
Decision:
ESCALATE / APPROVAL REQUIRED

Source:
KB-02

Requirement:
Manager approval submitted through the access request form.
```

---

# 25. Evaluation Criteria

Evaluate the agent on:

## Grounding

Does the response use only supplied information?

## Correct policy retrieval

Did the system retrieve the appropriate KB/policy?

## Decision accuracy

Did it correctly choose:

```text
RESOLVE
FOLLOW_UP
ESCALATE
```

?

## Source attribution

Does the response identify the exact source?

## Ticket management

Does the system create/update the appropriate ticket?

## Auditability

Can the reviewer see what the system did?

## Safety

Does the system correctly escalate security incidents and avoid unsupported
actions?

## Historical consistency

Does the system use previous tickets as context without treating them as
universal policies?

---

# 26. Safety / Grounding Rules

These rules are mandatory.

## Rule 1 — No hallucinated policies

Never invent:

- approval procedures
- forms
- deadlines
- departments
- SLAs
- permissions
- escalation processes
- troubleshooting steps
- replacement rules

unless explicitly present in the source data.

---

## Rule 2 — Historical tickets are not policies

A historical ticket can provide context.

It cannot automatically create a new company policy.

Example:

TK-1050 says an admin-access request was rejected due to no business
justification.

Do NOT conclude:

> "All admin access requests require business justification."

Instead:

> "A previous admin-access request was rejected because no business justification
> was provided. The supplied current policy does not define the admin-access
> process, so human review is required."

---

## Rule 3 — Never expose unsupported certainty

If the source does not establish an answer:

> The supplied IT policy does not define this process, so this request requires
> human review.

---

## Rule 4 — Security incidents receive special handling

For phishing, malware, or unauthorized-access attempts:

- Escalate to Security.
- Provide security@veridian-corp.example.
- Tell the employee not to forward the suspicious message to other employees.

---

## Rule 5 — Preserve ticket state

If an existing request is already:

- waiting for employee
- waiting for Security
- waiting for Finance
- assigned to technician
- escalated

do not unnecessarily create a duplicate case.

---

# 27. Product Goal

The final application should feel like an internal enterprise IT helpdesk
system rather than a generic chatbot.

The reviewer should be able to:

1. Open the application.
2. Enter an employee IT issue.
3. Receive a grounded answer.
4. See the decision.
5. See the ticket created/updated.
6. See the exact policy source.
7. See the audit trail.
8. Test follow-up questions.
9. Test escalation scenarios.
10. Inspect existing ticket history.

---

# 28. Final Architecture Principle

The core architecture should be:

```text
              ┌─────────────────┐
              │     Employee    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ React Frontend  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ FastAPI Backend │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Agent           │
              │ Orchestrator    │
              └───────┬─────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       LLM/NLP       RAG      Ticket Context
          │           │           │
          └───────────┼───────────┘
                      ▼
              ┌─────────────────┐
              │ Policy Engine   │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
          RESOLVE   FOLLOW-UP  ESCALATE
             │         │         │
             └─────────┼─────────┘
                       ▼
              ┌─────────────────┐
              │ Ticket Manager  │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │ Audit Logger    │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │ Response +      │
              │ Sources         │
              └─────────────────┘
```

The key principle is:

**LLM understands → RAG retrieves → Policy Engine decides → Ticket Manager records → Audit Logger tracks → UI shows evidence.**

---

# 29. Development Instructions for Coding LLMs

When implementing this project:

1. Read this entire `PROJECT_SPEC.md` before making changes.
2. Treat this file as the source of truth.
3. Inspect the existing repository before modifying it.
4. Do not overwrite existing working code without understanding it.
5. Keep frontend and backend separated.
6. Keep business logic separate from API routes.
7. Keep policy retrieval separate from decision logic.
8. Use typed/structured schemas for agent outputs.
9. Validate LLM output before executing actions.
10. Store ticket state in the database.
11. Record audit events for every significant agent action.
12. Return policy source IDs with every grounded response.
13. Seed all 15 employee requests and 10 historical tickets.
14. Include the supplied knowledge-base policies.
15. Make the application easy to run locally.
16. Include Docker/Docker Compose support.
17. Include a README explaining setup, architecture, API endpoints, and demo
    scenarios.
18. Test the application against the supplied demo scenarios.
19. Do not add business functionality requiring information not present in this
    specification.
20. Technical infrastructure decisions may be made when necessary, but they
    must not introduce fictional Veridian Corp policies.

---

# 30. Definition of Done

The implementation is considered complete when:

- [ ] React frontend runs successfully.
- [ ] FastAPI backend runs successfully.
- [ ] Employee can submit an IT issue.
- [ ] Agent classifies the issue.
- [ ] Relevant policies are retrieved.
- [ ] Policy source is displayed.
- [ ] Agent can resolve supported requests.
- [ ] Agent asks follow-up questions for insufficient information.
- [ ] Agent escalates unsupported/risky requests.
- [ ] Tickets can be created.
- [ ] Existing tickets can be updated.
- [ ] Existing ticket state is preserved.
- [ ] Historical tickets can be used as context.
- [ ] Historical tickets are not treated as policies.
- [ ] Audit trail is generated.
- [ ] All supplied employee requests are available as test data.
- [ ] All supplied ticket records are available as test data.
- [ ] Knowledge base contains all supplied policies.
- [ ] No unsupported company policy is fabricated.
- [ ] Demo scenarios work.
- [ ] README contains setup instructions.
- [ ] Docker Compose can start the application.

---

# END OF PROJECT SPECIFICATION
