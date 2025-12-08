"""
Pydantic models for resume-related requests and responses.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ResumeUploadResponse(BaseModel):
    """Response after successful resume upload."""
    id: str
    filename: str
    file_size: int
    created_at: datetime


class ResumeListItem(BaseModel):
    """Brief resume info for list view."""
    id: str
    filename: str
    file_size: int
    created_at: datetime


class ResumeDetail(BaseModel):
    """Full resume details including text."""
    id: str
    filename: str
    parsed_text: str
    file_size: int
    created_at: datetime
    updated_at: datetime


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: str
    details: Optional[str] = None

