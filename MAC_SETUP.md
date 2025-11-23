# BudgetApp - Setup en Mac

## 🏗️ Arquitectura: Windows Server + Mac Cliente

```
Windows PC (Server)
├── PostgreSQL 15 (nativo)
├── Backend FastAPI
└── Base de datos centralizada
    
Mac (Cliente de Desarrollo)
├── Frontend Vite (React)
├── Backend opcional (para testing)
└── Cliente PostgreSQL (conexión remota)
```

---

## 📋 Requisitos Previos

- **Mac** con macOS 11+
- **Node.js 18+** - Frontend (Vite)
- **Python 3.11+** - Backend (FastAPI)
- **Git** - Control de versiones
- **Windows PC** con PostgreSQL 15 instalado (servidor)
- **Conexión LAN** entre Mac y Windows

---

## 🚀 Paso 1: Instalar Requisitos en Mac

### 1.1 Instalar Homebrew (si no lo tienes)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 1.2 Instalar Node.js

```bash
brew install node@18
node --version  # v18.x.x
npm --version   # 9.x.x
```

### 1.3 Instalar Python

```bash
brew install python@3.11
python3 --version  # Python 3.11.x
```

### 1.4 Instalar Git

```bash
brew install git
git --version
```

### 1.5 Instalar Cliente PostgreSQL

```bash
brew install postgresql
psql --version  # psql (PostgreSQL) 15.x
```

---

## 🌐 Paso 2: Configurar PostgreSQL en Windows

### 2.1 Instalar PostgreSQL 15 en Windows

1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador
3. **Anotar la contraseña del usuario `postgres`**
4. Puerto por defecto: **5432**

### 2.2 Configurar Acceso Remoto

**Editar: `C:\Program Files\PostgreSQL\15\data\postgresql.conf`**

```ini
# Buscar la línea (alrededor de línea 59):
listen_addresses = '*'              # Cambiar de 'localhost' a '*'

# Guardar archivo
```

**Editar: `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`**

```ini
# Agregar al final del archivo:
# Permitir conexiones desde tu Mac (reemplazar 192.168.1.100 con tu IP)
host    all             all             192.168.1.100/32        md5
host    all             all             ::1/128                 md5
```

### 2.3 Abrir Firewall en Windows

En **PowerShell como Administrador**:

```powershell
# Permitir PostgreSQL en firewall
New-NetFirewallRule -DisplayName "PostgreSQL" `
  -Direction Inbound `
  -LocalPort 5432 `
  -Protocol TCP `
  -Action Allow

# Verificar que se creó
Get-NetFirewallRule -DisplayName "PostgreSQL"
```

### 2.4 Reiniciar PostgreSQL

```powershell
# En PowerShell como admin
Restart-Service -Name PostgreSQL-x64-15

# Verificar que está corriendo
Get-Service PostgreSQL-x64-15
```

### 2.5 Crear Bases de Datos

```powershell
# En Windows
psql -U postgres -p 5432

# En el prompt de PostgreSQL:
CREATE DATABASE budgetapp_dev;
CREATE DATABASE budgetapp_prod;
\l
\q
```

---

## 🍎 Paso 3: Clonar Repositorio en Mac

```bash
# Elegir dónde clonar (ejemplo: ~/Projects)
cd ~/Projects
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp
```

---

## 🔧 Paso 4: Setup Backend en Mac

### 4.1 Crear Virtual Environment

```bash
cd backend

# Crear venv
python3 -m venv .venv

# Activar (en Mac/Linux)
source .venv/bin/activate

# Verificar
which python  # Debe mostrar .venv/bin/python
```

### 4.2 Instalar Dependencias

```bash
# Asegurar pip actualizado
pip install --upgrade pip

# Instalar requirements
pip install -r requirements.txt
```

### 4.3 Configurar Variables de Entorno

```bash
# Crear archivo .env
cat > .env << EOF
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA_AQUI@192.168.1.50:5432/budgetapp_dev
PYTHONUNBUFFERED=1
EOF

# ⚠️ Reemplazar:
# - TU_CONTRASEÑA_AQUI con la contraseña de Windows
# - 192.168.1.50 con la IP de tu Windows PC
```

### 4.4 Obtener IP de Windows

En **Windows PowerShell**:

```powershell
ipconfig

# Buscar "IPv4 Address:" en "Ethernet adapter" o "Wi-Fi"
# Ejemplo: 192.168.1.50
```

En **Mac** para verificar:

```bash
# Deberías poder conectar desde Mac
psql -U postgres -h 192.168.1.50 -p 5432 -d budgetapp_dev

# Si pide contraseña, ingresa la de Windows
# Si funciona, verás el prompt de PostgreSQL
```

