import axios from 'axios'
const BASE = 'http://localhost:3000/api/archivos'
export const subirArchivo = (restauranteId, file) => {
  const formData = new FormData()
  formData.append('imagen', file)
  return axios.post(`${BASE}/upload/${restauranteId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const listarArchivos = (restauranteId) => axios.get(`${BASE}/list/${restauranteId}`)
export const eliminarArchivo = (fileId) => axios.delete(`${BASE}/${fileId}`)
export const getDownloadUrl = (fileId) => `${BASE}/download/${fileId}`