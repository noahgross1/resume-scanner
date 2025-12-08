-- ============================================
-- Resume Scanner - Database Setup
-- ============================================
-- Run this in Supabase SQL Editor to set up the database
-- for Task 2: Resume Upload & Vector Storage

-- ============================================
-- STEP 1: Enable pgvector Extension
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Verify it's enabled
SELECT * FROM pg_extension WHERE extname = 'vector';


-- ============================================
-- STEP 2: Create Resumes Table
-- ============================================

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    parsed_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,  -- text-embedding-3-small dimension
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create Indexes
-- ============================================

-- Regular index on user_id for fast user queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Vector similarity index using HNSW (Hierarchical Navigable Small World)
-- This enables fast approximate nearest neighbor search
-- m = 16: max connections per layer (higher = more accurate but slower)
-- ef_construction = 64: size of dynamic candidate list (higher = better index quality)
CREATE INDEX IF NOT EXISTS idx_resumes_embedding ON resumes
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);


-- ============================================
-- STEP 4: Row Level Security (RLS)
-- ============================================

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view own resumes"
    ON resumes FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own resumes
CREATE POLICY "Users can insert own resumes"
    ON resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own resumes
CREATE POLICY "Users can update own resumes"
    ON resumes FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
    ON resumes FOR DELETE
    USING (auth.uid() = user_id);


-- ============================================
-- STEP 5: Auto-update Trigger
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on resumes table
DROP TRIGGER IF EXISTS trigger_resumes_updated_at ON resumes;
CREATE TRIGGER trigger_resumes_updated_at
    BEFORE UPDATE ON resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- ============================================
-- STEP 6: Job Embeddings Cache Table (for Task 3)
-- ============================================

CREATE TABLE IF NOT EXISTS job_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_hash TEXT UNIQUE NOT NULL,    -- MD5 hash of job description
    job_title TEXT,                    -- For debugging
    job_company TEXT,                  -- For debugging
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_embeddings_hash ON job_embeddings(job_hash);
CREATE INDEX IF NOT EXISTS idx_job_embeddings_created ON job_embeddings(created_at DESC);

-- Vector index for potential similarity queries
CREATE INDEX IF NOT EXISTS idx_job_embeddings_vector ON job_embeddings
USING hnsw (embedding vector_cosine_ops);


-- ============================================
-- STEP 7: Search History Table (for Task 3)
-- ============================================

CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    location TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    avg_match_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- RLS for search history
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search history"
    ON search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
    ON search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- ============================================
-- STEP 8: Helper Functions
-- ============================================

-- Function to get user's most recent resume
CREATE OR REPLACE FUNCTION get_latest_resume(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    filename TEXT,
    parsed_text TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.filename, r.parsed_text, r.embedding, r.created_at
    FROM resumes r
    WHERE r.user_id = p_user_id
    ORDER BY r.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to search resumes by semantic similarity
CREATE OR REPLACE FUNCTION search_similar_resumes(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    filename TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.user_id,
        r.filename,
        1 - (r.embedding <=> query_embedding) AS similarity
    FROM resumes r
    WHERE 1 - (r.embedding <=> query_embedding) > match_threshold
    ORDER BY r.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- STEP 9: Cleanup Function for Old Embeddings
-- ============================================

-- Auto-cleanup old job embeddings (7 days)
CREATE OR REPLACE FUNCTION cleanup_old_embeddings()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM job_embeddings
    WHERE created_at < NOW() - INTERVAL '7 days';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_embeddings ON job_embeddings;
CREATE TRIGGER trigger_cleanup_embeddings
    AFTER INSERT ON job_embeddings
    EXECUTE FUNCTION cleanup_old_embeddings();


-- ============================================
-- STEP 10: Verification Queries
-- ============================================

-- Check if pgvector is installed
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('resumes', 'job_embeddings', 'search_history');

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('resumes', 'search_history');

-- ============================================
-- SUCCESS! 
-- ============================================
-- Your database is now ready for:
-- ✅ Task 2: Resume Upload & Vector Storage
-- ✅ Task 3: Job Search with Vector RAG
-- ============================================

