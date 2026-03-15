# 🎨 Arquitectura Visual - Encuesta de Perfiles Técnicos

**Documento:** Diagramas y Visualización de Componentes  
**Versión:** 1.0  
**Fecha:** Marzo 2026

---

## 📐 Diagrama de Flujo General del Sistema

```
┌──────────────────────────────────────────────────────────────────────┐
│                           USUARIO NUEVO                               │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
                       ↓
             ┌─────────────────────┐
             │  Página de Registro │
             └────────┬────────────┘
                      │ (Nombre, Cédula, Contraseña)
                      ↓
          ┌──────────────────────────┐
          │  API POST /auth/register  │
          └────────┬─────────────────┘
                   │
                   ├─ Validar datos
                   ├─ Hashear contraseña (bcrypt)
                   ├─ Crear usuario en BD
                   │
                   ↓
        ┌──────────────────────┐
        │  Usuario Registrado  │
        └────────┬─────────────┘
                 │
                 ↓
        ┌──────────────────────┐
        │   Página de Login    │
        └────────┬─────────────┘
                 │ (Cédula, Contraseña)
                 ↓
        ┌──────────────────────┐
        │  API POST /auth/login│
        └────────┬─────────────┘
                 │
               ┌─┴─────────────────────┐
               │                       │
          ✅ Exitoso            ❌ Fallido
               │                       │
               ↓                       ↓
        ┌────────────────┐    ┌──────────────┐
        │ Generar JWT    │    │ Error 401    │
        │ Retornar Token │    │ Reintentar   │
        └────────┬───────┘    └──────────────┘
                 │
                 ↓
        ┌──────────────────────────┐
        │ Token en LocalStorage     │
        │ (Authorization: Bearer)   │
        └────────┬─────────────────┘
                 │
                 ↓
        ┌──────────────────────────┐
        │ Dashboard Principal      │
        │ (Encuesta o Admin)       │
        └──────────────────────────┘
```

---

## 📋 Flujo de Encuesta (Usuario Regular)

```
┌─────────────────────────────────────────────────┐
│         USUARIO AUTENTICADO (USER)              │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
        ┌──────────────────────┐
        │  Selecciona Encuesta │
        └────────┬─────────────┘
                 │ (Ver preguntas carargadas)
                 ↓
    ┌────────────────────────────────┐
    │ API GET /api/questions         │
    │ Obtiene preguntas activas      │
    └────────┬───────────────────────┘
             │
             ↓
    ┌────────────────────────────────┐
    │ Mostrar Preguntas una a una    │
    │ Escala 1-10 (Radio buttons)    │
    └────────┬───────────────────────┘
             │
             ↓ (Usuario responde todas)
    ┌────────────────────────────────┐
    │ Compilar respuestas en objeto  │
    │ [{questionId, rawScore}, ...]  │
    └────────┬───────────────────────┘
             │
             ↓
    ┌────────────────────────────────┐
    │ API POST /api/surveys          │
    │ Enviar respuestas finales      │
    └────────┬───────────────────────┘
             │
             ├─ Backend calcula puntos:
             │  mapScoreToPoints(rawScore)
             │
             ├─ Suma por categoría:
             │  totalProfileA/B/C/D
             │
             └─ Guarda en BD
             │
             ↓
    ┌────────────────────────────────┐
    │ Mostrar Resultados             │
    │ • Gráfico de barras (Chart.js) │
    │ • Puntuaciones por perfil      │
    │ • Descripción del perfil       │
    └────────────────────────────────┘
```

---

## 👨‍💼 Flujo de Administrador

```
┌──────────────────────────────────────────────┐
│    USUARIO AUTENTICADO (ADMIN)               │
└──────────┬───────────────────────────────────┘
           │
           ↓
    ┌──────────────────────────────┐
    │  Dashboard Administrativo    │
    │  (Admin Layout)              │
    └──┬──────┬────────┬───────┬──┘
       │      │        │       │
       ↓      ↓        ↓       ↓
    ┌──┐ ┌──┐ ┌──┐ ┌──────┐
    │1 │ │2 │ │3 │ │  4   │
    └──┘ └──┘ └──┘ └──────┘
     │    │    │       │
     │    │    │       └─ Exportar/Importar
     │    │    │          CSV
     │    │    │
     │    │    └─ Gestionar Preguntas
     │    │       • Crear
     │    │       • Editar
     │    │       • Activar/Desactivar
     │    │
     │    └─ Ver Encuestas Globales
     │       • Filtrar por usuario
     │       • Ver respuestas detalladas
     │
     └─ Ver Estadísticas
        • Total usuarios
        • Total encuestas
        • Distribución de perfiles
        • Promedios por categoría

    ┌──────────────────────────────────┐
    │ API /api/admin/*                 │
    │ (Requiere role='ADMIN')          │
    └──────────────────────────────────┘
```

