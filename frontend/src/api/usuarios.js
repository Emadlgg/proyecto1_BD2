import axios from 'axios'
const BASE = 'http://localhost:3000/api/usuarios'
export const getUsuarios = (params) => axios.get(BASE, { params })
export const getUsuarioById = (id) => axios.get(`${BASE}/${id}`)
export const getUsuarioByEmail = (email) => axios.get(`${BASE}/email/${email}`)
export const createUsuario = (data) => axios.post(BASE, data)
export const updateUsuario = (id, data) => axios.put(`${BASE}/${id}`, data)
export const deleteUsuario = (id) => axios.delete(`${BASE}/${id}`)