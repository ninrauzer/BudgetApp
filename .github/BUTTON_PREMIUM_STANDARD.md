# Button Premium Standard - BudgetApp

> **Botones con efecto premium, gradientes y animaciones fluidas**

Fecha: 20 Noviembre 2025  
Versión: 1.0

---

## 📋 Definición

Los botones en BudgetApp ahora tienen efecto premium con:
- Gradientes vibrantes
- Sombras con color (color-specific shadow)
- Animaciones suaves (scale en hover/active)
- Transiciones de 200ms

---

## 🎨 Variantes de Botones

### Primary (Predeterminado)
```tsx
<Button>Primary Action</Button>
```
**Estilos:**
- Gradiente: `from-indigo-500 to-indigo-600`
- Sombra: `shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/50`
- Hover: `hover:shadow-xl scale-105`
- Color texto: `text-white`
- Uso: Acciones principales, confirmar, guardar

### Secondary
```tsx
<Button variant="secondary">Secondary Action</Button>
```
**Estilos:**
- Gradiente: `from-surface-soft to-gray-100`
- Sombra: `shadow-sm hover:shadow-md`
- Hover: `from-surface to-gray-200`
- Color texto: `text-text-primary`
- Uso: Acciones secundarias, opcionales

### Outline
```tsx
<Button variant="outline">Outline Button</Button>
```
**Estilos:**
- Borde: `border-2 border-border`
- Fondo: `bg-white`
- Hover: `border-indigo-500 hover:bg-indigo-50/50`
- Color texto: `text-text-primary`
- Uso: Cancelar, descartar, alternativas

### Destructive (Peligro)
```tsx
<Button variant="destructive">Delete</Button>
```
**Estilos:**
- Gradiente: `from-red-500 to-red-600`
- Sombra: `shadow-lg shadow-red-500/40 hover:shadow-red-500/50`
- Hover: `hover:shadow-xl scale-105`
- Color texto: `text-white`
- Uso: Eliminar, limpiar, acciones destructivas

### Ghost
```tsx
<Button variant="ghost">Subtle Action</Button>
```
**Estilos:**
- Sin fondo
- Hover: `bg-surface-soft text-indigo-600`
- Color texto: `text-text-primary`
- Uso: Acciones terciarias, opcionales

### Link
```tsx
<Button variant="link">Learn More</Button>
```
**Estilos:**
- Sin fondo
- Subrayado al hover
- Color: `text-indigo-600`
- Uso: Enlaces dentro de contenido

---

## 📐 Tamaños

### Small (sm)
```tsx
<Button size="sm">Small Button</Button>
```
- Altura: `h-9`
- Padding: `px-4`
- Border-radius: `rounded-xl`
- Font-size: `text-xs`

### Default (default)
```tsx
<Button size="default">Default Button</Button>
```
- Altura: `h-11`
- Padding: `px-5 py-3`
- Border-radius: `rounded-2xl`
- Font-size: `text-sm`

### Large (lg)
```tsx
<Button size="lg">Large Button</Button>
```
- Altura: `h-12`
- Padding: `px-8`
- Border-radius: `rounded-2xl`
- Font-size: `text-base`

### Icon (icon)
```tsx
<Button size="icon"><Plus className="w-5 h-5" /></Button>
```
- Altura: `h-11`
- Ancho: `w-11`
- Perfectamente cuadrado

---

## ✨ Características Premium

### 1. Gradientes Vibrantes
```tsx
// Primary
from-indigo-500 to-indigo-600

// Destructive
from-red-500 to-red-600

// Secondary
from-surface-soft to-gray-100
```

### 2. Sombras con Color
```tsx
// Primary
shadow-lg shadow-indigo-500/40
hover:shadow-xl shadow-indigo-500/50

// Destructive
shadow-lg shadow-red-500/40
hover:shadow-xl shadow-red-500/50
```

### 3. Animaciones Suaves
```tsx
// Escala en hover
hover:scale-105

// Presión en active
active:scale-95

// Transición de 200ms
transition-all duration-200
```

