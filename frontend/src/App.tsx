import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<div className="p-6">Transacciones (próximamente)</div>} />
          <Route path="budget" element={<div className="p-6">Presupuestos (próximamente)</div>} />
          <Route path="analysis" element={<div className="p-6">Análisis (próximamente)</div>} />
          <Route path="accounts" element={<div className="p-6">Cuentas (próximamente)</div>} />
          <Route path="settings" element={<div className="p-6">Configuración (próximamente)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
