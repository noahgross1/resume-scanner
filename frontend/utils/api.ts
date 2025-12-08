/**
 * API helper functions for backend communication.
 */
import { supabase } from "./supabaseClient";

const API_URL = __DEV__
  ? "http://localhost:8000"
  : "https://your-production-backend.com";

/**
 * Get authentication headers with JWT token.
 */
async function getAuthHeaders() {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new Error("No authentication token. Please login.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ============================================
// Resume API Functions
// ============================================

export interface ResumeUploadResponse {
  id: string;
  filename: string;
  file_size: number;
  created_at: string;
}

export interface ResumeListItem {
  id: string;
  filename: string;
  file_size: number;
  created_at: string;
}

export interface ResumeDetail {
  id: string;
  filename: string;
  parsed_text: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

/**
 * Upload a resume PDF to the backend.
 * The backend will extract text and generate embeddings.
 */
export async function uploadResume(
  fileUri: string,
  fileName: string,
  fileSize: number
): Promise<ResumeUploadResponse> {
  try {
    const headers = await getAuthHeaders();

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: "application/pdf",
    } as any);

    const response = await fetch(`${API_URL}/api/resumes`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Upload resume failed:", error);
    throw error;
  }
}

/**
 * Get list of user's uploaded resumes.
 */
export async function listResumes(): Promise<ResumeListItem[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/resumes`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load resumes");
    }

    return await response.json();
  } catch (error: any) {
    console.error("List resumes failed:", error);
    throw error;
  }
}

/**
 * Get specific resume details including full text.
 */
export async function getResume(resumeId: string): Promise<ResumeDetail> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load resume");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Get resume failed:", error);
    throw error;
  }
}

/**
 * Delete a resume.
 */
export async function deleteResume(resumeId: string): Promise<any> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/resumes/${resumeId}`, {
      method: "DELETE",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete resume");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Delete resume failed:", error);
    throw error;
  }
}

// ============================================
// Job Search API Functions (Task 3)
// ============================================

export interface JobSearchRequest {
  title: string;
  location: string;
  resume_id?: string;
}

export interface JobResult {
  title: string;
  company: string;
  location: string;
  description: string;
  match_score: number;
  qualifies: boolean;
  met_qualifications: string[];
  missing_qualifications: string[];
  guidance: Record<
    string,
    {
      description: string;
      link: string;
      steps: string;
    }
  >;
  apply_link: string;
}

export interface JobSearchResponse {
  success: boolean;
  data: {
    jobs: JobResult[];
    total_searched: number;
    analyzed: number;
  };
  message: string;
}

/**
 * Search for jobs using Vector RAG.
 * This will be implemented in Task 3.
 */
export async function searchJobs(
  title: string,
  location: string,
  resumeId?: string
): Promise<JobSearchResponse> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/jobs/search`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        location,
        resume_id: resumeId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Search failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Search jobs failed:", error);
    throw error;
  }
}
