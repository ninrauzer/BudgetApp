# BudgetApp - Docker Deployment

## 🚀 Despliegue con Docker

Esta aplicación se puede ejecutar completamente con Docker Compose.

### 📋 Prerrequisitos

- Docker Engine 20.10+
- Docker Compose v2 (plugin) o docker-compose v1 (legacy)

### 🛠️ Instalación y Ejecución

#### 1. Clonar repositorio
```bash
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp
```

#### 2. Iniciar aplicación

**Docker Compose v2 (recomendado)**:
```bash
# Construir y levantar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Solo backend logs
docker compose logs -f backend

# Solo frontend logs
docker compose logs -f frontend
```

**Docker Compose v1 (legacy)**:
```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Solo backend logs
docker-compose logs -f backend

# Solo frontend logs
docker-compose logs -f frontend
```

#### 3. Acceder a la aplicación
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 🔧 Comandos Útiles

```bash
# Detener servicios
docker compose down

# Detener y eliminar volúmenes (borra base de datos)
docker compose down -v

# Reconstruir imágenes
docker compose build

# Reconstruir sin caché
docker compose build --no-cache

# Ver servicios corriendo
docker compose ps

# Reiniciar un servicio específico
docker compose restart backend
docker compose restart frontend

# Ejecutar comandos en contenedor
docker compose exec backend python scripts/init_db.py
docker compose exec backend bash

# Ver uso de recursos
docker stats
```

### 📁 Estructura de Volúmenes

```
./data/
└── budget.db          # Base de datos SQLite persistente
```

### 🔐 Variables de Entorno

Puedes personalizar la configuración creando un archivo `.env`:

```env
# Backend
DATABASE_URL=sqlite:///./data/budget.db
LOG_LEVEL=info
PYTHONUNBUFFERED=1

# Frontend
VITE_API_URL=http://localhost:8000
```

### 🐛 Troubleshooting

#### Backend no inicia
```bash
# Ver logs detallados
docker compose logs backend

# Reiniciar servicio
docker compose restart backend

# Reconstruir imagen
docker compose build backend
docker compose up -d backend
```

#### Frontend no carga
```bash
# Verificar nginx
docker compose exec frontend nginx -t

# Ver logs de nginx
docker compose logs frontend
```

#### Frontend build fails con TypeScript errors
El proyecto usa configuraciones separadas de TypeScript:
- **Desarrollo** (`tsconfig.app.json`): Strict mode activo
- **Producción** (`tsconfig.build.json`): Strict mode deshabilitado

El build de Docker usa `tsconfig.build.json` automáticamente para evitar errores de tipos en producción. Si necesitas debugging:

```bash
# Ver errores de TypeScript
cd frontend && npm run build

# Forzar rebuild sin caché
docker compose build --no-cache frontend
```

#### Base de datos corrupta
```bash
# Detener servicios
docker compose down

# Eliminar base de datos
rm -rf ./data/budget.db*

# Reiniciar servicios (se creará nueva DB)
docker compose up -d

# Inicializar datos
docker compose exec backend python scripts/init_db.py
```

### 🔄 Actualización

```bash
# Pull últimos cambios
git pull origin master

# Reconstruir y reiniciar
docker compose down
docker compose build
docker compose up -d
```

### 📊 Health Checks

Los servicios incluyen health checks automáticos:

- **Backend**: Verifica endpoint `/api/health` cada 30s
- **Frontend**: Verifica nginx cada 30s

Ver estado:
```bash
docker compose ps
```

### 🚀 Producción

Para producción, considera:

1. **Usar variables de entorno seguras**
   ```bash
   # No usar --reload en uvicorn
   # Cambiar LOG_LEVEL=warning
   ```

2. **Configurar HTTPS con nginx**
   - Agregar certificados SSL
   - Modificar `nginx.conf`

3. **Usar base de datos externa**
   - PostgreSQL en lugar de SQLite
   - Actualizar `DATABASE_URL`

4. **Configurar backups automáticos**
   ```bash
   # Backup de base de datos
   docker compose exec backend cp /app/data/budget.db /app/data/backup_$(date +%Y%m%d).db
   ```

### 📝 Arquitectura de Contenedores

```
┌─────────────────────────────────────┐
│         Internet                    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Frontend (Nginx:80)                │
│  - Serve static files               │
│  - Proxy /api/* to backend          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Backend (FastAPI:8000)             │
│  - REST API                         │
│  - SQLAlchemy ORM                   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Volume (./data)                    │
│  - budget.db (SQLite)               │
└─────────────────────────────────────┘
```

### 🔗 Network

Todos los servicios están en la red `budgetapp-network` (bridge).

### 📦 Tamaño de Imágenes

- **Backend**: ~200MB (Python 3.11 slim + deps)
- **Frontend**: ~50MB (nginx alpine + build assets)

### ⚡ Performance

- Frontend con gzip compression
- Static assets cacheados 1 año
- Backend con Uvicorn workers configurable
- Health checks para auto-recovery

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa logs: `docker compose logs`
2. Verifica health: `docker compose ps`
3. Reinicia servicios: `docker compose restart`
4. Abre issue en GitHub
