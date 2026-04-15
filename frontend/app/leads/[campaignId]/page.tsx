"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Card from "@/components/Card";
import CSVUpload from "@/components/CSVUpload";
import LeadsTable from "@/components/LeadsTable";
import Pagination from "@/components/Pagination";
import { getLeadsByCampaign } from "@/services/api";
import { Lead } from "@/types";
import Button from "@/components/Button";

const DEFAULT_LIMIT = 10;

export default function LeadsByCampaignPage() {
  const params = useParams<{ campaignId: string }>();
  const campaignId = params.campaignId;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getLeadsByCampaign(campaignId, page, DEFAULT_LIMIT, appliedEmail, appliedName);
      setLeads(response.data);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError("Failed to load leads.");
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchLeads();
    }
  }, [campaignId, page, appliedEmail, appliedName]);

  const applyFilters = () => {
    setPage(1);
    setAppliedEmail(emailFilter.trim());
    setAppliedName(nameFilter.trim());
  };

  return (
    <div className="grid gap-6">
      <Card title="Upload Leads CSV">
        <CSVUpload campaignId={campaignId} onSuccess={fetchLeads} />
      </Card>

      <Card title={`Leads for Campaign: ${campaignId}`}>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <input
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            placeholder="Search by email"
            className="rounded-md border border-slate-300 p-2"
          />
          <input
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            placeholder="Search by name"
            className="rounded-md border border-slate-300 p-2"
          />
          <div className="flex gap-2">
            <Button onClick={applyFilters}>Apply Filters</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEmailFilter("");
                setNameFilter("");
                setAppliedEmail("");
                setAppliedName("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading leads...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {!loading && !error ? <LeadsTable leads={leads} /> : null}

        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
            onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          />
        </div>
      </Card>
    </div>
  );
}
