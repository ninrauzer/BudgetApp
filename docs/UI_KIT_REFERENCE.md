# BudgetApp UI Kit - Referencia de Componentes

> **Documentación completa del sistema de diseño. Base para todas las nuevas páginas.**

Fecha: 20 Noviembre 2025  
Referencia Visual: `http://localhost:5173/ui-kit`  
Estado: Production Ready ✅

---

## 📖 Tabla de Contenidos

1. [Componentes Disponibles](#componentes-disponibles)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado y Layout](#espaciado-y-layout)
5. [Patrones Reutilizables](#patrones-reutilizables)
6. [Checklist para Nuevas Páginas](#checklist-para-nuevas-páginas)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🧩 Componentes Disponibles

### 1. Button (Pill-shaped, Indigo)

**Variantes:**
```tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Primary (default)
<Button><Plus className="w-4 h-4" />Acción Principal</Button>

// Secondary
<Button variant="secondary">Secundaria</Button>

// Outline
<Button variant="outline">Outline</Button>

// Destructive
<Button variant="destructive">Eliminar</Button>

// Ghost
<Button variant="ghost">Subtle</Button>

// Link
<Button variant="link">Learn More</Button>
```

**Tamaños:**
- `size="sm"` - 36px altura
- `size="default"` - 40px altura (recomendado)
- `size="lg"` - 48px altura
- `size="icon"` - Cuadrado 40x40px

**Estilos:**
- Gradiente: `from-indigo-500 to-indigo-600`
- Sombra: `shadow-indigo-500/40` (hover: `/50`)
- Border-radius: `rounded-full` (pill-shaped)
- Animaciones: `hover:scale-105 active:scale-95`

---

### 2. Card (Glass Morphism)

**Uso Básico:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Título de la Tarjeta</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenido */}
  </CardContent>
</Card>
```

**Estilos:**
- Border-radius: `rounded-3xl`
- Fondo: Hereda `bg-card` (blanco)
- Sombra: `shadow-card`
- **Nuevo**: `backdrop-blur-md` (Glass Morphism)

**Uso con Gradiente (Premium):**
```tsx
<Card className="bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 border-none text-white shadow-card backdrop-blur-md">
  <CardContent className="p-6">
    {/* Contenido */}
  </CardContent>
</Card>
```

---

### 3. StatCard (Métricas con Glass Morphism)

**Uso:**
```tsx
import { StatCard } from '@/components/ui/stat-card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// Ingresos
<StatCard 
  variant="success" 
  icon={TrendingUp} 
  label="Ingresos" 
  value="45,500" 
  currency="PEN" 
  subtitle="Este mes" 
/>

// Gastos
<StatCard 
  variant="danger" 
  icon={TrendingDown} 
  label="Gastos" 
  value="32,200" 
  currency="PEN" 
  subtitle="Este mes" 
/>

// Saldo
<StatCard 
  variant="warning" 
  icon={DollarSign} 
  label="Saldo" 
  value="13,300" 
  currency="PEN" 
  subtitle="Disponible" 
/>
```

**Variantes:**
- `variant="success"` - Emerald (Ingresos)
- `variant="danger"` - Red (Gastos)
- `variant="info"` - Blue (Información)
- `variant="warning"` - Orange (Advertencia)
- `variant="purple"` - Purple (Premium)

**Estilos:**
- Gradientes con `/90` opacidad
- `backdrop-blur-md` para efecto cristal
- `shadow-lg` para elevación
- Animaciones: `hover:-translate-y-1 hover:shadow-xl`

---

### 4. Badge (Etiquetas)

**Uso:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Destructive</Badge>
```

**Variantes:**
- `default` - Gris neutro
- `secondary` - Gris suave
- `success` - Verde
- `warning` - Naranja
- `destructive` - Rojo

---

### 5. Componentes Dashboard

**SpendingStatusCard** - Estado de gasto (semáforo)
```tsx
import { SpendingStatusCard } from '@/components/dashboard/SpendingStatusCard';

<SpendingStatusCard />
```

**CashflowCard** - Balance con sparkline
```tsx
import { CashflowCard } from '@/components/dashboard/CashflowCard';

<CashflowCard />
```

**DebtRiskCard** - Resumen de deuda
```tsx
import { DebtRiskCard } from '@/components/dashboard/DebtRiskCard';

<DebtRiskCard />
```

**MonthProjectionCard** - Proyección de cierre
```tsx
import { MonthProjectionCard } from '@/components/dashboard/MonthProjectionCard';

<MonthProjectionCard />
```

**ProblemCategoryCard** - Categoría con desviación
```tsx
import { ProblemCategoryCard } from '@/components/dashboard/ProblemCategoryCard';

<ProblemCategoryCard />
```

---

## 🎨 Paleta de Colores

### Colores Semánticos

| Uso | Colores | Ejemplo |
|-----|---------|---------|
| **Ingresos / Éxito** | `emerald-400/500/600` | `from-emerald-400/90 to-emerald-500/90` |
| **Gastos / Peligro** | `rose-400/500/600` | `from-rose-400/90 to-rose-500/90` |
| **Positivo / Balance** | `amber-400/orange-500` | `from-amber-400/90 to-orange-500/90` |
| **Negativo / Crítico** | `red-500/600` | `from-red-500/90 to-red-600/90` |
| **Información** | `blue-400/500` | `from-blue-400/90 to-blue-500/90` |
| **Premium / Acciones** | `indigo-500/600` | Botones Primary |
| **Balance Positivo** | `cyan-400/500` | `from-cyan-400/90 to-cyan-500/90` |
| **Proyecciones +** | `indigo-400/500` | `from-indigo-400/90 to-indigo-500/90` |
| **Proyecciones -** | `orange-400/500` | `from-orange-400/90 to-orange-500/90` |
| **Alertas** | `pink-400/500` | `from-pink-400/90 to-pink-500/90` |
| **Sin Problemas** | `teal-400/500` | `from-teal-400/90 to-teal-500/90` |

### Colores Neutrales

```tsx
// Backgrounds
bg-white         // Cards principales
bg-surface       // #F9FAFB - Fondo de página
bg-surface-soft  // Hover states

// Text
text-text-primary    // #1a1a1a - Títulos
text-text-secondary  // #666666 - Descripciones
text-text-muted      // #999999 - Labels

// Borders
border-border    // #E5E7EB
```

---

## 📝 Tipografía

### Headings

```tsx
// H1 - Títulos de página
<h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
  Título Principal
</h1>

// H2 - Títulos de sección
<h2 className="text-2xl font-extrabold text-text-primary">
  Sección
</h2>

// H3 - Sub-títulos
<h3 className="text-xl font-extrabold text-text-primary">
  Subsección
</h3>
```

### Body Text

```tsx
// Texto principal
<p className="text-base text-text-primary">
  Contenido principal
</p>

// Texto secundario
<p className="text-sm text-text-secondary">
  Descripción o contexto
</p>

// Texto muy pequeño
<p className="text-xs text-text-muted">
  Label o metadata
</p>
```

### Font Weights

```tsx
font-medium      // 500 - Subtítulos, labels
font-bold        // 700 - Títulos, énfasis
font-extrabold   // 800 - Títulos grandes
font-black       // 900 - Números grandes
```

---

## 📐 Espaciado y Layout

### Espaciado Estándar

```tsx
// Horizontal padding
px-4   // 16px (pequeño)
px-6   // 24px (estándar)
px-8   // 32px (grande)

// Vertical padding
py-4   // 16px (pequeño)
py-6   // 24px (estándar)
py-8   // 32px (grande)

// Gaps entre elementos
gap-2  // 8px (tight)
gap-3  // 12px (normal)
gap-4  // 16px (comfortable)
gap-6  // 24px (spacious)

// Espaciado vertical entre secciones
space-y-6  // 24px (secciones en página)
space-y-8  // 32px (entre páginas)
```

### Border Radius

```tsx
rounded-lg    // 8px - Botones pequeños
rounded-xl    // 12px - Cards medianas
rounded-2xl   // 16px - Cards grandes
rounded-3xl   // 24px - Card component default
rounded-full  // 9999px - Botones pill-shaped
```

### Shadows

```tsx
shadow-sm         // Sutil
shadow-card       // Cards (estándar)
shadow-lg         // Elevación media
shadow-xl         // Elevación alta
shadow-2xl        // Elevación máxima

// Con color (nuevo)
shadow-indigo-500/40    // Sombra tintada
shadow-emerald-500/40   // Sombra verde
```

---

## 🎯 Patrones Reutilizables

### Patrón: Page Container

```tsx
export default function MyPage() {
  return (
    <div className="w-full space-y-12 py-8">
      {/* Header */}
      <div className="px-8">
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
          Título de Página
        </h1>
        <p className="text-lg text-text-secondary mt-2">
          Descripción corta
        </p>
      </div>

      {/* Secciones */}
      <section className="px-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-text-primary">
            Sección 1
          </h2>
          <p className="text-sm text-text-secondary">Subtítulo</p>
        </div>
        {/* Contenido */}
      </section>
    </div>
  );
}
```

### Patrón: Grid de Métricas

```tsx
// 3 columnas en desktop, 1 en mobile
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatCard variant="success" icon={TrendingUp} label="Ingresos" value="45,500" currency="PEN" />
  <StatCard variant="danger" icon={TrendingDown} label="Gastos" value="32,200" currency="PEN" />
  <StatCard variant="warning" icon={DollarSign} label="Saldo" value="13,300" currency="PEN" />
</div>
```

### Patrón: Tabla con Cards

```tsx
<div className="space-y-3">
  {items.map((item) => (
    <Card key={item.id} className="hover:shadow-lg transition-all">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="font-bold text-text-primary">{item.name}</p>
          <p className="text-sm text-text-secondary">{item.description}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-text-primary">{item.value}</p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### Patrón: Header con Acciones

```tsx
<div className="flex items-center justify-between mb-6 px-8">
  <div>
    <h1 className="text-2xl font-extrabold text-text-primary">
      Título
    </h1>
  </div>
  <div className="flex gap-3">
    <Button variant="outline">Cancelar</Button>
    <Button><Plus className="w-4 h-4" />Nuevo</Button>
  </div>
</div>
```

---

## ✅ Checklist para Nuevas Páginas

Antes de crear una nueva página, asegúrate de:

### Estructura
- [ ] Página en `frontend/src/pages/NombrePage.tsx`
- [ ] Ruta añadida en `App.tsx`
- [ ] Accesible desde navegación (si aplica)

### Componentes
- [ ] ¿Usa Button en lugar de `<button>`?
- [ ] ¿Usa Card en lugar de divs?
- [ ] ¿Usa Badge para etiquetas?
- [ ] ¿Usa StatCard para métricas?
- [ ] ¿Evita crear nuevos componentes duplicados?

### Espaciado
- [ ] ¿Usa `space-y-6` o `space-y-8` entre secciones?
- [ ] ¿Padding consistente: `px-8` en contenedores?
- [ ] ¿Gaps consistentes: `gap-6` en grids?

### Colores
- [ ] ¿Usa colores semánticos correctos (emerald/rose/amber)?
- [ ] ¿Gradientes con `/90` opacidad si usan glass morphism?
- [ ] ¿Contraste suficiente (WCAG AA)?

### Tipografía
- [ ] ¿H1 es `text-4xl font-extrabold`?
- [ ] ¿H2 es `text-2xl font-extrabold`?
- [ ] ¿Body es `text-base`?
- [ ] ¿Secundario es `text-sm text-text-secondary`?

### Responsive
- [ ] ¿Funciona en mobile (320px)?
- [ ] ¿Grids usan `grid-cols-1 md:grid-cols-X`?
- [ ] ¿Padding/spacing se adapta?

### Animaciones
- [ ] ¿Cards tienen `hover:shadow-lg transition-all`?
- [ ] ¿Botones tienen escala correcta (`hover:scale-105 active:scale-95`)?
- [ ] ¿No hay efectos que ralenticen?

### Accesibilidad
- [ ] ¿Todos los inputs tienen labels?
- [ ] ¿Focus states visibles?
- [ ] ¿Colores no son la única diferencia?

---

## 📚 Ejemplos Prácticos

### Ejemplo 1: Página Simple (Dashboard-like)

```tsx
import { StatCard } from '@/components/ui/stat-card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SimpleMetricsPage() {
  return (
    <div className="w-full space-y-12 py-8">
      {/* Header */}
      <div className="px-8">
        <h1 className="text-4xl font-extrabold text-text-primary">Métricas</h1>
        <p className="text-text-secondary mt-2">Resumen de este mes</p>
      </div>

      {/* Stats Grid */}
      <section className="px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard variant="success" icon={TrendingUp} label="Ingresos" value="45,500" currency="PEN" />
          <StatCard variant="danger" icon={TrendingDown} label="Gastos" value="32,200" currency="PEN" />
          <StatCard variant="warning" icon={DollarSign} label="Saldo" value="13,300" currency="PEN" />
        </div>
      </section>

      {/* Content Card */}
      <section className="px-8 space-y-6">
        <h2 className="text-2xl font-extrabold text-text-primary">Detalles</h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-text-secondary">Información adicional...</p>
          </CardContent>
        </Card>
      </section>

      {/* Actions */}
      <section className="px-8 flex gap-3">
        <Button variant="outline">Cancelar</Button>
        <Button>Guardar</Button>
      </section>
    </div>
  );
}
```

### Ejemplo 2: Página con Tabla

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const items = [
  { id: 1, name: 'Item 1', status: 'success', value: '100' },
  { id: 2, name: 'Item 2', status: 'warning', value: '200' },
];

export default function ListPage() {
  return (
    <div className="w-full space-y-8 py-8">
      <div className="px-8">
        <h1 className="text-4xl font-extrabold text-text-primary">Lista</h1>
      </div>

      <section className="px-8 space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-primary">{item.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={item.status === 'success' ? 'success' : 'warning'}>
                  {item.status}
                </Badge>
                <p className="font-bold text-text-primary">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
```

---

## 🔗 Referencias

- **Glass Morphism Standard**: `.github/GLASS_MORPHISM_STANDARD.md`
- **Button Premium Standard**: `.github/BUTTON_PREMIUM_STANDARD.md`
- **UI Kit Visual**: `http://localhost:5173/ui-kit` ⭐

---

## 📋 Resumen Rápido

| Necesidad | Usa |
|-----------|-----|
| Acción principal | `<Button>` |
| Acción secundaria | `<Button variant="secondary">` |
| Eliminar | `<Button variant="destructive">` |
| Contenedor | `<Card>` |
| Métrica importante | `<StatCard>` |
| Etiqueta | `<Badge>` |
| Color de éxito | `emerald-` |
| Color de error | `rose-` o `red-` |
| Espaciado entre secciones | `space-y-6` |
| Espaciado entre items | `gap-3` |

---

**Última Actualización**: 20 Nov 2025  
**Base**: http://localhost:5173/ui-kit  
**Estado**: Production Ready ✅
