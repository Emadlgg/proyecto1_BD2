import { useState, useEffect } from 'react'
import { Plus, Search, X, Check, Trash2, Pencil, Mail, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../api/usuarios'
import Modal from '../../components/Modal'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import './Usuarios.css'

const estadoInicial = { nombre: '', email: '' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
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
      const res = await getUsuarios({ skip: page * limit, limit, sort: 'nombre' })
      setUsuarios(res.data)
    } catch { toast.error('Error cargando usuarios') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [page])

  const filtrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const abrirCrear = () => { setForm(estadoInicial); setEditando(null); setShowModal(true) }
  const abrirEditar = (u) => { setForm({ nombre: u.nombre, email: u.email }); setEditando(u._id); setShowModal(true) }

  const guardar = async () => {
    if (!form.nombre.trim()) return toast.error('El nombre es requerido')
    if (!form.email.trim()) return toast.error('El email es requerido')
    try {
      if (editando) {
        await updateUsuario(editando, form)
        toast.success('Usuario actualizado')
      } else {
        await createUsuario(form)
        toast.success('Usuario creado')
      }
      setShowModal(false)
      cargar()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error guardando usuario')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try {
      await deleteUsuario(id)
      toast.success('Usuario eliminado')
      cargar()
    } catch { toast.error('Error eliminando usuario') }
  }

  const columnas = [
    {
      key: 'nombre',
      label: 'Usuario',
      render: (val, row) => (
        <div className="usuario-cell">
          <div className="usuario-avatar-sm">
            {val?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="cell-nombre">{val}</div>
            <div className="cell-sub"><Mail size={11} /> {row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'totalOrdenes',
      label: 'Órdenes',
      width: '100px',
      render: (val) => (
        <span className="cell-ordenes"><ShoppingBag size={12} /> {val || 0}</span>
      )
    },
    {
      key: '_id',
      label: 'Acciones',
      width: '120px',
      render: (val, row) => (
        <div className="cell-actions">
          <button className="btn-secondary btn-sm" onClick={e => { e.stopPropagation(); abrirEditar(row) }}>
            <Pencil size={13} />
          </button>
          <button className="btn-danger btn-sm" onClick={e => { e.stopPropagation(); eliminar(val) }}>
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Usuarios</h2>
          <p className="page-subtitle">{filtrados.length} usuarios encontrados</p>
        </div>
        <button className="btn-primary" onClick={abrirCrear}>
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: 24 }}>
        <Search size={16} className="search-icon" />
        <input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
      </div>

      <Table
        columns={columnas}
        data={filtrados}
        loading={loading}
        emptyIcon="👤"
        emptyText="No hay usuarios"
      />

      <Pagination page={page} setPage={setPage} hasMore={usuarios.length >= limit} />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editando ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={guardar}>
              <Check size={15} /> {editando ? 'Actualizar' : 'Crear'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Nombre *</label>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo" />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" />
        </div>
      </Modal>
    </div>
  )
}