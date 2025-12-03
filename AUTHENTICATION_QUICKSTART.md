# 🔐 Configuración de Autenticación Segura

## ⚡ Quick Start (5 minutos)

### 1. Instalar dependencia de bcrypt

```bash
cd E:\Desarrollo\BudgetApp\backend
pip install bcrypt
```

### 2. Crear usuarios seguros

```bash
python create_users.py
```

Te pedirá contraseñas para:
- **admin** (tu usuario principal)
- **demo** (para demostrar la app)

### 3. Iniciar aplicación

**Docker:**
```bash
docker compose up --build -d
```

**Local:**
```bash
# Backend
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload

# Frontend (otra terminal)
cd frontend
npm run dev
```

### 4. Login

Abre http://localhost:8080 (Docker) o http://localhost:5173 (local)

Usa las credenciales que configuraste en el paso 2.

---

## ☁️ Deploy a Render.com

### 1. Generar hashes

```bash
python backend/create_users.py
```

Al final verás algo como:
```
ADMIN_PASSWORD_HASH=$2b$12$xyz...
DEMO_PASSWORD_HASH=$2b$12$abc...
```

### 2. Configurar en Render

1. Ve a **Dashboard** → `budgetapp-backend` → **Environment**
2. Agrega:
   - `ADMIN_PASSWORD_HASH` = (el hash generado)
   - `DEMO_PASSWORD_HASH` = (el hash generado)
3. **Save Changes**

### 3. Deploy

```bash
git add .
git commit -m "feat: secure authentication with bcrypt"
git push origin master
```

Render desplegará automáticamente en ~5 minutos.

---

## 🛡️ Seguridad

✅ **Passwords hasheadas con bcrypt** - No texto plano  
✅ **Archivo .users.json en .gitignore** - No se sube a Git  
✅ **Variables de entorno en producción** - Hashes en Render  
✅ **Credenciales por defecto solo en desarrollo** - Con WARNING visible  

📖 **Documentación completa**: [docs/AUTHENTICATION.md](../docs/AUTHENTICATION.md)

---

## ❓ FAQ

**¿Por qué no aparece .users.json en Git?**  
Está en `.gitignore` por seguridad. Cada desarrollador debe crearlo localmente.

**¿Qué pasa si no creo .users.json?**  
La app usará credenciales por defecto: `admin/admin123` y `demo/demo123` con un WARNING visible.

**¿Cómo cambio mi contraseña?**  
Re-ejecuta `python backend/create_users.py` y sobrescribe el archivo.

**¿Las credenciales por defecto funcionan en producción?**  
Sí, pero Render.com mostrará el WARNING en logs. Debes configurar las variables de entorno.
