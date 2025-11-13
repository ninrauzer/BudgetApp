# BudgetApp Frontend# React + TypeScript + Vite



Frontend moderno construido con React 18, TypeScript 5, y shadcn/ui.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 Stack TecnológicoCurrently, two official plugins are available:



- **React 18** - Librería UI- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **TypeScript 5** - Type safety- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Vite 7** - Build tool ultra-rápido

- **Tailwind CSS 3** - Utility-first CSS## React Compiler

- **shadcn/ui** - Componentes UI de alta calidad

- **React Router 6** - RoutingThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- **TanStack Query** - Server state management

- **Zustand** - Client state management## Expanding the ESLint configuration

- **Axios** - HTTP client

- **Lucide React** - Iconos modernosIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:



## 📁 Estructura del Proyecto```js

export default defineConfig([

```  globalIgnores(['dist']),

frontend/  {

├── src/    files: ['**/*.{ts,tsx}'],

│   ├── components/      # Componentes reutilizables    extends: [

│   │   └── ui/         # Componentes shadcn/ui      // Other configs...

│   ├── pages/          # Páginas de la aplicación

│   │   ├── Dashboard.tsx      // Remove tseslint.configs.recommended and replace with this

│   │   ├── Transactions.tsx      tseslint.configs.recommendedTypeChecked,

│   │   ├── Budget.tsx      // Alternatively, use this for stricter rules

│   │   ├── Analysis.tsx      tseslint.configs.strictTypeChecked,

│   │   └── Settings.tsx      // Optionally, add this for stylistic rules

│   ├── hooks/          # Custom hooks      tseslint.configs.stylisticTypeChecked,

│   ├── services/       # API services

│   ├── stores/         # Zustand stores      // Other configs...

│   ├── types/          # TypeScript types/interfaces    ],

│   ├── lib/           # Utilidades    languageOptions: {

│   ├── App.tsx        # Componente principal      parserOptions: {

│   └── main.tsx       # Entry point        project: ['./tsconfig.node.json', './tsconfig.app.json'],

├── public/            # Archivos estáticos        tsconfigRootDir: import.meta.dirname,

└── index.html        # HTML base      },

```      // other options...

    },

## 🛠️ Instalación  },

])

```bash```

# Instalar dependencias

npm installYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



# Modo desarrollo```js

npm run dev// eslint.config.js

import reactX from 'eslint-plugin-react-x'

# Build para producciónimport reactDom from 'eslint-plugin-react-dom'

npm run build

export default defineConfig([

# Preview del build  globalIgnores(['dist']),

npm run preview  {

```    files: ['**/*.{ts,tsx}'],

    extends: [

## 🔗 API Backend      // Other configs...

      // Enable lint rules for React

El frontend consume la API REST del backend en `http://localhost:8000`.      reactX.configs['recommended-typescript'],

      // Enable lint rules for React DOM

Ver `/backend/README.md` para documentación de la API.      reactDom.configs.recommended,

    ],

## 🎨 Temas    languageOptions: {

      parserOptions: {

La aplicación soporta modo claro y oscuro mediante CSS variables y Tailwind dark mode.        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

## 📝 Componentes shadcn/ui      },

      // other options...

Los componentes UI están basados en Radix UI con estilos personalizables.    },

Cada componente se copia al proyecto para control total.  },

])

## 🚦 Estado de Desarrollo```


- ✅ Setup inicial (Vite + React + TypeScript)
- ✅ Tailwind CSS configurado
- ✅ shadcn/ui base configurado
- ⏳ React Router (pendiente)
- ⏳ TanStack Query (pendiente)
- ⏳ Zustand (pendiente)
- ⏳ Páginas principales (pendiente)

## 📚 Documentación

Ver `/docs/rfc/RFC-004-react-migration.md` para detalles del plan de migración.
