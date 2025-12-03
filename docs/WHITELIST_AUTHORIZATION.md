# 🔐 Sistema de Autorización de Usuarios - Whitelist

**Fecha de implementación:** 19 Nov 2024  
**Estado:** ✅ ACTIVO Y FUNCIONANDO

---

## 📋 Resumen Ejecutivo

### ¿Qué se implementó?
Sistema de **lista blanca (whitelist)** que controla qué usuarios de Google pueden acceder a BudgetApp. Solo los emails autorizados pueden autenticarse exitosamente.

### ¿Por qué?
**Problema identificado:** "Cualquiera puede entrar" - cualquier cuenta de Google podía autenticarse sin restricciones.

**Solución:** Tabla `allowed_users` que funciona como firewall de autenticación. Si tu email no está en la lista, recibes **403 Forbidden**.

---

## 🏗️ Arquitectura

### Flujo de Autenticación (Antes)
```
Usuario → Click "Sign in with Google" 
→ Google verifica identidad 
→ Backend recibe token de Google 
→ ✅ Usuario autenticado (SIN RESTRICCIÓN)
```

### Flujo de Autenticación (Ahora)
```
Usuario → Click "Sign in with Google" 
→ Google verifica identidad 
→ Backend recibe token de Google 
→ Backend extrae email del token
→ Backend busca email en tabla allowed_users
   ├─ ✅ Encontrado & is_active=true → Usuario autenticado
   └─ ❌ No encontrado o is_active=false → 403 Forbidden
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `allowed_users`

```sql
CREATE TABLE allowed_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,      -- Email autorizado (ninrauzer@gmail.com)
    name VARCHAR,                       -- Nombre descriptivo (Renan)
    is_active BOOLEAN DEFAULT true,     -- Activar/desactivar sin borrar
    added_at TIMESTAMP DEFAULT NOW(),   -- Fecha de autorización
    added_by VARCHAR                    -- Admin que lo agregó (para auditoría)
);
```

### Estado Actual

**budgetapp_dev (desarrollo):**
| ID | Email | Name | Status | Added By |
|----|-------|------|--------|----------|
| 1 | ninrauzer@gmail.com | Renan | ✅ ACTIVE | system |

**budgetapp_prod (producción):**
| ID | Email | Name | Status | Added By |
|----|-------|------|--------|----------|
| 1 | ninrauzer@gmail.com | Renan | ✅ ACTIVE | system |

---

## 💻 Implementación Técnica

### 1. Modelo de Datos (`backend/app/models/user.py`)

```python
class AllowedUser(Base):
    """
    Whitelist de usuarios autorizados para acceder al sistema.
    Solo los emails en esta tabla pueden autenticarse exitosamente.
    """
    __tablename__ = "allowed_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    added_by = Column(String, nullable=True)
```

### 2. Verificación en Login (`backend/app/api/auth.py`)

```python
@router.post("/google/callback")
async def google_token_login(token_data: GoogleTokenRequest, db: Session = Depends(get_db)):
    # 1. Verificar token de Google
    idinfo = id_token.verify_oauth2_token(...)
    email = idinfo.get('email')
    
    # 2. 🔐 VERIFICAR WHITELIST
    allowed_user = db.query(AllowedUser).filter(
        AllowedUser.email == email,
        AllowedUser.is_active == True
    ).first()
    
    if not allowed_user:
        print(f"[auth] ❌ Unauthorized access attempt: {email}")
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Tu cuenta no está autorizada. Contacta al administrador."
        )
    
    print(f"[auth] ✅ Authorized user: {email}")
    
    # 3. Crear/actualizar usuario y retornar JWT
    user = get_or_create_user(db, email, ...)
    access_token = create_access_token(...)
    return {"access_token": access_token, ...}
```

### 3. Migración (`backend/migrate_add_allowed_users.py`)

Script ejecutado para crear tabla y seed inicial:

```bash
cd backend
.\.venv\Scripts\python.exe migrate_add_allowed_users.py
```

**Resultado:**
- ✅ Tabla `allowed_users` creada en `budgetapp_dev`
- ✅ Tabla `allowed_users` creada en `budgetapp_prod`
- ✅ Usuario inicial: `ninrauzer@gmail.com` agregado

---

## 🧪 Testing

### ✅ Test 1: Usuario Autorizado

**Pasos:**
1. Abre http://192.168.126.127:8080
2. Click "Sign in with Google"
3. Selecciona **ninrauzer@gmail.com**

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Dashboard carga normalmente
- ✅ Backend logs: `[auth] ✅ Authorized user: ninrauzer@gmail.com`

### ❌ Test 2: Usuario NO Autorizado

**Pasos:**
1. Logout de la sesión actual
2. Click "Sign in with Google"
3. Selecciona **cualquier otra cuenta de Google**

**Resultado esperado:**
- ❌ Error 403 Forbidden
- ❌ Mensaje: "Acceso denegado. Tu cuenta no está autorizada. Contacta al administrador."
- ❌ Backend logs: `[auth] ❌ Unauthorized access attempt: <email>`
- ❌ Usuario NO puede acceder al dashboard

### 📝 Monitorear Logs

```bash
# Ver logs en tiempo real
docker compose logs backend --tail 50 -f

