"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import { uploadCSV } from "@/services/api";
import { UploadCSVResponse } from "@/types";

interface CSVUploadProps {
  campaignId: string;
  onSuccess?: () => void;
}

export default function CSVUpload({ campaignId, onSuccess }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadCSVResponse | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first.");
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await uploadCSV(campaignId, file);
      setResult(response);
      toast.success("CSV uploaded successfully.");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to upload CSV.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-3">
      <input
        type="file"
        accept=".csv"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        className="block w-full rounded-md border border-slate-300 p-2 text-sm"
      />
      <div>
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </div>

      {result ? (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          <p>Created: {result.created}</p>
          <p>Skipped: {result.skipped}</p>
          <p>Invalid: {result.invalid}</p>
        </div>
      ) : null}
    </div>
  );
}
