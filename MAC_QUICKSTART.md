# BudgetApp - Guía Rápida para Mac

## 🚀 Quick Start (3 pasos)

### 1️⃣ En Windows - Preparar PostgreSQL

**Una sola vez:**

```powershell
# PowerShell como Admin
Restart-Service -Name PostgreSQL-x64-15

# Crear bases de datos
psql -U postgres -p 5432

# En PostgreSQL prompt:
CREATE DATABASE budgetapp_dev;
CREATE DATABASE budgetapp_prod;
\q
```

**Notar IP de Windows:**
```powershell
ipconfig
# Anotar IPv4 Address (ej: 192.168.1.50)
```

---

### 2️⃣ En Mac - Ejecutar Setup Automático

```bash
# Clonar o entrar al repo
cd ~/Projects/BudgetApp  # o donde lo clones

# Ejecutar setup (descarga todo automáticamente)
bash setup-mac.sh

# Responder preguntas:
# - IP de Windows: 192.168.1.50
# - Contraseña PostgreSQL: [la de Windows]
```

**¿Qué hace `setup-mac.sh`?**
- ✅ Instala Homebrew, Node, Python, PostgreSQL client
- ✅ Clona o actualiza repositorio
- ✅ Crea virtual environment Python
- ✅ Instala dependencias backend y frontend
- ✅ Crea archivos `.env`

---

### 3️⃣ Empezar a Desarrollar

**Terminal 1 - Backend:**
```bash
cd ~/Projects/BudgetApp/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd ~/Projects/BudgetApp/frontend
npm run dev
```

**Navegador:**
```
http://localhost:5173
```

---

## 📚 Documentación Completa

Lee [`MAC_SETUP.md`](./MAC_SETUP.md) para:
- Instalación manual paso a paso
- Troubleshooting
- Configuración avanzada
- Scripts de sincronización

---

## 🔄 Sincronización Windows ↔ Mac

### Exportar datos desde Mac
```bash
pg_dump -U postgres -h 192.168.1.50 budgetapp_dev > ~/backup_mac.sql
```

### Importar datos en Windows
```powershell
psql -U postgres -h localhost budgetapp_dev < C:\Users\tu_usuario\backup_mac.sql
```

---

## ⚠️ Requisitos Windows

Antes de correr `setup-mac.sh`:

- [ ] PostgreSQL 15 instalado en Windows
- [ ] `listen_addresses = '*'` en `postgresql.conf`
- [ ] Firewall abre puerto 5432
- [ ] `pg_hba.conf` permite conexiones remotas (MD5)

Si no los tienes, ver **Step 2** en [`MAC_SETUP.md`](./MAC_SETUP.md)

---

## 🆘 ¿Algo no funciona?

### Backend no conecta a PostgreSQL
```bash
# Verificar IP Windows correcta
ping 192.168.1.50

# Verificar contraseña
psql -U postgres -h 192.168.1.50 -p 5432
```

### Frontend no carga
```bash
# Limpiar caché
rm -rf frontend/node_modules/.vite
npm run dev
```

### Virtual environment no activa
```bash
# En Mac/Linux
source backend/.venv/bin/activate

# Verificar
which python  # debe mostrar .venv/bin/python
```

Más soluciones en [`MAC_SETUP.md`](./MAC_SETUP.md#-troubleshooting)

---

## 📖 Arquitectura

```
Mac (Tu Laptop)                 Windows PC (Servidor)
├─ Frontend (5173)    ─→        Backend (8000)
├─ Backend opcional             PostgreSQL 15
│  (8001)             ─→        ├─ budgetapp_dev
└─ CLI Tools                    └─ budgetapp_prod
```

**Flujo de datos:**
```
Mac UI (React) 
  ↓ (HTTP)
Mac Backend (FastAPI) 
  ↓ (TCP/IP)
Windows PostgreSQL 
  ↓
Datos persistentes
```

---

## 🎯 Próximos Pasos

1. ✅ Setup completado
2. 🔄 Sincronizar datos desde Windows (opcional)
3. 🧪 Ejecutar tests
4. 🚀 Continuar desarrollo

---

## 📞 Support

- **Documentación detallada:** [`MAC_SETUP.md`](./MAC_SETUP.md)
- **Repositorio:** https://github.com/ninrauzer/BudgetApp
- **Issues:** https://github.com/ninrauzer/BudgetApp/issues

---

**¡Listo para desarrollar en Mac!** 🍎✨