---

## 🗄️ Arquitectura de Base de Datos Detallada

```
┌─────────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                              │
│                  (PostgreSQL / SQLite)                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│  TABLA: USER                         │
├──────────────────────────────────────┤
│ Column         │ Type      │ Constraint
├──────────────────────────────────────┤
│ id             │ INT       │ PK, AUTO_INCREMENT
│ name           │ VARCHAR   │ NOT NULL
│ cedula         │ VARCHAR   │ NOT NULL, UNIQUE
│ passwordHash   │ VARCHAR   │ NOT NULL
│ role           │ VARCHAR   │ DEFAULT='USER'
│ createdAt      │ TIMESTAMP │ DEFAULT=NOW()
└──────────────────────────────────────┘
           ↓ (1:N)
┌──────────────────────────────────────┐
│  TABLA: SURVEY                       │
├──────────────────────────────────────┤
│ Column         │ Type      │ Constraint
├──────────────────────────────────────┤
│ id             │ INT       │ PK, AUTO_INCREMENT
│ userId         │ INT       │ FK → User.id
│ createdAt      │ TIMESTAMP │ DEFAULT=NOW()
│ totalProfileA  │ INT       │ DEFAULT=0
│ totalProfileB  │ INT       │ DEFAULT=0
│ totalProfileC  │ INT       │ DEFAULT=0
│ totalProfileD  │ INT       │ DEFAULT=0
└──────────────────────────────────────┘
           ↓ (1:N)
┌──────────────────────────────────────┐
│  TABLA: ANSWER                       │
├──────────────────────────────────────┤
│ Column         │ Type      │ Constraint
├──────────────────────────────────────┤
│ id             │ INT       │ PK, AUTO_INCREMENT
│ surveyId       │ INT       │ FK → Survey.id
│ questionId     │ INT       │ FK → Question.id
│ rawScore       │ INT       │ (1-10)
│ points         │ INT       │ (1-5, mapped)
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  TABLA: QUESTION                     │
├──────────────────────────────────────┤
│ Column         │ Type      │ Constraint
├──────────────────────────────────────┤
│ id             │ INT       │ PK, AUTO_INCREMENT
│ text           │ TEXT      │ NOT NULL
│ profile        │ VARCHAR   │ (A|B|C|D)
│ order          │ INT       │ Posición en encuesta
│ isExample      │ BOOLEAN   │ DEFAULT=false
│ active         │ BOOLEAN   │ DEFAULT=true
└──────────────────────────────────────┘
           ↑ (N:1)
           └─ Referenciada por ANSWER
```

---

## 🔄 Flujo de Autenticación JWT

```
┌────────────────────────────────────────────────────────┐
│                   CLIENTE (Frontend)                   │
└────────────────────────────────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ↓                   ↓
        ┌──────────────┐   ┌──────────────┐
        │ POST /login  │   │ POST /reg... │
        └──────┬───────┘   └──────┬───────┘
               │                  │
               └──────────┬───────┘
                          ↓
        ┌─────────────────────────────────┐
        │ API Backend (Express)           │
        │ Route: POST /api/auth/login     │
        └──────────────┬──────────────────┘
                       │
                       ├─ Buscar usuario por cédula
                       ├─ Verificar password hash
                       │  (bcryptjs.compare)
                       │
                       ├─ Si válido:
                       │  ├─ Crear JWT token
                       │  │  jwt.sign({
                       │  │    id: user.id,
                       │  │    role: user.role
                       │  │  }, process.env.JWT_SECRET)
                       │  │
                       │  └─ Retornar { token, user }
                       │
                       ├─ Si inválido:
                       │  └─ 401 Unauthorized
                       │
                       ↓
        ┌─────────────────────────────────┐
        │ CLIENTE guarda token en:        │
        │ • localStorage.setItem(...)     │
        │ • sessionStorage.setItem(...)   │
        └──────────────┬──────────────────┘
                       │
                       ↓
        ┌──────────────────────────────────┐
        │ Siguiente solicitud API:         │
        │ headers: {                       │
        │   Authorization:                 │
        │   'Bearer eyJhbGc...'            │
        │ }                                │
        └──────────────┬───────────────────┘
                       │
                       ↓
        ┌──────────────────────────────────┐
        │ Middleware (Backend):            │
        │ authenticateToken()              │
        │                                  │
        │ ├─ Extraer token de header      │
        │ ├─ jwt.verify(token, SECRET)    │
        │ ├─ Si válido: next()            │
        │ └─ Si inválido: 401/403         │
        └──────────────────────────────────┘
```