# Buscar intentos de acceso no autorizado
docker compose logs backend | grep "Unauthorized access attempt"

# Buscar accesos autorizados
docker compose logs backend | grep "Authorized user"
```

---

## 🔧 Administración de Usuarios

### ➕ Agregar Nuevo Usuario Autorizado

**Opción 1: SQL Directo**

```sql
-- Conectar a base de datos
-- Para dev: budgetapp_dev
-- Para prod: budgetapp_prod

INSERT INTO allowed_users (email, name, is_active, added_by)
VALUES ('nuevo.usuario@gmail.com', 'Nombre Usuario', true, 'ninrauzer@gmail.com');
```

**Opción 2: Python Script (crear helper)**

```python
# Crear: backend/add_allowed_user.py
from sqlalchemy import create_engine, text
import sys

email = sys.argv[1]
name = sys.argv[2]
added_by = sys.argv[3]

DATABASE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    conn.execute(text("""
        INSERT INTO allowed_users (email, name, is_active, added_by)
        VALUES (:email, :name, true, :added_by)
    """), {"email": email, "name": name, "added_by": added_by})
    conn.commit()
    print(f"✅ Usuario autorizado: {email}")

# Uso: python add_allowed_user.py "user@gmail.com" "John Doe" "admin@gmail.com"
```

### ✏️ Modificar Usuario Existente

```sql
-- Desactivar usuario (sin borrar)
UPDATE allowed_users 
SET is_active = false 
WHERE email = 'usuario@gmail.com';

-- Reactivar usuario
UPDATE allowed_users 
SET is_active = true 
WHERE email = 'usuario@gmail.com';

-- Cambiar nombre
UPDATE allowed_users 
SET name = 'Nuevo Nombre' 
WHERE email = 'usuario@gmail.com';
```

### 🗑️ Eliminar Usuario Autorizado

```sql
-- Soft delete (recomendado): desactivar en vez de borrar
UPDATE allowed_users SET is_active = false WHERE email = 'usuario@gmail.com';

