# Backend Setup Instructions - Task 2 Complete! 🎉

## ✅ What's Been Implemented

Task 2 (Resume Upload & Vector Storage) is now complete:

- ✅ PDF text extraction
- ✅ OpenAI embeddings generation
- ✅ PostgreSQL + pgvector storage
- ✅ Resume CRUD API endpoints
- ✅ JWT authentication
- ✅ Frontend integration

## 🗄️ Step 1: Set Up Database

### 1.1 Run the SQL Schema

Go to your Supabase project:

1. Open **SQL Editor**
2. Copy the entire contents of `backend-new/setup_database.sql`
3. Paste and run it

This will create:

- `resumes` table with vector embeddings
- `job_embeddings` cache table
- `search_history` table
- Indexes for fast vector search
- Row Level Security policies
- Helper functions

### 1.2 Verify Installation

Run this query in Supabase SQL Editor:

```sql
-- Check pgvector is installed
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('resumes', 'job_embeddings', 'search_history');
```

You should see:

- `vector` extension version 0.5.0 or higher
- All 3 tables listed

## 🔑 Step 2: Configure Environment Variables

### 2.1 Create `.env` File

In the `backend/` directory, create a `.env` file:

```bash
cd backend
cp .env.example .env
```

### 2.2 Fill in Your Credentials

Edit `.env` with your actual values:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Indeed API (for Task 3 - optional for now)
INDEED_API_KEY=your-indeed-api-key-here
```

### 2.3 Where to Find These Values

**Supabase Credentials:**

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
4. Click **Settings** → **API** → **JWT Settings**
5. Copy `JWT Secret` → `SUPABASE_JWT_SECRET`

**OpenAI API Key:**

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it to `OPENAI_API_KEY`

## 🚀 Step 3: Start the Backend Server

### 3.1 Install Dependencies (if not done)

```bash
cd backend
uv sync
```

### 3.2 Run the Server

```bash
# Option 1: Using uv
uv run python main.py

# Option 2: Using uvicorn directly
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3.3 Test the API

Open your browser to:

- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📱 Step 4: Configure Frontend

### 4.1 Update API URL (if needed)

The frontend is already configured to use `http://localhost:8000` in development.

If you need to change it, edit `frontend/utils/api.ts`:

```typescript
const API_URL = __DEV__
  ? "http://localhost:8000" // Your backend URL
  : "https://your-production-backend.com";
```

### 4.2 Ensure Supabase is Configured

Make sure your `frontend/app.config.ts` has the correct Supabase credentials:

```typescript
export default {
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
  },
  // ... rest of config
};
```

And your `frontend/.env` file exists:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## 🧪 Step 5: Test the Complete Flow

### 5.1 Backend Test (Swagger UI)

1. Go to http://localhost:8000/docs
2. Click **Authorize** button
3. Get a JWT token:
   - Login via your frontend app
   - Copy the token from browser DevTools (Application → Local Storage)
4. Paste token in format: `Bearer your-token-here`
5. Test endpoints:
   - **POST /api/resumes** - Upload a PDF
   - **GET /api/resumes** - List all resumes
   - **GET /api/resumes/{id}** - Get specific resume
   - **DELETE /api/resumes/{id}** - Delete resume

### 5.2 Frontend Test (Mobile App)

1. **Start the frontend**:

   ```bash
   cd frontend
   npm start
   ```

2. **Login** to your app

3. **Go to Resumes screen**

4. **Tap "Add Resume"**

5. **Select a PDF file**

6. **Wait for upload** (~2-5 seconds)

   - You'll see "Processing your resume..." message
   - Backend extracts text from PDF
   - Generates 1536-dimensional embedding
   - Stores in PostgreSQL with pgvector

7. **Verify** resume appears in list

8. **Swipe left** on a resume to delete it

### 5.3 Verify in Database

Check your Supabase database:

```sql
SELECT
    id,
    filename,
    LENGTH(parsed_text) as text_length,
    array_length(embedding, 1) as embedding_dims,
    file_size,
    created_at
FROM resumes
ORDER BY created_at DESC;
```