---

## 🎨 Estructura de Componentes React

```
┌─────────────────────────────────────────────────────┐
│                   App (Root)                        │
│  • AuthContext Provider                             │
│  • React Router                                     │
│  • Rutas protegidas                                 │
└──────────────────────┬────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
         ↓             ↓              ↓
    ┌────────┐  ┌──────────┐  ┌────────────┐
    │ Login  │  │ Register │  │  Protected │
    │ Page   │  │  Page    │  │   Routes   │
    └────────┘  └──────────┘  └──────┬─────┘
                                      │
                    ┌─────────────────┼──────────────┐
                    │                 │              │
                    ↓                 ↓              ↓
               ┌────────┐        ┌──────────┐  ┌──────────┐
               │ Survey │        │  Admin   │  │  Score   │
               │ Page   │        │ Dashboard│  │  Bar     │
               └────────┘        │ Layout   │  │Component │
                                 └──────────┘  └──────────┘
                                      │
                         ┌────────────┴───────────┐
                         │                        │
                         ↓                        ↓
                   ┌──────────────┐       ┌──────────────┐
                   │ Admin        │       │ Import/      │
                   │ Dashboard    │       │ Export       │
                   └──────────────┘       └──────────────┘

┌─────────────────────────────────────────────────┐
│           Context API (Global State)            │
│  AuthContext:                                   │
│  • user (objeto usuario actual)                 │
│  • token (JWT token)                            │
│  • loading (estado de carga)                    │
│  • login(cedula, password)                      │
│  • logout()                                     │
│  • register(name, cedula, password)             │
└─────────────────────────────────────────────────┘
```

---

## 🔌 Endpoints API - Resumen Visual

```
┌─────────────────────────────────────────────────────┐
│           API REST Endpoints (/api)                 │
└─────────────────────────────────────────────────────┘

────────────────────── AUTH ──────────────────────────
  POST   /auth/register      📝  Registrar usuario
  POST   /auth/login         🔓  Iniciar sesión

──────────────────── SURVEYS ─────────────────────────
  POST   /surveys            ✏️   Crear encuesta
  GET    /surveys            📊  Listar mis encuestas
  GET    /surveys/:id        📖  Ver una encuesta

──────────────────── QUESTIONS ───────────────────────
  GET    /questions          ❓  Obtener preguntas
  GET    /questions/:id      ❓  Detalle de pregunta

──────────────────── ADMIN ───────────────────────────
  GET    /admin/surveys      📈  Todas las encuestas
  GET    /admin/stats        📊  Estadísticas globales
  POST   /admin/questions    ➕  Crear pregunta
  PATCH  /admin/questions/:id 🔧  Editar pregunta
  POST   /admin/import       📥  Importar CSV
  GET    /admin/export       📤  Exportar CSV

──────────────────── HEALTH ──────────────────────────
  GET    /health             ✅  Estado del servidor
```

---

## 🔐 Modelo de Seguridad

```
┌─────────────────────────────────────────────────┐
│            CAPAS DE SEGURIDAD                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────┐
│  CAPA 1: Autenticación      │
├─────────────────────────────┤
│ • Cédula + Contraseña       │
│ • JWT Token (validación)    │
│ • Expiración de tokens      │
└─────────────┬───────────────┘
              │
              ↓
┌─────────────────────────────┐
│  CAPA 2: Encriptación       │
├─────────────────────────────┤
│ • bcryptjs Hash (pass)      │
│ • JWT Secret (tokens)       │
│ • HTTPS (en producción)     │
└─────────────┬───────────────┘
              │
              ↓
┌─────────────────────────────┐
│  CAPA 3: Control Acceso     │
├─────────────────────────────┤
│ • Roles (ADMIN / USER)      │
│ • Middleware de validación  │
│ • requireAdmin()            │
└─────────────┬───────────────┘
              │
              ↓
┌─────────────────────────────┐
│  CAPA 4: Validación Datos   │
├─────────────────────────────┤
│ • Campos obligatorios       │
│ • Tipo de datos             │
│ • Rango de valores          │
│ • Sanitización inputs       │
└─────────────┬───────────────┘
              │
              ↓
┌─────────────────────────────┐
│  CAPA 5: ORM (SQL Safety)   │
├─────────────────────────────┤
│ • Prisma ORM                │
│ • Query parametrizada       │
│ • Prevención SQL injection  │
└─────────────────────────────┘
```

