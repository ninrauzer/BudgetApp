import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DefaultAccountProvider } from './contexts/DefaultAccountContext'
import { DefaultCurrencyProvider } from './contexts/DefaultCurrencyContext'
import { TimezoneProvider } from './contexts/TimezoneContext'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Analysis from './pages/Analysis'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import DebtManagement from './pages/DebtManagement'
import CreditCards from './pages/CreditCards'
import UIKitPage from './pages/UIKitPage'

function App() {
  return (
    <TimezoneProvider>
      <DefaultAccountProvider>
        <DefaultCurrencyProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budget" element={<Budget />} />
                <Route path="analysis" element={<Analysis />} />
                <Route path="debts" element={<DebtManagement />} />
                <Route path="credit-cards" element={<CreditCards />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="settings" element={<Settings />} />
                <Route path="ui-kit" element={<UIKitPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </DefaultCurrencyProvider>
      </DefaultAccountProvider>
    </TimezoneProvider>
  )
}

export default App
