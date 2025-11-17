---
applyTo: '**'
---
# BudgetApp - Información del Proyecto

## 📁 Estructura de Directorios
```
E:\Desarrollo\BudgetApp\
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── lib/            # Utilidades y APIs
│   │   └── contexts/       # Contextos React
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/            # Endpoints REST
│   │   ├── db/             # Base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   └── services/       # Lógica de negocio
│   ├── .venv/              # Entorno virtual Python
│   └── requirements.txt
└── docs/                   # Documentación
```

## 🚀 Comandos de Desarrollo

### Opción 1: Render.com (Producción)
```bash
# Push a GitHub
git add .
git commit -m "deploy: production release"
git push origin master

# Render despliega automáticamente
```

**URLs**:
- Frontend: https://budgetapp-frontend.onrender.com
- Backend: https://budgetapp-backend.onrender.com
- API Docs: https://budgetapp-backend.onrender.com/docs

📖 Ver [RENDER.md](../../RENDER.md) para documentación completa

### Opción 2: Docker (Local/Self-Hosted)
```bash
# Iniciar aplicación completa
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down
```

**URLs**:
- Frontend: http://localhost
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

📖 Ver [DOCKER.md](../../DOCKER.md) para documentación completa

### Opción 3: Desarrollo Local

#### Frontend (Puerto 5173/5174)
```bash
cd E:\Desarrollo\BudgetApp\frontend
npm run dev          # Servidor desarrollo
npm run build        # Build producción
```

#### Backend (Puerto 8000)
```bash
cd E:\Desarrollo\BudgetApp\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

## 🗄️ Base de Datos
- **Ubicación**: `E:\Desarrollo\BudgetApp\backend\budget.db`
- **Tipo**: SQLite
- **Modelos principales**: Account, Category, Transaction, BudgetPlan

## 🎨 Stack Tecnológico
- **Frontend**: React 18, TypeScript, Vite 7, Tailwind CSS 3
- **Backend**: FastAPI, SQLAlchemy, Uvicorn
- **Base de datos**: SQLite
- **Estado**: TanStack Query (React Query)
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 🔧 Configuración
- **Moneda por defecto**: PEN (Soles peruanos)
- **Conversión**: USD via exchange rate API
- **Tema**: Glass design con backdrop-blur
- **Drag & Drop**: @dnd-kit

## 📅 Sistema de Ciclos de Facturación
- **Inicio de ciclo**: Día 23 de cada mes
- **Duración**: Variable (28-31 días según mes)
- **Funciones clave**: `get_cycle_for_date()`, `get_cycle_by_offset()`
- **Parámetro API**: `cycle_offset` (0=actual, -1=anterior, 1=siguiente)
- **Base de datos**: Tabla `billing_cycle` con campos `start_date`, `end_date`, `start_day`
- **Ejemplo actual**: 2025-10-23 a 2025-11-22 (30 días)

---

GUIA VISUAL
# BudgetApp - Guía de Diseño Visual

> **Documento de referencia para mantener consistencia visual en todo el proyecto**

---

## 📐 Principios Fundamentales de Diseño

### 1. Decisión sobre Decoración
- Cada elemento debe tener un **propósito funcional claro**
- Priorizar **información accionable** sobre métricas pasivas
- Eliminar redundancia visual y cognitiva

### 2. Jerarquía Visual Clara
- **Hero elements**: Información crítica (más grande, más color)
- **Supporting elements**: Contexto (tamaño medio, colores sutiles)
- **Actions**: Botones y enlaces (siempre accesibles)

### 3. Consistencia sobre Creatividad
- Mismo patrón de diseño = menor carga cognitiva
- Reutilizar componentes antes de crear nuevos
- Colores predecibles según función, no aleatorios

### 4. Mobile-First Responsive
- Grid adapta de 1 columna (mobile) → 3 columnas (desktop)
- Touch targets mínimo 44px × 44px
- Texto legible sin zoom (mínimo 14px)

### 5. Performance Visual
- Animaciones ligeras (`duration-200`)
- Lazy loading para charts pesados
- Evitar re-renders innecesarios

---

## 🎨 Sistema de Design Tokens

### Espaciado (Tailwind Scale)
```css
/* Spacing interno de componentes */
p-4:   1rem    /* 16px - Pequeño */
p-6:   1.5rem  /* 24px - Estándar */
p-8:   2rem    /* 32px - Grande */

