import pytest
from pathlib import Path
from app.agent.retriever import RAGRetriever
from app.agent.classifier import RequestClassifier
from app.agent.entity_extractor import EntityExtractor
from app.agent.policy_engine import DeterministicPolicyEngine
from app.schemas.agent import DecisionType, IntentType

@pytest.fixture(scope="module")
def engine():
    retriever = RAGRetriever()
    return DeterministicPolicyEngine(retriever)

@pytest.fixture(scope="module")
def classifier():
    return RequestClassifier()

@pytest.fixture(scope="module")
def extractor():
    return EntityExtractor()

def test_01_guest_wifi(engine, classifier, extractor):
    """Scenario 1: Guest Wi-Fi -> RESOLVE (KB-07, kiosk 24h, no ticket)"""
    text = "Can I get Wi-Fi access for a guest visiting our office tomorrow?"
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.RESOLVE
    assert any(s.id == "KB-07" for s in result.sources)
    assert "24 hours" in result.response
    assert "front-desk kiosk" in result.response
    assert result.ticket_action == "NONE"

def test_02_password_lockout_after_6_attempts(engine, classifier, extractor):
    """Scenario 2: Password lockout after 6 attempts -> ESCALATE (KB-01 manual unlock)"""
    text = "I'm locked out of my account, tried my password 6 times."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    assert any(s.id == "KB-01" for s in result.sources)
    assert "manual IT unlock" in result.response.lower() or "unlock your account manually" in result.response.lower()
    assert result.assigned_team == "IT"

def test_03_expired_vpn_credentials(engine, classifier, extractor):
    """Scenario 3: Expired VPN credentials -> RESOLVE (KB-02, 90 days renewal)"""
    text = "My VPN stopped working this morning, says credentials expired."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.RESOLVE
    assert any(s.id == "KB-02" for s in result.sources)
    assert "90 days" in result.response

def test_04_contractor_vpn(engine, classifier, extractor):
    """Scenario 4: Contractor VPN -> ESCALATE / Approval required (KB-02)"""
    text = "New contractor joining my team next week, they'll need VPN access."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    assert any(s.id == "KB-02" for s in result.sources)
    assert "manager approval" in result.response.lower()
    assert "access request form" in result.response.lower()

def test_05_non_catalog_software(engine, classifier, extractor):
    """Scenario 5: Non-catalog software -> ESCALATE / Security review 3-5 days (KB-04)"""
    text = "Need approval to install a data-analysis tool that's not in the software catalog."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    assert any(s.id == "KB-04" for s in result.sources)
    assert result.assigned_team == "SECURITY"
    assert "3–5 business days" in result.response or "3-5 business days" in result.response

def test_06_phishing_email(engine, classifier, extractor):
    """Scenario 6: Phishing email -> ESCALATE (KB-09, security@veridian-corp.example, do not forward)"""
    text = "I think I got a phishing email asking for my login — forwarding it to a few teammates to check."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    assert any(s.id == "KB-09" for s in result.sources)
    assert result.assigned_team == "SECURITY"
    assert "security@veridian-corp.example" in result.response
    assert "not forward" in result.response.lower()

def test_07_mailbox_quota(engine, classifier, extractor):
    """Scenario 7: Mailbox quota -> RESOLVE (KB-06, default 25GB, max 50GB, manager approval)"""
    text = "My mailbox is full and I can't send emails."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.RESOLVE
    assert any(s.id == "KB-06" for s in result.sources)
    assert "25GB" in result.response or "25 gb" in result.response.lower()
    assert "50GB" in result.response or "50 gb" in result.response.lower()
    assert "manager approval" in result.response.lower()

def test_08_wfh_monitor(engine, classifier, extractor):
    """Scenario 8: WFH monitor -> ESCALATE (KB-10, >3 days, manager sign-off + Finance processing)"""
    text = "I've started working from home 4 days a week, how do I get a monitor?"
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    assert any(s.id == "KB-10" for s in result.sources)
    assert "manager sign-off" in result.response.lower() or "manager" in result.response.lower()
    assert "finance" in result.response.lower()

def test_09_admin_access_no_policy(engine, classifier, extractor):
    """Scenario 9: Admin access -> ESCALATE (No policy defined, TK-1050 is historical context only)"""
    text = "Can someone give me admin access to the finance reporting server? Need it urgently for month-end."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    assert "TK-1050" in [t.ticket_id for t in result.historical_context] or "TK-1050" in result.response
    assert "not define" in result.response.lower()
    assert len(result.sources) == 0  # No current policy exists!

def test_10_unclear_request(engine, classifier, extractor):
    """Scenario 10: Unclear request -> FOLLOW_UP (REQ-15, ask what is not working)"""
    text = "hey can you help, its not working"
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.FOLLOW_UP
    assert result.requires_follow_up is True
    assert "what is not working" in result.response.lower()
    assert len(result.sources) == 0

def test_11_laptop_3_point_5_years(engine, classifier, extractor):
    """Scenario 11: 3.5-year laptop case -> ESCALATE (KB-03 + Asset Management Policy interaction)"""
    text = "My laptop won't turn on at all, it's completely dead, had it about 3.5 years now."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [])

    assert result.decision == DecisionType.ESCALATE
    source_ids = [s.id for s in result.sources]
    assert "KB-03" in source_ids
    assert "Asset Management Policy" in source_ids
    assert "4-year" in result.response or "4 year" in result.response
    assert "Finance sign-off" in result.response or "finance" in result.response.lower()

def test_12_expense_software_login(engine, classifier, extractor):
    """Scenario 12: Expense software login -> FOLLOW_UP / preserve waiting state (KB-08)"""
    text = "I can't log into the expense tool, keeps saying invalid credentials."
    intent = classifier.classify(text)
    entities = extractor.extract(text, intent)
    result = engine.evaluate(intent, entities, text, [], [], existing_ticket_status="WAITING_FOR_EMPLOYEE")

    assert result.decision == DecisionType.FOLLOW_UP
    assert any(s.id == "KB-08" for s in result.sources)
    assert "Finance" in result.response
    assert result.ticket_status == "WAITING_FOR_EMPLOYEE"

