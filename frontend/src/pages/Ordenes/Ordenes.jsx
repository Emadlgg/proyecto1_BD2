import { useState, useEffect } from 'react'
import { Plus, Search, X, Check, Trash2, ShoppingCart, ChevronDown, ChevronUp, PlusCircle, MinusCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getOrdenes, createOrden, updateOrden, deleteOrden, agregarItem, quitarItem } from '../../api/ordenes'
import { getRestaurantes } from '../../api/restaurantes'
import { getUsuarios } from '../../api/usuarios'
import { getMenuUnicos } from '../../api/menu'
import Pagination from '../../components/Pagination'
import './Ordenes.css'

const ESTADOS = ['pendiente', 'confirmado', 'en preparación', 'entregado', 'cancelado']

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([])
  const [restaurantes, setRestaurantes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroRestaurante, setFiltroRestaurante] = useState('')
  const [expandida, setExpandida] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
  const [menuRestaurante, setMenuRestaurante] = useState([])
  const [page, setPage] = useState(0)
  const limit = 10

  const [form, setForm] = useState({
    userId: '', restauranteId: '', items: []
  })
  const [itemForm, setItemForm] = useState({
    articuloId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0
  })

  const cargar = async () => {
    setLoading(true)
    try {
      const params = { skip: page * limit, limit }
      if (filtroEstado) params.estado = filtroEstado
      if (filtroRestaurante) params.restauranteId = filtroRestaurante
      const res = await getOrdenes(params)
      setOrdenes(res.data)
    } catch { toast.error('Error cargando órdenes') }
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
  useEffect(() => { cargar() }, [page, filtroEstado, filtroRestaurante])

  const cargarMenu = async (restauranteId) => {
    try {
      const res = await getMenuUnicos({ restauranteId, limit: 100 })
      setMenuRestaurante(res.data)
    } catch (e) { console.error(e) }
  }

  const abrirCrear = () => {
    setForm({ userId: '', restauranteId: '', items: [] })
    setShowModal(true)
  }

  const onRestauranteChange = (id) => {
    setForm(p => ({ ...p, restauranteId: id, items: [] }))
    if (id) cargarMenu(id)
  }

  const agregarItemAlForm = () => {
    if (!itemForm.articuloId) return toast.error('Selecciona un artículo')
    if (itemForm.cantidad < 1) return toast.error('La cantidad debe ser mayor a 0')
    const articulo = menuRestaurante.find(a => a._id === itemForm.articuloId)
    if (!articulo) return
    const subtotal = parseFloat((articulo.precio * itemForm.cantidad).toFixed(2))
    const nuevoItem = {
      articuloId: articulo._id,
      nombre: articulo.nombre,
      cantidad: parseInt(itemForm.cantidad),
      precioUnitario: articulo.precio,
      subtotal
    }
    setForm(p => ({ ...p, items: [...p.items, nuevoItem] }))
    setItemForm({ articuloId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 })
  }

  const quitarItemDelForm = (idx) => {
    setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))
  }

  const guardar = async () => {
    if (!form.userId) return toast.error('Selecciona un usuario')
    if (!form.restauranteId) return toast.error('Selecciona un restaurante')
    if (form.items.length === 0) return toast.error('Agrega al menos un ítem')
    try {
      await createOrden(form)
      toast.success('Orden creada con transacción exitosa')
      setShowModal(false)
      cargar()
    } catch { toast.error('Error creando orden') }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await updateOrden(id, { estado })
      toast.success('Estado actualizado')
      cargar()
    } catch { toast.error('Error actualizando estado') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta orden?')) return
    try {
      await deleteOrden(id)
      toast.success('Orden eliminada')
      cargar()
    } catch { toast.error('Error eliminando orden') }
  }

  const abrirAgregarItem = (orden) => {
    setOrdenSeleccionada(orden)
    cargarMenu(orden.restaurante?._id || orden.restauranteId)
    setItemForm({ articuloId: '', cantidad: 1 })
    setShowItemModal(true)
  }

  const confirmarAgregarItem = async () => {
    const articulo = menuRestaurante.find(a => a._id === itemForm.articuloId)
    if (!articulo) return toast.error('Selecciona un artículo')
    const subtotal = parseFloat((articulo.precio * itemForm.cantidad).toFixed(2))
    try {
      await agregarItem(ordenSeleccionada._id, {
        articuloId: articulo._id,
        nombre: articulo.nombre,
        cantidad: parseInt(itemForm.cantidad),
        precioUnitario: articulo.precio,
        subtotal
      })
      toast.success('Ítem agregado')
      setShowItemModal(false)
      cargar()
    } catch { toast.error('Error agregando ítem') }
  }

  const confirmarQuitarItem = async (orden, articuloId, subtotal) => {
    if (!confirm('¿Quitar este ítem de la orden?')) return
    try {
      await quitarItem(orden._id, { articuloId, subtotal })
      toast.success('Ítem removido')
      cargar()
    } catch { toast.error('Error removiendo ítem') }
  }

  const montoTotal = form.items.reduce((s, i) => s + i.subtotal, 0)

  const getBadgeEstado = (estado) => {
    const map = {
      pendiente: 'badge-warning',
      confirmado: 'badge-accent',
      'en preparación': 'badge-accent',
      entregado: 'badge-success',
      cancelado: 'badge-error'
    }
    return map[estado] || 'badge-warning'
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Órdenes</h2>
          <p className="page-subtitle">{ordenes.length} órdenes encontradas</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>
          <Plus size={16} /> Nueva Orden
        </button>
      </div>

      <div className="ordenes-filtros">
        <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(0) }} className="filtro-select">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filtroRestaurante} onChange={e => { setFiltroRestaurante(e.target.value); setPage(0) }} className="filtro-select">
          <option value="">Todos los restaurantes</option>
          {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando órdenes...</div>
      ) : ordenes.length === 0 ? (
        <div className="empty-state"><span>🛒</span><p>No hay órdenes</p></div>
      ) : (
        <div className="ordenes-lista">
          {ordenes.map(o => (
            <div key={o._id} className="orden-card">
              <div className="orden-header" onClick={() => setExpandida(expandida === o._id ? null : o._id)}>
                <div className="orden-info">
                  <div className="orden-top">
                    <span className="orden-id">#{o._id?.slice(-6).toUpperCase()}</span>
                    <span className={`badge ${getBadgeEstado(o.estado)}`}>{o.estado}</span>
                  </div>
                  <div className="orden-meta">
                    <span>{o.usuario?.nombre || 'Usuario'}</span>
                    <span>·</span>
                    <span>{o.restaurante?.nombre || 'Restaurante'}</span>
                    <span>·</span>
                    <span>{new Date(o.fecha).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="orden-right">
                  <span className="orden-monto">Q{o.montoTotal?.toFixed(2)}</span>
                  {expandida === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expandida === o._id && (
                <div className="orden-detalle">
                  <div className="orden-items">
                    {o.items?.map((item, i) => (
                      <div key={i} className="orden-item">
                        <span className="item-nombre">{item.nombre}</span>
                        <span className="item-cantidad">x{item.cantidad}</span>
                        <span className="item-precio">Q{item.subtotal?.toFixed(2)}</span>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => confirmarQuitarItem(o, item.articuloId, item.subtotal)}
                        >
                          <MinusCircle size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="orden-acciones">
                    <select
                      value={o.estado}
                      onChange={e => cambiarEstado(o._id, e.target.value)}
                      className="estado-select"
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <button className="btn-secondary btn-sm" onClick={() => abrirAgregarItem(o)}>
                      <PlusCircle size={13} /> Agregar ítem
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => eliminar(o._id)}>
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} setPage={setPage} hasMore={ordenes.length >= limit} />

      {/* Modal nueva orden */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Orden</h3>
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
                  <select value={form.restauranteId} onChange={e => onRestauranteChange(e.target.value)}>
                    <option value="">Seleccionar restaurante</option>
                    {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
                  </select>
                </div>
              </div>

              {form.restauranteId && (
                <div className="agregar-item-form">
                  <h4>Agregar ítem</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Platillo</label>
                      <select value={itemForm.articuloId} onChange={e => setItemForm(p => ({ ...p, articuloId: e.target.value }))}>
                        <option value="">Seleccionar platillo</option>
                        {menuRestaurante.map(a => (
                          <option key={a._id} value={a._id}>{a.nombre} - Q{a.precio?.toFixed(2)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cantidad</label>
                      <input
                        type="number" min="1" value={itemForm.cantidad}
                        onChange={e => setItemForm(p => ({ ...p, cantidad: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button className="btn-secondary btn-sm" onClick={agregarItemAlForm}>
                    <PlusCircle size={13} /> Agregar
                  </button>
                </div>
              )}

              {form.items.length > 0 && (
                <div className="items-preview">
                  <h4>Ítems de la orden</h4>
                  {form.items.map((item, i) => (
                    <div key={i} className="orden-item">
                      <span className="item-nombre">{item.nombre}</span>
                      <span className="item-cantidad">x{item.cantidad}</span>
                      <span className="item-precio">Q{item.subtotal?.toFixed(2)}</span>
                      <button className="btn-danger btn-sm" onClick={() => quitarItemDelForm(i)}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <div className="items-total">Total: <strong>Q{montoTotal.toFixed(2)}</strong></div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={guardar}>
                <Check size={15} /> Crear Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar ítem a orden existente */}
      {showItemModal && (
        <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar ítem a orden</h3>
              <button className="modal-close" onClick={() => setShowItemModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Platillo</label>
                <select value={itemForm.articuloId} onChange={e => setItemForm(p => ({ ...p, articuloId: e.target.value }))}>
                  <option value="">Seleccionar platillo</option>
                  {menuRestaurante.map(a => (
                    <option key={a._id} value={a._id}>{a.nombre} - Q{a.precio?.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad</label>
                <input type="number" min="1" value={itemForm.cantidad} onChange={e => setItemForm(p => ({ ...p, cantidad: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowItemModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmarAgregarItem}>
                <Check size={15} /> Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}