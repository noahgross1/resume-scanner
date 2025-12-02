import { Job, Resume, User, SearchHistory } from "@/types/job";

export const mockUser: User = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
};

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior React Native Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$150,000 - $180,000",
    type: "Full-time",
    matchScore: 92,
    matchedSkills: ["React Native", "TypeScript", "Redux", "REST APIs", "Git"],
    missingSkills: ["GraphQL", "AWS"],
    description:
      "We are looking for an experienced React Native developer to join our mobile team. You will be responsible for building and maintaining our flagship mobile application used by millions of users worldwide.",
    requirements: [
      "5+ years of mobile development experience",
      "Strong proficiency in React Native and TypeScript",
      "Experience with state management (Redux, MobX)",
      "Familiarity with RESTful APIs and GraphQL",
      "Published apps on App Store and Google Play",
    ],
    applyUrl: "https://example.com/apply/1",
    postedDate: "2 days ago",
    howToImprove: [
      "Take an online GraphQL course on Udemy or Coursera",
      "Get AWS Developer Associate certification",
      "Build a side project using GraphQL and deploy it on AWS",
    ],
  },
  {
    id: "2",
    title: "Mobile Engineer",
    company: "StartupXYZ",
    location: "New York, NY",
    salary: "$130,000 - $160,000",
    type: "Full-time",
    matchScore: 85,
    matchedSkills: ["JavaScript", "React Native", "Node.js", "MongoDB"],
    missingSkills: ["Kotlin", "Swift", "CI/CD"],
    description:
      "Join our fast-growing startup as a Mobile Engineer. You will work on cutting-edge features and help shape the future of our product.",
    requirements: [
      "3+ years of mobile development",
      "Experience with React Native or native development",
      "Strong JavaScript/TypeScript skills",
      "Ability to work in a fast-paced environment",
    ],
    applyUrl: "https://example.com/apply/2",
    postedDate: "1 week ago",
    howToImprove: [
      "Learn Kotlin basics through Android documentation",
      "Complete Swift playgrounds on iPad or Mac",
      "Set up a CI/CD pipeline using GitHub Actions",
    ],
  },
  {
    id: "3",
    title: "Frontend Developer",
    company: "DigitalAgency",
    location: "Remote",
    salary: "$100,000 - $130,000",
    type: "Remote",
    matchScore: 78,
    matchedSkills: ["React", "JavaScript", "CSS", "HTML"],
    missingSkills: ["Vue.js", "Angular", "Figma"],
    description:
      "We need a talented Frontend Developer to create beautiful and responsive web applications for our diverse client base.",
    requirements: [
      "2+ years of frontend development",
      "Proficiency in React or Vue.js",
      "Strong CSS and responsive design skills",
      "Experience with design tools like Figma",
    ],
    applyUrl: "https://example.com/apply/3",
    postedDate: "3 days ago",
    howToImprove: [
      "Complete Vue.js 3 fundamentals course",
      "Learn Angular basics through official documentation",
      "Practice Figma with free design resources",
    ],
  },
  {
    id: "4",
    title: "Full Stack Developer",
    company: "Enterprise Solutions",
    location: "Austin, TX",
    salary: "$140,000 - $170,000",
    type: "Full-time",
    matchScore: 65,
    matchedSkills: ["JavaScript", "Node.js", "PostgreSQL"],
    missingSkills: ["Java", "Spring Boot", "Kubernetes", "Docker"],
    description:
      "Looking for a Full Stack Developer to work on enterprise-level applications. You will be involved in the entire development lifecycle.",
    requirements: [
      "4+ years of full stack development",
      "Experience with Java and Spring Boot",
      "Knowledge of containerization (Docker, Kubernetes)",
      "Strong database skills",
    ],
    applyUrl: "https://example.com/apply/4",
    postedDate: "5 days ago",
    howToImprove: [
      "Take a Java fundamentals course on Pluralsight",
      "Learn Spring Boot through official Spring guides",
      "Practice Docker with local development setup",
      "Explore Kubernetes basics with Minikube",
    ],
  },
  {
    id: "5",
    title: "iOS Developer",
    company: "AppWorks",
    location: "Seattle, WA",
    salary: "$135,000 - $165,000",
    type: "Full-time",
    matchScore: 55,
    matchedSkills: ["Mobile Development", "Git"],
    missingSkills: ["Swift", "SwiftUI", "Objective-C", "Xcode"],
    description:
      "Join our iOS team to build native applications for iPhone and iPad. Experience with SwiftUI is a plus.",
    requirements: [
      "3+ years of iOS development",
      "Strong Swift and SwiftUI skills",
      "Understanding of iOS design patterns",
      "Published apps on App Store",
    ],
    applyUrl: "https://example.com/apply/5",
    postedDate: "1 day ago",
    howToImprove: [
      "Complete 100 Days of Swift by Paul Hudson",
      "Build a SwiftUI app following Apple tutorials",
      "Learn iOS design patterns through Ray Wenderlich",
      "Publish a personal app to App Store",
    ],
  },
];

export const mockResumes: Resume[] = [
  {
    id: "1",
    filename: "Alex_Johnson_Resume_2024.pdf",
    dateAdded: "Nov 15, 2024",
    size: "245 KB",
  },
  {
    id: "2",
    filename: "Technical_Resume_Latest.pdf",
    dateAdded: "Oct 28, 2024",
    size: "198 KB",
  },
];

export const mockSearchHistory: SearchHistory[] = [
  {
    id: "1",
    jobTitle: "React Native Developer",
    location: "San Francisco, CA",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    jobTitle: "Mobile Engineer",
    location: "Remote",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    jobTitle: "Frontend Developer",
    location: "New York, NY",
    timestamp: "3 days ago",
  },
];
