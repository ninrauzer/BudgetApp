# BudgetApp Mobile (Expo)

Aplicación móvil con React Native y Expo para registrar gastos y ver balance financiero.

## 🚀 Instalación

```bash
# Instalar dependencias
cd mobile
npm install

# Iniciar servidor de desarrollo
npx expo start
```

## 📱 Testing en iPhone

### Opción 1: Expo Go (Recomendado para desarrollo)

1. Instalar "Expo Go" desde App Store
2. Ejecutar `npx expo start` en tu PC
3. Escanear código QR con la cámara del iPhone
4. La app se abrirá en Expo Go

**Nota:** Tu iPhone y PC deben estar en la misma red WiFi.

### Opción 2: Local con Tailscale (Si no están en mismo WiFi)

1. Instalar Tailscale en PC y iPhone
2. Conectarse a la red Tailscale
3. Ejecutar `npx expo start --tunnel`
4. Escanear QR

### Opción 3: Build de desarrollo

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login a Expo
eas login

# Build para iPhone
eas build --profile development --platform ios
```

## 🔧 Configuración del Backend

Editar `mobile/lib/api/client.ts`:

```typescript
// Para desarrollo local
const API_BASE_URL = 'http://192.168.1.X:8000/api';

// Para producción (Render.com)
const API_BASE_URL = 'https://budgetapp-backend.onrender.com/api';
```

## 📂 Estructura del Proyecto

```
mobile/
├── screens/
│   ├── HomeScreen.tsx           # Dashboard con métricas
│   └── AddTransactionScreen.tsx # Formulario agregar gasto
├── lib/
│   └── api/                     # API clients (copiado de frontend)
│       ├── client.ts            # Axios config
│       ├── types.ts             # TypeScript types
│       ├── dashboard.ts         # Dashboard API
│       ├── transactions.ts      # Transactions API
│       ├── categories.ts        # Categories API
│       └── accounts.ts          # Accounts API
├── App.tsx                      # Entry point
└── package.json
```

## 🎨 Funcionalidades

### HomeScreen
- Balance disponible
- Ingresos y gastos del mes
- Proyección de fin de mes
- Botón para agregar gasto

### AddTransactionScreen
- Input de monto
- Descripción
- Selector de categoría
- Selector de cuenta
- Fecha (default: hoy)

## 📦 Dependencias Principales

- `expo` - Framework React Native
- `@tanstack/react-query` - Data fetching y cache
- `axios` - HTTP client
- `react-native-paper` - UI components (opcional)

## 🔄 Sincronización

La app consume directamente tu backend FastAPI en Render.com. No hay sincronización offline por ahora (futuro: implementar cache y queue).

## 🐛 Troubleshooting

### "Network Error" al cargar datos
- Verificar que `API_BASE_URL` apunte a tu backend correcto
- Si usas local: asegúrate de estar en misma red WiFi
- Si usas Render.com: verifica que el backend esté corriendo

### Expo Go no carga la app
- Verificar que PC y iPhone estén en misma red
- Usar `npx expo start --tunnel` si hay problemas de red
- Reiniciar Expo Go y volver a escanear QR
