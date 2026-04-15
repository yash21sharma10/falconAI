import axios from "axios";
import { Campaign, CampaignPayload, LeadsResponse, UploadCSVResponse } from "@/types";

const api = axios.create({
  // Use Next.js rewrite proxy to avoid browser CORS issues.
  baseURL: "/backend"
});

type ApiLead = {
  id: number | string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
};

type BackendLeadsResponse = {
  items?: ApiLead[];
  data?: ApiLead[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type BackendUploadResponse = {
  created?: number;
  skipped?: number;
  skippedCount?: number;
  invalid?: number;
  invalidCount?: number;
};

const normalizeCampaign = (campaign: any): Campaign => ({
  id: String(campaign.id),
  name: campaign.name ?? "",
  description: campaign.description ?? "",
  status: campaign.status,
  createdAt: campaign.createdAt ?? new Date().toISOString()
});

const normalizeLead = (lead: ApiLead) => ({
  id: String(lead.id),
  name: [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() || "N/A",
  email: lead.email,
  company: lead.company ?? "N/A"
});

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get("/campaign");
  const payload = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  return payload.map(normalizeCampaign);
};

export const createCampaign = async (payload: CampaignPayload): Promise<Campaign> => {
  const response = await api.post("/campaign", payload);
  return normalizeCampaign(response.data);
};

export const updateCampaign = async (id: string, payload: Partial<CampaignPayload>): Promise<Campaign> => {
  const response = await api.patch(`/campaign/${id}`, payload);
  return normalizeCampaign(response.data);
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await api.delete(`/campaign/${id}`);
};

export const getLeadsByCampaign = async (
  campaignId: string,
  page: number,
  limit: number,
  email?: string,
  name?: string
): Promise<LeadsResponse> => {
  const response = await api.get(`/lead/campaign/${campaignId}`, {
    params: {
      page,
      limit,
      ...(email ? { email } : {}),
      ...(name ? { name } : {})
    }
  });
  const backendData = response.data as BackendLeadsResponse;
  const items = backendData.items ?? backendData.data ?? [];

  return {
    data: items.map(normalizeLead),
    page: backendData.page ?? page,
    limit: backendData.limit ?? limit,
    total: backendData.total ?? items.length,
    totalPages: backendData.totalPages ?? 1
  };
};

export const uploadCSV = async (campaignId: string, file: File): Promise<UploadCSVResponse> => {
  const formData = new FormData();
  formData.append("campaignId", campaignId);
  formData.append("file", file);

  const response = await api.post("/lead/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  const backendData = response.data as BackendUploadResponse;
  return {
    created: backendData.created ?? 0,
    skipped: backendData.skipped ?? backendData.skippedCount ?? 0,
    invalid: backendData.invalid ?? backendData.invalidCount ?? 0
  };
};

export default api;
