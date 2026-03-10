import axios from 'axios'
const BASE = 'http://localhost:3000/api/reportes'
export const getMejoresRestaurantes = () => axios.get(`${BASE}/mejores-restaurantes`)
export const getPlatillosVendidos = () => axios.get(`${BASE}/platillos-vendidos`)
export const getOrdenesDetalle = (params) => axios.get(`${BASE}/ordenes-detalle`, { params })
export const getConteoOrdenes = () => axios.get(`${BASE}/conteo-ordenes`)
export const getConteoResenas = () => axios.get(`${BASE}/conteo-resenas`)