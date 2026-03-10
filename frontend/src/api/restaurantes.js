import axios from 'axios'

const BASE = 'http://localhost:3000/api/restaurantes'

export const getRestaurantes = (params) => axios.get(BASE, { params })
export const getRestauranteById = (id) => axios.get(`${BASE}/${id}`)
export const buscarPorTexto = (q) => axios.get(`${BASE}/buscar/texto`, { params: { q } })
export const getRestaurantesCercanos = (lng, lat, distancia) =>
  axios.get(`${BASE}/buscar/cercanos`, { params: { lng, lat, distancia } })
export const createRestaurante = (data) => axios.post(BASE, data)
export const updateRestaurante = (id, data) => axios.put(`${BASE}/${id}`, data)
export const deleteRestaurante = (id) => axios.delete(`${BASE}/${id}`)