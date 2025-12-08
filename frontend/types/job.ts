export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  requirements: string[];
  applyUrl: string;
  postedDate: string;
  companyLogo?: string;
  howToImprove: string[];
}

export interface Resume {
  id: string;
  filename: string;
  dateAdded: string;
  size: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SearchHistory {
  id: string;
  jobTitle: string;
  location: string;
  timestamp: string;
}
