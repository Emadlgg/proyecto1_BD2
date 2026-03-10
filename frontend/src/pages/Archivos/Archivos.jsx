import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { subirArchivo, listarArchivos, eliminarArchivo, getDownloadUrl } from '../../api/archivos'
import { getRestaurantes } from '../../api/restaurantes'
import './Archivos.css'

export default function Archivos() {
  const [restaurantes, setRestaurantes] = useState([])
  const [restauranteId, setRestauranteId] = useState('')
  const [archivos, setArchivos] = useState([])
  const [loading, setLoading] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef()

  const cargarRestaurantes = async () => {
    try {
      const res = await getRestaurantes({ limit: 100 })
      setRestaurantes(res.data)
    } catch (e) { console.error(e) }
  }

  const cargarArchivos = async () => {
    if (!restauranteId) return
    setLoading(true)
    try {
      const res = await listarArchivos(restauranteId)
      setArchivos(res.data)
    } catch { toast.error('Error cargando archivos') }
    finally { setLoading(false) }
  }

  useEffect(() => { cargarRestaurantes() }, [])
  useEffect(() => { cargarArchivos() }, [restauranteId])

  const onFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!restauranteId) return toast.error('Selecciona un restaurante primero')
    if (!file.type.startsWith('image/')) return toast.error('Solo se permiten imágenes')

    setSubiendo(true)
    try {
      await subirArchivo(restauranteId, file)
      toast.success('Imagen subida correctamente')
      cargarArchivos()
    } catch { toast.error('Error subiendo imagen') }
    finally { setSubiendo(false); e.target.value = '' }
  }

  const eliminar = async (fileId) => {
    if (!confirm('¿Eliminar esta imagen?')) return
    try {
      await eliminarArchivo(fileId)
      toast.success('Imagen eliminada')
      cargarArchivos()
    } catch { toast.error('Error eliminando imagen') }
  }

  const restauranteNombre = restaurantes.find(r => r._id === restauranteId)?.nombre

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Archivos</h2>
          <p className="page-subtitle">Gestión de imágenes con GridFS</p>
        </div>
      </div>

      <div className="archivos-top">
        <select
          value={restauranteId}
          onChange={e => setRestauranteId(e.target.value)}
          className="filtro-select archivos-select"
        >
          <option value="">Seleccionar restaurante</option>
          {restaurantes.map(r => <option key={r._id} value={r._id}>{r.nombre}</option>)}
        </select>

        {restauranteId && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: 'none' }}
            />
            <button
              className="btn-primary"
              onClick={() => inputRef.current.click()}
              disabled={subiendo}
            >
              <Upload size={16} />
              {subiendo ? 'Subiendo...' : 'Subir imagen'}
            </button>
          </>
        )}
      </div>

      {!restauranteId ? (
        <div className="empty-state">
          <span>🖼️</span>
          <p>Selecciona un restaurante para ver sus imágenes</p>
        </div>
      ) : loading ? (
        <div className="loading">Cargando imágenes...</div>
      ) : archivos.length === 0 ? (
        <div className="empty-state">
          <span>📂</span>
          <p>No hay imágenes para {restauranteNombre}</p>
        </div>
      ) : (
        <>
          <p className="archivos-count">{archivos.length} imagen{archivos.length !== 1 ? 'es' : ''} de <strong>{restauranteNombre}</strong></p>
          <div className="archivos-grid">
            {archivos.map(a => (
              <div key={a._id} className="archivo-card">
                <div className="archivo-img-wrap" onClick={() => setPreview(a)}>
                  <img
                    src={getDownloadUrl(a._id)}
                    alt={a.filename}
                    className="archivo-img"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                  />
                  <div className="archivo-placeholder" style={{ display: 'none' }}>
                    <Image size={32} />
                  </div>
                </div>
                <div className="archivo-info">
                  <span className="archivo-nombre">{a.filename}</span>
                  <span className="archivo-size">{(a.length / 1024).toFixed(1)} KB</span>
                </div>
                <button className="btn-danger btn-sm archivo-delete" onClick={() => eliminar(a._id)}>
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setPreview(null)}><X size={20} /></button>
            <img src={getDownloadUrl(preview._id)} alt={preview.filename} className="preview-img" />
            <p className="preview-nombre">{preview.filename}</p>
          </div>
        </div>
      )}
    </div>
  )
}