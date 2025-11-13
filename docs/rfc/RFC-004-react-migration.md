# RFC-004 — Migración del Frontend de HTMX a React + TypeScript

**Estado:** Approved  
**Autor:** Ninrauzer  
**Fecha:** 2025-11-13  
**Versión:** 1.0  
**Supersedes:** -  
**Replaced by:** -  

## 1. Contexto

El proyecto BudgetApp comenzó con HTMX como frontend para acelerar el MVP (ver RFC-001). Después de validar el producto y estabilizar el backend API-First (ver ADR-001), se identificaron limitaciones en el desarrollo con HTMX:

**Problemas actuales con HTMX:**
- Debugging opaco y difícil
- Sin type safety (JavaScript vanilla)
- Errores aparecen solo en runtime
- State management confuso
- Sin herramientas de desarrollo modernas
- Difícil mantener consistencia en componentes

**Contexto de negocio:**
- MVP validado exitosamente
- Backend estable con API REST completa
- Plan original contemplaba React para producción
- Necesidad de mejor UX y mantenibilidad

---

## 2. Alcance

Migrar completamente el frontend de HTMX a React + TypeScript, consumiendo la misma API REST del backend FastAPI.

**Módulos a migrar:**
1. Dashboard (resumen financiero)
2. Transacciones (CRUD y filtros)
3. Presupuesto (planes y seguimiento)
4. Análisis (gráficos y métricas)
5. Configuración (cuentas y categorías)

**Fuera de alcance:**
- Cambios en el backend (permanece igual)
- Cambios en el modelo de datos
- Migraciones de base de datos

---

## 3. Requisitos

### 3.1 Funcionales
- ✅ Todas las funcionalidades del HTMX deben replicarse
- ✅ CRUD completo de transacciones
- ✅ Gestión de presupuestos mensuales
- ✅ Dashboard con métricas en tiempo real
- ✅ Filtros y búsqueda de transacciones
- ✅ Gestión de cuentas y categorías
- ✅ Visualizaciones (gráficos y reportes)

### 3.2 No Funcionales
- **Performance:** Carga inicial < 2s, interacciones < 500ms
- **Responsive:** Mobile-first, funcional en tablets y desktop
- **Type Safety:** TypeScript en modo strict
- **Testing:** Coverage > 70% en componentes críticos
- **Accesibilidad:** WCAG 2.1 nivel AA
- **SEO:** Metadata adecuada (aunque sea SPA privada)

### 3.3 Técnicos
- React 18+
- TypeScript 5+
- Vite como bundler
- React Query para data fetching
- Zustand para state management
- Tailwind CSS para estilos
- Recharts para gráficos
- Axios para HTTP

---

## 4. Stack Tecnológico

### 4.1 Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3+ | UI library |
| TypeScript | 5.0+ | Type safety |
| Vite | 5.0+ | Build tool |
| React Router | 6.20+ | Routing |

### 4.2 State Management & Data Fetching

| Tecnología | Propósito | Justificación |
|------------|-----------|---------------|
| React Query | Server state | Caché inteligente, sincronización automática |
| Zustand | Client state | Simple, sin boilerplate, TypeScript-friendly |

**Alternativas rechazadas:**
- ❌ Redux: Demasiado boilerplate para este proyecto
- ❌ Context API: No suficiente para server state
- ❌ Recoil: Menor adopción, más complejo

### 4.3 Estilos

| Tecnología | Propósito |
|------------|-----------|
| Tailwind CSS | Utility-first styling |
| HeadlessUI | Componentes accesibles |
| Lucide React | Iconos (mismo que HTMX) |

### 4.4 Gráficos y Visualización

| Tecnología | Propósito |
|------------|-----------|
| Recharts | Gráficos responsivos |
| date-fns | Manejo de fechas |

### 4.5 Validación y Formularios

| Tecnología | Propósito |
|------------|-----------|
| React Hook Form | Manejo de forms |
| Zod | Validación de schemas |

### 4.6 Testing

| Tecnología | Propósito |
|------------|-----------|
| Vitest | Test runner |
| React Testing Library | Component testing |
| MSW | API mocking |