/* Gaps entre elementos */
gap-3: 0.75rem /* 12px - Apretado */
gap-4: 1rem    /* 16px - Normal */
gap-6: 1.5rem  /* 24px - Espacioso */

/* Márgenes verticales */
space-y-6: 1.5rem /* Entre secciones */
space-y-8: 2rem   /* Entre páginas */
```

### Bordes y Radios
```css
/* Bordes */
border:   1px solid
border-2: 2px solid

/* Border radius */
rounded-lg:  0.5rem  /* 8px  - Botones */
rounded-xl:  0.75rem /* 12px - Cards pequeñas */
rounded-2xl: 1rem    /* 16px - Cards grandes */

/* Border colors */
border-border:        /* Gris claro (default) */
border-primary/30:    /* Hover effect */
```

### Sombras
```css
shadow-sm:     /* Elevación sutil */
shadow-card:   /* Cards estándar */
shadow-lg:     /* Glass cards premium */
shadow-xl:     /* Hover states */

/* Sombras de color específico */
shadow-[0_0_20px_rgba(251,191,36,0.3)] /* Glow dorado */
```

### Tipografía
```css
/* Headings */
text-h1: text-3xl font-bold           /* Títulos de página */
text-h2: text-2xl font-extrabold      /* Secciones */
text-h3: text-xl font-extrabold       /* Sub-secciones */

/* Body */
text-body-sm: text-sm                 /* Secundario */
text-body:    text-base               /* Principal */

/* Font weights */
font-medium:   500
font-bold:     700
font-extrabold: 800
font-black:     900  /* Solo para números grandes */

/* Tracking */
tracking-tight:  -0.025em  /* Números grandes */
tracking-wide:   0.025em   /* Labels uppercase */
tracking-wider:  0.05em    /* Énfasis */
```

---

## 🎨 Sistema de Colores Semántico

> **Base:** Tarjetas principales de Budget (/budget)

### Paleta Base (Budget Cards)
```css
/* Ingresos (Verde Esmeralda) */
bg-gradient-to-br from-emerald-400/90 to-emerald-500/90
emerald-600 /* Texto/íconos en fondos blancos */
emerald-50  /* Backgrounds suaves */

/* Gastos (Rojo/Rosa) */
bg-gradient-to-br from-rose-400/90 to-rose-500/90
rose-600    /* Texto/íconos en fondos blancos */
rose-50     /* Backgrounds suaves */

/* Saldo Positivo (Amarillo/Naranja con glow) */
bg-gradient-to-br from-amber-400/90 to-orange-500/90
shadow-[0_0_20px_rgba(251,191,36,0.3)] /* Glow dorado */

/* Saldo Negativo (Rojo intenso con glow) */
bg-gradient-to-br from-red-500/90 to-red-600/90
shadow-[0_0_20px_rgba(239,68,68,0.3)] /* Glow rojo */
```

### Extensiones para Dashboard
```css
/* Spending Status - Semáforo */
blue:   from-blue-400/90 to-blue-500/90      /* Bajo control */
amber:  from-amber-400/90 to-orange-500/90   /* En rango (usa Saldo Positivo) */
rose:   from-rose-400/90 to-rose-500/90      /* Exceso (usa Gastos) */

/* Cashflow */
cyan:   from-cyan-400/90 to-cyan-500/90      /* Balance positivo */
rose:   from-rose-400/90 to-rose-500/90      /* Balance negativo (usa Gastos) */

/* Debt Risk */
purple: from-purple-400/90 to-purple-500/90  /* Saludable */
orange: from-orange-400/90 to-orange-500/90  /* Precaución */
red:    from-red-400/90 to-red-500/90        /* Crítico */

/* Projection */
indigo: from-indigo-400/90 to-indigo-500/90  /* Positivo */
orange: from-orange-400/90 to-orange-500/90  /* Negativo */

/* Problem Category */
pink:   from-pink-400/90 to-pink-500/90      /* Con desviación */
teal:   from-teal-400/90 to-teal-500/90      /* Sin problema */
```

### Categorías Financieras (Tipos de Gasto)
```css
/* Gastos Fijos */
rose-600, rose-500  /* Compromisos recurrentes */

