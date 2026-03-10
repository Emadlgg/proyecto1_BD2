import axios from 'axios'
const BASE = 'http://localhost:3000/api/admin'
export const getExplain = () => axios.get(`${BASE}/explain`)
export const getEmbebido = () => axios.get(`${BASE}/embebido`)
export const getReferenciado = () => axios.get(`${BASE}/referenciado`)
export const getStats = () => axios.get(`${BASE}/stats`)
export const ejecutarTransaccion = () => axios.post(`${BASE}/transaccion`)
export const ejecutarBulk = () => axios.post(`${BASE}/bulk`)