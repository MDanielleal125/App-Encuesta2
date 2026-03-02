# 📋 Documentación Técnica - Encuesta de Perfiles Técnicos

**Versión:** 1.0.0  
**Fecha de Creación:** Marzo 2026  
**Estado:** Producción

---

## 📑 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Modelo de Base de Datos](#modelo-de-base-de-datos)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [API REST](#api-rest)
7. [Funcionalidades](#funcionalidades)
8. [Requisitos del Sistema](#requisitos-del-sistema)
9. [Instalación y Configuración](#instalación-y-configuración)
10. [Despliegue](#despliegue)
11. [Seguridad](#seguridad)
12. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 📌 Descripción General

**Encuesta de Perfiles Técnicos** es una aplicación web empresarial diseñada para evaluar y clasificar el perfil técnico de empleados en una organización de tecnología. Permite:

- Realizar encuestas interactivas con preguntas específicas
- Clasificar perfiles en 4 categorías: **Ideador**, **Clarificador**, **Desarrollador** e **Implementador**
- Visualizar resultados mediante gráficos estadísticos
- Administrar usuarios, preguntas y datos de encuestas
- Exportar e importar datos en formato CSV

**Público objetivo:** Equipos de RR.HH. y gerencia técnica en empresas de tecnología

---

## 🏗️ Arquitectura del Sistema

### Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVEGADOR (Cliente)                      │
│                    React 18 + Vite + Tailwind                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Puerto 3000)                     │
│  - Página de Login y Registro                               │
│  - Formulario de Encuesta Interactiva                        │
│  - Panel de Administración                                   │
│  - Gráficos de Resultados con Chart.js                      │
│  - Importación/Exportación de Datos                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Proxy /api
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Puerto 4000+)                     │
│              Express.js + Node.js + Prisma ORM               │
│  - Autenticación JWT                                         │
│  - Gestión de Usuarios                                       │
│  - Procesamiento de Encuestas                                │
│  - Administración de Preguntas                               │
│  - Generación de Reportes                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Base de Datos SQL                          │
│  - PostgreSQL (Producción)                                   │
│  - SQLite (Desarrollo)                                       │
│  - ORM: Prisma                                               │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
Usuario → Login/Register → API /auth → JWT Token → Almacenar en LocalStorage
                         ↓
                    Backend valida
                    Crea token JWT
                         ↓
                    Token incluido en
                    headers Authorization
                         ↓
                    API valida token
                    Ejecuta endpoint
```

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | 18.2.0 | Framework para interfaz de usuario |
| **React Router DOM** | 6.22.0 | Enrutamiento de aplicación |
| **Vite** | 5.1.0 | Empaquetador y servidor de desarrollo |
| **Tailwind CSS** | 3.4.1 | Framework CSS utilitario para estilos |
| **Chart.js** | 4.4.1 | Biblioteca de gráficos |
| **React ChartJS 2** | 5.2.0 | Componentes React para Chart.js |
| **PostCSS** | 8.4.35 | Procesador CSS |
| **Autoprefixer** | 10.4.17 | Prefijos CSS automáticos |

**Características del Frontend:**
- Aplicación de página única (SPA)
- Interfaz responsiva
- Autenticación basada en JWT
- Protección de rutas
- Componentes reutilizables
- Gestión de estado con Context API

### Backend

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express.js** | 4.19.2 | Framework web |
| **Prisma** | 5.16.0 | ORM para base de datos |
| **PostgreSQL** / SQLite | - | Bases de datos |
| **JWT (jsonwebtoken)** | 9.0.2 | Autenticación |
| **Bcryptjs** | 2.4.3 | Hash de contraseñas |
| **CORS** | 2.8.5 | Control de origen cruzado |
| **Multer** | 1.4.5 | Carga de archivos multipart |
| **dotenv** | 16.4.0 | Variables de entorno |
| **Nodemon** | 3.1.0 | Recarga automática en desarrollo |

**Características del Backend:**
- API RESTful
- Autenticación con JWT
- Control de acceso basado en roles (RBAC)
- Migraciones de base de datos
- Seed de datos iniciales
- Validación de entrada
- Manejo de errores centralizado

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-----------|----------|
| **Concurrently** | Ejecutar backend y frontend simultáneamente |
| **npm/npx** | Gestor de paquetes |
| **Git** | Control de versiones |

---

## 💾 Modelo de Base de Datos

### Diagrama ER

```
┌─────────────────────────────────────────────────────────────┐
│                          USER                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ INT                                       │
│ name             │ STRING                                    │
│ cedula (UNIQUE)  │ STRING                                    │
│ passwordHash     │ STRING                                    │
│ role             │ STRING (USER | ADMIN)                    │
│ createdAt        │ DATETIME (default: now)                  │
│ surveys (FK)     │ Relación 1:N a Survey                    │
└─────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ↓
┌─────────────────────────────────────────────────────────────┐
│                         SURVEY                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ INT                                       │
│ userId (FK)      │ INT → User.id                            │
│ createdAt        │ DATETIME (default: now)                  │
│ totalProfileA    │ INT (Ideador)                            │
│ totalProfileB    │ INT (Clarificador)                       │
│ totalProfileC    │ INT (Desarrollador)                      │
│ totalProfileD    │ INT (Implementador)                      │
│ answers (FK)     │ Relación 1:N a Answer                    │
└─────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ↓
┌─────────────────────────────────────────────────────────────┐
│                         ANSWER                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ INT                                       │
│ surveyId (FK)    │ INT → Survey.id                          │
│ questionId (FK)  │ INT → Question.id                        │
│ rawScore         │ INT (1-10)                               │
│ points           │ INT (1-5, mapeado de rawScore)           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       QUESTION                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)          │ INT                                       │
│ text             │ STRING                                    │
│ profile          │ STRING (A | B | C | D)                   │
│ order            │ INT                                       │
│ isExample        │ BOOLEAN (default: false)                 │
│ active           │ BOOLEAN (default: true)                  │
│ answers (FK)     │ Relación 1:N a Answer                    │
└─────────────────────────────────────────────────────────────┘
```

### Descripciones de Tablas

#### USER
Almacena información de usuarios registrados en el sistema.
- **cedula**: Identificador único nacional (DNI/Pasaporte)
- **role**: Define permisos (USER realiza encuestas, ADMIN gestiona sistema)
- **passwordHash**: Contraseña hasheada con bcrypt

#### QUESTION
Preguntas de la encuesta clasificadas por perfil técnico.
- **profile**: A (Ideador), B (Clarificador), C (Desarrollador), D (Implementador)
- **isExample**: `true` para preguntas de ejemplo, `false` para evaluación
- **active**: Controla qué preguntas aparecen en encuestas activas

#### SURVEY
Registro de cada encuesta completada por un usuario.
- **totalProfileX**: Puntuaciones totales por cada categoría
- **createdAt**: Timestamp de cuándo se completó

#### ANSWER
Respuestas individuales a preguntas dentro de una encuesta.
- **rawScore**: Puntuación bruta (1-10)
- **points**: Puntuación normalizada (1-5) resultado de `mapScoreToPoints()`

### Relaciones

- **User → Survey**: 1:N (Un usuario puede completar múltiples encuestas)
- **Survey → Answer**: 1:N (Una encuesta contiene múltiples respuestas)
- **Question → Answer**: 1:N (Una pregunta puede ser respondida múltiples veces)

---

## 📁 Estructura del Proyecto

```
App-Encuesta2/
│
├── 📄 package.json                  # Scripts principales para ejecutar proyecto
├── 📄 README.md                     # Guía de inicio rápido
├── 📄 INSTRUCCIONES.txt             # Instrucciones en texto plano
├── 📄 DOCUMENTACION_TECNICA.md      # Este archivo
│
├── 🗂️ backend/
│   ├── 📄 package.json              # Dependencias del backend
│   ├── 🗂️ src/
│   │   ├── 📄 server.js             # Punto de entrada, manejo de puertos
│   │   ├── 📄 app.js                # Configuración de Express
│   │   ├── 📄 prisma.js             # Cliente Prisma iniciado
│   │   ├── 🗂️ routes/
│   │   │   ├── 📄 auth.js           # Endpoints: /register, /login
│   │   │   ├── 📄 surveys.js        # Endpoints: CRUD de encuestas
│   │   │   ├── 📄 questions.js      # Endpoints: obtener preguntas
│   │   │   └── 📄 admin.js          # Endpoints: solo admin
│   │   ├── 🗂️ middleware/
│   │   │   └── 📄 auth.js           # Middleware JWT y control de acceso
│   │   └── 🗂️ utils/
│   │       └── 📄 scoring.js        # Función mapScoreToPoints()
│   └── 🗂️ prisma/
│       ├── 📄 schema.prisma         # Modelo de datos Prisma
│       ├── 📄 seed.js               # Script para cargar datos iniciales
│       ├── 📄 migration_lock.toml    # Bloqueo de migraciones
│       └── 🗂️ migrations/
│           └── 📄 20260301153323_init/ # Migración inicial
│
├── 🗂️ frontend/
│   ├── 📄 package.json              # Dependencias del frontend
│   ├── 📄 vite.config.js            # Configuración Vite
│   ├── 📄 tailwind.config.js        # Configuración Tailwind
│   ├── 📄 postcss.config.js         # Configuración PostCSS
│   ├── 📄 index.html                # HTML principal
│   └── 🗂️ src/
│       ├── 📄 main.jsx              # Punto de entrada React
│       ├── 📄 App.jsx               # Componente raíz con enrutamiento
│       ├── 📄 index.css             # Estilos globales
│       ├── 🗂️ api/
│       │   └── 📄 client.js         # Cliente HTTP para API
│       ├── 🗂️ context/
│       │   └── 📄 AuthContext.jsx   # Estado global de autenticación
│       ├── 🗂️ pages/
│       │   ├── 📄 Login.jsx         # Página de login
│       │   ├── 📄 Register.jsx      # Página de registro
│       │   ├── 📄 Survey.jsx        # Formulario de encuesta
│       │   └── 🗂️ admin/
│       │       ├── 📄 AdminLayout.jsx    # Layout del panel admin
│       │       ├── 📄 AdminDashboard.jsx # Dashboard con estadísticas
│       │       └── 📄 ImportExport.jsx   # Importar/Exportar CSV
│       ├── 🗂️ components/
│       │   └── 📄 ScoreBar.jsx      # Componente de barra de puntuación
│       └── 🗂️ styles/
│           └── 📄 auth.css          # Estilos específicos de auth
│
└── 🗂️ scripts/
    └── 📄 setup.js                  # Script de instalación inicial
```

---

## 🔌 API REST

### Configuración General

**Base URL:** `http://localhost:4000/api` (desarrollo)  
**Autenticación:** JWT Bearer Token  
**Content-Type:** application/json

### Autenticación

#### POST `/auth/register`
Registra un nuevo usuario.

**Request:**
```json
{
  "name": "Juan Pérez",
  "cedula": "123456789",
  "password": "micontraseña123"
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Juan Pérez",
  "cedula": "123456789",
  "role": "USER"
}
```

**Errores:**
- `400`: Campos obligatorios faltantes
- `409`: Cédula ya existe
- `500`: Error en servidor

---

#### POST `/auth/login`
Inicia sesión y obtiene JWT token.

**Request:**
```json
{
  "cedula": "123456789",
  "password": "micontraseña123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Juan Pérez",
    "cedula": "123456789",
    "role": "USER"
  }
}
```

**Errores:**
- `400`: Credenciales faltantes
- `401`: Cédula o contraseña incorrecta
- `500`: Error en servidor

---

### Preguntas

#### GET `/questions`
Obtiene todas las preguntas activas.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "text": "¿Cuál es tu fortaleza principal?",
    "profile": "A",
    "order": 1,
    "isExample": false,
    "active": true
  },
  ...
]
```

---

### Encuestas

#### POST `/surveys`
Envía una encuesta completada.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "rawScore": 8
    },
    {
      "questionId": 2,
      "rawScore": 5
    }
  ]
}
```

