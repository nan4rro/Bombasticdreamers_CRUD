# Bombastic Dreamers — Versión Online

Frontend en **Netlify** + Backend y base de datos en **Render** (PostgreSQL).

## Estructura

```
1_ESTO_PARA_ONLINE/
├── frontend/     → Netlify (React)
├── backend/        → Render (Express + PostgreSQL)
├── netlify.toml    → Config Netlify
└── render.yaml     → Blueprint Render
```

## Paso 1: Subir backend a Render

> **¿Te sale "cannot have more than one active free tier database"?**  
> Render solo permite **1 Postgres gratis** por cuenta. Ve a la sección **"Si ya tienes una base gratis"** más abajo.

### Opción A — Blueprint completo (solo si NO tienes otra base gratis)

1. Crea cuenta en [render.com](https://render.com)
2. Sube esta carpeta a GitHub
3. En Render: **New → Blueprint** y selecciona `render.yaml`
4. Variables de entorno en Render:
   - `DATABASE_URL` → la conexión de tu Postgres (Render la genera)
   - `CORS_ORIGIN` → URL de Netlify (ej: `https://bombastic-dreamers.netlify.app`)
   - `NODE_ENV` → `production`
5. Al iniciar, el backend crea las tablas automáticamente
6. Verifica: `https://TU-API.onrender.com/api/health`

### Opción B — Sin crear base nueva (`render-sin-db.yaml`)

Usa `render-sin-db.yaml` si ya tienes una base gratis en Render o usas **Neon**.

1. **New → Blueprint** → archivo `render-sin-db.yaml`
2. En el web service **bombastic-api**, agrega manualmente:
   - `DATABASE_URL` = URL de tu Postgres (ver abajo)
   - `CORS_ORIGIN` = tu URL de Netlify

### Si ya tienes una base gratis en Render

1. Render Dashboard → **PostgreSQL** (la que ya tienes)
2. Copia **External Database URL**
3. **New → Web Service** (no uses Blueprint con base de datos):
   - Root Directory: `backend` (o `1_ESTO_PARA_ONLINE/backend`)
   - Build: `npm install` | Start: `npm start`
4. Environment → `DATABASE_URL` = pega la URL copiada
5. Deploy → prueba `/api/health`

**O** borra la base gratis vieja que no uses y vuelve a desplegar `render.yaml`.

### Alternativa gratis: Neon (recomendado si Render no te deja otra base)

1. [neon.tech](https://neon.tech) → crea proyecto gratis
2. Copia la connection string PostgreSQL
3. En Render web service: `DATABASE_URL` = esa URL
4. El backend crea las tablas solo al arrancar

Guía detallada: `DEPLOY_RENDER.md`

## Paso 2: Subir frontend a Netlify

1. Crea cuenta en [netlify.com](https://netlify.com)
2. **Add new site → Import from Git**
3. Netlify detectará `netlify.toml` automáticamente
4. Variable de entorno en Netlify:
   - `VITE_API_URL` = `https://TU-API.onrender.com/api`
5. Deploy

## Paso 3: Conectar ambos

Después del deploy de Netlify, copia tu URL (ej: `https://bombastic.netlify.app`) y actualiza en Render:

```
CORS_ORIGIN=https://bombastic.netlify.app
```

Reinicia el servicio en Render.

## Backup de datos

Desde la app (menú lateral **Backup BD**) o directamente:

```
https://TU-API.onrender.com/api/backup/backup
```

Descarga un JSON con todas las tablas. También puedes exportar CSV por tabla:

```
/api/backup/export/ventas
/api/backup/export/inventario
/api/backup/export/compras
```

Render también guarda backups automáticos de PostgreSQL en planes de pago.

## Desarrollo local

### Backend (necesitas PostgreSQL local o gratis en Neon/Supabase)

```bash
cd backend
cp .env.example .env
# Edita DATABASE_URL
npm install
npm run db:init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
# Crea .env con VITE_API_URL=http://localhost:3001/api
npm run dev
```

## Diferencias vs versión local

| | Local (SQLite) | Online (PostgreSQL) |
|---|---|---|
| Base de datos | Archivo `.db` en tu PC | PostgreSQL en Render |
| Internet | No necesario | Sí |
| Backup | Archivo `.db` | JSON/CSV desde API |
| Acceso | Solo tu máquina | Desde cualquier navegador |

## Notas importantes

- El plan free de Render **duerme** el servidor tras inactividad (~50 seg al despertar)
- Netlify es gratis y siempre activo para el frontend
- No subas archivos `.env` a GitHub
- Mantén la versión local para uso offline; esta es para acceso remoto
