export type Role = 'veteran' | 'mentor' | 'employer' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  // Veteran specific
  militaryBranch?: string;
  rank?: string;
  mos?: string;
  yearsOfService?: number;
  militaryExperienceSummary?: string;
  skills?: string[];
  desiredIndustry?: string[];
  desiredJobTitle?: string[];
  locationPreference?: string;
  employmentType?: string;
  // Mentor specific
  professionalTitle?: string;
  company?: string;
  industry?: string;
  yearsProfessionalExperience?: number;
  areasOfExpertise?: string[];
  mentoringAvailability?: string;
  mentoringCommunication?: string;
  mentoringMotivation?: string;
  // Employer specific
  companyName?: string;
  companyIndustry?: string;
  companyWebsite?: string;
  companySize?: string;
  companyDescription?: string;
  contactPersonJobTitle?: string;
  companyLocations?: string[];
  hiringFocus?: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string; // Or fetch from User context
  title: string;
  description: string;
  location: string;
  requiredSkills: string[];
  postedDate: string;
}

export interface Application {
  jobId: string;
  veteranId: string;
  status: 'Applied' | 'Under Review' | 'Interview Scheduled' | 'Offer Received' | 'Rejected';
  appliedDate: string;
}

export interface SkillMatchResult {
  matchScore: number;
  relevantSkills: string[];
  missingSkills: string[];
  overallFit: string;
}