### 4.7 Dev Tools

| Tecnología | Propósito |
|------------|-----------|
| ESLint | Linting |
| Prettier | Code formatting |
| TypeScript ESLint | TS linting |

---

## 5. Arquitectura del Frontend

### 5.1 Estructura de Carpetas

```
frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── api/                    # API clients
│   │   ├── axios.ts           # Axios config
│   │   ├── transactions.ts    # Transactions endpoints
│   │   ├── categories.ts      # Categories endpoints
│   │   ├── accounts.ts        # Accounts endpoints
│   │   ├── budget.ts          # Budget endpoints
│   │   └── dashboard.ts       # Dashboard endpoints
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                # Componentes base (Button, Input, Card)
│   │   ├── layout/            # Layout components (Header, Sidebar)
│   │   └── shared/            # Componentes compartidos
│   │
│   ├── features/               # Módulos por funcionalidad
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── Dashboard.tsx
│   │   ├── transactions/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── Transactions.tsx
│   │   ├── budget/
│   │   ├── analysis/
│   │   └── settings/
│   │
│   ├── hooks/                  # Custom hooks globales
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useDebounce.ts
│   │
│   ├── store/                  # Zustand stores
│   │   ├── themeStore.ts
│   │   └── filterStore.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── transaction.ts
│   │   ├── category.ts
│   │   ├── account.ts
│   │   └── budget.ts
│   │
│   ├── utils/                  # Utilidades
│   │   ├── formatters.ts      # Formato de monedas, fechas
│   │   ├── validators.ts      # Validaciones custom
│   │   └── constants.ts       # Constantes
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.development
├── .env.production
├── .eslintrc.json
├── .prettierrc
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 5.2 Patterns y Convenciones

#### Component Structure
```tsx
// TransactionCard.tsx
import { FC } from 'react';
import { Transaction } from '@/types/transaction';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const TransactionCard: FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  // Component logic
  return (/* JSX */);
};
```

#### Custom Hooks
```tsx
// useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/api/transactions';

export const useTransactions = (filters?: TransactionFilters) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionsApi.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    transactions: data,
    isLoading,
    error,
    createTransaction: createMutation.mutate,
  };
};
```

#### API Client
```tsx
// api/transactions.ts
import { apiClient } from './axios';
import { Transaction, TransactionCreate } from '@/types/transaction';

export const transactionsApi = {
  getAll: (filters?: TransactionFilters) =>
    apiClient.get<Transaction[]>('/transactions', { params: filters }),

  getById: (id: number) =>
    apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: TransactionCreate) =>
    apiClient.post<Transaction>('/transactions', data),

  update: (id: number, data: Partial<Transaction>) =>
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/transactions/${id}`),
};
```

---

## 6. Plan de Migración

### Fase 1: Setup Inicial (1-2 días)
- [x] Crear proyecto React con Vite
- [x] Configurar TypeScript strict mode
- [x] Configurar ESLint + Prettier
- [x] Configurar Tailwind CSS
- [x] Configurar React Query
- [x] Configurar Zustand
- [x] Configurar React Router
- [x] Crear estructura de carpetas base

### Fase 2: Infraestructura (2-3 días)
- [ ] Configurar API client (Axios)
- [ ] Crear tipos TypeScript para todas las entidades
- [ ] Configurar manejo de errores global
- [ ] Implementar theme system (dark/light)
- [ ] Crear componentes UI base (Button, Input, Card, etc.)
- [ ] Configurar layout principal (Header, Sidebar)

### Fase 3: Módulo Dashboard (3-4 días)
- [ ] Implementar dashboard con métricas
- [ ] Integrar gráficos con Recharts
- [ ] Implementar selector de período
- [ ] Tests unitarios y de integración

### Fase 4: Módulo Transacciones (5-7 días)
- [ ] Lista de transacciones con filtros
- [ ] Formulario de creación/edición
- [ ] Quick add panel
- [ ] Paginación y búsqueda
- [ ] Validación con Zod
- [ ] Tests

