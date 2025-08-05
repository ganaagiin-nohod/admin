import { JobStatus, JobPriority } from '@/models/JobApplication';

export interface JobApplication {
  _id: string;
  company: string;
  position: string;
  status: JobStatus;
  priority: JobPriority;
  applicationDate: string;
  lastUpdated: string;
  location?: string;
  jobUrl?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  contactEmail?: string;
  notes?: string;
  interviews?: {
    date: string;
    type: string;
    notes?: string;
  }[];
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
}

export interface JobStats {
  total: number;
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  rejected: number;
}
