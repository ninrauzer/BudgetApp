import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './contexts/AuthContext'
import { DefaultAccountProvider } from './contexts/DefaultAccountContext'
import { DefaultCurrencyProvider } from './contexts/DefaultCurrencyContext'
import { TimezoneProvider } from './contexts/TimezoneContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import Analysis from './pages/Analysis'
import Accounts from './pages/Accounts'
import Settings from './pages/Settings'
import DebtManagement from './pages/DebtManagement'
import CreditCards from './pages/CreditCards'
import AdminUsers from './pages/AdminUsers'
import AdminRoute from './components/AdminRoute'
import UIKitPage from './pages/UIKitPage'

function App() {
  return (
    <AuthProvider>
      <TimezoneProvider>
        <DefaultAccountProvider>
          <DefaultCurrencyProvider>
            <BrowserRouter>
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="analysis" element={<Analysis />} />
                  <Route path="debts" element={<DebtManagement />} />
                  <Route path="credit-cards" element={<CreditCards />} />
                  <Route path="accounts" element={<Accounts />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="ui-kit" element={<UIKitPage />} />
                </Route>

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </DefaultCurrencyProvider>
        </DefaultAccountProvider>
      </TimezoneProvider>
    </AuthProvider>
  )
}

export default App
