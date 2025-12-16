import os
import json
from glob import glob
from typing import List, Dict
from openai import OpenAI
from app.config import OPENAI_API_KEY
from app.database import supabase
import PyPDF2
import re
import tiktoken

# ---------------------------------------
# CONFIG
# ---------------------------------------
client = OpenAI(api_key=OPENAI_API_KEY)

DATA_DIR = os.getenv("JOB_JSON_DIR", "data/jobs")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
PDF_DIR = os.getenv("PDF_DIR", "data")

# Optimized token limits for job descriptions
TARGET_TOKENS = 500      # Sweet spot for semantic coherence
MAX_TOKENS = 800         # Hard limit before splitting
MIN_TOKENS = 100         # Avoid tiny chunks
OVERLAP_TOKENS = 50      # Overlap for continuity when splitting

# OpenAI embedding tokenizer
ENC = tiktoken.encoding_for_model(EMBED_MODEL)


def read_file(file_path: str) -> str:
    """Read PDF, DOCX, or TXT resume from local disk"""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    else:
        raise ValueError(f"Unsupported file type: {ext}")


# ---------------------------------------
# MARKDOWN NORMALIZATION (PREPROCESSING)
# ---------------------------------------

def normalize_to_markdown(text: str) -> str:
    """
    Convert various heading formats to consistent markdown headers.
    
    This is the preprocessing step that normalizes all job descriptions
    to use a single, consistent format (markdown headers).
    
    Handles:
    - **Bold Headings** → ## Markdown Headers
    - ALL CAPS HEADINGS → ## Markdown Headers  
    - Title Case Headings → ## Markdown Headers
    - Underlined headings → ## Markdown Headers
    
    Returns: Normalized text with consistent ## headers
    """
    lines = text.split("\n")
    normalized_lines = []
    i = 0
    
    # Common job description section keywords (helps identify headings)
    SECTION_KEYWORDS = {
        'about', 'overview', 'description', 'summary', 'role', 'position',
        'responsibilities', 'duties', 'what you', 'you will', 'your role',
        'qualifications', 'requirements', 'skills', 'experience', 'education',
        'preferred', 'desired', 'nice to have', 'bonus',
        'benefits', 'perks', 'compensation', 'salary', 'we offer',
        'company', 'who we are', 'our mission', 'our team',
        'how to apply', 'application', 'equal opportunity', 'eeo'
    }
    
    def is_likely_heading(text: str) -> bool:
        """Check if text contains common section keywords"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in SECTION_KEYWORDS)
    
    def clean_heading_text(text: str) -> str:
        """Remove formatting characters and clean heading text"""
        # Remove bold markers
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        # Remove underscores used for underlining
        text = re.sub(r'^_{3,}$', '', text)
        # Clean up extra whitespace
        text = text.strip()
        return text
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Skip empty lines
        if not stripped:
            normalized_lines.append(line)
            i += 1
            continue
        
        converted = False
        
        # PATTERN 1: Bold headings (**Text**)
        if stripped.startswith("**") and stripped.endswith("**"):
            heading_text = clean_heading_text(stripped)
            if len(heading_text) > 0 and len(heading_text) < 100:
                normalized_lines.append(f"## {heading_text}")
                converted = True
        
        # PATTERN 2: ALL CAPS (minimum 3 words, short enough to be a heading)
        elif (stripped.isupper() and 
              len(stripped.split()) >= 2 and 
              len(stripped) < 80 and
              is_likely_heading(stripped)):
            heading_text = stripped.title()  # Convert to Title Case
            normalized_lines.append(f"## {heading_text}")
            converted = True
        
        # PATTERN 3: Title Case standalone (short, capitalized, likely heading)
        elif (re.match(r'^[A-Z][A-Za-z0-9\s\-&,\'()]+$', stripped) and
              3 <= len(stripped) < 80 and
              len(stripped.split()) <= 8 and
              is_likely_heading(stripped) and
              not stripped.endswith(('.', '!', '?'))):  # Not a sentence
            normalized_lines.append(f"## {stripped}")
            converted = True
        
        # PATTERN 4: Underlined headings (text followed by === or ---)
        elif i + 1 < len(lines):
            next_line = lines[i + 1].strip()
            if re.match(r'^[=\-]{3,}$', next_line):
                heading_text = clean_heading_text(stripped)
                normalized_lines.append(f"## {heading_text}")
                i += 1  # Skip the underline
                converted = True
        
        # If not converted, keep original line
        if not converted:
            normalized_lines.append(line)
        
        i += 1
    
    return "\n".join(normalized_lines)


# ---------------------------------------
# SECTION SPLITTING (SIMPLIFIED)
# ---------------------------------------

def read_job_files(directory=DATA_DIR):
    """Generator that yields JSON job files."""
    files = glob(os.path.join(directory, "*.json"))
    for f in files:
        with open(f, "r", encoding="utf-8") as fh:
            yield json.load(fh)


def split_into_sections(text: str) -> List[Dict[str, str]]:
    """
    Split markdown-normalized text into sections.
    
    MUCH SIMPLER now that we only need to detect ## headers!
    """
    lines = text.split("\n")
    sections = []
    current_title = None
    current_content = []
    
    def flush_section():
        """Save current section and reset"""
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
        
        # Detect markdown headers (## Title or ### Title)
        if re.match(r'^#{1,6}\s+.+', stripped):
            flush_section()
            # Extract title (remove ## symbols)
            current_title = re.sub(r'^#{1,6}\s+', '', stripped).strip()
        else:
            # Add line to current section
            if current_title is None:
                current_title = "Introduction"
            current_content.append(line)
    
    # Flush final section
    flush_section()
    
    return sections


# ---------------------------------------
# TOKENIZATION HELPERS
# ---------------------------------------

def tokenize(text: str) -> List[int]:
    """Convert text to tokens"""
    return ENC.encode(text)


def detokenize(tokens: List[int]) -> str:
    """Convert tokens back to text"""
    return ENC.decode(tokens)


def count_tokens(text: str) -> int:
    """Count tokens in text"""
    return len(tokenize(text))


# ---------------------------------------
# SECTION-BASED CHUNKING WITH SMART SPLITTING
# ---------------------------------------

def split_large_section_by_paragraphs(title: str, content: str) -> List[str]:
    """
    Split a large section into smaller chunks by paragraph boundaries.
    Preserves semantic coherence by keeping paragraphs together when possible.
    """
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
    
    chunks = []
    current_chunk_paras = []
    current_token_count = count_tokens(f"## {title}\n\n")
    
    for para in paragraphs:
        para_tokens = count_tokens(para)
        
        # If single paragraph exceeds MAX_TOKENS, split it further
        if para_tokens > MAX_TOKENS:
            # Flush current chunk first
            if current_chunk_paras:
                chunk_text = f"## {title}\n\n" + "\n\n".join(current_chunk_paras)
                chunks.append(chunk_text)
                current_chunk_paras = []
                current_token_count = count_tokens(f"## {title}\n\n")
            
            # Split paragraph by sentences
            sentences = re.split(r'(?<=[.!?])\s+', para)
            current_sent_chunk = []
            current_sent_tokens = 0
            
            for sent in sentences:
                sent_tokens = count_tokens(sent)
                
                if current_sent_tokens + sent_tokens > MAX_TOKENS:
                    if current_sent_chunk:
                        chunk_text = f"## {title}\n\n" + " ".join(current_sent_chunk)
                        chunks.append(chunk_text)
                    current_sent_chunk = [sent]
                    current_sent_tokens = sent_tokens
                else:
                    current_sent_chunk.append(sent)
                    current_sent_tokens += sent_tokens
            
            # Flush remaining sentences
            if current_sent_chunk:
                chunk_text = f"## {title}\n\n" + " ".join(current_sent_chunk)
                chunks.append(chunk_text)
            
            continue
        
        # Check if adding this paragraph exceeds MAX_TOKENS
        if current_token_count + para_tokens > MAX_TOKENS:
            # Flush current chunk
            if current_chunk_paras:
                chunk_text = f"## {title}\n\n" + "\n\n".join(current_chunk_paras)
                chunks.append(chunk_text)
            
            # Start new chunk with this paragraph
            current_chunk_paras = [para]
            current_token_count = count_tokens(f"## {title}\n\n") + para_tokens
        else:
            # Add paragraph to current chunk
            current_chunk_paras.append(para)
            current_token_count += para_tokens + 2  # +2 for \n\n
    
    # Flush final chunk
    if current_chunk_paras:
        chunk_text = f"## {title}\n\n" + "\n\n".join(current_chunk_paras)
        chunks.append(chunk_text)
    
    return chunks


def section_based_chunking(text: str, debug: bool = False) -> List[Dict[str, str]]:
    """
    Primary chunking strategy: Section-based with smart splitting.
    
    Strategy:
    1. Text should already be normalized to markdown format
    2. Split into sections by ## headers
    3. If section <= MAX_TOKENS: keep as single chunk
    4. If section > MAX_TOKENS: split by paragraph boundaries
    5. Each chunk retains the section title for context
    
    Returns list of {text, section_title, token_count} dictionaries.
    """
    sections = split_into_sections(text)
    chunks = []
    
    if debug:
        print(f"\n{'='*60}")
        print(f"Found {len(sections)} sections")
        print(f"{'='*60}")
    
    for idx, section in enumerate(sections):
        title = section['title']
        content = section['content']
        
        # Create full section text with markdown header
        full_section = f"## {title}\n\n{content}".strip()
        token_count = count_tokens(full_section)
        
        if debug:
            print(f"\nSection {idx + 1}: {title}")
            print(f"Token count: {token_count}")
        
        # CASE 1: Section fits within MAX_TOKENS - keep as single chunk
        if token_count <= MAX_TOKENS:
            chunks.append({
                "text": full_section,
                "section_title": title,
                "token_count": token_count
            })
            if debug:
                print(f"  ✓ Kept as single chunk")
        
        # CASE 2: Section exceeds MAX_TOKENS - split intelligently
        else:
            section_chunks = split_large_section_by_paragraphs(title, content)
            
            for chunk_text in section_chunks:
                chunks.append({
                    "text": chunk_text,
                    "section_title": title,
                    "token_count": count_tokens(chunk_text)
                })
            
            if debug:
                print(f"  ✂ Split into {len(section_chunks)} chunks")
    
    if debug:
        print(f"\n{'='*60}")
        print(f"Total chunks created: {len(chunks)}")
        avg_size = sum(c['token_count'] for c in chunks) / len(chunks) if chunks else 0
        print(f"Average chunk size: {avg_size:.0f} tokens")
        print(f"{'='*60}\n")
    
    return chunks


# ---------------------------------------
# EMBEDDINGS
# ---------------------------------------

def get_embeddings(texts: List[str], model=EMBED_MODEL) -> List[List[float]]:
    """Generate embeddings for list of texts"""
    response = client.embeddings.create(model=model, input=texts)
    return [r.embedding for r in response.data]


# ---------------------------------------
# INGESTION PIPELINE WITH NORMALIZATION
# ---------------------------------------

def ingest_all():
    """
    Ingest all job descriptions with markdown normalization.
    
    Pipeline:
    1. Read JSON job files
    2. NORMALIZE descriptions to markdown format
    3. Split into semantic sections
    4. Chunk appropriately
    5. Generate embeddings
    6. Store in vector database
    """
    jobs_data = read_job_files()
    
    for file_data in jobs_data:
        for job in file_data.get("data", []):
            job_id = str(job.get("id"))
            job_title = job.get("job_title")
            location = job.get("location")
            description = job.get("description") or ""
            
            metadata = {
                "company": job.get("company"),
                "url": job.get("url"),
                "source_url": job.get("source_url"),
                "salary_range": job.get("salary_string"),
                "seniority": job.get("seniority"),
                "employment_statuses": job.get("employment_statuses"),
                "technology_slugs": job.get("technology_slugs"),
                "date_posted": job.get("date_posted"),
            }
            
            print(f"\n{'='*60}")
            print(f"Processing Job {job_id}: {job_title}")
            print(f"{'='*60}")
            
            # 🔥 STEP 1: NORMALIZE TO MARKDOWN (preprocessing)
            print("\n[1/4] Normalizing to markdown format...")
            normalized_description = normalize_to_markdown(description)
            
            # Optional: Print before/after for debugging
            # print("\n--- BEFORE NORMALIZATION ---")
            # print(description[:500])
            # print("\n--- AFTER NORMALIZATION ---")
            # print(normalized_description[:500])
            
            # 🔥 STEP 2: CHUNK (now much simpler!)
            print("[2/4] Chunking sections...")
            chunks = section_based_chunking(normalized_description, debug=True)
            print(f"\nGenerated {len(chunks)} chunks")
            
            # 🔥 STEP 3: GENERATE EMBEDDINGS
            print("[3/4] Generating embeddings...")
            chunk_texts = [c["text"] for c in chunks]
            embeddings = get_embeddings(chunk_texts)
            
            # 🔥 STEP 4: BUILD AND STORE RECORDS
            print("[4/4] Storing in database...")
            records = []
            for chunk_data, embedding in zip(chunks, embeddings):
                records.append({
                    "job_id": job_id,
                    "job_title": job_title,
                    "location": location,
                    "chunk_text": chunk_data["text"],
                    "embedding": embedding,
                    "metadata": {
                        **metadata,
                        "section_title": chunk_data["section_title"],
                        "token_count": chunk_data["token_count"]
                    }
                })
            
            # Insert into Supabase
            try:
                supabase.table("job_chunks").insert(records).execute()
                print(f"✓ Inserted {len(records)} chunks into database")
            except Exception as e:
                print(f"✗ Error inserting job {job_id}: {e}")


if __name__ == "__main__":
    ingest_all()              