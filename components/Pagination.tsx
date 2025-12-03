import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getPagination = (page: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
  }
  return pages;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;
  return (
    <div
      className={`flex justify-center items-center gap-2 mt-4 ${
        className || ""
      }`}
    >
      <button
        className={`px-3 py-1 rounded ${
          page === 1
            ? "bg-gray-200 text-gray-400"
            : "bg-brand-gold text-brand-dark"
        }`}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      {getPagination(page, totalPages).map((p, idx) =>
        p === "..." ? (
          <span key={"ellipsis-" + idx} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={p as number}
            className={`px-3 py-1 rounded ${
              page === p
                ? "bg-brand-gold text-brand-dark font-bold"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => onPageChange(Number(p))}
            disabled={page === p}
          >
            {p}
          </button>
        )
      )}
      <button
        className={`px-3 py-1 rounded ${
          page === totalPages
            ? "bg-gray-200 text-gray-400"
            : "bg-brand-gold text-brand-dark"
        }`}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
