"""
Vector similarity search utilities.
"""
import numpy as np
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Returns value between 0 and 1:
    - 1.0 = identical
    - 0.9-1.0 = very similar
    - 0.7-0.9 = similar
    - 0.5-0.7 = somewhat similar
    - < 0.5 = not very similar
    
    Args:
        vec1: First embedding vector
        vec2: Second embedding vector
        
    Returns:
        Similarity score between 0 and 1
    """
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = float(dot_product / (norm1 * norm2))
    
    # Ensure result is between 0 and 1
    return max(0.0, min(1.0, similarity))


def rank_jobs_by_similarity(
    resume_embedding: List[float],
    jobs: List[dict],
    job_embeddings: List[List[float]]
) -> List[Tuple[dict, float]]:
    """
    Rank jobs by cosine similarity to resume.
    
    Args:
        resume_embedding: User's resume embedding vector
        jobs: List of job dictionaries
        job_embeddings: Corresponding embedding vectors
        
    Returns:
        List of (job, similarity_score) tuples, sorted by score descending
        
    Raises:
        ValueError: If jobs and embeddings lists have different lengths
    """
    if len(jobs) != len(job_embeddings):
        raise ValueError("Jobs and embeddings lists must have same length")
    
    similarities = []
    for job, job_embedding in zip(jobs, job_embeddings):
        score = cosine_similarity(resume_embedding, job_embedding)
        similarities.append((job, score))
        logger.info(f"Job '{job['title']}' at {job['company']}: similarity={score:.3f}")
    
    # Sort by similarity (highest first)
    ranked = sorted(similarities, key=lambda x: x[1], reverse=True)
    
    logger.info(f"✓ Ranked {len(ranked)} jobs by vector similarity")
    return ranked


def get_top_matches(
    resume_embedding: List[float],
    jobs: List[dict],
    job_embeddings: List[List[float]],
    top_n: int = 5
) -> List[Tuple[dict, float]]:
    """
    Get top N matching jobs by similarity.
    
    Args:
        resume_embedding: User's resume embedding
        jobs: List of job dictionaries
        job_embeddings: Corresponding embeddings
        top_n: Number of top matches to return
        
    Returns:
        List of top N (job, score) tuples
    """
    ranked = rank_jobs_by_similarity(resume_embedding, jobs, job_embeddings)
    return ranked[:top_n]

