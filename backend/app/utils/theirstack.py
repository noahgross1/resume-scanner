"""
TheirStack API client for job searching.
"""
import requests
from typing import List, Dict, Optional
import logging
from app.config import THEIRSTACK_API_KEY

logger = logging.getLogger(__name__)

THEIRSTACK_BASE_URL = "https://api.theirstack.com/v1"


def search_jobs(
    title: str,
    location: Optional[str] = None,
    limit: int = 10
) -> List[Dict]:
    """
    Search jobs using TheirStack API.
    
    Args:
        query: Job title or keywords
        location: City, state (optional)
        limit: Number of jobs to fetch (default 5 for pre-ranking)
        
    Returns:
        List of job dictionaries
        
    Raises:
        Exception: If API call fails
    """
    try:
        headers = {
            "Authorization": f"Bearer {THEIRSTACK_API_KEY}",
            "Content-Type": "application/json"
        }
        

        # Build search parameters
        body = {
            "limit": limit,
            "page": 0,
            "job_country_code_or": [
                "US"
            ],
            "posted_at_max_age_days": 4,
            "job_title_or": [title],
            "job_location_pattern_or": [location],
        }
        
        # if location:
        #     params["location"] = location
        
        logger.info(f"Searching TheirStack: title='{title}', location='{location}', limit={limit}")
        
        # Make API request
        response = requests.post(
            f"{THEIRSTACK_BASE_URL}/jobs/search",
            headers=headers,
            json=body,
        )
        
        response.raise_for_status()
        data = response.json()
        
        # Parse response to standardized format
        jobs = []
        for result in data.get("data", []):
            # Extract company name from company_object
            company_obj = result.get("company_object", {})
            company_name = company_obj.get("name", "") if company_obj else ""
            
            # Extract location from locations array (use first location if available)
            locations = result.get("locations", [])
            location_str = ""
            if locations and len(locations) > 0:
                loc = locations[0]
                # Build location string: "City, State" or "City, Country"
                parts = []
                if loc.get("name"):
                    parts.append(loc.get("name"))
                if loc.get("state"):
                    parts.append(loc.get("state"))
                elif loc.get("country_name"):
                    parts.append(loc.get("country_name"))
                location_str = ", ".join(parts)
            
            # Handle remote/hybrid
            if result.get("remote"):
                location_str = "Remote" + (f" ({location_str})" if location_str else "")
            elif result.get("hybrid"):
                location_str = "Hybrid" + (f" ({location_str})" if location_str else "")
            
            # Extract job type from employment_statuses array
            employment_statuses = result.get("employment_statuses", [])
            job_type = employment_statuses[0] if employment_statuses else ""
            # Convert to readable format: "full_time" -> "Full-time"
            if job_type:
                job_type = job_type.replace("_", "-").title()
            
            jobs.append({
                "id": str(result.get("id", "")),
                "title": result.get("job_title", ""),
                "company": company_name,
                "location": location_str,
                "description": result.get("description", ""),
                "apply_url": result.get("final_url") or result.get("url", ""),
                "salary": result.get("salary_string", ""),
                "job_type": job_type,
                "posted_date": result.get("date_posted", "")
            })
        
        logger.info(f"✓ Found {len(jobs)} jobs from TheirStack")
        return jobs
        
    except requests.exceptions.HTTPError as e:
        logger.error(f"TheirStack API HTTP error: {e}")
        logger.error(f"Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
        raise Exception(f"Job search failed: {str(e)}")
    except requests.exceptions.Timeout:
        logger.error("TheirStack API timeout")
        raise Exception("Job search timed out. Please try again.")
    except requests.exceptions.RequestException as e:
        logger.error(f"TheirStack API request error: {e}")
        raise Exception(f"Job search failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in TheirStack search: {e}")
        raise Exception(f"Job search failed: {str(e)}")


def get_job_details(job_id: str) -> Optional[Dict]:
    """
    Get detailed information about a specific job.
    
    Args:
        job_id: TheirStack job ID
        
    Returns:
        Job details dictionary or None if not found
    """
    try:
        headers = {
            "Authorization": f"Bearer {THEIRSTACK_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(
            f"{THEIRSTACK_BASE_URL}/jobs/{job_id}",
            headers=headers,
            timeout=10
        )
        
        response.raise_for_status()
        return response.json()
        
    except Exception as e:
        logger.error(f"Failed to get job details for {job_id}: {e}")
        return None

