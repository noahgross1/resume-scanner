"""
OpenAI embeddings generation utility.
"""
from openai import AsyncOpenAI
from typing import List
import logging
from app.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding vector for text using OpenAI text-embedding-3-small.
    
    Args:
        text: Text to embed (resume, job description, etc.)
        
    Returns:
        List[float]: 1536-dimensional embedding vector
        
    Raises:
        Exception: If OpenAI API call fails
        
    Cost: $0.02 per 1M tokens (~$0.00002 per resume)
    """
    try:
        # Truncate if too long (max ~8000 tokens for this model)
        max_chars = 30000  # Conservative estimate
        if len(text) > max_chars:
            logger.warning(f"Text truncated from {len(text)} to {max_chars} chars")
            text = text[:max_chars]
        
        logger.info(f"Generating embedding for {len(text)} characters")
        
        # Generate embedding
        response = await client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            encoding_format="float"
        )
        
        embedding = response.data[0].embedding
        
        # Verify dimensions
        assert len(embedding) == 1536, f"Expected 1536 dims, got {len(embedding)}"
        
        logger.info(f"✓ Generated {len(embedding)}-dimensional embedding")
        return embedding
        
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        raise Exception(f"Failed to generate embedding: {str(e)}")


async def generate_batch_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts in one API call.
    More efficient than individual calls.
    
    Args:
        texts: List of texts to embed
        
    Returns:
        List of embedding vectors
    """
    try:
        # Truncate each text
        max_chars = 30000
        truncated = [text[:max_chars] for text in texts]
        
        logger.info(f"Generating embeddings for {len(texts)} texts (batch)")
        
        response = await client.embeddings.create(
            model="text-embedding-3-small",
            input=truncated,
            encoding_format="float"
        )
        
        embeddings = [item.embedding for item in response.data]
        
        logger.info(f"✓ Generated {len(embeddings)} embeddings")
        return embeddings
        
    except Exception as e:
        logger.error(f"Batch embedding generation failed: {e}")
        raise Exception(f"Failed to generate embeddings: {str(e)}")

