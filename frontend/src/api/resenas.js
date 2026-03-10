import axios from 'axios'
const BASE = 'http://localhost:3000/api/resenas'
export const getResenas = (params) => axios.get(BASE, { params })
export const createResena = (data) => axios.post(BASE, data)
export const updateResena = (id, data) => axios.put(`${BASE}/${id}`, data)
export const deleteResena = (id) => axios.delete(`${BASE}/${id}`)