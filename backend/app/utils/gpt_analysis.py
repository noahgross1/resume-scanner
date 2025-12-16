"""
GPT-4o-mini analysis for job matching using structured outputs.
"""
from openai import AsyncOpenAI
import logging
from app.config import OPENAI_API_KEY
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

class JobAnalysis(BaseModel):
    """Complete job analysis with metadata and match details"""
    title: str = Field(description="Job title")
    company: str = Field(description="Company name")
    location: str = Field(description="Job location")
    salary: str = Field(description="Salary range if available, empty string otherwise")
    job_type: str = Field(description="Employment type (remote, on-site, hybrid)")
    match_score: int = Field(description="Match score 0-100 based on similarity and requirements fit")
    met_qualifications: list[str] = Field(description="Job requirements that the candidate meets")
    missing_qualifications: list[str] = Field(description="Job requirements that the candidate does not meet")
    apply_url: str = Field(description="URL to apply for the job")
    posted_date: str = Field(description="When the job was posted")
    description: str = Field(description="Full job description")
    requirements: list[str] = Field(description="Job requirements")
    how_to_improve: list[str] = Field(description="How to improve the candidate's qualifications to meet the job requirements")

system_prompt = """You are an expert career advisor analyzing job matches.
Analyze the candidate's resume against this job description and return a complete JobAnalysis.

Guidelines:
- job_type: Employment type (remote, on-site, hybrid)
- match_score: 0-100, weighing vector similarity AND qualifications fit
- met_qualifications: Job requirements that the candidate meets
- missing_qualifications: Job requirements that the candidate does not meet
- requirements: Job requirements
- how_to_improve: How to improve the candidate's qualifications to meet the job requirements
- Use the provided metadata for title, company, location, salary, apply_url, posted_date.
- Keep description as the full job text provided"""

def get_user_prompt(resume_text: str, job_text: str, job_metadata: dict, similarity_score: float) -> str:
    user_prompt = f"Here is the latest user resume: \n\n{resume_text}\n\n"
    user_prompt += f"Here is the latest job description to compare the user resume against: \n\n{job_text}\n\n"
    user_prompt += "Here is the job metadata: \n\n"
    user_prompt += f"- Title: {job_metadata['title']}\n"
    user_prompt += f"- Company: {job_metadata['company']}\n"
    user_prompt += f"- Location: {job_metadata['location']}\n"
    user_prompt += f"- Salary: {job_metadata.get('salary_string', 'Not specified')}\n"
    user_prompt += f"- Posted Date: {job_metadata.get('date_posted', 'Unknown')}\n"
    user_prompt += f"- Apply URL: {job_metadata.get('source_url', '')}\n\n\n"
    user_prompt += f"The similarity score between the user resume and the job description is {similarity_score * 100:.1f}%"
    return user_prompt


async def analyze_job_match(
    resume_text: str,
    job_text: str,
    job_metadata: dict,
    similarity_score: float
) -> JobAnalysis:
    """
    Analyze job match using GPT-4o-mini with structured outputs.
    
    Args:
        resume_text: User's resume text
        job_text: Full job description text from TheirStack
        job_metadata: Job metadata (title, company, location, salary, etc.)
        similarity_score: Cosine similarity score (0-1)
        
    Returns:
        JobAnalysis Pydantic model with complete analysis
    """
    try:
        # Use OpenAI's structured output feature (beta)
        completion = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": get_user_prompt(resume_text, job_text, job_metadata, similarity_score)
                }
            ],
            response_format=JobAnalysis,
            temperature=0.0,
        )
        
        # Parse the structured output
        analysis = completion.choices[0].message.parsed
        
        logger.info(
            f"✓ Analyzed '{analysis.title}': "
            f"score={analysis.match_score}, qualifies={analysis.qualifies}"
        )
        
        return analysis
        
    except Exception as e:
        logger.error(f"GPT analysis failed: {e}")
        # Return fallback analysis
        return JobAnalysis(
            title=job_metadata["title"],
            company=job_metadata["company"],
            location=job_metadata["location"],
            salary=job_metadata.get("salary", ""),
            job_type=job_metadata.get("job_type", ""),
            match_score=int(similarity_score * 100),
            qualifies=similarity_score > 0.7,
            met_qualifications=[],
            missing_qualifications=["Analysis unavailable - please try again"],
            guidance={},
            apply_url=job_metadata.get("apply_url", ""),
            posted_date=job_metadata.get("posted_date", ""),
            description=job_text
        )


async def analyze_batch_jobs(
    resume_text: str,
    jobs_with_scores: list,
    total_searched: int
):
    """
    Analyze multiple jobs in parallel and return JobSearchResponse.
    
    Args:
        resume_text: User's resume text
        jobs_with_scores: List of (job_dict, similarity_score) tuples
            where job_dict has 'description' and metadata fields
        total_searched: Total number of jobs fetched from TheirStack
        
    Returns:
        JobSearchResponse with analyzed jobs
    """
    import asyncio
    from app.models.job import JobSearchResponse, JobResult
    
    # Debug: Print structure of first job to see available keys
    if jobs_with_scores:
        first_job, first_score = jobs_with_scores[0]
        logger.info(f"DEBUG - Job structure keys: {list(first_job.keys())}")
        logger.info(f"DEBUG - Sample job data: title={first_job.get('title')}, company={first_job.get('company')}")
    
    # Create parallel analysis tasks
    tasks = [
        analyze_job_match(
            resume_text=resume_text,
            job_text=job["description"],
            job_metadata={
                "title": job["title"],  # TheirStack returns "title" not "job_title"
                "company": job["company"],
                "location": job["location"],
                "salary": job.get("salary", ""),
                "posted_date": job.get("posted_date", ""),
                "apply_url": job.get("apply_url", "")
            },
            similarity_score=score
        )
        for job, score in jobs_with_scores
    ]
    
    # Run all analyses in parallel
    analyses = await asyncio.gather(*tasks)
    
    # Convert JobAnalysis models to JobResult models
    import uuid
    job_results = [
        JobResult(
            id=str(uuid.uuid4()),  # Generate unique ID for each job
            title=analysis.title,
            company=analysis.company,
            location=analysis.location,
            salary=analysis.salary,
            job_type=analysis.job_type,
            match_score=analysis.match_score,
            met_qualifications=analysis.met_qualifications,
            missing_qualifications=analysis.missing_qualifications,
            apply_url=analysis.apply_url,
            posted_date=analysis.posted_date,
            description=analysis.description,
            requirements=analysis.requirements,
            how_to_improve=analysis.how_to_improve
        )
        for analysis in analyses
    ]
    
    return JobSearchResponse(
        jobs=job_results,
        total_searched=total_searched,
        analyzed=len(job_results)
    )

