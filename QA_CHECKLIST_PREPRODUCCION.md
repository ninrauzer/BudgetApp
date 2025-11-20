# BudgetApp - QA Checklist Pre-Producción
**Fecha**: 20 Noviembre 2025  
**Ambiente**: Docker (192.168.126.127:8080)  
**Backend**: http://192.168.126.127:8000

---

## 🔍 Verificaciones Críticas

### ✅ Infrastructure & Deployment
- [ ] **Docker**: Ambos contenedores corriendo (frontend + backend)
  ```bash
  docker ps | grep budgetapp
  ```
- [ ] **Backend health**: `/api/health` responde 200 OK con estado "connected"
  ```bash
  curl http://192.168.126.127:8000/api/health
  ```
- [ ] **Database**: PostgreSQL conectado y funcional
  - [ ] `budgetapp_prod` accesible
  - [ ] `budgetapp_dev` accesible (para testing)
- [ ] **Network**: 192.168.126.127 alcanzable desde host

---

## 📱 Frontend - Páginas Críticas

### Dashboard
- [ ] Carga sin errores en consola (F12)
- [ ] **Zona de Decisión Instantánea**:
  - [ ] AvailableBalanceCard carga (hero card)
  - [ ] SpendingStatusCard carga
  - [ ] CashflowCard carga (con sparkline Nivo)
  - [ ] DebtRiskCard carga
  - [ ] UpcomingPaymentsCard carga
- [ ] **Contexto para Decidir**:
  - [ ] MonthProjectionCard carga
  - [ ] ProblemCategoryCard carga
- [ ] **Últimas Transacciones**: tabla carga correctamente
- [ ] Todos los números formateados en moneda (S/ o USD)

### Budget (Presupuesto)
- [ ] **Vista Anual carga**:
  - [ ] Selector de año (2025, 2026) funciona
  - [ ] Grid de 12 meses se renderiza
  - [ ] **Todos los meses tienen datos**:
    - [ ] Enero ✓
    - [ ] Febrero ✓
    - [ ] ... (todos)
    - [ ] Noviembre ✓ (CRÍTICO - probado hoy)
    - [ ] Diciembre ✓ (CRÍTICO - probado hoy)

### Drag-Fill (CRITICAL FIX)
- [ ] **Noviembre**: Drag-fill funciona
  - [ ] Seleccionar celda con valor en Noviembre
  - [ ] Ver icono de grip (círculos) en hover
  - [ ] Arrastrar a otras celdas
  - [ ] ✓ Toast "Celdas actualizadas"
  - [ ] ✓ Datos persisten (no vuelven a 0)
  - [ ] ✓ Se graban en BD con fechas correctas: 2025-10-23 a 2025-11-22

- [ ] **Diciembre**: Drag-fill funciona
  - [ ] Seleccionar celda con valor en Diciembre
  - [ ] Arrastrar a otras celdas
  - [ ] ✓ Toast "Celdas actualizadas"
  - [ ] ✓ Datos persisten
  - [ ] ✓ Se graban en BD con fechas correctas: 2025-11-23 a 2025-12-22

- [ ] **Otros meses**: Drag-fill funciona en al menos 3 meses más (verificar patrón)
  - [ ] Enero: ✓
  - [ ] Junio: ✓
  - [ ] Septiembre: ✓

### Analysis (Análisis)
- [ ] Página carga sin errores
- [ ] Charts renderean correctamente (Nivo):
  - [ ] Pie chart visible
  - [ ] Bar chart visible
  - [ ] Line chart visible
- [ ] Tabs funcionan (General, Ingresos, Gastos, Categorías)
- [ ] Datos coinciden con presupuesto

### Transactions (Transacciones)
- [ ] Tabla de transacciones carga
- [ ] Filtros funcionan (por fecha, categoría)
- [ ] Quick add row funciona
- [ ] Agregar transacción nueva: ✓
- [ ] Editar transacción: ✓
- [ ] Eliminar transacción: ✓

---

## 🗄️ Base de Datos - Validaciones

### Ciclos de Facturación
- [ ] Todos los 12 ciclos existen en `budget_plans`:
  ```sql
  SELECT DISTINCT cycle_name FROM budget_plans ORDER BY cycle_name;
  ```
  - Debe retornar: Enero, Febrero, ..., Diciembre (12 filas)

- [ ] Fechas de ciclos son correctas:
  ```sql
  SELECT cycle_name, MIN(start_date), MAX(end_date) 
  FROM budget_plans GROUP BY cycle_name ORDER BY cycle_name;
  ```
  - **Noviembre**: 2025-10-23 a 2025-11-22
  - **Diciembre**: 2025-11-23 a 2025-12-22
  - **Enero**: 2024-12-23 a 2025-01-22 (correctamente en años 2024-2025)

### Categorías
- [ ] Todas las categorías tienen iconos válidos (lucide-react):
  ```bash
  # No debe haber emoji ❌ ➕ 📱 etc en BD
  psql -U postgres -h 192.168.126.127 -d budgetapp_prod \
    -c "SELECT name, icon FROM categories WHERE icon LIKE '%\\%';"
  # Debe retornar 0 filas
  ```

- [ ] Categorías activas = 36 (o verificar conteo esperado):
  ```sql
  SELECT COUNT(*) FROM categories WHERE is_active = true;
  ```