---

## 📈 Flujo de Cálculo de Scores

```
Usuario responde con valor 1-10
              │
              ↓
    ┌─────────────────────┐
    │ mapScoreToPoints()  │
    │ Normaliza a 1-5     │
    └────────┬────────────┘
             │
       ┌─────┼─────┬─────┬─────┐
       │     │     │     │     │
   1-2│  3-4│ 5-6 │7-8 │ 9-10│
       │     │     │     │     │
       ↓     ↓     ↓     ↓     ↓
       1     2     3     4     5 puntos


Para cada pregunta:
- Si profile='A' → suma a totalProfileA
- Si profile='B' → suma a totalProfileB
- Si profile='C' → suma a totalProfileC
- Si profile='D' → suma a totalProfileD

Resultado final:
   Puntuación por Perfil = Σ (puntos normalizados)
                          para preguntas de ese perfil

Ejemplo:
   Si 4 preguntas de perfil A con puntos [4,3,5,4]
   → totalProfileA = 4+3+5+4 = 16 puntos
```

---

## 🎯 Matriz de Perfiles

```
┌──────────────────────────────────────────────┐
│    PERFILES TÉCNICOS (4 Categorías)          │
└──────────────────────────────────────────────┘

🧠 PERFIL A: IDEADOR
├─ Pensamiento estratégico
├─ Innovación y creatividad
├─ Visión a largo plazo
├─ Propuesta de nuevas soluciones
└─ Rol ideal: CTO, Team Lead, Arquitecto

📋 PERFIL B: CLARIFICADOR
├─ Análisis detallado
├─ Estructuración de problemas
├─ Documentación y procesos
├─ Claridad en comunicación
└─ Rol ideal: Business Analyst, QA, Documentador

🛠️  PERFIL C: DESARROLLADOR
├─ Habilidades técnicas
├─ Implementación de código
├─ Resolución de problemas técnicos
├─ Desarrollo de features
└─ Rol ideal: Developer, Engineer, Programmer

⚙️  PERFIL D: IMPLEMENTADOR
├─ Optimización operacional
├─ Eficiencia en procesos
├─ Atención al detalle
├─ Mejora continua
└─ Rol ideal: DevOps, SRE, Operations

┌──────────────────────────────────────────────┐
│  Equipo Ideal = Mezcla equilibrada de todos  │
└──────────────────────────────────────────────┘
```

---

## 🖥️ Interfaz de Usuario - Flujo Visual

```
LOGIN SCREEN
┌──────────────────────────────┐
│   Encuesta Perfiles Técnicos │
│                              │
│  Cédula: [_______________]   │
│  Contraseña: [___________]   │
│                              │
│       [Entrar] [Registrar]   │
└──────────────────────────────┘
           │
           ↓ (éxito)
           
SURVEY SCREEN (Usuario)
┌──────────────────────────────┐
│   Pregunta 1/20              │
│   ████████░░░░░░░░░░ 50%     │
│                              │
│  ¿Cuál es tu fortaleza?      │
│                              │
│  (1) ○  (2) ○  (3) ○ ...    │
│  ... (8) ○  (9) ○  (10) ○   │
│                              │
│  [Anterior] [Siguiente]      │
└──────────────────────────────┘
           │
           ↓ (última pregunta)
           
RESULTS SCREEN
┌──────────────────────────────┐
│   Tus Resultados             │
│                              │
│  [Gráfico de barras]         │
│  Ideador:      ████░░  12 pts│
│  Clarificador: ███░░░░   9 pts│
│  Desarrollador:█████░░░  15pts│
│  Implementador:██░░░░░░   5pts│
│                              │
│  [Ver más] [Descargar]       │
└──────────────────────────────┘
           │
           ↓
           
ADMIN DASHBOARD
┌──────────────────────────────┐
│   Panel Administrativo       │
│                              │
│  Total Usuarios: 150         │
│  Total Encuestas: 340        │
│                              │
│  Distribución de Perfiles    │
│  [Gráfico circular]          │
│                              │
│  [Ver Detalles] [Exportar]   │
└──────────────────────────────┘
```

