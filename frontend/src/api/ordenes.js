import axios from 'axios'
const BASE = 'http://localhost:3000/api/ordenes'
export const getOrdenes = (params) => axios.get(BASE, { params })
export const getOrdenById = (id) => axios.get(`${BASE}/${id}`)
export const createOrden = (data) => axios.post(BASE, data)
export const updateOrden = (id, data) => axios.put(`${BASE}/${id}`, data)
export const deleteOrden = (id) => axios.delete(`${BASE}/${id}`)
export const agregarItem = (id, item) => axios.put(`${BASE}/${id}/items/add`, item)
export const quitarItem = (id, data) => axios.put(`${BASE}/${id}/items/remove`, data)
export const actualizarCantidadItem = (id, data) =>
  axios.put(`${BASE}/${id}/items/update`, data)