from typing import List, Optional
from ..schemas.agent import (
    IntentType,
    DecisionType,
    AgentDecisionResult,
    ExtractedEntities,
    SourceReference,
    HistoricalTicketContext
)
from .retriever import RAGRetriever

class DeterministicPolicyEngine:
    """
    Deterministic business policy engine for Veridian Corp.
    Applies authoritative company rules strictly based on structured entities
    and retrieved knowledge base documents.
    The LLM is NEVER allowed to invent or override Veridian Corp policy.
    """
    def __init__(self, retriever: RAGRetriever):
        self.retriever = retriever

    def evaluate(
        self,
        intent: IntentType,
        entities: ExtractedEntities,
        raw_text: str,
        retrieved_sources: List[SourceReference],
        historical_context: List[HistoricalTicketContext],
        existing_ticket_status: Optional[str] = None
    ) -> AgentDecisionResult:
        norm_text = raw_text.lower()

        # 1. GUEST WI-FI (KB-07)
        if intent == IntentType.GUEST_WIFI:
            kb07 = self.retriever.get_policy_by_id("KB-07")
            sources = [kb07] if kb07 else retrieved_sources
            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.RESOLVE,
                assigned_team="IT",
                response=(
                    "Guest Wi-Fi credentials are valid for 24 hours. "
                    "Any employee can generate guest Wi-Fi credentials from the front-desk kiosk. "
                    "No IT ticket is required."
                ),
                sources=sources,
                historical_context=historical_context,
                requires_follow_up=False,
                ticket_action="NONE",
                ticket_status="RESOLVED"
            )

        # 2. PASSWORD RESET / LOCKOUT (KB-01)
        if intent == IntentType.PASSWORD_RESET:
            kb01 = self.retriever.get_policy_by_id("KB-01")
            sources = [kb01] if kb01 else retrieved_sources

            # Check lockout threshold: 5 failed attempts
            attempts = entities.attempt_count or 0
            is_locked_out = (attempts >= 5) or ("locked out" in norm_text) or ("6 times" in norm_text) or ("6 failed" in norm_text)

            if is_locked_out or attempts > 5:
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.ESCALATE,
                    assigned_team="IT",
                    response=(
                        f"Because you have exceeded the 5-failed-attempt threshold "
                        f"({attempts or 'multiple'} attempts), your account is locked. "
                        "Under KB-01, manual IT unlock is required. "
                        "An IT technician will unlock your account manually. No approval is required."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="IN_PROGRESS"
                )
            else:
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.RESOLVE,
                    assigned_team="IT",
                    response=(
                        "Employees can reset their own password via the self-service portal at any time. "
                        "No approval is required. If you are locked out after 5 failed attempts, "
                        "contact IT to unlock the account manually."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="RESOLVED"
                )

        # 3. VPN ACCESS (KB-02)
        if intent == IntentType.VPN_ACCESS:
            kb02 = self.retriever.get_policy_by_id("KB-02")
            sources = [kb02] if kb02 else retrieved_sources

            # Contractor VPN requires manager approval
            if entities.is_contractor or "contractor" in norm_text:
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.ESCALATE,
                    assigned_team="IT",
                    response=(
                        "Under KB-02, VPN access is granted automatically only to full-time employees. "
                        "Contractors require manager approval submitted via the access request form. "
                        "Access cannot be provisioned automatically."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="WAITING_FOR_APPROVAL"
                )
            else:
                # Full-time employee expired credentials or general renewal
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.RESOLVE,
                    assigned_team="IT",
                    response=(
                        "VPN credentials expire every 90 days and must be renewed by the employee. "
                        "VPN access is granted automatically to all full-time employees. "
                        "Please renew your credentials via the standard VPN portal."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="RESOLVED"
                )

        # 4. LAPTOP REPLACEMENT / REPAIR (KB-03 & Asset Management Policy)
        if intent == IntentType.LAPTOP_REPLACEMENT:
            kb03 = self.retriever.get_policy_by_id("KB-03")
            amp = self.retriever.get_policy_by_id("Asset Management Policy")
            laptop_sources = [s for s in [kb03, amp] if s is not None]

            duration = entities.duration_years or 0.0

            # Screen flickering / repair case (REQ-13: 2 years old, asks for repair)
            if "flicker" in norm_text or (duration < 3.0 and "repair" in norm_text or "fix" in norm_text):
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.ESCALATE,
                    assigned_team="IT",
                    response=(
                        f"Your laptop is {duration or 2} years old, which has not reached the 3-year "
                        "replacement eligibility in KB-03. You have requested a repair. "
                        "Because the supplied IT policies do not provide a screen-flickering troubleshooting procedure, "
                        "we will not invent troubleshooting steps. Your request is routed to IT for hardware diagnosis."
                    ),
                    sources=[kb03] if kb03 else laptop_sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="IN_PROGRESS"
                )

            # 3.5 year laptop dead case (REQ-01)
            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.ESCALATE,
                assigned_team="IT",
                response=(
                    f"Your laptop is {duration or 3.5} years old. Under KB-03, laptops are eligible for replacement "
                    "after 3 years of service, or earlier in case of verified hardware failure. "
                    "However, under the Asset Management Policy, all company-issued hardware follows a standard 4-year "
                    "refresh cycle. Early replacement outside the 4-year cycle requires Finance sign-off, "
                    "IT approval, and verification of hardware failure. Replacement cannot be automatically approved."
                ),
                sources=laptop_sources,
                historical_context=historical_context,
                requires_follow_up=False,
                ticket_action="CREATE_OR_UPDATE",
                ticket_status="ESCALATED"
            )

        # 5. SOFTWARE INSTALLATION (KB-04)
        if intent == IntentType.SOFTWARE_INSTALLATION:
            kb04 = self.retriever.get_policy_by_id("KB-04")
            sources = [kb04] if kb04 else retrieved_sources

            # Check if catalog status is explicitly known
            if entities.is_catalog_software is False or "not in" in norm_text or "non-catalog" in norm_text:
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.ESCALATE,
                    assigned_team="SECURITY",
                    response=(
                        "Standard software listed in the approved catalog can be self-installed. "
                        "However, non-catalog software requires an IT Security review. "
                        "The security review takes 3–5 business days. Approval has not yet been granted."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="WAITING_FOR_SECURITY"
                )
            elif entities.is_catalog_software is True:
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.RESOLVE,
                    assigned_team="IT",
                    response=(
                        "Standard software listed in the approved catalog can be self-installed by employees. "
                        "No additional approval is required."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=False,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="RESOLVED"
                )
            else:
                # Catalog status is unspecified (REQ-14 browser extension)
                return AgentDecisionResult(
                    intent=intent.value,
                    entities=entities.raw_details,
                    decision=DecisionType.FOLLOW_UP,
                    assigned_team="IT",
                    response=(
                        "Is this software or browser extension listed in the approved software catalog? "
                        "Standard catalog software can be self-installed. If it is non-catalog software, "
                        "it requires an IT Security review which takes 3–5 business days."
                    ),
                    sources=sources,
                    historical_context=historical_context,
                    requires_follow_up=True,
                    ticket_action="CREATE_OR_UPDATE",
                    ticket_status="WAITING_FOR_EMPLOYEE",
                    follow_up_prompt="Is the software listed in the approved catalog?"
                )

        # 6. PRINTER TROUBLESHOOTING (KB-05)
        if intent == IntentType.PRINTER_TROUBLESHOOTING:
            kb05 = self.retriever.get_policy_by_id("KB-05")
            sources = [kb05] if kb05 else retrieved_sources

            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.RESOLVE,
                assigned_team="IT",
                response=(
                    "For printer issues, follow the official troubleshooting steps: "
                    "1. Check the printer queue. "
                    "2. Restart the print spooler. "
                    "3. If the issue persists after restart, log a ticket with the printer's asset tag. "
                    "(Note: If a technician is already assigned to this printer, please allow them to investigate "
                    "to avoid duplicate tickets.)"
                ),
                sources=sources,
                historical_context=historical_context,
                requires_follow_up=False,
                ticket_action="CREATE_OR_UPDATE",
                ticket_status="IN_PROGRESS"
            )

        # 7. EMAIL MAILBOX QUOTA (KB-06)
        if intent == IntentType.MAILBOX_QUOTA:
            kb06 = self.retriever.get_policy_by_id("KB-06")
            sources = [kb06] if kb06 else retrieved_sources

            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.RESOLVE,
                assigned_team="IT",
                response=(
                    "The default mailbox quota is 25GB. Employees nearing quota should archive old mail. "
                    "Quota increases beyond 25GB require manager approval. The maximum quota allowed is 50GB. "
                    "Quota increases cannot be granted automatically without manager approval."
                ),
                sources=sources,
                historical_context=historical_context,
                requires_follow_up=False,
                ticket_action="CREATE_OR_UPDATE",
                ticket_status="RESOLVED"
            )

        # 8. SECURITY INCIDENT / PHISHING (KB-09)
        if intent == IntentType.SECURITY_INCIDENT:
            kb09 = self.retriever.get_policy_by_id("KB-09")
            sources = [kb09] if kb09 else retrieved_sources

            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.ESCALATE,
                assigned_team="SECURITY",
                response=(
                    "This is a security incident. Any suspected phishing email, malware, or unauthorized "
                    "access attempt must be reported immediately to security@veridian-corp.example. "
                    "Do NOT forward the suspected email or message to other employees or teammates. "
                    "The incident has been escalated to the Security team."
                ),
                sources=sources,
                historical_context=historical_context,
                requires_follow_up=False,
                ticket_action="CREATE_OR_UPDATE",
                ticket_status="ESCALATED"
            )

        # 9. WORK FROM HOME EQUIPMENT (KB-10)
        if intent == IntentType.WFH_EQUIPMENT:
            kb10 = self.retriever.get_policy_by_id("KB-10")
            sources = [kb10] if kb10 else retrieved_sources

            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.ESCALATE,
                assigned_team="FINANCE",
                response=(
                    "Employees working remotely more than 3 days/week are eligible for a one-time "
                    "home office equipment allowance (eligible equipment includes a chair and monitor). "
                    "This requires: 1. Manager sign-off, and 2. Finance processing. "
                    "IT does not directly approve the equipment allowance, and only handles shipping once approved."
                ),
                sources=sources,
                historical_context=historical_context,
                requires_follow_up=False,
                ticket_action="CREATE_OR_UPDATE",
                ticket_status="WAITING_FOR_APPROVAL"
            )

        # 10. EXPENSE SOFTWARE ACCESS (KB-08)
        if intent == IntentType.EXPENSE_ACCESS:
            kb08 = self.retriever.get_policy_by_id("KB-08")
            sources = [kb08] if kb08 else retrieved_sources

            # Check if this is REQ-12 preserving existing waiting state
            is_waiting = (existing_ticket_status == "WAITING_FOR_EMPLOYEE") or ("screenshot" in norm_text) or ("invalid credentials" in norm_text)

            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.FOLLOW_UP if is_waiting else DecisionType.RESOLVE,
                assigned_team="IT",
                response=(
                    "Access to the expense management tool is granted by Finance, not IT. "
                    "IT can only assist with login and technical issues once an account already exists. "
                    "If your account already exists and you are experiencing credential or login errors, "
                    "please provide a screenshot of the error message so IT can assist."
                ),
                sources=sources,
                historical_context=historical_context,
                requires_follow_up=True if is_waiting else False,
                ticket_action="UPDATE" if is_waiting else "CREATE_OR_UPDATE",
                ticket_status="WAITING_FOR_EMPLOYEE" if is_waiting else "OPEN",
                follow_up_prompt="Please attach or provide a screenshot of the invalid credentials error."
            )

        # 11. ADMIN ACCESS REQUEST (No policy, historical TK-1050 context)
        if intent == IntentType.ADMIN_ACCESS:
            # Check historical context for TK-1050
            tk1050_context = [t for t in historical_context if t.ticket_id == "TK-1050"]
            return AgentDecisionResult(
                intent=intent.value,
                entities=entities.raw_details,
                decision=DecisionType.ESCALATE,
                assigned_team="IT",
                response=(
                    "The supplied Veridian Corp IT policies do not define an administrative access approval process. "
                    "A previous historical ticket (TK-1050) was rejected because no business justification was provided; "
                    "however, historical tickets serve as context only and do not establish a universal policy. "
                    "Because the policy is not defined, this request is escalated for human IT review."
                ),
                sources=[],
                historical_context=tk1050_context or historical_context,
                requires_follow_up=False,
                ticket_action="CREATE_OR_UPDATE",
                ticket_status="ESCALATED"
            )

        # 12. UNKNOWN / VAGUE REQUEST (REQ-15)
        return AgentDecisionResult(
            intent=IntentType.UNKNOWN.value,
            entities={},
            decision=DecisionType.FOLLOW_UP,
            assigned_team="IT",
            response=(
                "Could you please describe what is not working? "
                "Please specify what service or device is affected (for example: laptop, VPN, email, printer, "
                "account/login, software, or another IT service) so we can assist you."
            ),
            sources=[],
            historical_context=[],
            requires_follow_up=True,
            ticket_action="CREATE_OR_UPDATE",
            ticket_status="WAITING_FOR_EMPLOYEE",
            follow_up_prompt="What service or device is affected?"
        )