**Response (201):**
```json
{
  "survey": {
    "id": 5,
    "userId": 2,
    "createdAt": "2026-03-02T10:30:00Z",
    "totalProfileA": 12,
    "totalProfileB": 8,
    "totalProfileC": 10,
    "totalProfileD": 6
  },
  "answers": [
    {
      "id": 1,
      "surveyId": 5,
      "questionId": 1,
      "rawScore": 8,
      "points": 4
    },
    ...
  ]
}
```

---

#### GET `/surveys`
Obtiene todas las encuestas del usuario logueado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "surveys": [
    {
      "id": 5,
      "userId": 2,
      "createdAt": "2026-03-02T10:30:00Z",
      "totalProfileA": 12,
      "totalProfileB": 8,
      "totalProfileC": 10,
      "totalProfileD": 6
    }
  ]
}
```

---

#### GET `/surveys/:id`
Obtiene detalles de una encuesta específica.

**Response (200):**
```json
{
  "survey": {
    "id": 5,
    "userId": 2,
    "createdAt": "2026-03-02T10:30:00Z",
    "totalProfileA": 12,
    "totalProfileB": 8,
    "totalProfileC": 10,
    "totalProfileD": 6
  },
  "answers": [...]
}
```

---

### Administración (Solo ADMIN)

#### GET `/admin/surveys`
Obtiene todas las encuestas del sistema.

**Headers:**
```
Authorization: Bearer <token>
Role: ADMIN
```

**Response (200):**
```json
{
  "surveys": [...],
  "total": 42
}
```

---

#### GET `/admin/stats`
Obtiene estadísticas globales.

**Response (200):**
```json
{
  "totalUsers": 50,
  "totalSurveys": 42,
  "avgProfileA": 12.5,
  "avgProfileB": 10.3,
  "avgProfileC": 11.8,
  "avgProfileD": 9.2
}
```

---

#### POST `/admin/questions`
Crea una nueva pregunta.

**Request:**
```json
{
  "text": "¿Prefieres trabajar solo o en equipo?",
  "profile": "B",
  "order": 15,
  "isExample": false
}
```

---

#### POST `/admin/import`
Importa datos desde CSV (multipart/form-data).

**Form Data:**
```
file: <archivo.csv>
```

---

#### GET `/admin/export`
Exporta datos a CSV.

**Response:** Descarga archivo CSV

---

### Health Check

#### GET `/api/health`
Verifica estado del servidor.

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## ⚙️ Funcionalidades

### Para Usuarios Regulares (Role: USER)

1. **Autenticación**
   - Registro de nuevos usuarios
   - Login con cédula y contraseña
   - Logout y limpiar sesión

2. **Encuestas**
   - Responder formulario interactivo
   - Escala de puntuación 1-10
   - Validación de respuestas
   - Ver resultados personales
   - Gráfico de perfiles obtenidos

3. **Resultados**
   - Ver puntuación en 4 perfiles
   - Interpretar resultados
   - Historial de encuestas completadas

### Para Administradores (Role: ADMIN)

1. **Panel de Control**
   - Visualizar estadísticas globales
   - Gráficos de distribución de perfiles
   - Número de encuestas completadas

2. **Gestión de Preguntas**
   - Crear nuevas preguntas
   - Editar preguntas existentes
   - Activar/Desactivar preguntas
   - Marcar preguntas como ejemplares

3. **Gestión de Usuarios**
   - Ver lista de usuarios
   - Ver detalles de encuestas
   - Eliminar usuarios si es necesario

4. **Importación/Exportación**
   - Exportar datos a CSV
   - Importar datos desde CSV
   - Backup de información

5. **Seguridad**
   - Solo admins pueden acceder a endpoints administrativos
   - Validación JWT en cada solicitud
   - Logs de actividad

---

## 📋 Requisitos del Sistema

### Mínimos

- **Sistema Operativo:** Windows, macOS, Linux
- **Node.js:** Versión 18.0.0 o superior
- **npm:** Versión 9.0.0 o superior
- **Disco:** 500 MB libres (dependencias + base de datos)
- **RAM:** 512 MB (recomendado 1 GB)
- **Navegador:** Chrome, Firefox, Safari, Edge (versiones modernas)

### Recomendados

- **Node.js:** Última versión LTS
- **Base de Datos:** PostgreSQL 14+ (para producción)
- **Servidor Web:** Nginx o Apache (para despliegue)
- **Gestor de Procesos:** PM2 (para mantener servidor activo)

### Dependencias del Sistema

```bash
# macOS
brew install node

