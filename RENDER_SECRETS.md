# Configuración de Secretos en Render.com

## 🔐 Variables de Entorno Requeridas

### Backend Service (budgetapp-backend)

Configurar manualmente en **Render Dashboard → budgetapp-backend → Environment**:

#### 1. Database (PostgreSQL)
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
# Ejemplo Supabase:
# DATABASE_URL=postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### 2. OAuth Google
```bash
GOOGLE_CLIENT_ID=TU-CLIENT-ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-TU-CLIENT-SECRET
```

**Cómo obtener credenciales OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita **Google+ API**
4. Ve a **Credentials → Create Credentials → OAuth 2.0 Client ID**
5. Tipo: **Web application**
6. Authorized redirect URIs:
   ```
   https://budgetapp-frontend.onrender.com/auth/callback
   https://budgetapp-backend.onrender.com/auth/google/callback
   ```
7. Copia **Client ID** y **Client Secret**

#### 3. JWT Secret
```bash
JWT_SECRET_KEY=TU-SECRET-KEY-HEXADECIMAL-64-CARACTERES
```

**Generar JWT Secret:**
```bash
# En tu terminal local:
openssl rand -hex 32
# Output: 09a8f6c3e2d1b4a7f9e6c3d2b1a0f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1
```

#### 4. URLs y CORS
```bash
FRONTEND_URL=https://budgetapp-frontend.onrender.com
ALLOWED_ORIGINS=https://budgetapp-frontend.onrender.com,https://budgetapp-backend.onrender.com
```

---

## 📝 Pasos para Configurar

### Método 1: Dashboard Web (Más Rápido)

1. **Login en Render:**
   ```
   https://dashboard.render.com/
   ```

2. **Ir al Backend Service:**
   - Dashboard → **budgetapp-backend** → **Environment**

3. **Agregar Variables (una por una):**
   - Click **"Add Environment Variable"**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: `TU-CLIENT-ID.apps.googleusercontent.com`
   - Click **"Save"**
   
   Repetir para:
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET_KEY`
   - `DATABASE_URL`
   - `FRONTEND_URL`
   - `ALLOWED_ORIGINS`

4. **Guardar Cambios:**
   - Click **"Save Changes"** (abajo)
   - Render redesplegará automáticamente (~5 min)

### Método 2: Secret Files (Más Seguro para Producción)

1. **Crear archivo local con secretos:**
   ```bash
   # secrets.env
   GOOGLE_CLIENT_ID=TU-CLIENT-ID.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-TU-CLIENT-SECRET
   JWT_SECRET_KEY=GENERA-UNO-CON-OPENSSL-RAND-HEX-32
   ```

2. **Subir en Dashboard:**
   - Dashboard → budgetapp-backend → **Settings**
   - Scroll a **"Secret Files"**
   - Click **"Add Secret File"**
   - Filename: `.env`
   - Content: Pegar contenido de `secrets.env`
   - Save

---

## ✅ Verificar Configuración

### 1. Check Environment Variables
```bash
# Dashboard → budgetapp-backend → Environment
# Verificar que aparezcan:
✓ GOOGLE_CLIENT_ID
✓ GOOGLE_CLIENT_SECRET
✓ JWT_SECRET_KEY
✓ DATABASE_URL
✓ FRONTEND_URL
✓ ALLOWED_ORIGINS
```

### 2. Test Backend Health
```bash
curl https://budgetapp-backend.onrender.com/api/health
# Esperado: {"status": "healthy"}
```

### 3. Test OAuth Login
```
https://budgetapp-frontend.onrender.com/login
# Click "Login with Google"
# Debe redirigir a Google OAuth
# Después de autorizar, debe redirigir a /dashboard
```

### 4. Check Logs
```bash
# Dashboard → budgetapp-backend → Logs
# Buscar:
[INFO] OAuth configured with client_id: YOUR-CLIENT-ID...
[INFO] Application startup complete
```

---

## 🚨 Troubleshooting

### Error: "Missing GOOGLE_CLIENT_ID"
**Causa:** Variable no configurada en Render
**Solución:**
1. Dashboard → budgetapp-backend → Environment
2. Add: `GOOGLE_CLIENT_ID=tu-client-id`
3. Save Changes

### Error: "Invalid redirect_uri"
**Causa:** Redirect URI no autorizada en Google Console
**Solución:**
1. Google Cloud Console → Credentials → OAuth 2.0 Client
2. Agregar en "Authorized redirect URIs":
   ```
   https://budgetapp-frontend.onrender.com/auth/callback
   https://budgetapp-backend.onrender.com/auth/google/callback
   ```

### Error: "CORS policy blocked"
**Causa:** ALLOWED_ORIGINS no incluye frontend URL
**Solución:**
```bash
ALLOWED_ORIGINS=https://budgetapp-frontend.onrender.com,https://budgetapp-backend.onrender.com
```

### Backend no inicia después de agregar variables
**Causa:** Render está redesplegando
**Solución:** Esperar 5-7 minutos. Ver logs en Dashboard.

---

## 🔒 Seguridad

### ⚠️ NUNCA hacer:
- ❌ Commitear secretos en Git
- ❌ Compartir `GOOGLE_CLIENT_SECRET` en público
- ❌ Usar mismas credenciales para dev y producción
- ❌ Hardcodear secrets en código

### ✅ SIEMPRE hacer:
- ✅ Usar variables de entorno
- ✅ Generar `JWT_SECRET_KEY` único para producción
- ✅ Rotar secrets periódicamente
- ✅ Usar diferentes OAuth credentials para dev/prod
- ✅ Mantener `.env` en `.gitignore`

---

## 📊 Cheatsheet Rápido

```bash
# Variables PÚBLICAS (OK en render.yaml)
PYTHON_VERSION=3.11.0
LOG_LEVEL=info
PYTHONUNBUFFERED=1
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
FRONTEND_URL=https://budgetapp-frontend.onrender.com
ALLOWED_ORIGINS=https://budgetapp-frontend.onrender.com

# Variables SECRETAS (SOLO en Dashboard)
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET_KEY=...
```

---

## 📚 Referencias

- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Secret Files](https://render.com/docs/environment-variables#secret-files)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2/web-server)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
