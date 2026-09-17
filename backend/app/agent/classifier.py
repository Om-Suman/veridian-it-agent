import os
import re
import json
from typing import Optional
import httpx
from ..schemas.agent import IntentType

class RequestClassifier:
    """
    Classifies employee IT requests into structured intents.
    Uses Gemini LLM for natural language understanding when GEMINI_API_KEY is configured,
    with an offline deterministic pattern fallback.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.getenv("GEMINI_API_KEY") or "").strip().strip('"').strip("'")

    def classify(self, text: str) -> IntentType:
        # If Gemini API key is configured, attempt LLM classification
        if self.api_key:
            try:
                llm_intent = self._classify_with_llm(text)
                if llm_intent:
                    return llm_intent
            except Exception:
                pass

        return self._classify_deterministic(text)

    def _classify_with_llm(self, text: str) -> Optional[IntentType]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        prompt = f"""You are an internal IT helpdesk classifier for Veridian Corp.
Classify the employee's request into exactly ONE of the following intent categories:
- PASSWORD_RESET (forgot password, account locked, failed login attempts)
- VPN_ACCESS (VPN connection, expired VPN credentials, contractor VPN)
- LAPTOP_REPLACEMENT (broken/dead laptop, hardware refresh, laptop repair, screen issues)
- SOFTWARE_INSTALLATION (installing software, tools, catalog or browser extensions)
- PRINTER_TROUBLESHOOTING (printer paper jam, print spooler, printing issues)
- MAILBOX_QUOTA (email storage full, cannot send email, quota increase)
- GUEST_WIFI (temporary Wi-Fi for visitors/guests)
- EXPENSE_ACCESS (expense management software login, Finance tool access)
- SECURITY_INCIDENT (phishing email, suspicious login link, malware)
- WFH_EQUIPMENT (work from home allowance, monitor, chair)
- ADMIN_ACCESS (requesting administrative server access or elevated rights)
- UNKNOWN (vague requests like 'help it is not working', or unspecified IT issues)

Employee Request: "{text}"

Return ONLY valid JSON in this exact structure:
{{"intent": "CATEGORY_NAME"}}"""

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.0,
                "responseMimeType": "application/json"
            }
        }

        with httpx.Client(timeout=4.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content)
                intent_str = parsed.get("intent", "").upper()
                if hasattr(IntentType, intent_str):
                    return IntentType[intent_str]

        return None

    def _classify_deterministic(self, text: str) -> IntentType:
        norm_text = text.lower().strip()

        # Check for vague requests (REQ-15 pattern)
        if (
            re.search(r"^(hey|hi|hello)?\s*(can you help|help me|please help)?\s*,?\s*(its|it's|it is)?\s*not working\b", norm_text)
            or norm_text in ["not working", "help", "broken", "issue", "it is broken", "it's broken"]
            or (len(norm_text.split()) <= 6 and "not working" in norm_text and not any(k in norm_text for k in ["laptop", "vpn", "email", "printer", "wifi", "wi-fi", "password", "screen", "expense"]))
        ):
            return IntentType.UNKNOWN

        # Phishing / Security Incident (KB-09)
        if any(w in norm_text for w in ["phishing", "malware", "unauthorized access", "suspicious email", "phish"]):
            return IntentType.SECURITY_INCIDENT

        # Admin Access (Historical TK-1050 context / No policy)
        if "admin access" in norm_text or ("admin" in norm_text and "access" in norm_text):
            return IntentType.ADMIN_ACCESS

        # Guest Wi-Fi (KB-07)
        if ("guest" in norm_text and ("wi-fi" in norm_text or "wifi" in norm_text)) or "guest wifi" in norm_text or "guest wi-fi" in norm_text:
            return IntentType.GUEST_WIFI

        # Expense tool (KB-08)
        if "expense" in norm_text or "expense tool" in norm_text or "expense management" in norm_text:
            return IntentType.EXPENSE_ACCESS

        # Password Reset / Lockout (KB-01)
        if any(w in norm_text for w in ["password", "locked out", "lock out", "failed attempt"]):
            return IntentType.PASSWORD_RESET

        # VPN Access (KB-02)
        if "vpn" in norm_text:
            return IntentType.VPN_ACCESS

        # Mailbox Quota (KB-06)
        if any(w in norm_text for w in ["mailbox", "quota", "can't send emails", "cannot send emails", "email full", "inbox full"]):
            return IntentType.MAILBOX_QUOTA

        # Printer (KB-05)
        if any(w in norm_text for w in ["printer", "print spooler", "paper jam", "printing"]):
            return IntentType.PRINTER_TROUBLESHOOTING

        # WFH Equipment (KB-10)
        if any(w in norm_text for w in ["work from home", "working from home", "wfh", "home office", "monitor", "chair"]):
            return IntentType.WFH_EQUIPMENT

        # Laptop Replacement or repair (KB-03 & Asset Management Policy)
        if any(w in norm_text for w in ["laptop", "notebook", "won't turn on", "dead", "screen flickering", "flickering screen", "replacement"]):
            return IntentType.LAPTOP_REPLACEMENT

        # Software Installation (KB-04)
        if any(w in norm_text for w in ["install", "software", "catalog", "browser extension", "extension", "tool"]):
            return IntentType.SOFTWARE_INSTALLATION

        return IntentType.UNKNOWN
