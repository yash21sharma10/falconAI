import Button from "@/components/Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({ page, totalPages, onPrevious, onNext }: PaginationProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" onClick={onPrevious} disabled={page <= 1}>
        Previous
      </Button>
      <span className="text-sm text-slate-600">
        Page {page} of {Math.max(totalPages, 1)}
      </span>
      <Button variant="secondary" onClick={onNext} disabled={page >= totalPages}>
        Next
      </Button>
    </div>
  );
}
