function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-4">
      <button
        className="px-3 py-1 rounded-lg cursor-pointer border border-[#DFE4EA] body-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
      >
        ← Prev
      </button>

      <span className="body-2">
        Page {page} of {totalPages || 1}
      </span>

      <button
        className="px-3 py-1 cursor-pointer rounded-lg border border-[#DFE4EA] body-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(page < totalPages ? page + 1 : page)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination
