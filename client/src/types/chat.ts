/**
 * Chat Types for AI Assistant
 * Supports rich media responses with tool data
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  
  // Rich media fields
  intent?: {
    tool: "lookup_job" | "get_job_summary" | "general_chat";
    search_term: string | null;
    reasoning: string;
  };
  
  data?: JobLookupData | JobSummaryData | null;
  dataFound?: boolean;
}

// Data structure for lookup_job tool
export interface JobLookupData {
  jobs: Array<{
    id: number;
    fullName: string;
    email: string | null;
    phone: string | null;
    address: string;
    cityStateZip: string;
    status: string;
    dealType: string | null;
    totalPrice: string | null;
    createdAt: Date | string;
  }>;
}

// Data structure for get_job_summary tool
export interface JobSummaryData {
  job: {
    id: number;
    fullName: string;
    address: string;
    status: string;
    dealType: string | null;
  };
  activities: Array<{
    id: number;
    activityType: string;
    description: string | null;
    createdAt: Date | string;
  }>;
}

// Type guard to check if data is JobLookupData
export function isJobLookupData(data: any): data is JobLookupData {
  return data && Array.isArray(data.jobs);
}

// Type guard to check if data is JobSummaryData
export function isJobSummaryData(data: any): data is JobSummaryData {
  return data && data.job && Array.isArray(data.activities);
}
