"""
Supabase database client initialization.
"""
from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

