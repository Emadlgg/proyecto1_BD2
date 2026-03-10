import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Clock, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRestaurantes, createRestaurante, updateRestaurante, deleteRestaurante, buscarPorTexto } from '../../api/restaurantes'
import './Restaurantes.css'

const estadoInicial = {
  nombre: '', descripcion: '',
  direccion: { calle: '', ciudad: '', pais: 'Guatemala' },
  ubicacion: { type: 'Point', coordinates: [-90.5133, 14.6349] },
  horario: '', activo: true
}

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(estadoInicial)
  const [page, setPage] = useState(0)
  const limit = 12

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await getRestaurantes({ skip: page * limit, limit })
      setRestaurantes(res.data)
    } catch { toast.error('Error cargando restaurantes') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [page])

  const buscar = async () => {
    if (!search.trim()) return cargar()
    setLoading(true)
    try {
      const res = await buscarPorTexto(search)
      setRestaurantes(res.data)
    } catch { toast.error('Error en búsqueda') }
    finally { setLoading(false) }
  }

  const abrirCrear = () => { setForm(estadoInicial); setEditando(null); setShowModal(true) }
  const abrirEditar = (r) => {
    setForm({
      nombre: r.nombre, descripcion: r.descripcion,
      direccion: r.direccion,
      ubicacion: r.ubicacion,
      horario: r.horario, activo: r.activo
    })
    setEditando(r._id)
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) return toast.error('El nombre es requerido')
    try {
      if (editando) {
        await updateRestaurante(editando, form)
        toast.success('Restaurante actualizado')
      } else {
        await createRestaurante(form)
        toast.success('Restaurante creado')
      }
      setShowModal(false)
      cargar()
    } catch { toast.error('Error guardando restaurante') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este restaurante?')) return
    try {
      await deleteRestaurante(id)
      toast.success('Restaurante eliminado')
      cargar()
    } catch { toast.error('Error eliminando restaurante') }
  }

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const setDireccion = (field, value) => setForm(prev => ({
    ...prev, direccion: { ...prev.direccion, [field]: value }
  }))

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Restaurantes</h2>
          <p className="page-subtitle">{restaurantes.length} restaurantes encontrados</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input
          placeholder="Buscar por nombre o descripción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && buscar()}
        />
        {search && (
          <button className="search-clear" onClick={() => { setSearch(''); cargar() }}>
            <X size={14} />
          </button>
        )}
        <button className="btn-primary search-btn" onClick={buscar}>Buscar</button>
      </div>

      {loading ? (
        <div className="loading">Cargando restaurantes...</div>
      ) : restaurantes.length === 0 ? (
        <div className="empty-state"><span>🍽️</span><p>No hay restaurantes</p></div>
      ) : (
        <div className="restaurantes-grid">
          {restaurantes.map(r => (
            <div key={r._id} className="restaurante-card">
              <div className="restaurante-card-header">
                <div className="restaurante-info">
                  <h3 className="restaurante-nombre">{r.nombre}</h3>
                  <p className="restaurante-desc">{r.descripcion}</p>
                </div>
                <span className={`badge ${r.activo ? 'badge-success' : 'badge-error'}`}>
                  {r.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="restaurante-meta">
                <span className="meta-item">
                  <MapPin size={13} />
                  {r.direccion?.ciudad}, {r.direccion?.pais}
                </span>
                <span className="meta-item">
                  <Clock size={13} />
                  {r.horario}
                </span>
              </div>
              <div className="restaurante-actions">
                <button className="btn-secondary btn-sm" onClick={() => abrirEditar(r)}>
                  <Pencil size={13} /> Editar
                </button>
                <button className="btn-danger btn-sm" onClick={() => eliminar(r._id)}>
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button className="btn-secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
          Anterior
        </button>
        <span className="page-num">Página {page + 1}</span>
        <button className="btn-secondary" onClick={() => setPage(p => p + 1)} disabled={restaurantes.length < limit}>
          Siguiente
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Nombre del restaurante" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows={2} value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} placeholder="Descripción breve" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Calle</label>
                  <input value={form.direccion.calle} onChange={e => setDireccion('calle', e.target.value)} placeholder="Av. Principal 100" />
                </div>
                <div className="form-group">
                  <label>Ciudad</label>
                  <input value={form.direccion.ciudad} onChange={e => setDireccion('ciudad', e.target.value)} placeholder="Guatemala" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Horario</label>
                  <input value={form.horario} onChange={e => setField('horario', e.target.value)} placeholder="09:00-22:00" />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={form.activo} onChange={e => setField('activo', e.target.value === 'true')}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
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