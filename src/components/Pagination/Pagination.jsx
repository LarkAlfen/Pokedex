import "./Pagination.scss";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="pagination">

      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ←
      </button>

      <span>
        Page {page} sur {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        →
      </button>

    </div>
  );
}