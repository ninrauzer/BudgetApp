# 🎯 Guía Rápida: Administración de Usuarios

**Página de administración implementada exitosamente** ✅

---

## 🚀 Acceso Rápido

### URL de Administración
```
http://192.168.126.127:8080/admin/users
```

### Acceso desde la Aplicación
1. Haz login con tu cuenta (ninrauzer@gmail.com)
2. En el **Sidebar** (menú izquierdo), ve a la sección inferior
3. Click en **"Administración"** con icono de escudo (🛡️)

---

## 🔑 Permisos

### ¿Quién puede acceder?
Solo usuarios con **privilegios de administrador** (`is_admin=true`)

### Usuario Administrador Actual
- **Email:** ninrauzer@gmail.com
- **Status:** 👑 ADMIN
- **Configurado automáticamente** en la migración

---

## 📋 Funcionalidades Disponibles

### 1. Ver Usuarios Autorizados
- Lista completa de usuarios en la whitelist
- Estado: Activo ✅ / Inactivo ❌
- Información: email, nombre, fecha de agregado, quién lo agregó

### 2. Agregar Nuevo Usuario
**Pasos:**
1. Click en botón **"Agregar Usuario"** (arriba a la derecha)
2. Ingresa el **email** de la cuenta de Google (requerido)
3. Ingresa **nombre** (opcional)
4. Click **"Agregar"**

**Resultado:**
- Usuario agregado a la whitelist
- Estado: Activo por defecto
- Podrá hacer login inmediatamente

### 3. Activar/Desactivar Usuario
**Acción:**
- Click en icono de **toggle** (⚡) en la fila del usuario

**Efectos:**
- **Activo → Inactivo:** Usuario ya no podrá autenticarse (recibirá 403)
- **Inactivo → Activo:** Usuario podrá autenticarse nuevamente

**Ventaja:** No necesitas eliminar permanentemente, solo desactiva temporalmente

### 4. Eliminar Usuario
**Acción:**
- Click en icono de **basura** (🗑️) en la fila del usuario
- Confirmar eliminación en el diálogo

**Advertencia:** 
- ⚠️ Eliminación permanente (no se puede deshacer)
- ⚠️ No puedes eliminar tu propia cuenta

---

## 📊 Estadísticas en Dashboard Admin

### Tarjetas de Métricas

**1. Usuarios Autorizados**
- Total de usuarios en whitelist activos
- Cantidad de usuarios inactivos

**2. Administradores**
- Cantidad de admins en el sistema
- Cantidad de usuarios regulares

**3. Total Usuarios**
- Todos los usuarios registrados en el sistema

---

## 🔒 Restricciones de Seguridad

### Protecciones Implementadas

1. **No puedes desactivar tu propia cuenta**
   - Previene bloqueo accidental

2. **No puedes eliminar tu propia cuenta**
   - Siempre debe haber al menos un admin

3. **Solo admins pueden acceder a /admin/users**
   - Usuarios regulares reciben 403 Forbidden

4. **Duplicados no permitidos**
   - No puedes agregar el mismo email dos veces

---

## 🛠️ API Endpoints (Técnico)

Para integraciones o scripts:

### GET /api/admin/allowed-users
Lista todos los usuarios autorizados
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://192.168.126.127:8000/api/admin/allowed-users
```

### POST /api/admin/allowed-users
Agregar nuevo usuario
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@gmail.com", "name": "John Doe"}' \
  http://192.168.126.127:8000/api/admin/allowed-users
```

### PUT /api/admin/allowed-users/{id}/toggle
Activar/desactivar usuario
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  http://192.168.126.127:8000/api/admin/allowed-users/1/toggle
```

### DELETE /api/admin/allowed-users/{id}
Eliminar usuario permanentemente
```bash
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  http://192.168.126.127:8000/api/admin/allowed-users/1
```

### GET /api/admin/stats
Obtener estadísticas
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://192.168.126.127:8000/api/admin/stats
```

---

## 🎨 Diseño UI

### Elementos Visuales

**Header:**
- Título con icono de escudo
- Botón "Agregar Usuario" (gradiente morado)

**Stats Cards:**
- 3 tarjetas con métricas clave
- Iconos de usuarios y escudo
- Números grandes y fáciles de leer

**Tabla:**
- Columnas: Email, Nombre, Estado, Fecha, Agregado por, Acciones
- Badge de estado: Verde (activo) / Gris (inactivo)
- Hover highlighting en filas
- Acciones: Toggle y Eliminar

**Modal de Agregar:**
- Formulario con validación
- Email requerido (tipo email)
- Nombre opcional
- Botones: Cancelar / Agregar

**Alerts:**
- Éxito: Verde con ✓
- Error: Rojo con ✗
- Auto-desaparece después de mostrar

---

## 🧪 Testing

### Caso 1: Agregar Usuario
1. Abre http://192.168.126.127:8080/admin/users
2. Click "Agregar Usuario"
3. Email: `test@gmail.com`
4. Nombre: `Test User`
5. Verificar que aparece en la tabla

### Caso 2: Desactivar Usuario
1. En la tabla, encuentra a `test@gmail.com`
2. Click en toggle (⚡)
3. Verificar badge cambia a "Inactivo" gris
4. Intentar login con esa cuenta → debe fallar con 403

### Caso 3: Reactivar Usuario
1. En la tabla, encuentra usuario inactivo
2. Click en toggle (⚡) nuevamente
3. Verificar badge cambia a "Activo" verde
4. Intentar login → debe funcionar ahora

### Caso 4: Eliminar Usuario
1. En la tabla, click en basura (🗑️) de `test@gmail.com`
2. Confirmar eliminación
3. Verificar que desaparece de la tabla
4. Intentar login con esa cuenta → debe fallar con 403

---

## 🔍 Logs para Debugging

### Ver actividad de admin
```bash
docker compose logs backend -f | grep admin
```

**Mensajes importantes:**
- `[admin] ✅ User added to whitelist: <email> by <admin>`
- `[admin] User activado/desactivado: <email> by <admin>`
- `[admin] ⚠️ User deleted from whitelist: <email> by <admin>`

---

## ❓ Preguntas Frecuentes

**P: ¿Cómo hago a alguien más administrador?**
R: Ejecuta en la base de datos:
```sql
UPDATE users SET is_admin = true WHERE email = 'email@gmail.com';
```

**P: ¿Puedo tener múltiples admins?**
R: Sí, puedes tener tantos admins como necesites.

**P: ¿Qué pasa si elimino a todos los usuarios autorizados?**
R: Nadie podrá hacer login (excepto demo@budgetapp.local si existe).

**P: ¿Los cambios son inmediatos?**
R: Sí, los cambios en la whitelist se aplican de inmediato. El próximo login del usuario reflejará el cambio.

**P: ¿Puedo ver quién agregó a cada usuario?**
R: Sí, en la columna "Por" de la tabla.

**P: ¿Se puede deshacer una eliminación?**
R: No, las eliminaciones son permanentes. Usa desactivar en su lugar.

---

## 🎉 ¡Listo para usar!

Tu página de administración está **100% funcional**.

**Próximos pasos opcionales:**
- Agregar más admins para el equipo
- Agregar usuarios autorizados
- Monitorear logs de acceso
- Exportar lista de usuarios para backup

---

**Última actualización:** 2 Diciembre 2024  
**Desarrollado por:** GitHub Copilot