You should see:

- Your uploaded resume
- `text_length` > 0 (extracted text)
- `embedding_dims` = 1536 (OpenAI embedding)
- `file_size` in bytes

## 🎯 API Endpoints

### Resume Endpoints

| Method | Endpoint            | Description         | Auth Required |
| ------ | ------------------- | ------------------- | ------------- |
| POST   | `/api/resumes`      | Upload PDF resume   | ✅ Yes        |
| GET    | `/api/resumes`      | List user's resumes | ✅ Yes        |
| GET    | `/api/resumes/{id}` | Get resume details  | ✅ Yes        |
| DELETE | `/api/resumes/{id}` | Delete resume       | ✅ Yes        |

### System Endpoints

| Method | Endpoint  | Description  | Auth Required |
| ------ | --------- | ------------ | ------------- |
| GET    | `/`       | API info     | ❌ No         |
| GET    | `/health` | Health check | ❌ No         |
| GET    | `/docs`   | Swagger UI   | ❌ No         |

## 📊 What Happens When You Upload a Resume

```
1. Frontend picks PDF file
   ↓
2. Sends to POST /api/resumes
   ↓
3. Backend validates JWT token
   ↓
4. Extracts text from PDF (PyPDF2)
   ↓
5. Generates embedding (OpenAI text-embedding-3-small)
   ↓
6. Stores in PostgreSQL with pgvector
   ↓
7. Returns resume metadata
   ↓
8. Frontend reloads resume list
```

**Processing Time**: 2-5 seconds per resume

**Cost**: ~$0.00002 per resume (OpenAI embeddings)

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Make sure your `.env` file exists and has all required variables.

```bash
cd backend
cat .env  # Check if file exists and has values
```

### Error: "Failed to store resume in database"

**Solution**: Check that you ran the SQL schema in Supabase.

```sql
-- Verify pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Error: "PDF processing failed"

**Solution**: Ensure the PDF is text-based (not a scanned image). Try a different PDF.

### Error: "No authentication token"

**Solution**: Make sure you're logged in to the frontend app. The JWT token is automatically sent with each request.

### Error: "Connection refused" when uploading

**Solution**: Make sure the backend server is running on port 8000.

```bash
# Check if backend is running
curl http://localhost:8000/health
```

### Frontend can't connect to backend

**Solution**:

- iOS Simulator: Use `http://localhost:8000`
- Android Emulator: Use `http://10.0.2.2:8000`
- Physical device: Use your computer's IP (e.g., `http://192.168.1.100:8000`)

Update `frontend/utils/api.ts` accordingly.

## 📈 Performance Expectations

| Operation             | Time     | Cost         |
| --------------------- | -------- | ------------ |
| PDF text extraction   | 0.5-1s   | Free         |
| Embedding generation  | 0.5-1s   | $0.00002     |
| Database storage      | 0.1-0.3s | Free         |
| **Total upload time** | **2-5s** | **$0.00002** |

## 🎉 Success Criteria

You've successfully completed Task 2 if:

- ✅ Backend server starts without errors
- ✅ Swagger UI accessible at http://localhost:8000/docs
- ✅ Can upload PDF from frontend
- ✅ Resume appears in database with embedding
- ✅ Can list and delete resumes
- ✅ Processing time < 5 seconds

## 🚀 Next Steps

**Task 3: Job Search with Vector RAG**

Once Task 2 is working, you can implement:

- Indeed API integration
- Vector similarity search
- GPT-4o-mini job analysis
- Ranked job results with match scores

See `documents/TASK.md` for Task 3 details.

## 📚 Additional Resources

- **Supabase pgvector docs**: https://supabase.com/docs/guides/database/extensions/pgvector
- **OpenAI Embeddings**: https://platform.openai.com/docs/guides/embeddings
- **FastAPI docs**: https://fastapi.tiangolo.com/

---

**Need help?** Check the logs:

- Backend: Terminal where you ran `python main.py`
- Frontend: Expo terminal output
- Database: Supabase Dashboard → Logs