# Windows
choco install nodejs  # O descargar desde https://nodejs.org/

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm
```

---

## 🚀 Instalación y Configuración

### Opción 1: Instalación Rápida (Recomendada para usuarios)

```bash
# 1. Navegar a la carpeta del proyecto
cd App-Encuesta2

# 2. Ejecutar instalación completa (instala deps, crea BD, carga datos)
npm run setup

# 3. Iniciar aplicación
npm run dev

# 4. Abrir navegador
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

**Usuarios por defecto:**
- Cédula: `00000000`
- Contraseña: `admin123`

---

### Opción 2: Instalación Manual Paso a Paso

#### Backend Setup

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env (si no existe)
cp .env.example .env

# Generar cliente Prisma
npx prisma generate

# Crear migraciones y ejecutarlas
npx prisma migrate dev --name init

# Cargar datos iniciales (usuario admin + preguntas)
npm run prisma:seed

# Iniciar servidor
npm run dev
```

**Archivo `.env` requerido:**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-clave-secreta-aqui-cambiar-en-produccion"
PORT=4000
```

#### Frontend Setup

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# (Opcional) Si el backend está en puerto diferente a 4000:
# Crear archivo .env
echo "VITE_API_TARGET=http://localhost:4001" > .env

# Iniciar servidor de desarrollo
npm run dev
```

---

### Variables de Entorno

#### Backend (`.env`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/encuesta_db"
JWT_SECRET="super-secret-key-min-32-chars-required"
PORT=4000
NODE_ENV="development"
```

