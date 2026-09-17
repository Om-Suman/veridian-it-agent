import os
import json
import glob
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np
import faiss

from ..schemas.agent import SourceReference, HistoricalTicketContext

class RAGRetriever:
    """
    FAISS-based RAG Retriever for Veridian Corp IT policies and historical tickets.
    Ensures clear separation between POLICY SOURCE and HISTORICAL TICKET CONTEXT.
    """
    def __init__(self, data_dir: Optional[Path] = None, kb_dir: Optional[Path] = None):
        base_path = Path(__file__).resolve().parent.parent.parent
        self.data_dir = data_dir or (base_path / "data")
        self.kb_dir = kb_dir or (base_path / "knowledge_base")

        self.policy_docs: List[Dict[str, Any]] = []
        self.ticket_docs: List[Dict[str, Any]] = []

        self.policy_index: Optional[faiss.IndexFlatIP] = None
        self.ticket_index: Optional[faiss.IndexFlatIP] = None

        self.model = None
        self.vector_dim = 384
        self._init_embedding_model()
        self.build_indices()

    def _init_embedding_model(self):
        """Initializes sentence-transformers if available, otherwise uses deterministic fallback."""
        try:
            os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
            os.environ["HF_HUB_OFFLINE"] = "1"
            os.environ["TRANSFORMERS_OFFLINE"] = "1"
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.vector_dim = 384
        except Exception:
            self.model = None
            self.vector_dim = 256

    def _get_embedding(self, text: str) -> np.ndarray:
        """Generates normalized embedding vector."""
        if self.model is not None:
            try:
                emb = self.model.encode([text], normalize_embeddings=True)[0]
                return np.array(emb, dtype=np.float32)
            except Exception:
                pass

        # Robust deterministic fallback vectorizer based on hashed token frequencies & character n-grams
        vec = np.zeros(self.vector_dim, dtype=np.float32)
        words = text.lower().replace("-", " ").replace("_", " ").split()
        for i, word in enumerate(words):
            h1 = hash(word) % self.vector_dim
            vec[h1] += 1.0 / (i + 1)**0.5
            for j in range(len(word) - 2):
                ngram = word[j:j+3]
                h2 = hash(ngram) % self.vector_dim
                vec[h2] += 0.5

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec

    def build_indices(self):
        """Loads and indexes policies and historical tickets into separate FAISS indices."""
        self._load_policies()
        self._load_tickets()

        # Build Policy FAISS Index
        if self.policy_docs:
            policy_vectors = np.array([self._get_embedding(doc["content"]) for doc in self.policy_docs], dtype=np.float32)
            self.policy_index = faiss.IndexFlatIP(self.vector_dim)
            self.policy_index.add(policy_vectors)

        # Build Historical Ticket FAISS Index
        if self.ticket_docs:
            ticket_vectors = np.array([self._get_embedding(doc["content"]) for doc in self.ticket_docs], dtype=np.float32)
            self.ticket_index = faiss.IndexFlatIP(self.vector_dim)
            self.ticket_index.add(ticket_vectors)

    def _load_policies(self):
        self.policy_docs = []
        txt_files = sorted(list(self.kb_dir.glob("*.txt")))
        for file_path in txt_files:
            with open(file_path, "r", encoding="utf-8") as f:
                content_raw = f.read()

            lines = content_raw.splitlines()
            source_id = ""
            title = ""
            category = ""
            content_lines = []
            is_content = False

            for line in lines:
                s_line = line.strip()
                if s_line.startswith("Document ID:"):
                    source_id = s_line.replace("Document ID:", "").strip()
                elif s_line.startswith("Title:"):
                    title = s_line.replace("Title:", "").strip()
                elif s_line.startswith("Category:"):
                    category = s_line.replace("Category:", "").strip()
                elif s_line.startswith("Content:"):
                    is_content = True
                elif is_content:
                    content_lines.append(line)

            content = "\n".join(content_lines).strip()
            if not source_id:
                source_id = file_path.stem.upper()
            if not title:
                title = source_id
            if not content:
                content = content_raw

            # Searchable text combines title, category, and content
            search_text = f"{source_id} {title} {category}\n{content}"

            self.policy_docs.append({
                "source_id": source_id,
                "title": title,
                "category": category,
                "source_type": "policy",
                "content": content,
                "search_text": search_text
            })

    def _load_tickets(self):
        self.ticket_docs = []
        tickets_path = self.data_dir / "tickets.json"
        if not tickets_path.exists():
            return

        with open(tickets_path, "r", encoding="utf-8") as f:
            tickets_data = json.load(f)

        for t in tickets_data:
            summary = t.get("summary", "")
            notes = t.get("resolution_notes", "")
            category = t.get("category", "")
            search_text = f"Ticket {t.get('ticket_id')} {category} {summary} {notes}"

            self.ticket_docs.append({
                "ticket_id": t.get("ticket_id"),
                "employee_name": t.get("employee_name"),
                "category": category,
                "summary": summary,
                "status": t.get("status"),
                "resolution_notes": notes,
                "source_type": "historical_ticket",
                "content": f"{summary}. Notes: {notes}",
                "search_text": search_text
            })

    def search_policies(self, query: str, top_k: int = 3) -> List[SourceReference]:
        """Searches policies using FAISS semantic vector search."""
        if not self.policy_index or not self.policy_docs:
            return []

        query_vec = np.array([self._get_embedding(query)], dtype=np.float32)
        k = min(top_k, len(self.policy_docs))
        distances, indices = self.policy_index.search(query_vec, k)

        results = []
        for idx in indices[0]:
            if 0 <= idx < len(self.policy_docs):
                doc = self.policy_docs[idx]
                results.append(SourceReference(
                    id=doc["source_id"],
                    title=doc["title"],
                    source_type="policy",
                    content=doc["content"]
                ))
        return results

    def search_historical_tickets(self, query: str, top_k: int = 2) -> List[HistoricalTicketContext]:
        """Searches historical ticket context using FAISS vector search."""
        if not self.ticket_index or not self.ticket_docs:
            return []

        query_vec = np.array([self._get_embedding(query)], dtype=np.float32)
        k = min(top_k, len(self.ticket_docs))
        distances, indices = self.ticket_index.search(query_vec, k)

        results = []
        for idx in indices[0]:
            if 0 <= idx < len(self.ticket_docs):
                t = self.ticket_docs[idx]
                results.append(HistoricalTicketContext(
                    ticket_id=t["ticket_id"],
                    employee_name=t.get("employee_name"),
                    summary=t["summary"],
                    status=t["status"],
                    resolution_notes=t.get("resolution_notes")
                ))
        return results

    def get_policy_by_id(self, source_id: str) -> Optional[SourceReference]:
        for doc in self.policy_docs:
            if doc["source_id"].lower() == source_id.lower() or doc["title"].lower() == source_id.lower():
                return SourceReference(
                    id=doc["source_id"],
                    title=doc["title"],
                    source_type="policy",
                    content=doc["content"]
                )
        return None