/* Gastos Variables */
pink-600, pink-500  /* Discrecionales */

/* Sin tipo definido */
gray-600, gray-500  /* Categorías legacy sin expense_type */
```

### Colores Neutrales
```css
/* Backgrounds */
bg-white            /* Cards principales */
bg-surface          /* #F9FAFB - Fondo de página */
bg-surface-soft     /* Hover states */
bg-gray-50/100/200  /* Degradados sutiles */

/* Text */
text-text-primary   /* #1a1a1a - Títulos y valores */
text-text-secondary /* #666666 - Descripciones */
text-text-muted     /* #999999 - Labels terciarios */

/* Borders */
border-border       /* #E5E7EB - Separadores */
```

---

## 🎨 Diseño Glass Premium (Glass Morphism)

> **Patrón base extraído de Budget (/budget) - Tarjetas de resumen anual**

### Anatomía Exacta de Budget Glass Card
```tsx
<div className="
  group relative 
  rounded-2xl p-6 
  text-white 
  shadow-lg backdrop-blur-md 
  bg-gradient-to-br from-emerald-400/90 to-emerald-500/90
  transition-all duration-200 
  hover:-translate-y-1 hover:shadow-xl
">
  {/* Icono superior izquierdo */}
  <div className="flex items-center justify-between mb-4">
    <TrendingUp className="w-8 h-8 text-white/80" strokeWidth={2} />
  </div>
  
  {/* Label superior (uppercase) */}
  <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">
    Ingresos Anuales
  </p>
  
  {/* Valor principal (bold, grande) */}
  <p className="text-3xl font-black text-white tracking-tight mb-1">
    S/ 50,000.00
  </p>
  
  {/* Texto secundario (pequeño, sutil) */}
  <p className="text-white/60 text-xs">
    ~S/ 4,166/mes
  </p>
</div>
```

### Variante con Glow Effect (Saldo)
```tsx
<div className={cn(
  "group relative rounded-2xl p-6 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl",
  totalSaving >= 0 
    ? "bg-gradient-to-br from-amber-400/90 to-orange-500/90 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
    : "bg-gradient-to-br from-red-500/90 to-red-600/90 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
)}>
  {/* Mismo contenido */}
</div>
```

### Clases Clave (Budget Standard)
```css
/* Container */
rounded-2xl              /* 16px border radius */
p-6                      /* 24px padding */
text-white               /* Todo el texto blanco */

/* Glass effect */
shadow-lg                /* Sombra base */
backdrop-blur-md         /* Efecto cristal */
bg-gradient-to-br        /* Gradiente diagonal */
from-COLOR-400/90        /* Color inicio 90% opacidad */
to-COLOR-500/90          /* Color fin 90% opacidad */

/* Animaciones */
transition-all duration-200
hover:-translate-y-1     /* Elevación 4px */
hover:shadow-xl          /* Sombra más pronunciada */

/* Iconos */
w-8 h-8                  /* 32×32px */
text-white/80            /* 80% opacidad */
strokeWidth={2}          /* Grosor líneas */

/* Tipografía */
text-white/70            /* Labels - 70% opacidad */
text-xs                  /* 12px - Labels y secundario */
font-medium              /* Weight 500 - Labels */
uppercase tracking-wider /* Labels en mayúsculas */

text-3xl                 /* 30px - Valor principal */
font-black               /* Weight 900 - Números */
tracking-tight           /* Espaciado ajustado */

text-white/60            /* Secundario - 60% opacidad */
```

### Cuándo Usar Glass Design
✅ **SÍ usar:**
- Tarjetas de métricas principales (Dashboard, Budget)
- Resúmenes importantes (totales anuales)
- Cards con gradientes de color

❌ **NO usar:**
- Listas de transacciones (usar bg-white)
- Formularios (usar bg-white)
- Tablas de datos (usar bg-white)

---

## 🧩 Componentes Reutilizables

### Glass Card (Base Template)
```tsx
// Componente base para métricas con glass design
<div className={`
  rounded-2xl p-6 text-white shadow-lg backdrop-blur-md 
  ${gradient} 
  transition-all duration-200 hover:-translate-y-1 hover:shadow-xl
`}>
  {/* Header con icono */}
  <div className="flex items-center justify-between mb-4">
    <Icon className="w-8 h-8 text-white/80" strokeWidth={2} />
  </div>
  
  {/* Label + Valor + Descripción */}
  <p className="text-white/70 text-xs mb-2 font-medium uppercase tracking-wider">
    Label
  </p>
  <p className="text-3xl font-black text-white tracking-tight mb-1">
    Valor Principal
  </p>
  <p className="text-white/60 text-sm">Descripción</p>
  
  {/* Stats opcionales */}
  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
    {/* Stats */}
  </div>