#### Frontend (`.env`)
```
VITE_API_TARGET=http://localhost:4000
```

---

## 🌐 Despliegue

### Despliegue en Producción (PostgreSQL)

#### 1. Preparar Base de Datos PostgreSQL

```bash
# En servidor PostgreSQL
createdb encuesta_produccion

# Obtener connection string:
# postgresql://user:password@host:5432/encuesta_produccion
```

#### 2. Configurar Backend

```bash
cd backend

# Actualizar .env
cat > .env << EOF
DATABASE_URL="postgresql://user:password@host:5432/encuesta_produccion"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=4000
NODE_ENV="production"
EOF

# Ejecutar migraciones
npx prisma migrate deploy

# Cargar datos iniciales (si es primer despliegue)
npm run prisma:seed

# Construir (ya está listo para producción)
npm run start
```

#### 3. Despliegue Frontend

```bash
cd frontend

# Crear build optimizado
npm run build

# El directorio 'dist' contiene archivos listos para servir
```

#### 4. Servir con Nginx

```nginx
upstream api {
  server localhost:4000;
}

server {
  listen 80;
  server_name tu-dominio.com;

  # Servir frontend
  root /ruta/al/frontend/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Proxy API
  location /api {
    proxy_pass http://api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### 5. Ejecutar con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar backend
pm2 start backend/src/server.js --name "encuesta-api"

# Ver estado
pm2 status

# Guardar configuración
pm2 save

# Reiniciar en boot
pm2 startup
```

