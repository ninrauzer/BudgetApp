# 🔐 Sistema de Autenticación - BudgetApp

## Características de Seguridad

✅ **Passwords hasheadas con bcrypt** - No se almacenan contraseñas en texto plano  
✅ **Archivo de usuarios separado** - `.users.json` excluido de Git  
✅ **Variables de entorno en producción** - Para Render.com  
✅ **Comparación segura** - Protección contra timing attacks  

---

## 🚀 Configuración Local (Desarrollo)

### Opción 1: Usar credenciales por defecto (⚠️ Solo para desarrollo)

Si no creas el archivo `.users.json`, la aplicación usará:
- **Usuario**: `admin` / **Contraseña**: `admin123`
- **Usuario**: `demo` / **Contraseña**: `demo123`

### Opción 2: Crear usuarios seguros (Recomendado)

```bash
# Ejecutar script de creación de usuarios
cd E:\Desarrollo\BudgetApp
python backend/create_users.py
```

El script te pedirá:
1. Contraseña para usuario `admin` (mínimo 8 caracteres)
2. Contraseña para usuario `demo` (mínimo 8 caracteres)

Esto creará `backend/.users.json` con passwords hasheadas:

```json
{
  "admin": {
    "password_hash": "$2b$12$...",
    "type": "admin"
  },
  "demo": {
    "password_hash": "$2b$12$...",
    "type": "demo"
  }
}
```

⚠️ **IMPORTANTE**: El archivo `.users.json` está en `.gitignore` - NUNCA lo subas a Git.

---

## 🐳 Docker (Producción Local)

Docker usará el archivo `.users.json` si existe, sino usará credenciales por defecto.

```bash
# 1. Crear usuarios seguros
python backend/create_users.py

# 2. Levantar Docker
docker compose up --build -d
```

---

## ☁️ Render.com (Producción Cloud)

### Paso 1: Generar hashes de contraseñas

```bash
python backend/create_users.py
```

El script mostrará al final los hashes que necesitas para Render:

```
ADMIN_PASSWORD_HASH=$2b$12$xyz...
DEMO_PASSWORD_HASH=$2b$12$abc...
```

### Paso 2: Configurar variables de entorno en Render

1. Ve a **Render Dashboard** → `budgetapp-backend` → **Environment**
2. Agrega estas variables:

```
ADMIN_PASSWORD_HASH=$2b$12$xyz...
DEMO_PASSWORD_HASH=$2b$12$abc...
```

3. **Save Changes** (reiniciará el servicio)

### Paso 3: Verificar deployment

```bash
curl -u admin:tu_contraseña https://budgetapp-backend.onrender.com/api/health
```

---

## 🔄 Cambiar Contraseñas

### Desarrollo Local

```bash
# Re-ejecutar script (sobrescribirá .users.json)
python backend/create_users.py
```

### Producción (Render.com)

1. Generar nuevo hash localmente
2. Actualizar variable de entorno en Render Dashboard
3. Reiniciar servicio

---

## 📊 Tipos de Usuario

| Usuario | Tipo | Descripción |
|---------|------|-------------|
| `admin` | admin | Acceso completo a datos reales |
| `demo` | demo | Datos ofuscados para demostración |

El tipo de usuario determina:
- Frontend activa **modo demo** automáticamente para usuario `demo`
- Backend puede filtrar/ofuscar datos según tipo (futuro)

---

## 🛡️ Seguridad

### ¿Por qué bcrypt?

- **Slow hashing** - Protege contra brute force
- **Salts automáticos** - Cada hash es único
- **Industry standard** - Usado por GitHub, Dropbox, etc.

### Protección contra Timing Attacks

```python
# ✅ Usa secrets.compare_digest (constant-time)
secrets.compare_digest(password1, password2)

# ❌ Nunca uses == (vulnerable)
if password1 == password2:  # INSEGURO
```

### Prioridad de Credenciales

1. **`.users.json`** (local) - Archivo con hashes
2. **Environment variables** (Render) - `ADMIN_PASSWORD_HASH`, `DEMO_PASSWORD_HASH`
3. **Fallback** (desarrollo) - Credenciales por defecto con WARNING

---

## ⚠️ Troubleshooting

### "Invalid username or password"

- Verifica que `.users.json` existe
- Revisa logs del backend para ver qué credenciales cargó
- Prueba credenciales por defecto si no creaste usuarios

### Docker no carga .users.json

```bash
# Verificar que el archivo está montado
docker compose exec backend ls -la /app/.users.json

# Si no existe, crearlo y reiniciar
python backend/create_users.py
docker compose restart backend
```

### Render.com - 401 Unauthorized

- Verifica variables de entorno en Dashboard
- Los hashes deben incluir el prefijo `$2b$12$...`
- Reinicia el servicio después de cambiar variables

---

## 📝 Checklist de Seguridad

Antes de deploy a producción:

- [ ] Crear `.users.json` con contraseñas fuertes (8+ caracteres)
- [ ] Verificar que `.users.json` está en `.gitignore`
- [ ] NO subir credenciales a Git
- [ ] Configurar `ADMIN_PASSWORD_HASH` en Render.com
- [ ] Configurar `DEMO_PASSWORD_HASH` en Render.com
- [ ] Probar login antes de anunciar deployment
- [ ] Documentar contraseñas en gestor seguro (1Password, Bitwarden, etc.)

---

## 🔮 Mejoras Futuras

- [ ] JWT tokens en lugar de HTTP Basic Auth
- [ ] Múltiples usuarios admin
- [ ] Roles y permisos granulares
- [ ] Two-factor authentication (2FA)
- [ ] Password reset vía email
- [ ] Session management
- [ ] Rate limiting en login
- [ ] Audit log de accesos
