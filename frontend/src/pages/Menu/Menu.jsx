import { useState, useEffect } from 'react'
import { Plus, Search, X, Check, Pencil, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import {getMenuUnicos, getMenuCount, createArticulo, updateArticulo, deleteArticulo } from '../../api/menu'
import { getRestaurantes } from '../../api/restaurantes'
import Pagination from '../../components/Pagination'
import './Menu.css'

const estadoInicial = { nombre: '', descripcion: '', categoria: '', precio: '', disponible: true, restauranteId: '' }

export default function Menu() {
  const [articulos, setArticulos] = useState([])
  const [restaurantes, setRestaurantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroRestaurante, setFiltroRestaurante] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(estadoInicial)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const limit = 15

  const cargarRestaurantes = async () => {
    try {
      const res = await getRestaurantes({ limit: 100 })
      setRestaurantes(res.data)
    } catch (e) { console.error(e) }
  }

const cargar = async () => {
  setLoading(true)
  try {
    const params = {
      skip: page * limit,
      limit,
      restauranteId: filtroRestaurante || undefined,
      categoria: filtroCategoria || undefined
    }

    const [menuRes, countRes] = await Promise.all([
      getMenuUnicos(params),
      getMenuCount({
        restauranteId: filtroRestaurante || undefined,
        categoria: filtroCategoria || undefined
      })
    ])

    setArticulos(menuRes.data)
    setTotal(countRes.data.total)
  } catch (e) {
    console.error(e)
    toast.error('Error cargando menú')
  } finally { setLoading(false) }
}

  useEffect(() => { cargarRestaurantes() }, [])
  useEffect(() => { cargar() }, [page, filtroRestaurante, filtroCategoria])

  const filtrados = articulos.filter(a =>
    a.nombre?.toLowerCase().includes(search.toLowerCase())
  )

  const abrirCrear = () => { setForm(estadoInicial); setEditando(null); setShowModal(true) }
  const abrirEditar = (a) => {
    setForm({
      nombre: a.nombre, descripcion: a.descripcion,
      categoria: a.categoria, precio: a.precio,
      disponible: a.disponible, restauranteId: a.restauranteId
    })
    setEditando(a._id)
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.nombre.trim()) return toast.error('El nombre es requerido')
    if (!form.restauranteId) return toast.error('Selecciona un restaurante')
    if (!form.precio) return toast.error('El precio es requerido')
    try {
      const data = { ...form, precio: parseFloat(form.precio) }
      if (editando) {
        await updateArticulo(editando, data)
        toast.success('Artículo actualizado')
      } else {
        await createArticulo(data)
        toast.success('Artículo creado')
      }
      setShowModal(false)
      cargar()
    } catch { toast.error('Error guardando artículo') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este artículo?')) return
    try {
      await deleteArticulo(id)
      toast.success('Artículo eliminado')
      cargar()
    } catch { toast.error('Error eliminando artículo') }
  }

  const categorias = [...new Set(articulos.map(a => a.categoria))].sort()

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Menú</h2>
          <p className="page-subtitle">{total.toLocaleString()} artículos en total</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="menu-filtros">
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            placeholder="Buscar platillo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={filtroRestaurante}
          onChange={e => { setFiltroRestaurante(e.target.value); setPage(0) }}
          className="filtro-select"
        >
          <option value="">Todos los restaurantes</option>
          {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
        </select>
        <select
          value={filtroCategoria}
          onChange={e => { setFiltroCategoria(e.target.value); setPage(0) }}
          className="filtro-select"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando menú...</div>
      ) : filtrados.length === 0 ? (
        <div className="empty-state"><span>📋</span><p>No hay artículos</p></div>
      ) : (
        <div className="menu-grid">
          {filtrados.map(a => (
            <div key={a._id} className="menu-card">
              <div className="menu-card-top">
                <div>
                  <h3 className="menu-nombre">{a.nombre}</h3>
                  <p className="menu-desc">{a.descripcion}</p>
                </div>
                <span className={`badge ${a.disponible ? 'badge-success' : 'badge-error'}`}>
                  {a.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <div className="menu-meta">
                <span className="meta-item"><Tag size={12} />{a.categoria}</span>
                <span className="menu-precio">Q{a.precio?.toFixed(2)}</span>
              </div>
              <div className="restaurante-actions">
                <button className="btn-secondary btn-sm" onClick={() => abrirEditar(a)}>
                  <Pencil size={13} /> Editar
                </button>
                <button className="btn-danger btn-sm" onClick={() => eliminar(a._id)}>
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        setPage={setPage}
        hasMore={articulos.length >= limit}
        total={total}
        limit={limit}
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Restaurante *</label>
                <select value={form.restauranteId} onChange={e => setForm(p => ({ ...p, restauranteId: e.target.value }))}>
                  <option value="">Seleccionar restaurante</option>
                  {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del platillo" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea rows={2} value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción del platillo" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <input value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} placeholder="Plato fuerte, Postre..." />
                </div>
                <div className="form-group">
                  <label>Precio (Q) *</label>
                  <input type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <div className="form-group">
                <label>Disponibilidad</label>
                <select value={form.disponible} onChange={e => setForm(p => ({ ...p, disponible: e.target.value === 'true' }))}>
                  <option value="true">Disponible</option>
                  <option value="false">No disponible</option>
                </select>
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