</div>
```

### White Card (Lists/Forms)
```tsx
// Para listas, tablas, formularios
<div className="
  bg-white 
  border-2 border-border 
  rounded-xl 
  hover:border-primary/30 hover:shadow-md 
  transition-all 
  shadow-card
">
  {/* Header con separador */}
  <div className="p-6 border-b-2 border-border">
    <h3 className="text-xl font-extrabold text-text-primary">Título</h3>
    <p className="text-xs text-text-secondary mt-1">Subtítulo</p>
  </div>
  
  {/* Content */}
  <div className="p-6">
    {/* Contenido */}
  </div>
</div>
```

### Action Button (Primary)
```tsx
<button className="
  flex items-center gap-2 
  px-4 py-2 
  rounded-lg 
  bg-gradient-to-r from-purple-500 to-indigo-600 
  text-white 
  shadow-lg shadow-purple-500/30
  font-bold text-sm
  transition-all
  hover:scale-105
">
  <Icon className="w-4 h-4" strokeWidth={2.5} />
  Texto Botón
</button>
```

### Action Link (Secondary)
```tsx
<a className="
  flex items-center gap-4 p-4 
  rounded-xl 
  bg-gradient-to-r from-emerald-50 to-emerald-100 
  hover:from-emerald-100 hover:to-emerald-200 
  border border-emerald-200 
  transition-all 
  group
">
  <div className="
    flex h-12 w-12 items-center justify-center 
    rounded-xl 
    bg-emerald-500 text-white 
    group-hover:scale-110 transition-transform
  ">
    <Icon className="h-6 w-6" strokeWidth={2.5} />
  </div>
  <div className="flex-1">
    <p className="font-bold text-text-primary">Título</p>
    <p className="text-xs text-text-secondary">Descripción</p>
  </div>
</a>
```

### Tab Navigation
```tsx
<div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
  {/* Tab activo */}
  <button className="
    flex items-center gap-2 px-4 py-2 rounded-lg 
    bg-gradient-to-r from-purple-500 to-indigo-600 
    text-white shadow-lg shadow-purple-500/30
    font-bold text-sm
  ">
    <Icon className="w-4 h-4" strokeWidth={2.5} />
    ACTIVO
  </button>
  
  {/* Tab inactivo */}
  <button className="
    flex items-center gap-2 px-4 py-2 rounded-lg 
    text-text-secondary 
    hover:text-text-primary hover:bg-surface-hover
    font-bold text-sm transition-all
  ">
    <Icon className="w-4 h-4" strokeWidth={2.5} />
    INACTIVO
  </button>
</div>
```

### Category Icon Badge
```tsx
<div className={`p-1.5 rounded-lg ${
  type === 'income' ? 'bg-emerald-100' : 'bg-orange-100'
}`}>
  <CategoryIcon 
    iconName={icon} 
    className={type === 'income' ? 'text-emerald-600' : 'text-orange-600'} 
    size={18} 
  />
</div>
```

---

## 📊 Charts y Visualizaciones (Recharts)

### Configuración Base
```tsx
import { ResponsiveContainer, LineChart, Line, PieChart, Pie } from 'recharts';

// Array de colores para charts
const COLORS = [
  '#10B981', '#F43F5E', '#EC4899', '#8B5CF6', 
  '#3B82F6', '#F59E0B', '#06B6D4', '#84CC16'
];
```

### Line Chart (Sparkline)
```tsx
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={dailyData}>
    <Line 
      type="monotone" 
      dataKey="balance" 
      stroke="rgba(255,255,255,0.8)" 
      strokeWidth={2} 
      dot={false}
    />
  </LineChart>
