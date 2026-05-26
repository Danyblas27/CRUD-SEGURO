# DANI ES GAY

# 🎵 Melody's — Sistema de Inventario

CRUD completo de inventario con autenticación JWT, listo para escalar con roles y permisos.

## Estructura

```
melodys/
├── backend/
│   ├── server.js              ← Punto de entrada Express
│   ├── db.js                  ← SQLite (sql.js) + helpers con sentencias parametrizadas
│   ├── auth.middleware.js     ← JWT + placeholder de roles
│   ├── routes.auth.js         ← POST /api/auth/login | /register | GET /me
│   ├── routes.products.js     ← CRUD completo /api/products
│   └── .env.example           ← Variables de entorno
└── frontend/
    └── melodys-inventory.jsx  ← React app completa
```

## Backend — Arranque rápido

```bash
cd backend
cp .env.example .env
npm install
npm start
# → http://localhost:3001
```

## Frontend — Arranque con Vite

**1. Crea el proyecto**
```bash
npm create vite@latest melodys-frontend -- --template react
cd melodys-frontend
npm install
```

**2. Limpia lo que no necesitas**
```bash
rm src/App.jsx src/App.css src/index.css
```

**3. Coloca** `melodys-inventory.jsx` dentro de `src/` y renómbralo `App.jsx`.

**4. Edita `src/main.jsx`** — quita el import de `index.css` si lo tiene:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**5. Configura el proxy en `vite.config.js`**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

**6. Cambia la línea del API** en `src/App.jsx` (línea 4 aprox):
```js
const API = "/api";   // ← antes decía http://localhost:3001/api
```

**7. Arranca todo en dos terminales**
```bash
# Terminal 1 — backend
cd melodys-backend && npm start

# Terminal 2 — frontend
cd melodys-frontend && npm run dev
# → http://localhost:5173
```

## Endpoints

| Método | Ruta                    | Auth | Descripción              |
|--------|-------------------------|------|--------------------------|
| POST   | /api/auth/login         | —    | Login → devuelve JWT     |
| POST   | /api/auth/register      | —    | Registrar usuario        |
| GET    | /api/auth/me            | ✓    | Validar token            |
| GET    | /api/products           | ✓    | Listar (filtros, búsqueda, paginación) |
| GET    | /api/products/categories| ✓    | Categorías únicas        |
| GET    | /api/products/:id       | ✓    | Obtener uno              |
| POST   | /api/products           | ✓    | Crear                    |
| PUT    | /api/products/:id       | ✓    | Actualizar               |
| DELETE | /api/products/:id       | ✓    | Eliminar                 |

## Usuario por defecto

- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Rol:** `admin`

## Seguridad

- Todas las queries usan **sentencias parametrizadas** (cero SQL injection)
- Passwords hasheadas con **bcrypt** (salt rounds: 10)
- Autenticación con **JWT** (expira en 8h)

## Extender con Roles (preparado)

`auth.middleware.js` ya tiene `requireRole()`:

```js
// Ejemplo: solo admin puede eliminar
router.delete('/:id', authMiddleware, requireRole('admin'), handler);
```

Roles disponibles: `admin`, `editor`, `viewer` (agrega los que necesites en la tabla `users`).