### Datos
- [ ] Transacciones cargadas correctamente (mínimo 100+)
- [ ] Presupuestos cargados correctamente
- [ ] No hay registros duplicados por ciclo+categoría:
  ```sql
  SELECT cycle_name, category_id, COUNT(*) as cnt 
  FROM budget_plans 
  GROUP BY cycle_name, category_id 
  HAVING COUNT(*) > 1;
  # Debe retornar 0 filas
  ```

---

## 🎨 UI/UX - Validaciones Visuales

### Responsive
- [ ] Desktop (1920x1080): Todo visible sin scroll horizontal
- [ ] Tablet (768x1024): Grid se adapta correctamente
- [ ] Mobile (375x667): Cards apilados, responsive funciona

### Colores & Diseño
- [ ] Glass design en cards del dashboard visible (backdrop-blur)
- [ ] Gradientes de color funcionan:
  - [ ] Emerald (ingresos)
  - [ ] Rose (gastos)
  - [ ] Cyan (cashflow positivo)
  - [ ] Amber (saldo positivo)

### Iconos
- [ ] Todos los iconos se renderizan correctamente
- [ ] No hay errores de "Icon not found" en consola
- [ ] Iconos del dashboard: TrendingUp, TrendingDown, etc. visibles

### Animaciones
- [ ] Charts animados al cargar (Nivo wobbly/gentle)
- [ ] Hover effects funcionan (cards se elevan)
- [ ] Transiciones suaves (duration-200)

---

## 🔒 Seguridad & Performance

### Performance
- [ ] Dashboard carga en <2 segundos
- [ ] Budget carga en <3 segundos
- [ ] API responde <500ms en endpoints críticos:
  ```bash
  time curl http://192.168.126.127:8000/api/health
  ```

### Network
- [ ] No hay requests fallidos en Network tab (F12)
- [ ] CORS funciona correctamente
- [ ] No hay mixed content warnings

### Data Validation
- [ ] No puedo grabar montos negativos (validación)
- [ ] No puedo agregar categoría sin nombre
- [ ] Campos required están validados

---

## 🐛 Bugs Conocidos - VERIFICAR FIXES

### Bug #1: Drag-fill no grababa en Nov-Dic ✅ FIXED
- [x] Noviembre: drag-fill funciona
- [x] Diciembre: drag-fill funciona
- [x] Fechas en BD son correctas (2025, no 2024)

### Bug #2: React error #310 ✅ FIXED
- [x] Dashboard carga sin errores
- [x] Consola no muestra "Minified React error #310"
- [x] useMemo removido de CashflowCard
- [x] structuralSharing: false en React Query

### Bug #3: Emoji icons ✅ FIXED
- [x] No hay ❌ ➕ 📱 etc en BD
- [x] Todos los iconos son lucide-react válidos
- [x] Console no muestra "Icon not found" errors

---

## 📊 Casos de Uso Críticos

### Flujo 1: Agregar Presupuesto (Drag-Fill)
```
1. Abrir /budget
2. Ver tabla anual 2025
3. Encontrar categoría "Alquiler" en Noviembre
4. Ver icono de grip en hover
5. Arrastrar a otras celdas de Noviembre
6. Ver toast "Celdas actualizadas"
7. Refrescar página (Ctrl+F5)
8. Verificar que datos persisten
9. Ir a análisis y verificar que presupuesto se refleja
```
✓ Status: **PASSED** (probado 20 Nov)

### Flujo 2: Ver Dashboard
```
1. Abrir / (home)
2. Verificar que carga sin errores (F12 console)
3. Verificar que AvailableBalanceCard muestra saldo
4. Verificar que todos los charts cargan
5. Verificar que números están formateados
6. Verificar que ciclo actual es correcto
```
✓ Status: **PASSED** (probado 20 Nov)

### Flujo 3: Agregar Transacción
```
1. Abrir /transactions
2. Click en "Quick Add"
3. Llenar fecha, descripción, categoría, monto, cuenta
4. Presionar Enter
5. Verificar que aparece en tabla
6. Ir a Dashboard y verificar que presupuesto se actualiza
```
Status: **PENDING** (verificar hoy)

---

## 📝 Test Results Log

| Fecha | Tester | Página | Resultado | Notas |
|-------|--------|--------|-----------|-------|
| 2025-11-20 | Auto | Dashboard | ✅ PASS | Sin errores, React #310 fixed |
| 2025-11-20 | Auto | Budget | ✅ PASS | Drag-fill Nov-Dic working |
| 2025-11-20 | Auto | BD | ✅ PASS | Fechas corregidas a 2025 |
| | | | | |

---

## 🚀 Go-Live Readiness

**Bloqueadores**: 
- [ ] None - All critical issues fixed

**Warnings**:
- [ ] None

**Nice-to-Have (No bloqueador)**:
- [ ] Dark mode (opcional)
- [ ] Más gráficos de análisis (opcional)
- [ ] Export a PDF (opcional)

**Status**: 🟢 **READY FOR TESTING**

---

## 📋 Próximas Acciones

- [ ] Ejecutar este checklist completo
- [ ] Documentar cualquier nuevo bug encontrado
- [ ] Si todo ✅ PASS: Considerar como listo para Render.com
- [ ] Si hay ❌ FAIL: Crear issue y trackear fix

