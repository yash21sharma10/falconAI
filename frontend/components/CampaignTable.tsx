"use client";

import Link from "next/link";
import Button from "@/components/Button";
import { Campaign } from "@/types";

interface CampaignTableProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => Promise<void>;
  deletingId?: string | null;
}

export default function CampaignTable({ campaigns, onEdit, onDelete, deletingId }: CampaignTableProps) {
  if (!campaigns.length) {
    return <p className="text-sm text-slate-500">No campaigns found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Description</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b border-slate-100 align-top">
              <td className="p-2 font-medium">
                <Link className="text-blue-600 hover:underline" href={`/leads/${campaign.id}`}>
                  {campaign.name}
                </Link>
              </td>
              <td className="p-2">{campaign.description}</td>
              <td className="p-2 capitalize">{campaign.status}</td>
              <td className="p-2">{new Date(campaign.createdAt).toLocaleString()}</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onEdit(campaign)}>
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onDelete(campaign.id)}
                    disabled={deletingId === campaign.id}
                  >
                    {deletingId === campaign.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
