import axios from 'axios'
const BASE = 'http://localhost:3000/api/menu'
export const getMenu = (params) => axios.get(BASE, { params })
export const getCategorias = (restauranteId) => axios.get(`${BASE}/categorias/${restauranteId}`)
export const createArticulo = (data) => axios.post(BASE, data)
export const updateArticulo = (id, data) => axios.put(`${BASE}/${id}`, data)
export const deleteArticulo = (id) => axios.delete(`${BASE}/${id}`)
export const getMenuCount = (params) => axios.get(`${BASE}/count`, { params })
export const getMenuUnicos = (params) => axios.get(`${BASE}/unicos`, { params })