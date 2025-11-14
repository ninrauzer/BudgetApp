import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DefaultAccountProvider } from './contexts/DefaultAccountContext'
import { DefaultCurrencyProvider } from './contexts/DefaultCurrencyContext'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import TestAPI from './pages/TestAPI'

function App() {
  return (
    <DefaultAccountProvider>
      <DefaultCurrencyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="test-api" element={<TestAPI />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budget" element={<div className="p-6">Presupuestos (próximamente)</div>} />
              <Route path="analysis" element={<div className="p-6">Análisis (próximamente)</div>} />
              <Route path="accounts" element={<div className="p-6">Cuentas (próximamente)</div>} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DefaultCurrencyProvider>
    </DefaultAccountProvider>
  )
}

export default App