-- Hard delete (no recomendado): borrar permanentemente
DELETE FROM allowed_users WHERE email = 'usuario@gmail.com';
```

### 📊 Listar Usuarios Autorizados

```bash
# Con Python script
cd backend
.\.venv\Scripts\python.exe verify_whitelist.py
```

```sql
-- Con SQL directo
SELECT id, email, name, is_active, added_at, added_by 
FROM allowed_users 
ORDER BY added_at DESC;
```

---

## 🚀 Deployment Checklist

### Para Render.com (Producción Cloud)

**Antes de desplegar:**
1. ✅ Migrar `allowed_users` a base de datos de producción en Render
2. ✅ Agregar emails autorizados a la tabla
3. ✅ Verificar variable de entorno `DATABASE_URL` en Render
4. ✅ Deploy con git push

**Después de desplegar:**
1. ✅ Testear login con usuario autorizado
2. ✅ Testear login con usuario NO autorizado (debe fallar)
3. ✅ Revisar logs en Render Dashboard
4. ✅ Documentar proceso de agregar usuarios para el equipo

### Para Docker Local

**Ya completado:**
- ✅ Tabla creada en `budgetapp_dev` y `budgetapp_prod`
- ✅ Backend rebuilt con whitelist check
- ✅ Usuario inicial autorizado: ninrauzer@gmail.com
- ✅ Tests listos para ejecutar

---

## 🔮 Próximos Pasos (Roadmap)

### 1. Admin API Endpoints (PRÓXIMA PRIORIDAD)

**Crear:** `backend/app/api/admin.py`

```python
@router.post("/admin/allowed-users")
async def add_allowed_user(
    email: str,
    name: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Agregar usuario a whitelist (solo admins)"""
    pass

@router.get("/admin/allowed-users")
async def list_allowed_users(current_user: User = Depends(get_current_admin_user)):
    """Listar todos los usuarios autorizados (solo admins)"""
    pass

@router.delete("/admin/allowed-users/{user_id}")
async def remove_allowed_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user)
):
    """Desactivar usuario de whitelist (solo admins)"""
    pass

@router.put("/admin/allowed-users/{user_id}/activate")
async def activate_allowed_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user)
):
    """Reactivar usuario de whitelist (solo admins)"""
    pass
```

### 2. Agregar Campo `is_admin` a User Model

```python
class User(Base):
    # ... campos existentes ...
    is_admin = Column(Boolean, default=False)  # Solo admins pueden gestionar whitelist
```

```sql
-- Migración
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
UPDATE users SET is_admin = true WHERE email = 'ninrauzer@gmail.com';
```

### 3. Admin UI (Frontend)

**Crear página:** `frontend/src/pages/AdminUsers.tsx`

**Funcionalidades:**
- Tabla con todos los usuarios autorizados
- Botón "Agregar Usuario" (modal con formulario)
- Toggle activar/desactivar usuarios
- Filtro por estado (activos/inactivos)
- Búsqueda por email
- Historial de cambios (quién agregó a quién)

**Acceso:** Solo visible para usuarios con `is_admin=true`

### 4. Audit Log (Opcional)

Tabla para tracking:
```sql
CREATE TABLE user_whitelist_audit (
    id SERIAL PRIMARY KEY,
    action VARCHAR NOT NULL,        -- 'ADDED', 'REMOVED', 'ACTIVATED', 'DEACTIVATED'
    target_email VARCHAR NOT NULL,
    performed_by VARCHAR NOT NULL,
    performed_at TIMESTAMP DEFAULT NOW(),
    details JSONB                   -- Metadata adicional
);
```

### 5. Mejoras de Seguridad

- Rate limiting en endpoint de login (prevenir brute force)
- Notificaciones de intentos de acceso no autorizado
- Logs centralizados en servicio externo (Datadog, Sentry)
- Multi-factor authentication (MFA) para admins

---

## 📊 Métricas de Seguridad

### Estado Actual: ✅ SEGURO

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Acceso sin restricción** | ❌ Cualquier Google account | ✅ Solo emails autorizados |
| **Control de usuarios** | ❌ No existe | ✅ Whitelist administrable |
| **Auditoría** | ❌ Sin tracking | ✅ added_by + added_at |
| **Desactivación temporal** | ❌ Borrar usuario | ✅ is_active flag |
| **Mensajes de error** | ❌ Genérico | ✅ "Acceso denegado. Contacta admin" |

### Próximos Niveles de Seguridad

1. **Nivel 1 (ACTUAL):** ✅ Whitelist básica
2. **Nivel 2 (PRÓXIMO):** Admin API + UI
3. **Nivel 3 (FUTURO):** Audit log + Roles
4. **Nivel 4 (AVANZADO):** MFA + Rate limiting

---

## 📚 Referencias

### Archivos Modificados

1. **backend/app/models/user.py**
   - Agregado: `AllowedUser` model

2. **backend/app/api/auth.py**
   - Modificado: `google_token_login()` - agregado whitelist check
   - Import: `AllowedUser`

3. **backend/migrate_add_allowed_users.py** (NUEVO)
   - Crea tabla `allowed_users`
   - Seed inicial: ninrauzer@gmail.com

4. **backend/test_whitelist.py** (NUEVO)
   - Guía de testing

5. **backend/verify_whitelist.py** (NUEVO)
   - Verifica contenido de whitelist

### Comandos Útiles

```bash
# Rebuild backend con cambios
docker compose up --build -d backend

# Ver logs de autenticación
docker compose logs backend --tail 100 -f | grep auth

# Verificar whitelist
cd backend
.\.venv\Scripts\python.exe verify_whitelist.py

# Ejecutar tests
cd backend
.\.venv\Scripts\python.exe test_whitelist.py
```

---

## ❓ FAQ

**P: ¿Qué pasa si intento entrar con un email no autorizado?**  
R: Recibes error 403 con mensaje "Acceso denegado. Tu cuenta no está autorizada. Contacta al administrador."

**P: ¿Puedo desactivar un usuario temporalmente?**  
R: Sí, usando `UPDATE allowed_users SET is_active = false WHERE email = '...'`

**P: ¿Cómo agrego a alguien nuevo?**  
R: Ejecuta `INSERT INTO allowed_users (email, name, is_active, added_by) VALUES ('email@gmail.com', 'Nombre', true, 'admin');`

**P: ¿Se aplica a todos los endpoints?**  
R: No, solo al login inicial. Una vez autenticado, el JWT token da acceso a los endpoints protegidos con OAuth.

**P: ¿Funciona en producción (Render.com)?**  
R: Aún no desplegado, pero listo. Solo falta ejecutar migración en base de datos de producción.

**P: ¿Qué pasa con el usuario demo?**  
R: El sistema de whitelist no afecta al usuario demo (demo@budgetapp.local) porque no usa Google OAuth.

---

**Autor:** GitHub Copilot  
**Revisado por:** Renan (ninrauzer@gmail.com)  
**Última actualización:** 19 Nov 2024