### Fase 5: Módulo Presupuesto (4-5 días)
- [ ] Vista de planes de presupuesto
- [ ] Creación/edición de presupuestos
- [ ] Visualización de cumplimiento
- [ ] Comparativa planeado vs real
- [ ] Tests

### Fase 6: Módulo Análisis (3-4 días)
- [ ] Gráficos de tendencias
- [ ] Reportes por categoría
- [ ] Filtros avanzados
- [ ] Exportación de datos
- [ ] Tests

### Fase 7: Módulo Configuración (2-3 días)
- [ ] Gestión de cuentas
- [ ] Gestión de categorías
- [ ] Configuración de temas
- [ ] Tests

### Fase 8: Optimización y Cleanup (2-3 días)
- [ ] Code splitting y lazy loading
- [ ] Optimización de bundle size
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Eliminar código HTMX de `/legacy`

**Tiempo total estimado:** 4-6 semanas

---

## 7. Comparación HTMX vs React

| Aspecto | HTMX | React + TypeScript |
|---------|------|-------------------|
| Debugging | ❌ Opaco | ✅ DevTools excelentes |
| Type Safety | ❌ No | ✅ TypeScript strict |
| State Management | ❌ Confuso | ✅ React Query + Zustand |
| Component Reuse | ⚠️ Limitado | ✅ Alto |
| Testing | ❌ Difícil | ✅ RTL + Vitest |
| Developer Experience | ⚠️ Básico | ✅ Excelente |
| Performance | ✅ Buena | ✅ Excelente |
| Bundle Size | ✅ Mínimo | ⚠️ ~150KB gzipped |
| Learning Curve | ✅ Baja | ⚠️ Media-Alta |
| Ecosystem | ⚠️ Limitado | ✅ Maduro |

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de funcionalidades | Media | Alto | Mantener HTMX funcionando, checklist exhaustivo |
| Estimación de tiempo incorrecta | Alta | Medio | Migración incremental, validar por módulo |
| Problemas de CORS | Baja | Bajo | Configuración clara en backend |
| Performance peor que HTMX | Baja | Medio | Code splitting, lazy loading, memoization |
| Curva de aprendizaje | Media | Bajo | Documentación interna, pair programming |

---

## 9. Decisión

Se aprueba la migración a **React 18 + TypeScript 5** con el stack y plan detallados en este RFC.

**Razones:**
1. Alineado con el plan original (RFC-001, ADR-001)
2. Mejor developer experience y debugging
3. Type safety elimina clases enteras de bugs
4. Ecosistema maduro con soluciones probadas
5. Escalable para producto comercial
6. Mantiene el backend sin cambios (API-First)

---

## 10. Impacto en la Arquitectura

### Backend
- ✅ Sin cambios en código
- ✅ Agregar configuración CORS
- ✅ Opcional: agregar rate limiting

### Frontend
- 🆕 Nuevo proyecto React en `/frontend`
- 🆕 Build pipeline independiente
- 🆕 Deploy separado del backend

### Legacy
- 📦 HTMX movido a `/legacy`
- 📚 Conservado como referencia

---

## 11. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Funcionalidades migradas | 100% |
| Coverage de tests | > 70% |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 |
| Bundle size (gzipped) | < 200KB |
| Time to Interactive | < 2s |
| Bugs en producción (primer mes) | < 5 |

---

## 12. Próximos Pasos

1. ✅ Aprobar este RFC
2. ✅ Ejecutar ADR-002 (reestructuración del proyecto)
3. ⏳ Inicializar proyecto React en `/frontend`
4. ⏳ Implementar infraestructura base
5. ⏳ Migrar módulo por módulo
6. ⏳ Testing y validación exhaustiva
7. ⏳ Deploy a producción

---

## 13. Estado del Documento
**Approved** - La migración está autorizada y en progreso.

---

## 14. Comentarios

Esta migración es el paso natural después de validar el MVP con HTMX. La arquitectura API-First que adoptamos desde el inicio hace que esta transición sea limpia y sin riesgos para el backend.

El mantener HTMX en `/legacy` permite una migración sin presión, validando funcionalidad por funcionalidad.

---

**Aprobado por:** Ninrauzer  
**Fecha de aprobación:** 2025-11-13
