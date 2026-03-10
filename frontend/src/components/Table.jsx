import './Table.css'

export default function Table({ columns, data, loading, emptyIcon = '📄', emptyText = 'No hay datos', onRowClick }) {
  if (loading) return <div className="loading">Cargando...</div>

  if (!data || data.length === 0) return (
    <div className="empty-state">
      <span>{emptyIcon}</span>
      <p>{emptyText}</p>
    </div>
  )

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'table-row--clickable' : ''}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}