---

## 🎯 Ejemplos de Uso

### Con Icono
```tsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

<Button>
  <Plus className="w-4 h-4" />
  Agregar
</Button>
```

### Estados
```tsx
{/* Normal */}
<Button>Normal</Button>

{/* Deshabilitado */}
<Button disabled>Deshabilitado</Button>

{/* Loading (con spinner) */}
<Button disabled>
  <Loader2 className="w-4 h-4 animate-spin" />
  Guardando...
</Button>
```

### Variantes Combinadas
```tsx
{/* Primary grande */}
<Button size="lg" className="w-full">Confirmar</Button>

{/* Secondary pequeño */}
<Button variant="secondary" size="sm">Más</Button>

{/* Destructive con icono */}
<Button variant="destructive">
  <Trash2 className="w-4 h-4" />
  Eliminar
</Button>
```

---

## 🔧 Especificaciones Técnicas

### Clases Base
```tsx
// SIEMPRE incluidas:
inline-flex items-center justify-center gap-2
whitespace-nowrap rounded-2xl text-sm font-bold
transition-all duration-200
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0

// Nuevas: animaciones premium
hover:scale-105 active:scale-95
```

### Color Palette (Shadow)
```tsx
// Primary button shadow
shadow-primary/40   // Normal
shadow-primary/50   // Hover

// Destructive button shadow
shadow-red-500/40   // Normal
shadow-red-500/50   // Hover
```

---

## 📱 Responsive

Los botones se adaptan automáticamente según el tamaño de pantalla:

```tsx
// Desktop
<div className="flex gap-3">
  <Button size="lg">Acción Principal</Button>
  <Button variant="outline" size="lg">Cancelar</Button>
</div>

// Mobile - se adaptan automáticamente
// No requiere cambios, responsive por defecto
```

---

## ✅ Checklist para Nuevos Botones

Antes de usar un botón, asegurar que:

- [ ] Usa la variante correcta (primary, secondary, outline, destructive, ghost, link)
- [ ] Usa el tamaño correcto (sm, default, lg, icon)
- [ ] Tiene icono alineado a la izquierda si lo necesita
- [ ] Está deshabilitado si corresponde (loading, datos faltantes)
- [ ] Tiene hover effect visible (scale-105)
- [ ] Tiene active effect visible (scale-95)
- [ ] Contraste de texto es suficiente
- [ ] El gap entre icono y texto es consistente (gap-2)

---

## 🚀 Rollout Completado

**Fecha**: 20 Noviembre 2025

**Cambios Implementados:**
- Button primary: Nuevo gradiente + sombra de color ✅
- Button secondary: Gradiente suave + mejor hover ✅
- Button outline: Mejor foco y hover ✅
- Button destructive: Nuevo gradiente rojo + sombra ✅
- Todas las variantes: Animaciones scale (105/95) ✅
- UIKit actualizado con nuevos estilos ✅

**Status**: ✅ ESTÁNDAR IMPLEMENTADO

---

## 📝 Notas de Implementación

### Por Qué Premium

1. **Sombras con Color** - Hacen que los botones "floten" sobre la interfaz
2. **Gradientes** - Diferencian visualmente las acciones
3. **Animaciones Scale** - Feedback inmediato del usuario
4. **Hover Effects** - Indican que el elemento es interactivo
5. **Duración 200ms** - Suave pero no lenta

### Consideraciones de Accesibilidad

- ✅ Focus ring visible en todos los botones
- ✅ Disabled state claramente visible
- ✅ Contraste suficiente (WCAG AA)
- ✅ Tamaño mínimo 44px x 44px (touch targets)

### Rendimiento

- Usar `scale()` en lugar de width/height (mejor performance)
- Usar `duration-200` (fast enough para UI responsiva)
- No hay blur o efectos costosos

---

**Última Actualización**: 20 Nov 2025 - Estándar implementado completamente
