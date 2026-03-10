import { useState, useEffect } from 'react'
import { Shield, Zap, FileJson, GitBranch, Layers, BarChart3, RefreshCw, Play, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getExplain, getEmbebido, getReferenciado, getStats, ejecutarTransaccion, ejecutarBulk } from '../../api/admin'
import './Admin.css'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [explains, setExplains] = useState([])
  const [embebido, setEmbebido] = useState(null)
  const [referenciado, setReferenciado] = useState(null)
  const [transaccionResult, setTransaccionResult] = useState(null)
  const [bulkResult, setBulkResult] = useState(null)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [loadingTx, setLoadingTx] = useState(false)
  const [loadingBulk, setLoadingBulk] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)

  const cargarStats = async () => {
    try {
      const res = await getStats()
      setStats(res.data)
    } catch (e) { console.error(e) }
  }

  const cargarExplain = async () => {
    setLoadingExplain(true)
    try {
      const res = await getExplain()
      setExplains(res.data)
    } catch { toast.error('Error cargando explain plans') }
    finally { setLoadingExplain(false) }
  }

  const cargarDocs = async () => {
    setLoadingDocs(true)
    try {
      const [e, r] = await Promise.all([getEmbebido(), getReferenciado()])
      setEmbebido(e.data)
      setReferenciado(r.data)
    } catch { toast.error('Error cargando documentos') }
    finally { setLoadingDocs(false) }
  }

  const correrTransaccion = async () => {
    setLoadingTx(true)
    try {
      const res = await ejecutarTransaccion()
      setTransaccionResult(res.data)
      if (res.data.exito) toast.success('Transacción ejecutada exitosamente')
      else toast.error('Error en transacción')
    } catch { toast.error('Error ejecutando transacción') }
    finally { setLoadingTx(false) }
  }

  const correrBulk = async () => {
    setLoadingBulk(true)
    try {
      const res = await ejecutarBulk()
      setBulkResult(res.data)
      if (res.data.exito) toast.success('Bulk operation ejecutada')
      else toast.error('Error en bulk')
    } catch { toast.error('Error ejecutando bulk') }
    finally { setLoadingBulk(false) }
  }

  useEffect(() => { cargarStats() }, [])

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin</h2>
          <p className="page-subtitle">Diagnóstico y validación de features MongoDB</p>
        </div>
      </div>

      {/* Stats generales */}
      {stats && (
        <div className="admin-stats">
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} className="admin-stat-card">
              <span className="stat-val">{val.toLocaleString()}</span>
              <span className="stat-key">{key}</span>
            </div>
          ))}
        </div>
      )}

      <div className="admin-grid">

        {/* Explain Plans */}
        <div className="admin-card admin-wide">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <BarChart3 size={18} className="admin-icon" />
              <h3>Explain Plans — Validación de Índices</h3>
            </div>
            <button className="btn-secondary btn-sm" onClick={cargarExplain} disabled={loadingExplain}>
              {loadingExplain ? <RefreshCw size={13} className="spin" /> : <Play size={13} />}
              {loadingExplain ? 'Corriendo...' : 'Correr Explains'}
            </button>
          </div>

          {explains.length === 0 ? (
            <p className="admin-hint">Presiona "Correr Explains" para validar que los índices se usan correctamente</p>
          ) : (
            <div className="explain-lista">
              {explains.map((e, i) => (
                <div key={i} className="explain-item">
                  <div className="explain-top">
                    <span className={`badge ${e.tipo === 'IXSCAN' ? 'badge-success' : 'badge-error'}`}>
                      {e.tipo === 'IXSCAN' ? <Check size={11} /> : <X size={11} />}
                      {e.tipo}
                    </span>
                    <span className="explain-nombre">{e.nombre}</span>
                  </div>
                  <div className="explain-meta">
                    <span className="explain-tag">📦 {e.coleccion}</span>
                    <span className="explain-tag">🔑 {e.indice}</span>
                    <span className="explain-tag">📄 Docs examinados: <strong>{e.docsExaminados}</strong></span>
                    <span className="explain-tag">✅ Docs devueltos: <strong>{e.docsDevueltos}</strong></span>
                    <span className="explain-tag">⏱ {e.tiempoMs}ms</span>
                  </div>
                  <code className="explain-query">{e.query}</code>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transacción */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Zap size={18} className="admin-icon" />
              <h3>Transacción Multi-documento</h3>
            </div>
            <button className="btn-primary btn-sm" onClick={correrTransaccion} disabled={loadingTx}>
              {loadingTx ? <RefreshCw size={13} className="spin" /> : <Play size={13} />}
              {loadingTx ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>
          <p className="admin-hint">Crea una orden e incrementa <code>totalOrdenes</code> del usuario atómicamente en una sola transacción.</p>

          {transaccionResult && (
            <div className={`result-box ${transaccionResult.exito ? 'result-success' : 'result-error'}`}>
              <div className="result-badge">
                {transaccionResult.exito ? <Check size={14} /> : <X size={14} />}
                {transaccionResult.exito ? 'Éxito' : 'Error'}
              </div>
              <p className="result-msg">{transaccionResult.mensaje}</p>
              {transaccionResult.resultado && (
                <div className="result-details">
                  <div className="result-row"><span>Orden ID</span><code>{transaccionResult.resultado.ordenId}</code></div>
                  <div className="result-row"><span>Usuario</span><strong>{transaccionResult.resultado.usuario}</strong></div>
                  <div className="result-row"><span>Restaurante</span><strong>{transaccionResult.resultado.restaurante}</strong></div>
                  <div className="result-row"><span>Artículo</span><strong>{transaccionResult.resultado.articulo}</strong></div>
                  <div className="result-row"><span>Monto</span><strong>Q{transaccionResult.resultado.monto?.toFixed(2)}</strong></div>
                  <div className="result-row"><span>Total órdenes usuario</span><strong>{transaccionResult.resultado.totalOrdenesUsuario}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Operations */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Layers size={18} className="admin-icon" />
              <h3>Bulk Operations</h3>
            </div>
            <button className="btn-primary btn-sm" onClick={correrBulk} disabled={loadingBulk}>
              {loadingBulk ? <RefreshCw size={13} className="spin" /> : <Play size={13} />}
              {loadingBulk ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>
          <p className="admin-hint">Ejecuta un <code>bulkWrite</code> con 2 operaciones <code>updateMany</code> sobre artículos del menú.</p>

          {bulkResult && (
            <div className={`result-box ${bulkResult.exito ? 'result-success' : 'result-error'}`}>
              <div className="result-badge">
                {bulkResult.exito ? <Check size={14} /> : <X size={14} />}
                {bulkResult.exito ? 'Éxito' : 'Error'}
              </div>
              <p className="result-msg">{bulkResult.mensaje}</p>
              {bulkResult.resultado && (
                <div className="result-details">
                  <div className="result-row"><span>Operaciones</span><strong>{bulkResult.resultado.operacionesEjecutadas}</strong></div>
                  <div className="result-row"><span>Docs modificados</span><strong>{bulkResult.resultado.documentosModificados}</strong></div>
                  <div className="result-row"><span>Restaurante</span><strong>{bulkResult.resultado.restaurante}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documentos embebidos vs referenciados */}
        <div className="admin-card admin-wide">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <FileJson size={18} className="admin-icon" />
              <h3>Documentos Embebidos vs Referenciados</h3>
            </div>
            <button className="btn-secondary btn-sm" onClick={cargarDocs} disabled={loadingDocs}>
              {loadingDocs ? <RefreshCw size={13} className="spin" /> : <Play size={13} />}
              {loadingDocs ? 'Cargando...' : 'Cargar ejemplos'}
            </button>
          </div>

          {!embebido && !referenciado ? (
            <p className="admin-hint">Presiona "Cargar ejemplos" para ver documentos reales de la base de datos</p>
          ) : (
            <div className="docs-grid">
              {embebido && (
                <div className="doc-section">
                  <div className="doc-label doc-label--embebido">
                    <GitBranch size={13} /> Embebido — Orden con items
                  </div>
                  <p className="admin-hint">{embebido.descripcion}</p>
                  <pre className="json-preview">{JSON.stringify(embebido.documento, null, 2)}</pre>
                </div>
              )}
              {referenciado && (
                <div className="doc-section">
                  <div className="doc-label doc-label--referenciado">
                    <GitBranch size={13} /> Referenciado — Reseña con lookup
                  </div>
                  <p className="admin-hint">{referenciado.descripcion}</p>
                  <div className="ref-split">
                    <div>
                      <p className="ref-label">Documento original (solo IDs):</p>
                      <pre className="json-preview">{JSON.stringify(referenciado.documentoOriginal, null, 2)}</pre>
                    </div>
                    <div>
                      <p className="ref-label">Con $lookup resuelto:</p>
                      <pre className="json-preview">{JSON.stringify(referenciado.documentoConLookup, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}