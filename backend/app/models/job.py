"""
Pydantic models for job search requests and responses.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict


class JobSearchRequest(BaseModel):
    """Request for job search."""
    title: str
    location: Optional[str] = None
    resume_id: Optional[str] = None  # Use latest if not provided


class JobResult(BaseModel):
    """Individual job result with match analysis - matches JobAnalysis model."""
    id: str  # Unique identifier for the job
    title: str
    company: str
    location: str
    salary: str
    job_type: str
    match_score: int  # 0-100
    met_qualifications: List[str]
    missing_qualifications: List[str]
    apply_url: str
    posted_date: str
    description: str
    requirements: List[str]
    how_to_improve: List[str]


class JobSearchResponse(BaseModel):
    """Response for job search with multiple results."""
    jobs: List[JobResult]
    total_searched: int
    analyzed: int


class SearchHistoryItem(BaseModel):
    """Search history entry."""
    id: str
    job_title: str
    location: str
    results_count: int
    avg_match_score: Optional[float]
    created_at: str