#### 6. HTTPS (SSL/TLS)

```bash
# Con Certbot y Let's Encrypt
sudo apt install certbot python3-certbot-nginx

certbot certonly --nginx -d tu-dominio.com

# Nginx actualizará automáticamente config
```

---

### Despliegue en Vercel (Frontend)

```bash
# Instalar CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Configurar variables de entorno en dashboard:
# VITE_API_TARGET=https://api.tu-dominio.com
```

---

### Despliegue en Heroku (Backend)

```bash
# Instalar CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create nombre-app

# Añadir PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

---

## 🔐 Seguridad

### Implementado

1. **Autenticación JWT**
   - Token de expiración 24h (configurable)
   - Almacenamiento seguro en cliente
   - Validación en cada solicitud

2. **Hashing de Contraseñas**
   - bcryptjs con 10 rounds
   - Nunca almacenar contraseña en texto plano
   - Verificación hash en login

3. **Control de Acceso (RBAC)**
   - Dos roles: USER y ADMIN
   - Endpoints protegidos validando role
   - Middleware `requireAdmin` para acciones sensibles

4. **CORS**
   - Configurado para aceptar origen local
   - En producción cambiar a dominio específico

5. **Validación de Entrada**
   - Validación de campos obligatorios
   - Sanitización de datos
   - Prevención de inyección SQL (usando Prisma)

### Recomendaciones de Seguridad

1. **Cambiar JWT_SECRET en producción**
   ```bash
   # Generar clave segura
   openssl rand -base64 32
   ```

2. **CORS en Producción**
   ```javascript
   // En app.js
   app.use(cors({
     origin: ['https://tu-dominio.com'],
     credentials: true
   }));
   ```

3. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

4. **Helmet para headers HTTP**
   ```bash
   npm install helmet
   ```

5. **Variables Sensibles**
   - Nunca commitear `.env`
   - Usar `.env.example` como plantilla
   - Gestionar secretos en servidor/variables de entorno

6. **HTTPS en Producción**
   - Obtener certificado SSL/TLS
   - Forzar redirección HTTP → HTTPS
   - HSTS headers

---

## 💻 Guía de Desarrollo

### Estructura de Componentes React

```
pages/             # Páginas completas (rutas)
├── Login.jsx
├── Register.jsx
├── Survey.jsx
└── admin/
    ├── AdminLayout.jsx
    ├── AdminDashboard.jsx
    └── ImportExport.jsx

