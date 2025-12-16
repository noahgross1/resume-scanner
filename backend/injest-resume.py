import os
import json
from glob import glob
from typing import List, Dict, Tuple
from openai import OpenAI
from app.config import OPENAI_API_KEY
from app.database import supabase
import re
import tiktoken
import pymupdf4llm

# ---------------------------------------
# CONFIG
# ---------------------------------------
client = OpenAI(api_key=OPENAI_API_KEY)

DATA_DIR = os.getenv("JOB_JSON_DIR", "data/jobs")
PDF_DIR = os.getenv("PDF_DIR", "data/resumes")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")

# Token limits optimized for resumes
TARGET_TOKENS = 400      # Resumes sections are typically shorter than job descriptions
MAX_TOKENS = 600         # Ceiling for resume sections
MIN_TOKENS = 50          # Some resume sections are brief (e.g., Summary)

# OpenAI tokenizer
ENC = tiktoken.encoding_for_model(EMBED_MODEL)


# ---------------------------------------
# STAGE 3: SECTION SPLITTING & CHUNKING
# ---------------------------------------

def tokenize(text: str) -> List[int]:
    return ENC.encode(text)

def count_tokens(text: str) -> int:
    return len(tokenize(text))


def split_into_sections(text: str) -> List[Dict[str, str]]:
    """Split markdown-normalized text into sections by ## headers"""
    lines = text.split("\n")
    sections = []
    current_title = None
    current_content = []
    
    def flush_section():
        nonlocal current_title, current_content, sections
        
        if current_title and current_content:
            content_text = "\n".join(current_content).strip()
            if content_text:
                sections.append({
                    "title": current_title,
                    "content": content_text
                })
        
        current_title = None
        current_content = []
    
    for line in lines:
        stripped = line.strip()
        
        # Detect markdown headers
        if re.match(r'^#{1,6}\s+.+', stripped):
            flush_section()
            current_title = re.sub(r'^#{1,6}\s+', '', stripped).strip()
        else:
            if current_title is None:
                current_title = "Header"  # Contact info at top
            current_content.append(line)
    
    flush_section()
    return sections


def chunk_resume_sections(text: str, debug: bool = False) -> List[Dict[str, str]]:
    """
    Chunk resume into semantic sections.
    Resumes typically have smaller, well-defined sections.
    """
    sections = split_into_sections(text)
    chunks = []
    
    if debug:
        print(f"\n{'='*60}")
        print(f"Found {len(sections)} resume sections")
        print(f"{'='*60}")
    
    for idx, section in enumerate(sections):
        title = section['title']
        content = section['content']
        
        full_section = f"## {title}\n\n{content}".strip()
        token_count = count_tokens(full_section)
        
        if debug:
            print(f"\nSection {idx + 1}: {title}")
            print(f"Token count: {token_count}")
        
        # Most resume sections fit in one chunk
        if token_count <= MAX_TOKENS:
            chunks.append({
                "text": full_section,
                "section_title": title,
                "token_count": token_count
            })
            if debug:
                print(f"  ✓ Single chunk")
        else:
            # Split large sections (e.g., long work experience)
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            
            current_chunk = []
            current_tokens = count_tokens(f"## {title}\n\n")
            
            for para in paragraphs:
                para_tokens = count_tokens(para)
                
                if current_tokens + para_tokens > MAX_TOKENS:
                    # Flush current chunk
                    if current_chunk:
                        chunk_text = f"## {title}\n\n" + "\n\n".join(current_chunk)
                        chunks.append({
                            "text": chunk_text,
                            "section_title": title,
                            "token_count": count_tokens(chunk_text)
                        })
                    current_chunk = [para]
                    current_tokens = count_tokens(f"## {title}\n\n") + para_tokens
                else:
                    current_chunk.append(para)
                    current_tokens += para_tokens
            
            # Flush final chunk
            if current_chunk:
                chunk_text = f"## {title}\n\n" + "\n\n".join(current_chunk)
                chunks.append({
                    "text": chunk_text,
                    "section_title": title,
                    "token_count": count_tokens(chunk_text)
                })
            
            if debug:
                print(f"  ✂ Split into {len([c for c in chunks if c['section_title'] == title])} chunks")
    
    if debug:
        print(f"\n{'='*60}")
        print(f"Total chunks: {len(chunks)}")
        avg = sum(c['token_count'] for c in chunks) / len(chunks) if chunks else 0
        print(f"Average size: {avg:.0f} tokens")
        print(f"{'='*60}\n")
    
    return chunks


# ---------------------------------------
# EMBEDDINGS
# ---------------------------------------

def get_embeddings(texts: List[str], model=EMBED_MODEL) -> List[List[float]]:
    """Generate embeddings for texts"""
    response = client.embeddings.create(model=model, input=texts)
    return [r.embedding for r in response.data]


# ---------------------------------------
# INGESTION PIPELINE FOR RESUMES
# ---------------------------------------

def ingest_resumes_from_directory(directory: str, user_id: str = None):
    """
    Complete resume ingestion pipeline:
    1. Extract text from PDF (with formatting if possible)
    2. Normalize to markdown
    3. Split into semantic sections
    4. Chunk appropriately
    5. Generate embeddings
    6. Store in database
    """
    files = glob(os.path.join(directory, "*.pdf"))
    
    for file_path in files:
        print(f"\n{'='*60}")
        print(f"Processing: {os.path.basename(file_path)}")
        print(f"{'='*60}")
        
        try:

            normalized_text = pymupdf4llm.to_markdown(file_path)
            
            # STAGE 3: Chunk sections
            print("[3/5] Chunking sections...")
            chunks = chunk_resume_sections(normalized_text, debug=True)

            for chunk in chunks:
                print(f"Chunk: {chunk['text']}")
                print(f"Section Title: {chunk['section_title']}")
                print(f"Token Count: {chunk['token_count']}")
                print(f"-"*60)
            
            # STAGE 4: Generate embeddings
            print("[4/5] Generating embeddings...")
            chunk_texts = [c["text"] for c in chunks]
            embeddings = get_embeddings(chunk_texts)
            
            # STAGE 5: Store in database
            print("[5/5] Storing in database...")
            
            # First, insert resume metadata
            resume_result = supabase.table("resumes").insert({
                "user_id": user_id or "default_user",
                "filename": os.path.basename(file_path)
            }).execute()
            
            resume_id = resume_result.data[0]["id"]
            
            # Then insert chunks
            records = []
            for chunk_data, embedding in zip(chunks, embeddings):
                records.append({
                    "resume_id": resume_id,
                    "chunk_text": chunk_data["text"],
                    "embedding": embedding,
                    "metadata": {
                        "section_title": chunk_data["section_title"],
                        "token_count": chunk_data["token_count"],
                        "filename": os.path.basename(file_path)
                    }
                })
            
            supabase.table("resume_chunks").insert(records).execute()
            print(f"✓ Inserted {len(records)} chunks for resume {resume_id}")
            
        except Exception as e:
            print(f"✗ Error processing {file_path}: {e}")
            import traceback
            traceback.print_exc()


# ---------------------------------------
# MAIN
# ---------------------------------------

if __name__ == "__main__":
    # Test with a single file first
    test_file = "data/Profile.pdf"
    user_id = os.getenv("USER_ID")
    
    if os.path.exists(test_file):
        print("Testing with single file...")
        # text = pymupdf4llm.to_markdown(test_file)
        # print(f"Text: {text}")
        ingest_resumes_from_directory(os.path.dirname(test_file), user_id)
    else:
        # Process all resumes in directory
        print("Processing all resumes...")
        # ingest_resumes_from_directory(PDF_DIR)