---

## 📱 Responsive Design

```
╔════════════════════════════════════════╗
║       MÓVIL (360px)                    ║
╠════════════════════════════════════════╣
║                                        ║
║  Pregunta 1/20                         ║
║  [████░░░░░░] 50%                     ║
║                                        ║
║  ¿Cuál es tu                           ║
║  fortaleza?                            ║
║                                        ║
║  (1)○ (2)○ (3)○                        ║
║  (4)○ (5)○ (6)○                        ║
║  (7)○ (8)○ (9)○                        ║
║  (10)○                                 ║
║                                        ║
║  [Anterior] [Siguiente]                ║
║                                        ║
╚════════════════════════════════════════╝

╔═══════════════════════════════════════════════╗
║  TABLET (768px)                             ║
╠═══════════════════════════════════════════════╣
║  Pregunta 1/20                               ║
║  [████████░░░░░░░░] 50%                     ║
║                                             ║
║  ¿Cuál es tu fortaleza principal?           ║
║                                             ║
║  (1)○ (2)○ (3)○ (4)○ (5)○                    ║
║  (6)○ (7)○ (8)○ (9)○ (10)○                   ║
║                                             ║
║  [Anterior]  [Siguiente]                    ║
║                                             ║
╚═══════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║  ESCRITORIO (1920px)                                    ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Pregunta 1/20 [████████████░░░░░░░░░░░░░░░░] 50%       ║
║                                                           ║
║  ¿Cuál es tu fortaleza principal?                        ║
║                                                           ║
║  (1)○ (2)○ (3)○ (4)○ (5)○ (6)○ (7)○ (8)○ (9)○ (10)○      ║
║                                                           ║
║  [Anterior]              [Siguiente]                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🚀 Pipeline de Despliegue

```
┌──────────────────────────────────────┐
│         LOCAL (Desarrollo)           │
│  npm run setup && npm run dev        │
└──────────────┬───────────────────────┘
               │ Git push
               ↓
┌──────────────────────────────────────┐
│      GitHub/GitLab (Repository)      │
└──────────────┬───────────────────────┘
               │
         ┌─────┴──────┐
         │            │
         ↓            ↓
    ┌────────┐   ┌──────────┐
    │Frontend│   │ Backend  │
    └────┬───┘   └────┬─────┘
         │            │
         ↓            ↓
    ┌────────┐   ┌──────────┐
    │ Vercel │   │ Heroku / │
    │ o      │   │ AWS /    │
    │Netlify │   │ GCloud   │
    └────┬───┘   └────┬─────┘
         │            │
         └─────┬──────┘
               ↓
     ┌──────────────────┐
     │  PRODUCCIÓN      │
     │ https://tu-      │
     │ dominio.com      │
     └──────────────────┘
```

---

## 📊 Estadísticas en Tiempo Real

```
Dashboard Admin muestra:

┌────────────────────────────────┐
│  MÉTRICAS PRINCIPALES          │
├────────────────────────────────┤
│                                │
│  👥 Usuarios: 150              │
│  📋 Encuestas: 340             │
│  ✅ Completadas: 98%           │
│  ⏱️  Promedio duración: 12 min  │
│                                │
└────────────────────────────────┘

┌────────────────────────────────┐
│  DISTRIBUCIÓN DE PERFILES      │
├────────────────────────────────┤
│                                │
│  🧠 Ideador:       32%  ██████ │
│  📋 Clarificador:  28%  █████  │
│  🛠️  Desarrollador: 25%  █████ │
│  ⚙️  Implementador: 15%  ███   │
│                                │
└────────────────────────────────┘

┌────────────────────────────────┐
│  ACTIVIDADPOR DÍA              │
├────────────────────────────────┤
│                                │
│           Encuestas/Día        │
│  ^  ║                          │
│  │  ║    ■ ■                   │
│  │ ■║ ■  ■ ■   ■ ■            │
│  │ ■║ ■  ■ ■ ■ ■ ■ ■          │
│  └─╫────────────────→          │
│    L M M J V S D              │
│                                │
└────────────────────────────────┘
```

---

**Documento para visualización en presentaciones públicas y demostraciones técnicas**

*Última actualización: Marzo 2, 2026*