components/        # Componentes reutilizables
└── ScoreBar.jsx

context/           # Estado global
└── AuthContext.jsx

api/              # Servicios HTTP
└── client.js

styles/           # CSS específico
└── auth.css
```

### Agregar Nueva Pregunta

**Backend:**
```javascript
// POST /api/admin/questions
POST /api/admin/questions
Authorization: Bearer <admin-token>

{
  "text": "Mi nueva pregunta",
  "profile": "A",
  "order": 20,
  "isExample": false
}
```

### Agregar Nueva Ruta

**Backend (`backend/src/routes/`):**
```javascript
// nueva-ruta.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  // Tu lógica aquí
});

module.exports = router;
```

**En `app.js`:**
```javascript
app.use('/api/nueva-ruta', require('./routes/nueva-ruta'));
```

**Frontend:**
```javascript
// En App.jsx
<Route path="/mi-ruta" element={<ProtectedRoute><MiComponente /></ProtectedRoute>} />
```

### Debugging

**Backend:**
```javascript
// Usar logs
console.log('Debug:', obj);

// Con nodemon se reinicia automáticamente
npm run dev
```

**Frontend:**
```javascript
// React DevTools disponible en Chrome
// Usar console.log normalmente
console.log('State:', variable);

// Vite HMR integrado (hot module replacement)
```

---

## 📊 Scoring de Perfiles

### Algoritmo de Mapeo

Las respuestas en escala 1-10 se normalizan a 1-5:

```
Rango 1-2  → 1 punto
Rango 3-4  → 2 puntos
Rango 5-6  → 3 puntos
Rango 7-8  → 4 puntos
Rango 9-10 → 5 puntos
```

**Código:**
```javascript
function mapScoreToPoints(rawScore) {
  if (rawScore >= 1 && rawScore <= 2) return 1;
  if (rawScore >= 3 && rawScore <= 4) return 2;
  if (rawScore >= 5 && rawScore <= 6) return 3;
  if (rawScore >= 7 && rawScore <= 8) return 4;
  if (rawScore >= 9 && rawScore <= 10) return 5;
  throw new Error('Puntuación fuera de rango');
}
```

### Cálculo de Perfiles

```
totalProfileA = Suma de puntos de respuestas con profile='A'
totalProfileB = Suma de puntos de respuestas con profile='B'
totalProfileC = Suma de puntos de respuestas con profile='C'
totalProfileD = Suma de puntos de respuestas con profile='D'
```

---

## 📦 Scripts Disponibles

### Raíz del Proyecto

```bash
npm run setup       # Instalación completa (dev + backend + frontend)
npm run dev         # Ejecutar backend + frontend simultáneamente
npm run backend     # Solo backend
npm run frontend    # Solo frontend
```

### Backend

```bash
npm run dev              # Desarrollo con nodemon
npm run start            # Producción
npm run prisma:migrate   # Crear/ejecutar migraciones
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:seed      # Cargar datos iniciales
```

### Frontend

```bash
npm run dev      # Servidor de desarrollo Vite
npm run build    # Crear build optimizado
npm run preview  # Ver build en local
```

---

## 🐛 Troubleshooting

### Puerto ya está en uso

```bash
# Backend intenta puertos 4000-4010 automáticamente
# Si sigue fallando:

