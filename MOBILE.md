# BudgetApp - Proyectos Móviles

Este repositorio contiene **dos implementaciones móviles** para acceder a BudgetApp desde tu iPhone:

## 📱 Opción 1: `/mobile` - Expo (React Native)

**Tecnología:** React Native + Expo + TypeScript  
**Ventaja:** Desarrollo rápido, reutiliza conocimiento de React  
**Tiempo setup:** 10 minutos  
**Android:** Incluido (mismo código)

### Inicio Rápido

```bash
cd mobile
npm install
npx expo start
# Escanear QR con app "Expo Go" en tu iPhone
```

**Documentación completa:** [mobile/README.md](mobile/README.md)

---

## 🍎 Opción 2: `/mobile-ios` - SwiftUI Nativo

**Tecnología:** Swift + SwiftUI (100% nativo Apple)  
**Ventaja:** Máximo performance, app más ligera  
**Tiempo setup:** 30 minutos  
**Android:** No incluido (iOS only)

### Inicio Rápido

**En tu Mac:**

```bash
# 1. Clonar repo
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp/mobile-ios

# 2. Abrir Xcode
open .

# 3. En Xcode:
# - File → Open → Seleccionar "BudgetApp" folder
# - Agregar archivos .swift al proyecto
# - Presionar ▶️ para correr
```

**Documentación completa:** [mobile-ios/README.md](mobile-ios/README.md)

---

## 🔄 Transferir Código a Mac

### Método 1: Git Clone (Recomendado)

```bash
# En tu Mac
cd ~/Developer
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp
```

### Método 2: GitHub Desktop

1. Descargar [GitHub Desktop](https://desktop.github.com) en Mac
2. File → Clone Repository
3. Seleccionar `ninrauzer/BudgetApp`
4. Listo

### Método 3: Download ZIP

1. En GitHub: Code → Download ZIP
2. Transferir archivo a Mac (AirDrop, USB, iCloud)
3. Descomprimir

---

## 📊 Comparativa

| Característica | Expo | SwiftUI |
|----------------|------|---------|
| **Tiempo desarrollo** | 1-2 días | 3-4 días |
| **Performance** | 90% | 100% |
| **Tamaño app** | ~25 MB | ~8 MB |
| **Android incluido** | ✅ Sí | ❌ No |
| **Curva aprendizaje** | Baja (React) | Media (Swift) |
| **Publicar App Store** | $99/año | $99/año |
| **Testing sin publicar** | Expo Go (gratis) | TestFlight |
| **Código compartido** | 70% con web | 0% |
| **Acceso features iOS** | Limitado | Total |

---

## 🎯 Cuál Elegir

### Usa Expo si:
- ✅ Quieres resultado rápido (hoy mismo)
- ✅ Ya sabes React
- ✅ Posiblemente necesites Android después
- ✅ Prefieres no pagar $99/año todavía

### Usa SwiftUI si:
- ✅ Quieres app premium
- ✅ Solo necesitas iOS
- ✅ Quieres aprender Swift
- ✅ Performance es crítico
- ✅ Planeas vender la app después

---

## 🚀 Funcionalidades (Ambas Versiones)

### Home Screen
- 💰 Balance disponible
- 📊 Ingresos y gastos del mes
- 🎯 Proyección de fin de mes
- ➕ Botón agregar gasto

### Add Transaction Screen
- 💵 Monto
- 📝 Descripción
- 🏷️ Categoría
- 💳 Cuenta
- ✅ Guardar

---

## 🔧 Backend

Ambas apps se conectan al **mismo backend FastAPI**:

```
Producción: https://budgetapp-backend.onrender.com/api
Desarrollo: http://192.168.126.127:8000/api
```

No necesitas cambios en el backend. Las apps consumen la API REST existente.

---

## 📱 Testing en iPhone

### Expo
1. Instalar "Expo Go" desde App Store
2. Escanear QR
3. Listo

### SwiftUI
1. Conectar iPhone con cable
2. Presionar ▶️ en Xcode
3. Confiar en desarrollador en Settings
4. Listo

---

## 💡 Recomendación

**Para uso personal inmediato:** Empieza con **Expo**  
**Para producto comercial futuro:** Usa **SwiftUI**

O prueba ambos y elige el que más te guste. Son proyectos independientes.
