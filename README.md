# CRUD-SEGURO

## Resumen del proyecto

CRUD-SEGURO es una aplicación de inventario segura, diseñada para ofrecer un sistema CRUD completo con autenticación y base para autorización por roles.

El proyecto combina:
- Backend con Node.js y Express
- Base de datos SQLite a través de `sql.js`
- Autenticación JWT
- Hash de contraseñas con `bcryptjs`
- Frontend en React + Vite
- Orquestación con Docker Compose
- Proxy y seguridad HTTP con Nginx

## Cómo funciona

- El backend expone una API REST en `/api`.
- El frontend consume la API y ofrece interfaz de inventario.
- El usuario puede registrarse e iniciar sesión para recibir un JWT.
- Las solicitudes a rutas protegidas requieren el token en el header `Authorization`.
- El backend usa consultas SQL parametrizadas para evitar inyección SQL.
- El middleware de autenticación está preparado para admitir roles como `admin`, `editor` y `viewer`.

## Tecnologías utilizadas

- Node.js
- Express
- sql.js
- bcryptjs
- jsonwebtoken
- cors
- React
- Vite
- Docker
- Docker Compose
- Nginx
- ESLint

## Estructura del repositorio

```
crud-seguro/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── auth.middleware.js
│   ├── routes.auth.js
│   ├── routes.products.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── nginx/
│   ├── default.conf
│   └── error_seguro.html
└── docker-compose.yml
```

## Ejecución con Docker Compose

```bash
docker compose up --build
```

Servicios disponibles:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Ejecución local sin Docker

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API disponible

| Método | Ruta                     | Autenticación | Descripción |
|--------|--------------------------|----------------|-------------|
| POST   | /api/auth/login          | No             | Inicia sesión y devuelve JWT |
| POST   | /api/auth/register       | No             | Registra un nuevo usuario |
| GET    | /api/auth/me             | Sí             | Valida token y devuelve datos del usuario |
| GET    | /api/products            | Sí             | Lista productos |
| GET    | /api/products/:id        | Sí             | Obtiene un producto por ID |
| POST   | /api/products            | Sí             | Crea un producto |
| PUT    | /api/products/:id        | Sí             | Actualiza un producto |
| DELETE | /api/products/:id        | Sí             | Elimina un producto |

## Seguridad implementada

- Consultas SQL parametrizadas para evitar inyección.
- Contraseñas almacenadas con `bcryptjs`.
- Autenticación con JSON Web Tokens (JWT).
- Middleware preparado para autorización por roles.

## Desarrollo incremental con IA

Este proyecto se construyó de forma incremental con ayuda de inteligencia artificial.

La primera etapa consistió en pedirle a Claude un sistema de inventario con:
- sentencias SQL parametrizadas
- diseño escalable para autorización por roles
- autenticación segura
- una API REST clara

A partir de esa base, se integró el CRUD completo, el frontend en React, la configuración Docker y Nginx, y los ajustes de seguridad.
