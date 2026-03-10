import { useState, useEffect } from 'react'
import { Plus, X, Check, Trash2, Pencil, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { getResenas, createResena, updateResena, deleteResena } from '../../api/resenas'
import { getRestaurantes } from '../../api/restaurantes'
import { getUsuarios } from '../../api/usuarios'
import Pagination from '../../components/Pagination'
import './Resenas.css'

const estadoInicial = { userId: '', restauranteId: '', calificacion: 5, comentario: '' }

function Estrellas({ valor, onChange }) {
  return (
    <div className="estrellas">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          className={`estrella ${n <= valor ? 'estrella--activa' : ''}`}
          onClick={() => onChange && onChange(n)}
        >
          <Star size={20} fill={n <= valor ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default function Resenas() {
  const [resenas, setResenas] = useState([])
  const [restaurantes, setRestaurantes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroRestaurante, setFiltroRestaurante] = useState('')
  const [filtroCalificacion, setFiltroCalificacion] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(estadoInicial)
  const [page, setPage] = useState(0)
  const limit = 10

  const cargar = async () => {
    setLoading(true)
    try {
      const params = { skip: page * limit, limit }
      if (filtroRestaurante) params.restauranteId = filtroRestaurante
      if (filtroCalificacion) params.calificacion = filtroCalificacion
      const res = await getResenas(params)
      setResenas(res.data)
    } catch { toast.error('Error cargando reseñas') }
    finally { setLoading(false) }
  }

  const cargarCatalogos = async () => {
    try {
      const [r, u] = await Promise.all([
        getRestaurantes({ limit: 100 }),
        getUsuarios({ limit: 100 })
      ])
      setRestaurantes(r.data)
      setUsuarios(u.data)
    } catch (e) { console.error(e) }
  }

  useEffect(() => { cargarCatalogos() }, [])
  useEffect(() => { cargar() }, [page, filtroRestaurante, filtroCalificacion])

  const abrirCrear = () => { setForm(estadoInicial); setEditando(null); setShowModal(true) }
  const abrirEditar = (r) => {
    setForm({ userId: r.userId, restauranteId: r.restauranteId, calificacion: r.calificacion, comentario: r.comentario })
    setEditando(r._id)
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.userId) return toast.error('Selecciona un usuario')
    if (!form.restauranteId) return toast.error('Selecciona un restaurante')
    if (!form.comentario.trim()) return toast.error('El comentario es requerido')
    try {
      if (editando) {
        await updateResena(editando, form)
        toast.success('Reseña actualizada')
      } else {
        await createResena(form)
        toast.success('Reseña creada')
      }
      setShowModal(false)
      cargar()
    } catch { toast.error('Error guardando reseña') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    try {
      await deleteResena(id)
      toast.success('Reseña eliminada')
      cargar()
    } catch { toast.error('Error eliminando reseña') }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reseñas</h2>
          <p className="page-subtitle">{resenas.length} reseñas encontradas</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="ordenes-filtros">
        <select value={filtroRestaurante} onChange={e => { setFiltroRestaurante(e.target.value); setPage(0) }} className="filtro-select">
          <option value="">Todos los restaurantes</option>
          {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
        </select>
        <select value={filtroCalificacion} onChange={e => { setFiltroCalificacion(e.target.value); setPage(0) }} className="filtro-select">
          <option value="">Todas las calificaciones</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando reseñas...</div>
      ) : resenas.length === 0 ? (
        <div className="empty-state"><span>⭐</span><p>No hay reseñas</p></div>
      ) : (
        <div className="resenas-lista">
          {resenas.map(r => (
            <div key={r._id} className="resena-card">
              <div className="resena-header">
                <div className="resena-info">
                  <span className="resena-usuario">{r.usuario?.nombre || 'Usuario'}</span>
                  <span className="resena-restaurante">{r.restaurante?.nombre || 'Restaurante'}</span>
                </div>
                <div className="resena-right">
                  <Estrellas valor={r.calificacion} />
                  <div className="resena-actions">
                    <button className="btn-secondary btn-sm" onClick={() => abrirEditar(r)}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => eliminar(r._id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
              <p className="resena-comentario">"{r.comentario}"</p>
              <span className="resena-fecha">{new Date(r.fecha).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} setPage={setPage} hasMore={resenas.length >= limit} />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Reseña' : 'Nueva Reseña'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Usuario *</label>
                  <select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map(u => <option key={u._id} value={u._id}>{u.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Restaurante *</label>
                  <select value={form.restauranteId} onChange={e => setForm(p => ({ ...p, restauranteId: e.target.value }))}>
                    <option value="">Seleccionar restaurante</option>
                    {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Calificación</label>
                <Estrellas valor={form.calificacion} onChange={v => setForm(p => ({ ...p, calificacion: v }))} />
              </div>
              <div className="form-group">
                <label>Comentario *</label>
                <textarea rows={3} value={form.comentario} onChange={e => setForm(p => ({ ...p, comentario: e.target.value }))} placeholder="Escribe tu reseña..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}>
                <Check size={15} /> {editando ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}