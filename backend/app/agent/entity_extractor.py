import re
from typing import Dict, Any, Optional
from ..schemas.agent import ExtractedEntities, IntentType

class EntityExtractor:
    """
    Extracts structured entities from employee IT requests.
    Validates numbers, boolean flags, and key parameters.
    """
    def extract(self, text: str, intent: IntentType) -> ExtractedEntities:
        norm = text.lower()
        entities = ExtractedEntities()
        raw: Dict[str, Any] = {}

        # 1. Attempt count (e.g. "tried my password 6 times", "6 failed attempts")
        attempt_match = re.search(r"(\d+)\s*(times|attempts|failed attempts)", norm)
        if attempt_match:
            entities.attempt_count = int(attempt_match.group(1))
            raw["attempt_count"] = entities.attempt_count

        # 2. Duration in years (e.g. "about 3.5 years", "had it 2 years", "3 years")
        year_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:years|year|yrs|yr)", norm)
        if year_match:
            entities.duration_years = float(year_match.group(1))
            raw["duration_years"] = entities.duration_years

        # 3. Contractor flag
        if "contractor" in norm:
            entities.is_contractor = True
            raw["is_contractor"] = True
        elif "employee" in norm or "full-time" in norm:
            entities.is_contractor = False
            raw["is_contractor"] = False

        # 4. Remote days per week (e.g. "4 days a week", "4 days/week", "3 days")
        remote_match = re.search(r"(\d+)\s*days?\s*(?:a|per|\/)\s*week", norm)
        if remote_match:
            entities.days_remote_per_week = int(remote_match.group(1))
            raw["days_remote_per_week"] = entities.days_remote_per_week

        # 5. Software catalog presence
        if "not in the software catalog" in norm or "not in catalog" in norm or "non-catalog" in norm or "not approved" in norm:
            entities.is_catalog_software = False
            raw["is_catalog_software"] = False
        elif "in the software catalog" in norm or "in the approved catalog" in norm or "catalog software" in norm:
            entities.is_catalog_software = True
            raw["is_catalog_software"] = True
        else:
            # Catalog presence is unknown
            entities.is_catalog_software = None
            raw["is_catalog_software"] = None

        # 6. Specific issue identification
        if "phishing" in norm or "suspicious email" in norm:
            entities.issue = "phishing"
            if "forward" in norm:
                raw["forwarding_to_others"] = True
        elif "locked out" in norm:
            entities.issue = "account_locked"
        elif "expired" in norm:
            entities.issue = "credentials_expired"
        elif "won't turn on" in norm or "dead" in norm:
            entities.issue = "hardware_failure_dead"
            raw["hardware_dead"] = True
        elif "flicker" in norm or "flickering" in norm:
            entities.issue = "screen_flickering"
        elif "paper jam" in norm:
            entities.issue = "paper_jam"
        elif "quota" in norm or "mailbox is full" in norm:
            entities.issue = "mailbox_quota_full"
        elif "guest" in norm and ("wi-fi" in norm or "wifi" in norm):
            entities.issue = "guest_wifi_request"
        elif "expense" in norm:
            entities.issue = "expense_login_error"
        elif "admin" in norm:
            entities.issue = "admin_access_request"

        # 7. Device / service detection
        if "laptop" in norm or "computer" in norm:
            entities.device_or_service = "laptop"
        elif "printer" in norm:
            entities.device_or_service = "printer"
        elif "vpn" in norm:
            entities.device_or_service = "vpn"
        elif "monitor" in norm:
            entities.device_or_service = "monitor"
        elif "chair" in norm:
            entities.device_or_service = "chair"
        elif "browser extension" in norm or "extension" in norm:
            entities.device_or_service = "browser_extension"

        entities.raw_details = raw
        return entities

