import './Pagination.css'

export default function Pagination({ page, setPage, hasMore, total, limit }) {
  const totalPages = total ? Math.ceil(total / limit) : null

  const goTo = (p) => {
    if (p < 0) return
    if (totalPages && p >= totalPages) return
    setPage(p)
  }

  const getPages = () => {
    if (!totalPages) return []
    const pages = []
    const start = Math.max(0, page - 2)
    const end = Math.min(totalPages - 1, page + 2)
    if (start > 0) { pages.push(0); if (start > 1) pages.push('...') }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) { if (end < totalPages - 2) pages.push('...'); pages.push(totalPages - 1) }
    return pages
  }

  return (
    <div className="pagination">
      <button className="btn-secondary pag-btn" onClick={() => goTo(page - 1)} disabled={page === 0}>
        ←
      </button>

      {totalPages ? (
        getPages().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="pag-dots">...</span>
          ) : (
            <button
              key={p}
              className={`pag-btn ${p === page ? 'pag-btn--active' : 'btn-secondary'}`}
              onClick={() => goTo(p)}
            >
              {p + 1}
            </button>
          )
        )
      ) : (
        <span className="page-num">Página {page + 1}</span>
      )}

      <button className="btn-secondary pag-btn" onClick={() => goTo(page + 1)} disabled={!hasMore}>
        →
      </button>
    </div>
  )
}