</ResponsiveContainer>
```

### Pie Chart (Distribución)
```tsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={100}
      label
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip formatter={(value) => formatCurrency(value)} />
  </PieChart>
</ResponsiveContainer>
```

### Gauge Chart (Presupuesto)
```tsx
<RadialBarChart 
  width={200} height={200} 
  innerRadius="70%" outerRadius="100%"
  data={[{ value: percentage, fill: getColor(percentage) }]}
  startAngle={180} endAngle={0}
>
  <RadialBar dataKey="value" />
</RadialBarChart>
```

---

## 🏗️ Patrones de Layout

### Page Container
```tsx
<div className="space-y-8"> {/* Espaciado vertical entre secciones */}
  {/* Header */}
  <div>
    <h1 className="text-h1 font-bold text-text-primary">Título Página</h1>
    <p className="text-body-sm text-text-secondary mt-1">Descripción</p>
  </div>

  {/* Sección 1 */}
  <div className="space-y-6">
    <h2 className="text-h2 font-extrabold text-text-primary">Sección</h2>
    {/* Contenido */}
  </div>
</div>
```

### Grid Responsive
```tsx
{/* 1 columna mobile → 2 desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card />
  <Card />
</div>

{/* 1 columna mobile → 3 desktop */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>
```

### Sidebar + Content
```tsx
{/* Sidebar */}
<div className={`
  fixed left-0 top-0 h-screen
  ${isCollapsed ? 'w-20' : 'w-60'}
  transition-all duration-300
`}>
  {/* Sidebar content */}
</div>

{/* Main content */}
<div className={`
  ${isCollapsed ? 'ml-20' : 'ml-60'}
  transition-all duration-300
  p-6
`}>
  {/* Page content */}
</div>
```

---

## 📱 Pantallas Principales

### 📊 Dashboard
**Filosofía:** "¿Estoy bien o estoy jodido este mes?"

**Estructura:**
```
┌─────────────────────────────────────┐
│ Hero: AvailableBalanceCard          │ ← Verde/Amarillo/Rojo según health
├─────────┬─────────┬─────────────────┤
│ Spending│Cashflow │ Debt Risk       │ ← Azul/Cyan/Morado
├─────────┴─────────┴─────────────────┤
│ Upcoming Payments (full width)      │ ← Blanco con alerts
├─────────────────┬───────────────────┤
│ Projection      │ Problem Category  │ ← Índigo/Rosa
├─────────────────┴───────────────────┤
│ Operaciones: Transacciones | Actions│ ← Blanco
└─────────────────────────────────────┘
```

**Colores por tarjeta:**
- Available: Emerald/Amber/Rose (dinámico)
- Spending: Blue/Amber/Rose (semáforo)
- Cashflow: Cyan/Rose (balance)
- Debt: Purple/Orange/Red (riesgo)
- Projection: Indigo/Orange (tendencia)
- Problem: Pink/Teal (alerta)

**Auto-refresh:**
- Métricas críticas: 60s
- Deuda: 300s

---

### 💰 Budget (Presupuesto)

**Vista Anual:**
```
┌─────────────────────────────────────┐
│ Year Selector (2024/2025/2026)      │ ← Botones con gradiente activo
├─────────┬─────────┬─────────────────┤
│ Ingresos│ Gastos  │ Saldo           │ ← Glass cards: Emerald/Rose/Amber
├─────────────────────────────────────┤
│ Grid Table (12 meses × categorías)  │ ← Tabla editable
└─────────────────────────────────────┘
```

**Vista Mensual:**
```
┌─────────────────────────────────────┐
│ Cycle Selector + Actions            │
├─────────────────────────────────────┤
│ Categorías agrupadas por tipo       │
│ ├─ Ingresos (emerald)               │
│ ├─ Gastos Fijos (rose)              │
│ └─ Gastos Variables (pink)          │
└─────────────────────────────────────┘
```

---

### 📈 Analysis (Análisis)

**Tabs:**
- General | Ingresos | Gastos | Categorías

**Charts por tab:**
- Gauge chart (presupuesto usado)
- Pie chart (distribución)
- Line chart (tendencias)
- Treemap (jerarquía)

**Estilo:**
- Fondo: `bg-surface border border-border rounded-2xl`
- Charts: ResponsiveContainer con COLORS array
- Tooltips: Formato moneda personalizado

---

### 💳 Transactions (Transacciones)

**Layout:**
```
┌─────────────────────────────────────┐
│ Quick Add Row (sticky top)          │ ← Formulario inline
├─────────────────────────────────────┤
│ Filters Bar                         │ ← Fecha, categoría, tipo
├─────────────────────────────────────┤
│ Table                               │
│ ├─ Fecha | Descripción | Categoría  │
│ ├─ Monto | Cuenta | Actions         │
└─────────────────────────────────────┘
```

**Estilos:**
- Tabla: Hover row highlighting
- Categorías: Icon badge con color
- Montos: Verde (income) / Naranja (expense)

---

### ⚙️ Settings (Configuración)

**Tabs:**
- Categorías | Cuentas | Ciclo | Exportar

**Categorías:**
- Drag & drop reordering
- Icon picker
- Color picker
- Tipo: Income/Expense (Fijo/Variable)

**Drag handles:**
- SVG con 3 círculos
- Posición: `-bottom-0.5 -right-0.5`
- Aparece en hover

---

## 🎯 Drag & Drop Handles

### Especificaciones
```tsx
<div className="absolute -bottom-0.5 -right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
    <circle cx="7" cy="7" r="1.5"/>
    <circle cx="13" cy="7" r="1.5"/>
    <circle cx="7" cy="13" r="1.5"/>
    <circle cx="13" cy="13" r="1.5"/>
    <circle cx="10" cy="10" r="1.5"/>
  </svg>
</div>
```

---

## 🔧 Componentes Técnicos

### CategoryIcon (Mapeo Iconos)
```tsx
import * as LucideIcons from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  'Home': LucideIcons.Home,
  'ShoppingCart': LucideIcons.ShoppingCart,
  // ... más mapeos
};

