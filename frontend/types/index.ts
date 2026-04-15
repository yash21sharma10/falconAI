export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
}

export interface LeadsResponse {
  data: Lead[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UploadCSVResponse {
  created: number;
  skipped: number;
  invalid: number;
}

export interface CampaignPayload {
  name: string;
  description: string;
  status: CampaignStatus;
}
