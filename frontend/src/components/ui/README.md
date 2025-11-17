# Componentes UI Reutilizables

Este directorio contiene componentes de interfaz de usuario reutilizables construidos sobre shadcn/ui y Tailwind CSS.

## Componentes Disponibles

### 1. StatCard

Tarjeta para mostrar métricas y estadísticas con gradientes coloridos.

**Props:**
- `variant`: 'success' | 'danger' | 'info' | 'warning' | 'purple' | 'primary'
- `icon`: LucideIcon - Ícono a mostrar
- `label`: string - Etiqueta de la métrica
- `value`: string | number - Valor principal (sin símbolo de moneda)
- `currency?`: string - Código de moneda a mostrar después del valor (ej: 'PEN', 'USD')
- `subtitle?`: string - Texto secundario opcional
- `trend?`: { value: number; isPositive: boolean } - Indicador de tendencia opcional

**Ejemplo:**
```tsx
import { StatCard } from '@/components/ui/stat-card';
import { Wallet } from 'lucide-react';

<StatCard
  variant="success"
  icon={Wallet}
  label="Saldo Total"
  value="15,234.50"
  currency="PEN"
  subtitle="3 cuentas activas"
  trend={{ value: 12.5, isPositive: true }}
/>
```

**Formato de moneda:**
El componente muestra el valor y la moneda separados, siguiendo el formato:
`182,327.00 PEN` (número + espacio + código de moneda)

---

### 2. IconBadge

Badge circular con gradiente y un ícono centrado.

**Props:**
- `icon`: LucideIcon - Ícono a mostrar
- `variant?`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange'
- `size?`: 'sm' | 'md' | 'lg'

**Ejemplo:**
```tsx
import { IconBadge } from '@/components/ui/icon-badge';
import { Settings } from 'lucide-react';

<IconBadge icon={Settings} variant="primary" size="md" />
```

---

### 3. SectionHeader

Header de sección con ícono, título, descripción y acciones opcionales.

**Props:**
- `icon`: LucideIcon - Ícono del header
- `title`: string - Título de la sección
- `description?`: string - Descripción opcional
- `actions?`: ReactNode - Botones u otros elementos a la derecha
- `variant?`: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange'

**Ejemplo:**
```tsx
import { SectionHeader } from '@/components/ui/section-header';
import { Users } from 'lucide-react';

<SectionHeader
  icon={Users}
  title="Usuarios"
  description="Gestiona los usuarios del sistema"
  actions={
    <button className="btn-primary">Agregar Usuario</button>
  }
/>
```

---

### 4. LoadingSpinner

Spinner de carga con tamaños configurables y modo pantalla completa.

**Props:**
- `size?`: 'sm' | 'md' | 'lg' | 'xl'
- `fullScreen?`: boolean - Si es true, cubre toda la pantalla
- `message?`: string - Mensaje opcional bajo el spinner

**Ejemplo:**
```tsx
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Loading simple
<LoadingSpinner />

// Loading pantalla completa con mensaje
<LoadingSpinner fullScreen message="Cargando datos..." />
```

---

### 5. EmptyState

Estado vacío con ícono, mensaje y acción opcional.

**Props:**
- `icon`: LucideIcon - Ícono a mostrar
- `message`: string - Mensaje a mostrar
- `action?`: { label: string; onClick: () => void } - Acción opcional

**Ejemplo:**
```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  message="No hay elementos para mostrar"
  action={{
    label: "Crear Nuevo",
    onClick: () => handleCreate()
  }}
/>
```

---

### 6. PageHeader

Header de página con título, subtítulo y acciones.

**Props:**
- `title`: string - Título de la página
- `subtitle?`: string - Subtítulo opcional
- `actions?`: ReactNode - Botones u otros elementos a la derecha

**Ejemplo:**
```tsx
import { PageHeader } from '@/components/ui/page-header';

<PageHeader
  title="Dashboard"
  subtitle="Vista general de tu actividad"
  actions={
    <button className="btn-primary">Nueva Acción</button>
  }
/>
```

---

## Beneficios de Usar Estos Componentes

1. **Consistencia Visual**: Todos los componentes siguen el mismo sistema de diseño
2. **Menos Código**: Reduce duplicación de clases de Tailwind
3. **Mantenibilidad**: Cambios centralizados se propagan automáticamente
4. **Accesibilidad**: Componentes base ya incluyen mejores prácticas de a11y
5. **Type Safety**: Props totalmente tipadas con TypeScript
6. **Tema Unificado**: Soporte automático de modo oscuro y variables CSS

---

## Migración de Código Existente

### Antes:
```tsx
<div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl p-8 shadow-card text-white">
  <div className="flex items-center gap-3 mb-4">
    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
      <Wallet className="w-6 h-6" strokeWidth={2.5} />
    </div>
    <p className="text-emerald-100 font-medium">Saldo Total</p>
  </div>
  <p className="text-3xl font-bold">15,234.50 PEN</p>
  <p className="text-sm text-emerald-100 mt-2">3 cuentas activas</p>
</div>
```

### Después:
```tsx
<StatCard
  variant="success"
  icon={Wallet}
  label="Saldo Total"
  value="15,234.50"
  currency="PEN"
  subtitle="3 cuentas activas"
/>
```

**Reducción:** ~80% menos código, 100% más legible.

---

## Próximos Componentes Planificados

- [ ] **DataTable**: Tabla con sorting, paginación y acciones
- [ ] **GradientButton**: Botones con gradientes y estilos consistentes
- [ ] **TransactionRow**: Fila de transacción reutilizable
- [ ] **SettingsSection**: Sección de configuración pre-estructurada
- [ ] **ChartWrapper**: Wrapper consistente para gráficos

---

## Contribuir

Al crear nuevos componentes UI:

1. Seguir el patrón de `forwardRef` para refs DOM
2. Usar `cn()` utility para merge de clases
3. Exportar tipos de Props
4. Incluir `displayName` para debugging
5. Documentar con ejemplos en este README
6. Mantener consistencia con sistema de variantes de color
