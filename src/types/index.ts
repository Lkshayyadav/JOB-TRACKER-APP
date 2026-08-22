export type ApplicationStatus =
  | "Wishlist"
  | "Applied"
  | "OA"
  | "Technical Round"
  | "HR Round"
  | "Offer"
  | "Rejected";

export type ApplicationPriority = "Low" | "Medium" | "High";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  platformId?: string | null;
  jobUrl?: string;
  status: ApplicationStatus;
  appliedDate: string;
  followUpDate?: string;
  priority: ApplicationPriority;
  salary?: string;
  location?: string;
  jobType?: "Remote" | "Hybrid" | "On-site" | string;
  notes?: string;
  isPinned: boolean;
  companyWebsite?: string;
  applicationMethod?: "LinkedIn" | "Wellfound" | "Indeed" | "Referral" | "Website" | string;
  recruiterName?: string;
  recruiterEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationHistory {
  _id: string;
  applicationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedAt: string;
  notes?: string;
}

export interface SavedJob {
  _id: string;
  userId: string;
  company: string;
  role: string;
  platformId?: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  notes?: string;
  savedDate: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Platform {
  _id: string;
  userId: string;
  name: string;
  url?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  totalApplications?: number;
  successRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  rejectionRate: number;
  responseRate?: number;
  statusBreakdown: Record<ApplicationStatus, number>;
  weeklyActivity?: { day: string; count: number }[];
  recentApplications?: Application[];
}

export interface FilterParams {
  status?: ApplicationStatus | "All";
  priority?: ApplicationPriority | "All";
  platformId?: string;
  search?: string;
  sortBy?: "appliedDate" | "company" | "priority" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
  isPinned?: boolean;
}
