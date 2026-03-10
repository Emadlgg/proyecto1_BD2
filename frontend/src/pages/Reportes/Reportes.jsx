import { useState, useEffect } from 'react'
import { BarChart3, Star, ShoppingBag, UtensilsCrossed, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getMejoresRestaurantes, getPlatillosVendidos,
  getConteoOrdenes, getConteoResenas
} from '../../api/reportes'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './Reportes.css'

const COLORES = ['#e8c547', '#4caf7d', '#e8a847', '#e05252', '#5b8dee', '#9b59b6']

export default function Reportes() {
  const [mejores, setMejores] = useState([])
  const [platillos, setPlatillos] = useState([])
  const [conteoOrdenes, setConteoOrdenes] = useState([])
  const [conteoResenas, setConteoResenas] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = async () => {
    setLoading(true)
    try {
      const [m, p, co, cr] = await Promise.all([
        getMejoresRestaurantes(),
        getPlatillosVendidos(),
        getConteoOrdenes(),
        getConteoResenas()
      ])
      setMejores(m.data.slice(0, 8))
      setPlatillos(p.data.slice(0, 8))
      setConteoOrdenes(co.data)
      setConteoResenas(cr.data)
    } catch (e) {
      console.error(e)
      toast.error('Error cargando reportes')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  if (loading) return <div className="loading">Cargando reportes...</div>

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reportes</h2>
          <p className="page-subtitle">Aggregation pipelines en tiempo real</p>
        </div>
        <button className="btn-secondary" onClick={cargar}>
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      <div className="reportes-grid">

        {/* Mejores restaurantes */}
        <div className="reporte-card reporte-wide">
          <div className="reporte-header">
            <Star size={18} className="reporte-icon" />
            <h3>Mejores Restaurantes por Calificación</h3>
          </div>
          {mejores.length === 0 ? (
            <div className="empty-state"><p>Sin datos</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mejores} margin={{ top: 8, right: 16, bottom: 70, left: 0 }}>
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: '#9a9690', fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis domain={[0, 5]} tick={{ fill: '#9a9690', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: 8 }}
                  labelStyle={{ color: '#f0ede6' }}
                  formatter={(v) => [v.toFixed(2), 'Calificación promedio']}
                />
                <Bar dataKey="promedioCalificacion" fill="#e8c547" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platillos más vendidos */}
        <div className="reporte-card reporte-wide">
          <div className="reporte-header">
            <UtensilsCrossed size={18} className="reporte-icon" />
            <h3>Platillos Más Vendidos</h3>
          </div>
          {platillos.length === 0 ? (
            <div className="empty-state"><p>Sin datos</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={platillos} margin={{ top: 8, right: 16, bottom: 70, left: 0 }}>
                <XAxis
                  dataKey="_id"
                  tick={{ fill: '#9a9690', fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: '#9a9690', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: 8 }}
                  labelStyle={{ color: '#f0ede6' }}
                  formatter={(v) => [v, 'Unidades vendidas']}
                />
                <Bar dataKey="totalVendido" fill="#4caf7d" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Conteo de órdenes por estado */}
        <div className="reporte-card">
          <div className="reporte-header">
            <ShoppingBag size={18} className="reporte-icon" />
            <h3>Órdenes por Estado</h3>
          </div>
          {conteoOrdenes.length === 0 ? (
            <div className="empty-state"><p>Sin datos</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={conteoOrdenes}
                    dataKey="total"
                    nameKey="_id"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {conteoOrdenes.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: 8 }}
                    formatter={(v, n) => [v, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="conteo-lista">
                {conteoOrdenes.map((item, i) => (
                  <div key={i} className="conteo-item">
                    <span className="conteo-dot" style={{ background: COLORES[i % COLORES.length] }} />
                    <span className="conteo-label">{item._id}</span>
                    <span className="conteo-valor">{item.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reseñas por calificación */}
        <div className="reporte-card">
          <div className="reporte-header">
            <Star size={18} className="reporte-icon" />
            <h3>Reseñas por Calificación</h3>
          </div>
          {conteoResenas.length === 0 ? (
            <div className="empty-state"><p>Sin datos</p></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={conteoResenas} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                  <XAxis
                    dataKey="_id"
                    tick={{ fill: '#9a9690', fontSize: 14 }}
                    tickFormatter={v => '⭐'.repeat(v)}
                  />
                  <YAxis tick={{ fill: '#9a9690', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1f1f1f', border: '1px solid #2e2e2e', borderRadius: 8 }}
                    formatter={(v) => [v, 'Reseñas']}
                    labelFormatter={(v) => `${'⭐'.repeat(v)} (${v} estrellas)`}
                  />
                  <Bar dataKey="total" fill="#e8a847" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="conteo-lista">
                {conteoResenas.map((item, i) => (
                  <div key={i} className="conteo-item">
                    <span>{'⭐'.repeat(item._id)}</span>
                    <span className="conteo-valor">{item.total} reseñas</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* MongoDB Charts Dashboard */}
        <div className="reporte-card reporte-wide" style={{ padding: 0, overflow: 'hidden', height: '600px' }}>
          <div className="reporte-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <BarChart3 size={18} className="reporte-icon" />
            <h3>MongoDB Charts Dashboard</h3>
          </div>
          <iframe
            style={{ border: 'none', width: '100%', height: 'calc(100% - 61px)' }}
            src="https://charts.mongodb.com/charts-project-0-fykxutr/embed/dashboards?id=68bfe0bf-6ca2-429e-a2bf-a4d8d1bacddd&theme=dark&autoRefresh=true&maxDataAge=14400&showTitleAndDesc=false&scalingWidth=fixed&scalingHeight=fixed"
          />
        </div>

      </div>
    </div>
  )
}