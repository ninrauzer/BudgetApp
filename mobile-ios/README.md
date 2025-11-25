# BudgetApp iOS (SwiftUI)

Aplicación nativa iOS con SwiftUI para registrar gastos y ver balance financiero.

## 📂 Estructura del Proyecto

```
mobile-ios/BudgetApp/
├── BudgetAppApp.swift          # Entry point
├── ContentView.swift            # Navigation wrapper
├── Models/
│   └── Models.swift             # Data models (Transaction, Account, Category)
├── ViewModels/
│   ├── DashboardViewModel.swift # Dashboard state management
│   └── TransactionViewModel.swift # Transaction form state
├── Views/
│   ├── DashboardView.swift      # Home screen
│   └── AddTransactionView.swift # Add transaction form
└── Services/
    └── APIClient.swift          # Network layer (FastAPI integration)
```

## 🚀 Setup en Mac

### 1. Transferir Proyecto a Mac

```bash
# En tu Mac, clonar repositorio
cd ~/Developer
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp
```

### 2. Abrir en Xcode

```bash
# Desde terminal
cd mobile-ios/BudgetApp
open .
```

**O manualmente:**
1. Abrir Xcode
2. File → New → Project
3. iOS → App
4. Product Name: `BudgetApp`
5. Interface: `SwiftUI`
6. Language: `Swift`
7. Guardar en `E:\Desarrollo\BudgetApp\mobile-ios\BudgetApp`

### 3. Agregar Archivos al Proyecto

En Xcode:
1. Click derecho en el folder "BudgetApp"
2. Add Files to "BudgetApp"
3. Seleccionar todos los archivos `.swift` que generamos:
   - `Models/Models.swift`
   - `ViewModels/DashboardViewModel.swift`
   - `ViewModels/TransactionViewModel.swift`
   - `Views/DashboardView.swift`
   - `Views/AddTransactionView.swift`
   - `Services/APIClient.swift`

### 4. Configurar API URL

Editar `Services/APIClient.swift` línea 6:

```swift
// Para desarrollo local (Mac en misma red)
private let baseURL = "http://192.168.1.X:8000/api"

// Para producción (Render.com)
private let baseURL = "https://budgetapp-backend.onrender.com/api"
```

### 5. Configurar Permisos de Red

En `Info.plist` agregar (si usas HTTP local):

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

**Nota:** Para producción con HTTPS no es necesario.

### 6. Correr en Simulador

1. Seleccionar simulador: **iPhone 15 Pro** (o tu preferido)
2. Presionar `Cmd + R` o botón ▶️
3. La app se compilará y abrirá en el simulador

### 7. Correr en tu iPhone Real

1. Conectar iPhone con cable USB-C
2. Confiar en la computadora (si es primera vez)
3. En Xcode → Signing & Capabilities:
   - Team: Seleccionar tu Apple ID
   - Bundle Identifier: `com.TUNOMBRE.BudgetApp` (debe ser único)
4. Seleccionar tu iPhone en la lista de dispositivos
5. Presionar `Cmd + R`
6. En el iPhone: Settings → General → VPN & Device Management → Confiar en desarrollador

## 🎨 Pantallas

### DashboardView
- Balance disponible (grande, verde/rojo)
- Métricas del mes actual:
  - Ingresos
  - Gastos fijos
  - Gastos variables
  - Pendiente por cobrar
- Proyección de fin de mes
- Botón "Agregar Gasto"

### AddTransactionView
- Input de monto (teclado numérico)
- Descripción
- Lista de categorías (seleccionable)
- Lista de cuentas (seleccionable)
- Botón "Guardar"

## 🔧 Arquitectura

### MVVM Pattern
- **Models**: Estructuras de datos (`Codable`)
- **ViewModels**: Estado y lógica de negocio (`ObservableObject`)
- **Views**: UI pura (`SwiftUI Views`)
- **Services**: API client (networking)

### Async/Await
Todo el networking usa Swift Concurrency:
```swift
Task {
    await viewModel.loadDashboard()
}
```

### State Management
```swift
@StateObject private var viewModel = DashboardViewModel()
@State private var amount = ""
```

## 📦 Sin Dependencias Externas

El proyecto usa **solo librerías nativas de Apple**:
- `Foundation` - Networking, JSON
- `SwiftUI` - UI framework
- `Combine` - State management (implícito con `@Published`)

## 🐛 Troubleshooting

### "Failed to load" al abrir app
- Verificar que `baseURL` sea correcto
- Si usas local: Mac e iPhone en misma WiFi
- Si usas Render.com: verificar que backend esté corriendo

### Error de firma de código
- Ir a Signing & Capabilities
- Cambiar Bundle Identifier (debe ser único)
- Seleccionar tu Apple ID en Team

### "Untrusted Developer" en iPhone
- Settings → General → VPN & Device Management
- Click en tu nombre de desarrollador
- Trust

## 🚀 Publicar en App Store (Futuro)

1. **Unirte a Apple Developer Program** ($99/año)
2. **Crear App ID** en developer.apple.com
3. **Configurar App Store Connect**
4. **Archive** en Xcode (Product → Archive)
5. **Upload** a App Store Connect
6. **Agregar info**: Screenshots, descripción, etc.
7. **Submit for Review** (1-2 días)

## 🆚 Comparación con Expo

| Aspecto | SwiftUI | Expo |
|---------|---------|------|
| Performance | 100% | 90% |
| Tamaño app | ~8 MB | ~25 MB |
| Setup tiempo | 30 min | 10 min |
| Código reutilizado | 0% | 70% |
| Curva aprendizaje | Media | Baja |
| Android | Reescribir | Ya incluido |

## 📚 Recursos de Aprendizaje

- [SwiftUI Tutorials (Apple)](https://developer.apple.com/tutorials/swiftui)
- [Swift Documentation](https://docs.swift.org)
- [Hacking with Swift](https://www.hackingwithswift.com)

## ✅ Checklist de Implementación

- [x] Estructura de folders creada
- [x] Models definidos (Transaction, Account, Category)
- [x] APIClient con endpoints
- [x] ViewModels con state management
- [x] DashboardView con métricas
- [x] AddTransactionView con formulario
- [ ] Crear proyecto en Xcode
- [ ] Agregar archivos al proyecto
- [ ] Configurar Bundle ID y signing
- [ ] Correr en simulador
- [ ] Probar en iPhone real
- [ ] Publicar en TestFlight (opcional)