### 4.5 Ejecutar Migraciones (si necesario)

```bash
# Desde backend/ con .venv activado
alembic upgrade head
```

---

## 📦 Paso 5: Setup Frontend en Mac

### 5.1 Instalar Dependencias

```bash
cd frontend
npm install
```

### 5.2 Configurar Variables de Entorno

```bash
# Crear archivo .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
EOF
```

---

## ▶️ Paso 6: Levantar Aplicación en Mac

### 6.1 Terminal 1 - Backend

```bash
cd backend
source .venv/bin/activate

# Ejecutar servidor
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Esperado:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Verificar:** http://localhost:8000/docs → Swagger UI

### 6.2 Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

**Esperado:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 6.3 Abrir en Navegador

```
http://localhost:5173
```

---

## ✅ Verificación

### Checklist de Setup

- [ ] `brew --version` funciona (Homebrew instalado)
- [ ] `node --version` ≥ 18.0.0
- [ ] `python3 --version` ≥ 3.11.0
- [ ] `git --version` funciona
- [ ] `psql --version` ≥ 15.0
- [ ] PostgreSQL corre en Windows (`Get-Service PostgreSQL-x64-15`)
- [ ] Firewall abre puerto 5432
- [ ] `psql -U postgres -h 192.168.1.50 -p 5432` funciona desde Mac
- [ ] `budgetapp_dev` y `budgetapp_prod` existen en Windows
- [ ] BudgetApp clonado en Mac
- [ ] `backend/.env` con IP correcta
- [ ] `frontend/.env.local` creado
- [ ] `npm install` completó exitosamente
- [ ] `pip install -r requirements.txt` completó exitosamente
- [ ] Backend corre en http://localhost:8000
- [ ] Frontend corre en http://localhost:5173
- [ ] UI funciona y conecta a Backend

### Test de Conectividad

```bash
# En Mac - Verificar que Backend puede alcanzar BD Windows
curl http://localhost:8000/api/health/

# Esperado: {"status": "ok"}
```

---

## 🔄 Workflow Diario

### Al Empezar

```bash
# Terminal 1 - Backend
cd ~/Projects/BudgetApp/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend
cd ~/Projects/BudgetApp/frontend
npm run dev

# Abrir navegador
open http://localhost:5173
```

### Desarrollo

- Editar código en Mac
- Hot reload automático (Vite + FastAPI)
- Datos guardados en PostgreSQL en Windows

### Sincronizar Cambios

```bash
# Commit y push
git add .
git commit -m "feat: descripción"
git push origin master
```

### Cambiar entre Windows y Mac

```bash
# En Mac - Exportar datos antes de cambiar a Windows
pg_dump -U postgres -h 192.168.1.50 -p 5432 budgetapp_dev > ~/backup_mac.sql

# Guardar en git o cloud
# En Windows - Importar
psql -U postgres -h 192.168.1.50 -p 5432 budgetapp_dev < ~/backup_mac.sql
```

---

## 🆘 Troubleshooting

### Error: "psql: error: could not connect to server"

**Causa:** Windows PostgreSQL no está corriendo o firewall bloqueado

```bash
# En Windows PowerShell:
Restart-Service -Name PostgreSQL-x64-15
Get-Service PostgreSQL-x64-15 | Select Status
```

### Error: "permission denied" en .env

```bash
chmod 600 backend/.env
```

### Backend no puede conectar a BD

1. Verificar IP de Windows: `ipconfig` en PowerShell
2. Verificar `.env`: `cat backend/.env`
3. Verificar contraseña: `psql -U postgres -h 192.168.1.50` en Mac
4. Verificar firewall: `Get-NetFirewallRule -DisplayName "PostgreSQL"` en Windows

### Frontend no carga

```bash
# Limpiar caché de Vite
rm -rf frontend/node_modules/.vite
npm run dev
```

### "CORS error" o "Backend no responde"

```bash
# Verificar que backend está corriendo
curl http://localhost:8000/api/health/

# Si no funciona, reiniciar backend en Terminal 1
```

---

## 📚 Referencias

- [PostgreSQL Remote Access](https://www.postgresql.org/docs/15/runtime-config-connection.html)
- [Vite Dev Server](https://vitejs.dev/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/concepts/)
- [Homebrew](https://brew.sh/)

---

## 🎯 Próximos Pasos

1. ✅ Setup completado
2. 🔄 Sincronizar datos desde Windows
3. 🧪 Ejecutar tests
4. 🚀 Continuar desarrollo en Mac

**¡A disfrutar desarrollo en Mac!** 🍎
