"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CampaignForm from "@/components/CampaignForm";
import CampaignTable from "@/components/CampaignTable";
import Card from "@/components/Card";
import { createCampaign, deleteCampaign, getCampaigns, updateCampaign } from "@/services/api";
import { Campaign, CampaignPayload } from "@/types";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError("Failed to load campaigns.");
      toast.error("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (payload: CampaignPayload) => {
    try {
      await createCampaign(payload);
      toast.success("Campaign created successfully.");
      await fetchCampaigns();
    } catch (err) {
      toast.error("Failed to create campaign.");
      throw err;
    }
  };

  const handleUpdateCampaign = async (payload: CampaignPayload) => {
    if (!editingCampaign) {
      return;
    }

    try {
      await updateCampaign(editingCampaign.id, payload);
      toast.success("Campaign updated successfully.");
      setEditingCampaign(null);
      await fetchCampaigns();
    } catch (err) {
      toast.error("Failed to update campaign.");
      throw err;
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCampaign(id);
      toast.success("Campaign deleted successfully.");
      await fetchCampaigns();
    } catch (err) {
      toast.error("Failed to delete campaign.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6">
      <Card title={editingCampaign ? "Edit Campaign" : "Create Campaign"}>
        <CampaignForm
          initialData={editingCampaign}
          onSubmit={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}
          onCancelEdit={() => setEditingCampaign(null)}
        />
      </Card>

      <Card title="Campaign List">
        {loading ? <p className="text-sm text-slate-500">Loading campaigns...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !error ? (
          <CampaignTable
            campaigns={campaigns}
            onEdit={setEditingCampaign}
            onDelete={handleDeleteCampaign}
            deletingId={deletingId}
          />
        ) : null}
      </Card>
    </div>
  );
}
