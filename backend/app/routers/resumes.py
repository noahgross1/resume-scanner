"""
Resume management API endpoints.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from typing import List
import logging

from app.middleware.auth import get_current_user
from app.models.resume import (
    ResumeUploadResponse,
    ResumeListItem,
    ResumeDetail,
    ErrorResponse
)
from app.utils.pdf import extract_text_from_pdf
from app.utils.embeddings import generate_embedding
from app.database import supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload and process a resume PDF.
    
    Steps:
    1. Validate file (PDF, size < 10MB)
    2. Extract text from PDF
    3. Generate embedding vector (1536 dims)
    4. Store in database with pgvector
    
    Returns resume ID and metadata.
    """
    user_id = current_user["id"]
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    # Validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: 10MB"
        )
    
    # Reset file pointer for PDF processing
    await file.seek(0)
    
    try:
        # Step 1: Extract text from PDF
        logger.info(f"Processing resume: {file.filename}")
        text = await extract_text_from_pdf(file)
        logger.info(f"✓ Extracted {len(text)} characters")
        
        # Step 2: Generate embedding
        logger.info(f"Generating embedding...")
        embedding = await generate_embedding(text)
        logger.info(f"✓ Generated {len(embedding)}-dimensional embedding")
        
        # Step 3: Store in database
        logger.info(f"Storing in database...")
        result = supabase.table("resumes").insert({
            "user_id": user_id,
            "filename": file.filename,
            "parsed_text": text,
            "embedding": embedding,  # pgvector handles the conversion
            "file_size": len(content)
        }).execute()
        
        if not result.data:
            raise HTTPException(500, "Failed to store resume in database")
        
        resume = result.data[0]
        logger.info(f"✓ Stored resume with ID: {resume['id']}")
        
        return ResumeUploadResponse(
            id=resume["id"],
            filename=resume["filename"],
            file_size=resume["file_size"],
            created_at=resume["created_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("", response_model=List[ResumeListItem])
async def list_resumes(
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of user's uploaded resumes.
    Returns metadata only (no full text or embeddings).
    """
    user_id = current_user["id"]
    
    try:
        result = supabase.table("resumes")\
            .select("id, filename, file_size, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return result.data
        
    except Exception as e:
        logger.error(f"Failed to list resumes: {e}")
        raise HTTPException(500, f"Failed to list resumes: {str(e)}")


@router.get("/{resume_id}", response_model=ResumeDetail)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get specific resume details including full text.
    Does not include embedding vector (too large for API response).
    """
    user_id = current_user["id"]
    
    try:
        result = supabase.table("resumes")\
            .select("id, filename, parsed_text, file_size, created_at, updated_at")\
            .eq("id", resume_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(404, "Resume not found")
        
        resume = result.data[0]
        
        return ResumeDetail(**resume)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get resume: {e}")
        raise HTTPException(500, f"Failed to get resume: {str(e)}")


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a resume. Only owner can delete."""
    user_id = current_user["id"]
    
    try:
        # Verify ownership
        check = supabase.table("resumes")\
            .select("id")\
            .eq("id", resume_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not check.data:
            raise HTTPException(404, "Resume not found")
        
        # Delete
        supabase.table("resumes")\
            .delete()\
            .eq("id", resume_id)\
            .execute()
        
        logger.info(f"Deleted resume: {resume_id}")
        
        return {
            "success": True,
            "message": "Resume deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete resume: {e}")
        raise HTTPException(500, f"Failed to delete resume: {str(e)}")

