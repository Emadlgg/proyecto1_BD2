# 🍽️ RestaurantDB — Sistema de Gestión de Pedidos y Reseñas

> Aplicación fullstack para gestionar restaurantes, pedidos y reseñas, construida sobre MongoDB Atlas.
> El backend en Node.js/Express expone una API REST que aprovecha aggregations, transacciones, GridFS
> y múltiples tipos de índices. El frontend en React/Vite permite interactuar con todas las funcionalidades
> del sistema.
>
> CC3089 Base de Datos 2 — Universidad del Valle de Guatemala, Semestre I 2026

---

## 👥 Equipo y Roles

| Rol | Responsabilidades |
|-----|-------------------|
| 🏗️ Arquitecto de Modelo de Datos | Diseño del esquema documental, colecciones, embedding vs referencing |
| 🔍 Especialista en Consultas y Analítica | Aggregation pipelines, índices, análisis de rendimiento |
| ⚙️ Ingeniero de Consistencia y Escalabilidad | Transacciones, GridFS, operaciones bulk, estados |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Base de datos | MongoDB Atlas |
| Backend | Node.js + Express |
| Frontend | React + Vite |
| Visualización | Recharts + MongoDB Charts |
| Archivos | GridFS |

---

## 📁 Estructura del Proyecto
```
proyecto1/
├── backend/
│   ├── scripts/
│   │   ├── seed.js           # Datos iniciales (35 restaurantes, 50k artículos)
│   │   ├── seedExtra.js      # Datos adicionales (usuarios, órdenes, reseñas)
│   │   └── createIndexes.js  # Creación de todos los índices
│   └── src/
│       ├── config/
│       │   └── db.js         # Conexión a MongoDB Atlas
│       ├── middleware/
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── restaurantes.js
│       │   ├── usuarios.js
│       │   ├── menu.js
│       │   ├── ordenes.js
│       │   ├── resenas.js
│       │   ├── reportes.js
│       │   ├── archivos.js
│       │   └── admin.js
│       └── index.js
└── frontend/
    └── src/
        ├── api/              # Llamadas a la API REST
        ├── components/       # Sidebar, Modal, Table, Pagination
        └── pages/            # Una carpeta por módulo
```

---

## ⚙️ Instalación y configuración

### Prerrequisitos
- Node.js v18+
- Cuenta en MongoDB Atlas con un cluster activo

### 1. Clonar el repositorio
```bash
git clone https://github.com/Emadlgg/proyecto1_BD2.git
cd proyecto1_BD2
```

### 2. Configurar el backend
```bash
cd backend
npm install
```

Copia el archivo de ejemplo y rellena tus credenciales:
```bash
cp .env.example .env
```
```env
MONGODB_URI= (Se encuentra dentro del documento de la entrega de tarea)
PORT=3000
```

### 3. Configurar el frontend
```bash
cd ../frontend
npm install
```

---

## 🌱 Poblar la base de datos

Desde la carpeta `backend/`:
```bash
# Datos base: 35 restaurantes y 50,000 artículos de menú
npm run seed

# Crear todos los índices
npm run createIndexes

# Datos adicionales: usuarios, órdenes y reseñas
npm run seedExtra
```

---

## 🚀 Correr el proyecto

En dos terminales separadas:
```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Corre en http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Corre en http://localhost:5173
```

---

## 📌 Funcionalidades implementadas

### CRUD completo
- Restaurantes, Usuarios, Menú, Órdenes, Reseñas
- Creación de documentos embebidos y referenciados
- Filtros, proyecciones, ordenamiento, skip y límite
- Lookups multi-colección

### Índices (5 tipos)
- Simple — email único en usuarios
- Compuesto — órdenes por restaurante + fecha
- Multikey — items dentro de órdenes
- Geoespacial 2dsphere — ubicación de restaurantes
- Texto — búsqueda en nombre y descripción de restaurantes

### Aggregation Pipelines
- Mejores restaurantes por calificación promedio
- Platillos más vendidos
- Conteo de órdenes por estado
- Reseñas por calificación
- Órdenes detalladas con lookup de usuario y restaurante

### Otras características
- **GridFS** — subida, descarga y eliminación de archivos
- **Transacciones** — creación de órdenes multi-documento
- **Arrays** — `$push` y `$pull` para items en órdenes
- **Bulk operations** — inserción y actualización masiva
- **MongoDB Charts** — dashboard embebido en la app
- **Página Admin** — explain plans en vivo, stats generales

---

## 🗺️ Endpoints principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/restaurantes` | Listar restaurantes |
| POST | `/api/restaurantes` | Crear restaurante |
| GET | `/api/restaurantes/buscar?q=texto` | Búsqueda por texto |
| GET | `/api/menu?restauranteId=...` | Menú por restaurante |
| POST | `/api/ordenes` | Crear orden (transacción) |
| PATCH | `/api/ordenes/:id/items` | Agregar item (`$push`) |
| GET | `/api/reportes/mejores-restaurantes` | Top restaurantes |
| GET | `/api/reportes/platillos-vendidos` | Platillos más vendidos |
| POST | `/api/archivos/upload` | Subir archivo (GridFS) |
| GET | `/api/admin/explain/:coleccion` | Explain plan en vivo |

---

## 📊 MongoDB Charts Dashboard

El dashboard embebido está disponible directamente en la sección **Reportes** de la aplicación.

---

# VIDEO

[Enlace a carpeta drive con el video](https://drive.google.com/drive/folders/1FKv17fLlgIFAXm-8kIc2UByYd9x82Kf8?usp=sharing)

*CC3089 Base de Datos 2 — Facultad de Ingeniería, UVG — Semestre I 2026*