import { NavLink } from 'react-router-dom'
import { UtensilsCrossed, Users, BookOpen, ShoppingCart, Star, BarChart3, ChefHat, FolderOpen, Shield } from 'lucide-react'
import './Sidebar.css'

const links = [
  { to: '/restaurantes', icon: UtensilsCrossed, label: 'Restaurantes' },
  { to: '/usuarios', icon: Users, label: 'Usuarios' },
  { to: '/menu', icon: BookOpen, label: 'Menú' },
  { to: '/ordenes', icon: ShoppingCart, label: 'Órdenes' },
  { to: '/resenas', icon: Star, label: 'Reseñas' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/archivos', icon: FolderOpen, label: 'Archivos' },
  { to: '/admin', icon: Shield, label: 'Admin' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <ChefHat size={28} color="var(--accent)" />
        <div>
          <h1 className="logo-title">RestaurantDB</h1>
          <p className="logo-sub">MongoDB Atlas</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              <Icon size={18} className="nav-icon" />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <p>CC3089 Base de Datos 2</p>
        <p>Semestre I 2026</p>
      </div>
    </aside>
  )
}