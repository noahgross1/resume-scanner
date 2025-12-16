import os
import re
import json
import math
from openai import OpenAI
from typing import List, Dict, Any
from app.database import supabase

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# --- BASIC CHUNKER (sentence-based, token-ish chunks) ---
def split_sentences(text: str) -> List[str]:
    # naive sentence split; for production, use nltk/punkt or spaCy
    sentences = re.split(r'(?<=[\.\?\!])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def chunk_text_semantic(text: str, max_words=300, overlap=50):
    sentences = split_sentences(text)
    chunks = []
    current = []
    current_words = 0
    for s in sentences:
        sw = len(s.split())
        if current_words + sw > max_words:
            chunks.append(" ".join(current))
            # create overlap
            if overlap > 0:
                # keep last N words as overlap
                words = " ".join(current).split()
                if len(words) > overlap:
                    current = [" ".join(words[-overlap:])]
                    current_words = len(current[0].split())
                else:
                    current = []
                    current_words = 0
            else:
                current = []
                current_words = 0
        current.append(s)
        current_words += sw
    if current:
        chunks.append(" ".join(current))
    return chunks

# --- BATCH EMBEDDING USING OPENAI ---
def get_embeddings(texts: List[str], model="text-embedding-3-small") -> List[List[float]]:
    # client.embeddings.create returns embeddings
    # batch for efficiency
    results = client.embeddings.create(model=model, input=texts)
    embs = [r.embedding for r in results.data]
    return embs

# --- STORE chunk into Supabase pgvector via REST client ---
def upsert_chunk_to_supabase(job_id: str, chunk_text: str, embedding: List[float], metadata: Dict[str, Any]):
    # Supabase python client will send JSON; many setups accept embedding as list and pgvector cast can be done server-side if set
    payload = {
        "job_id": job_id,
        "chunk_text": chunk_text,
        "embedding": embedding,
        "metadata": metadata
    }
    # Use RPC or direct insert - supabase client .table("job_chunks").insert
    res = supabase.table("job_chunks").insert(payload).execute()
    if res.status_code not in (200, 201):
        print("Supabase insert failed:", res.status_code, res.data)
    return res