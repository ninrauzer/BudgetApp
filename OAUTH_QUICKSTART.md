# 🔐 Configurar Google OAuth - Guía Rápida

## 📋 Prerequisitos

- Cuenta de Google
- Proyecto en Google Cloud Console
- 10 minutos

---

## 🚀 Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Click en **"Select a project"** → **"New Project"**
3. Nombre: `BudgetApp`
4. Click **"Create"**

---

## 🔑 Paso 2: Configurar OAuth Consent Screen

1. En el menú lateral: **APIs & Services** → **OAuth consent screen**
2. Selecciona **"External"** → **"Create"**
3. Completa el formulario:
   - **App name**: BudgetApp
   - **User support email**: tu-email@gmail.com
   - **Developer contact**: tu-email@gmail.com
4. Click **"Save and Continue"**
5. **Scopes**: Click **"Add or Remove Scopes"**
   - Selecciona:
     - `openid`
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
6. Click **"Save and Continue"**
7. **Test users**: Agrégatecomoun usuario de prueba
8. Click **"Save and Continue"**

---

## 🎫 Paso 3: Crear Credenciales OAuth

1. **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type**: Web application
4. **Name**: BudgetApp Web Client
5. **Authorized JavaScript origins**:
   - `http://localhost:8000`
   - `http://localhost:5173`
   - `http://192.168.126.127:8080` (Docker)
6. **Authorized redirect URIs**:
   - `http://localhost:8000/api/auth/google/callback`
   - `http://192.168.126.127:8000/api/auth/google/callback`
7. Click **"Create"**

📋 **Copia tus credenciales**:
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `xxxx-xxxxx`

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### Desarrollo Local

Edita `backend/.env`:

```bash
# JWT Secret (genera uno nuevo)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Docker

Edita `compose.yml` → servicio `backend`:

```yaml
environment:
  - JWT_SECRET_KEY=tu-secret-key-generado
  - GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
  - GOOGLE_CLIENT_SECRET=tu-client-secret
  - GOOGLE_REDIRECT_URI=http://192.168.126.127:8000/api/auth/google/callback
  - FRONTEND_URL=http://192.168.126.127:8080
```

---

## 🗄️ Paso 5: Migrar Base de Datos

```bash
cd E:\Desarrollo\BudgetApp\backend
python migrate_add_users_table.py
```

Esto creará la tabla `users` y el usuario demo.

---

## 🐳 Paso 6: Reiniciar Aplicación

**Docker:**
```bash
docker compose down
docker compose up --build -d
```

**Local:**
```bash
# Backend (instalar authlib primero)
pip install authlib httpx
python -m uvicorn app.main:app --reload

# Frontend
cd ../frontend
npm run dev
```

---

## ✅ Paso 7: Probar Login

1. Abre http://localhost:5173 (local) o http://192.168.126.127:8080 (Docker)
2. Click en **"Sign in with Google"**
3. Selecciona tu cuenta de Google
4. Autoriza la aplicación
5. Deberías ser redirigido al dashboard

---

## 🌐 Paso 8: Configurar para Producción (Render.com)

### 1. Agregar Redirect URI en Google Console

**Authorized redirect URIs**:
- `https://budgetapp-backend.onrender.com/api/auth/google/callback`

### 2. Configurar Variables de Entorno en Render

Dashboard → `budgetapp-backend` → **Environment**:

```
JWT_SECRET_KEY=<genera-con-openssl-rand-hex-32>
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=https://budgetapp-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://budgetapp-frontend.onrender.com
```

### 3. Deploy

```bash
git add .
git commit -m "feat: add Google OAuth authentication"
git push origin master
```

---

## 🔍 Troubleshooting

### "redirect_uri_mismatch"
- Verifica que el redirect URI en Google Console coincida exactamente
- Revisa la variable `GOOGLE_REDIRECT_URI`

### "Google OAuth not configured"
- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén configurados
- Reinicia el servidor

### "Could not validate credentials"
- El JWT secret puede haber cambiado
- Haz logout y vuelve a hacer login

### "User not found"
- La tabla `users` no existe
- Ejecuta `python backend/migrate_add_users_table.py`

---

## 📝 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/google/login` | GET | Inicia flujo OAuth con Google |
| `/api/auth/google/callback` | GET | Callback de Google (automático) |
| `/api/auth/me` | GET | Info del usuario autenticado |
| `/api/auth/demo` | POST | Crea sesión demo sin login |
| `/api/auth/logout` | POST | Cierra sesión |

---

## 🎯 Próximos Pasos

- [ ] Configurar Google OAuth
- [ ] Migrar base de datos
- [ ] Probar login localmente
- [ ] Actualizar frontend para usar Google Sign-In
- [ ] Deploy a producción
- [ ] Opcional: Agregar Apple Sign In

---

## 💡 Tips

- **Modo desarrollo**: Puedes usar `/api/auth/demo` para probar sin Google
- **Múltiples usuarios**: Cada persona puede usar su propia cuenta de Google
- **Sin passwords**: Google maneja toda la seguridad
- **Gratis**: OAuth de Google es gratis hasta 10,000 usuarios/mes

---

¿Dudas? Revisa la [documentación completa](./docs/OAUTH_SETUP.md)
