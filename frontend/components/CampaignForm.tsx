"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { Campaign, CampaignPayload, CampaignStatus } from "@/types";

interface CampaignFormProps {
  initialData?: Campaign | null;
  onSubmit: (payload: CampaignPayload) => Promise<void>;
  onCancelEdit?: () => void;
}

const statuses: CampaignStatus[] = ["draft", "active", "paused", "completed"];

export default function CampaignForm({ initialData, onSubmit, onCancelEdit }: CampaignFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CampaignStatus>("draft");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setStatus(initialData.status);
    } else {
      setName("");
      setDescription("");
      setStatus("draft");
    }
  }, [initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ name, description, status });
      if (!initialData) {
        setName("");
        setDescription("");
        setStatus("draft");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Campaign name"
        className="rounded-md border border-slate-300 p-2"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Campaign description"
        className="rounded-md border border-slate-300 p-2"
        rows={3}
        required
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as CampaignStatus)}
        className="rounded-md border border-slate-300 p-2"
      >
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initialData ? "Update Campaign" : "Create Campaign"}
        </Button>
        {initialData && onCancelEdit ? (
          <Button type="button" variant="secondary" onClick={onCancelEdit}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
