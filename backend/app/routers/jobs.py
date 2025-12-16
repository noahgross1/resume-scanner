"""
Job search API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Union
from datetime import datetime, timedelta
import hashlib
import logging
import json

from app.middleware.auth import verify_jwt
from app.database import supabase
from app.models.job import JobSearchRequest, JobSearchResponse
from app.utils.theirstack import search_jobs
from app.utils.embeddings import generate_batch_embeddings
from app.utils.vector_search import get_top_matches
from app.utils.gpt_analysis import analyze_batch_jobs

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


def convert_embedding_to_list(embedding: Union[str, list]) -> List[float]:
    """
    Convert embedding from database to list of floats.
    PostgreSQL pgvector sometimes returns embeddings as strings.
    
    Args:
        embedding: Embedding as string or list
        
    Returns:
        List of floats
    """
    if isinstance(embedding, list):
        # Already a list, ensure all elements are floats
        return [float(x) for x in embedding]
    
    if isinstance(embedding, str):
        # Remove brackets and whitespace, split by comma
        embedding = embedding.strip()
        if embedding.startswith('[') and embedding.endswith(']'):
            embedding = embedding[1:-1]
        
        # Split and convert to floats
        try:
            return [float(x.strip()) for x in embedding.split(',')]
        except ValueError:
            # Try parsing as JSON
            try:
                parsed = json.loads(embedding)
                return [float(x) for x in parsed]
            except:
                logger.error(f"Failed to parse embedding: {embedding[:100]}...")
                raise ValueError("Invalid embedding format")
    
    raise ValueError(f"Unexpected embedding type: {type(embedding)}")


@router.post("/search", response_model=JobSearchResponse)
async def search_and_analyze_jobs(
    request: JobSearchRequest,
    current_user: dict = Depends(verify_jwt)
):
    """
    Search jobs using Vector RAG workflow with TheirStack API.
    
    Complete 8-step process:
    1. Get user's resume with embedding
    2. Fetch 15 jobs from TheirStack
    3. Check cache for job embeddings
    4. Generate embeddings for uncached jobs
    5. Calculate cosine similarity
    6. Rank and select top 5
    7. Analyze top 5 with GPT (parallel)
    8. Store search history and return results
    
    Args:
        request: JobSearchRequest with title, location, optional resume_id
        current_user: Authenticated user from JWT
        
    Returns:
        JobSearchResponse with analyzed job matches
    """
    user_id = current_user.user.id
    
    try:
        # STEP 1: Get resume with embedding
        logger.info(f"Searching jobs: '{request.title}' in {request.location or 'Any Location'}")
        
        if request.resume_id:
            resume_result = supabase.table("resumes")\
                .select("*")\
                .eq("id", request.resume_id)\
                .eq("user_id", user_id)\
                .execute()
        else:
            # Get latest resume
            resume_result = supabase.table("resumes")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
        
        if not resume_result.data:
            raise HTTPException(
                400,
                "No resume found. Please upload your resume first."
            )
        
        resume = resume_result.data[0]
        resume_embedding = convert_embedding_to_list(resume["embedding"])
        resume_text = resume["parsed_text"]
        
        logger.info(f"✓ Using resume: {resume['filename']}")
        
        # STEP 2: Fetch jobs from TheirStack
        logger.info("Fetching jobs from TheirStack API...")
        jobs = search_jobs(request.title, request.location, limit=15)
        
        if not jobs:
            return JobSearchResponse(
                jobs=[],
                total_searched=0,
                analyzed=0
            )
        
        logger.info(f"✓ Found {len(jobs)} jobs from TheirStack")
        
        # STEP 3-4: Get/generate job embeddings with caching
        job_embeddings = []
        jobs_to_embed = []
        
        # Calculate 7 days ago timestamp for cache validation
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        
        for job in jobs:
            # Create hash for cache lookup
            job_hash = hashlib.md5(job['description'].encode()).hexdigest()
            
            # Check cache (only use embeddings from last 7 days)
            cache_result = supabase.table("job_embeddings")\
                .select("embedding")\
                .eq("job_hash", job_hash)\
                .gte("created_at", seven_days_ago)\
                .execute()
            
            if cache_result.data:
                # Cache hit
                cached_embedding = convert_embedding_to_list(cache_result.data[0]["embedding"])
                job_embeddings.append((job, cached_embedding))
                logger.info(f"✓ Cache hit: {job['title']}")
            else:
                # Need to generate
                jobs_to_embed.append((job, job_hash))
        
        # Generate embeddings for uncached jobs
        if jobs_to_embed:
            logger.info(f"Generating embeddings for {len(jobs_to_embed)} uncached jobs...")
            descriptions = [job['description'] for job, _ in jobs_to_embed]
            new_embeddings = await generate_batch_embeddings(descriptions)
            
            # Cache new embeddings
            for (job, job_hash), embedding in zip(jobs_to_embed, new_embeddings):
                # Store in cache
                try:
                    supabase.table("job_embeddings").insert({
                        "job_hash": job_hash,
                        "job_title": job['title'],
                        "job_company": job['company'],
                        "embedding": embedding
                    }).execute()
                except Exception as e:
                    logger.warning(f"Failed to cache embedding: {e}")
                
                job_embeddings.append((job, embedding))
            
            logger.info(f"✓ Generated and cached {len(new_embeddings)} embeddings")
        
        # STEP 5-6: Calculate similarity and rank
        logger.info("Ranking jobs by vector similarity...")
        all_embeddings = [emb for _, emb in job_embeddings]
        all_jobs = [job for job, _ in job_embeddings]
        
        top_5 = get_top_matches(
            resume_embedding,
            all_jobs,
            all_embeddings,
            top_n=5
        )
        
        logger.info(f"✓ Selected top 5 jobs (scores: {[f'{s:.2f}' for _, s in top_5]})")
        
        # STEP 7: Analyze with GPT (parallel for speed)
        logger.info("Analyzing top 5 jobs with GPT-4o-mini...")
        response = await analyze_batch_jobs(resume_text, top_5, total_searched=len(jobs))
        logger.info(f"✓ Completed GPT analysis")
        
        # STEP 8: Store search history
        try:
            avg_score = sum(job.match_score for job in response.jobs) / len(response.jobs) if response.jobs else 0
            supabase.table("search_history").insert({
                "user_id": user_id,
                "job_title": request.title,
                "location": request.location or "Any Location",
                "results_count": response.analyzed,
                "avg_match_score": avg_score
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to store search history: {e}")
        
        logger.info(f"✓ Search complete: {response.analyzed} jobs analyzed")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job search failed: {e}", exc_info=True)
        raise HTTPException(500, f"Search failed: {str(e)}")


@router.get("/history")
async def get_search_history(
    current_user: dict = Depends(verify_jwt)
):
    """Get user's job search history."""
    user_id = current_user["id"]
    
    try:
        result = supabase.table("search_history")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
        
        return {
            "success": True,
            "data": result.data
        }
    except Exception as e:
        logger.error(f"Failed to get search history: {e}")
        raise HTTPException(500, f"Failed to get search history: {str(e)}")

