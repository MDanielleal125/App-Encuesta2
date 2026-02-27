# Encuesta de Perfiles Técnicos

Aplicación web para realizar encuestas de perfiles técnicos (Ideador, Clarificador, Desarrollador, Implementador) en una empresa de tecnología.

---

## Ejecutar en cualquier PC (para exponer o usar en otro equipo)

1. **Requisito:** tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en ese PC.

2. **Copiar la carpeta** del proyecto completa (por USB, nube, etc.) al otro equipo.

3. **Abrir terminal** en la carpeta del proyecto (donde está este README y las carpetas `backend` y `frontend`).

4. **Instalar y preparar todo** (solo la primera vez):
   ```bash
   npm run setup
   ```
   Este comando instala dependencias, crea la base de datos y carga el usuario admin y las preguntas.

5. **Iniciar la aplicación:**
   ```bash
   npm run dev
   ```
   Se abrirán el backend y el frontend. En la consola verás en qué puertos están.

6. **Abrir en el navegador:** [http://localhost:3000](http://localhost:3000)

   - **Usuario administrador:** cédula `00000000`, contraseña `admin123`
   - Cualquier otra persona puede registrarse y hacer la encuesta.

**Si en esa PC no puedes usar `npm`** (por políticas de ejecución en PowerShell), abre **Símbolo del sistema (cmd)** y ejecuta los mismos comandos desde la carpeta del proyecto, o usa `npm.cmd run setup` y `npm.cmd run dev`.

---

## Desarrollo (por partes)

### Base de datos (SQLite)

En la carpeta `backend`:

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Backend (Express + Prisma)

```bash
cd backend
npm run dev
```

La API quedará en `http://localhost:4000`. Si ese puerto está ocupado, el servidor probará automáticamente 4001, 4002, etc. y mostrará en consola el puerto usado.

### Frontend (React + Vite + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

La app quedará en `http://localhost:3000` con proxy a la API. **Si el backend arrancó en un puerto distinto de 4000**, crea `frontend/.env` con:
```
VITE_API_TARGET=http://localhost:4001
```
(usa el puerto que indicó el backend en consola).

### Accesos por defecto

- **Admin:** cédula `00000000`, contraseña `admin123` (creado por el seed).
- Los usuarios que se registren tendrán rol USER y podrán hacer la encuesta.

## Producción (PostgreSQL)

1. Crear base de datos PostgreSQL y definir `DATABASE_URL` en `.env`:

   ```
   DATABASE_URL="postgresql://usuario:clave@host:5432/nombre_bd"
   ```

2. En `backend/prisma/schema.prisma` cambiar el provider del datasource:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Ejecutar migraciones:

   ```bash
   cd backend
   npx prisma migrate deploy
   npm run prisma:seed
   ```

4. Construir frontend y servir estático desde Express o un servidor web:

   ```bash
   cd frontend && npm run build
   ```

## Estructura

- **backend:** API REST (auth, preguntas, encuestas, panel admin con import/export).
- **frontend:** React con rutas para login, registro, encuesta y panel admin (dashboard con gráficas, import/export).

## Funcionalidad

- Encuesta de 37 preguntas (primera de ejemplo que no suma puntos).
- Puntuación 1–10 agrupada en puntos (1–2→1, 3–4→2, 5–6→3, 7–8→4, 9–10→5) por perfil A/B/C/D.
- Usuario común: registro, login, tutorial, respuestas y mensaje de agradecimiento.
- Administrador: listado de encuestas, gráficas (barras y radar), exportar/importar preguntas y resultados (CSV/JSON).