export default function CategoryIcon({ 
  iconName, 
  size = 20, 
  className 
}: CategoryIconProps) {
  const IconComponent = iconMap[iconName] || LucideIcons.HelpCircle;
  return <IconComponent size={size} className={className} />;
}
```

### useDemoMode (Ofuscación)
```tsx
const { applyDemoScale, obfuscateDescription } = useDemoMode();

// Multiplica montos por 0.7 en demo
const amount = applyDemoScale(1000); // 700

// Ofusca descripciones sensibles
const desc = obfuscateDescription("Netflix", "Entretenimiento"); 
// "Pago de Entretenimiento"
```

---

## ❌ Anti-Patrones y Lecciones Aprendidas

### ❌ NO: Floating Grip Button
**Problema:** 3 puntos verticales como botón colapso del sidebar
**Causa:** Conflictos z-index y positioning complejo
**Solución:** Usar chevrons simples integrados
**Lección:** Simplicidad > complejidad visual

### ❌ NO: Conditional Hook Calls
**Problema:** `useQuery` dentro de condicionales causa Hook Order Violations
```tsx
// ❌ MAL
if (showDrawer) {
  const { data } = useQuery(...)
}

// ✅ BIEN
const { data } = useQuery({
  enabled: showDrawer
})
```

### ❌ NO: Crear Cards con Gradientes Aleatorios
**Problema:** Cada card verde confunde al usuario
**Solución:** Colores semánticos según función
**Lección:** Color = significado, no decoración

### ❌ NO: Mezclar bg-white con Glass Design
**Problema:** Inconsistencia visual en misma pantalla
**Solución:** Glass para métricas, White para listas/forms
**Lección:** Un patrón por tipo de contenido

---

## ✅ Checklist de Nuevos Componentes

Antes de crear un nuevo componente, verificar:

- [ ] ¿Existe un componente similar reutilizable?
- [ ] ¿Usa tokens de diseño (spacing, colors, typography)?
- [ ] ¿Es responsive (mobile-first)?
- [ ] ¿Tiene hover/focus states accesibles?
- [ ] ¿Usa las clases de Tailwind del sistema?
- [ ] ¿Está documentado en esta guía?

---

## 🚀 Próximas Mejoras

- [ ] Dark mode (variables CSS custom properties)
- [ ] Animaciones de entrada (framer-motion)
- [ ] Skeleton loaders consistentes
- [ ] Error boundaries con diseño
- [ ] Storybook para componentes