# Liberar puerto (Windows)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Liberar puerto (macOS/Linux)
lsof -i :4000
kill <PID>
```

### Base de datos no se conecta

```bash
# Verificar DATABASE_URL en .env
cat .env

# Resetear base de datos
cd backend
npx prisma migrate reset  # ⚠️ Borra todos los datos
```

### Frontend no se conecta a API

```bash
# Verificar puerto del backend (en consola del backend)
# Crear/actualizar frontend/.env
VITE_API_TARGET=http://localhost:<puerto-backend>

# Reiniciar frontend
npm run dev
```

### npm no funciona en PowerShell

```powershell
# Usar símbolo de sistema (cmd) en su lugar
cmd /c "npm run setup"

# O usar npm.cmd explícitamente
npm.cmd run dev
```

---

## 📞 Soporte y Mantenimiento

### Logs Importantes

**Backend:**
```bash
# Ver logs en tiempo real
pm2 logs encuesta-api

# O desde código
console.log('[ERROR]', error);
console.log('[INFO]', message);
```

**Frontend:**
```
Abierto: DevTools → Console
```

### Actualizaciones de Dependencias

```bash
# Verificar desactualización
npm outdated

# Actualizar seguro
npm update

# Actualizar mayor versión (cuidado)
npm install package@latest
```

---

## 📄 Licencia

MIT License - 2026

---

## 📝 Historial de Cambios

### v1.0.0 (Marzo 2026)
- Lanzamiento inicial
- Funcionalidades base completas
- PostgreSQL compatible
- Panel administrativo funcional

---

**Última actualización:** Marzo 2, 2026

Para preguntas o soporte técnico, contactar al equipo de desarrollo.
