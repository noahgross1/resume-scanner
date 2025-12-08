"""
Configuration management using environment variables.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Indeed API Configuration (for Task 3)
INDEED_API_KEY = os.getenv("INDEED_API_KEY")

# Validate required environment variables
def validate_config():
    """Validate that all required environment variables are set."""
    required = {
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_KEY": SUPABASE_KEY,
        "SUPABASE_JWT_SECRET": SUPABASE_JWT_SECRET,
        "OPENAI_API_KEY": OPENAI_API_KEY,
    }
    
    missing = [key for key, value in required.items() if not value]
    
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please create a .env file in the backend directory.\n"
            f"See .env.example for reference."
        )

