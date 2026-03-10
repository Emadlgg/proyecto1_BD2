import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Restaurantes from './pages/Restaurantes/Restaurantes'
import Usuarios from './pages/Usuarios/Usuarios'
import Menu from './pages/Menu/Menu'
import Ordenes from './pages/Ordenes/Ordenes'
import Resenas from './pages/Resenas/Resenas'
import Reportes from './pages/Reportes/Reportes'
import Archivos from './pages/Archivos/Archivos'
import Admin from './pages/Admin/Admin'

import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f1f1f',
            color: '#f0ede6',
            border: '1px solid #2e2e2e',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#4caf7d', secondary: '#1f1f1f' } },
          error: { iconTheme: { primary: '#e05252', secondary: '#1f1f1f' } },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/restaurantes" replace />} />
            <Route path="/restaurantes" element={<Restaurantes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/resenas" element={<Resenas />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/archivos" element={<Archivos />} />
            <Route path="/admin" element={<Admin />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}