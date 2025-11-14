import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Wallet, CreditCard, Loader2 } from 'lucide-react'
import { useDashboardStats, useRecentTransactions, useBudgetLimits, useActiveBudgetPlan } from '@/lib/hooks/useApi'
import { exchangeRateApi } from '@/lib/api'
import { useState, useEffect } from 'react'
import CategoryIcon from '@/components/CategoryIcon'

export default function Dashboard() {
  const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN')
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [rateLoading, setRateLoading] = useState(false)

  // Fetch exchange rate when switching to USD
  useEffect(() => {
    if (displayCurrency === 'USD') {
      setRateLoading(true)
      exchangeRateApi.getRate()
        .then(data => setExchangeRate(data.rate))
        .catch(err => console.error('Error fetching exchange rate:', err))
        .finally(() => setRateLoading(false))
    }
  }, [displayCurrency])

  // Convert amount based on display currency
  const convertAmount = (amountPEN: number) => {
    if (displayCurrency === 'USD' && exchangeRate) {
      return amountPEN / exchangeRate
    }
    return amountPEN
  }

  // Fetch data from API
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: transactions = [], isLoading: transactionsLoading } = useRecentTransactions(5)
  const { data: activeBudget } = useActiveBudgetPlan()
  const { data: budgetLimits = [], isLoading: budgetsLoading } = useBudgetLimits(
    activeBudget ? { budget_plan_id: activeBudget.id } : undefined
  )

  // Debug: log data
  console.log('Dashboard Stats:', stats)
  console.log('Stats Loading:', statsLoading)
  console.log('Stats Error:', statsError)
  console.log('Transactions:', transactions)

  // Calculate safe values
  const totalIncome = stats?.total_income_actual || 0
  const totalExpense = stats?.total_expense_actual || 0
  const balance = stats?.balance_actual || 0
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0
  const incomeVariance = stats?.variance_percentage || 0

  // Loading state
  if (statsLoading || transactionsLoading || budgetsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text-primary">Dashboard</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Resumen de tus finanzas personales
          </p>
        </div>
        
        {/* Currency Toggle */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
          <button
            onClick={() => setDisplayCurrency('PEN')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              displayCurrency === 'PEN'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            S/ PEN
          </button>
          <button
            onClick={() => setDisplayCurrency('USD')}
            disabled={rateLoading}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              displayCurrency === 'USD'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            } disabled:opacity-50`}
          >
            {rateLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : '$ USD'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Ingresos Totales</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <DollarSign className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {convertAmount(totalIncome).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-2xl opacity-80">{displayCurrency}</span>
            </div>
            <div className="flex items-center text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              <ArrowUpIcon className="mr-1 h-4 w-4" strokeWidth={2.5} />
              {incomeVariance >= 0 ? '+' : ''}{incomeVariance.toFixed(1)}% varianza
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Gastos Totales</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <CreditCard className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {convertAmount(totalExpense).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-2xl opacity-80">{displayCurrency}</span>
            </div>
            <div className="flex items-center text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              <ArrowDownIcon className="mr-1 h-4 w-4" strokeWidth={2.5} />
              Gastos del mes
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-400 to-orange-500'} rounded-3xl p-8 shadow-card text-white`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Balance</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">
              {convertAmount(balance).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-2xl opacity-80">{displayCurrency}</span>
            </div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              Disponible para invertir
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 shadow-card text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wide opacity-90">Tasa de Ahorro</h3>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-extrabold">{savingsRate.toFixed(1)}%</div>
            <div className="text-sm font-bold bg-white/20 backdrop-blur-sm rounded-pill px-3 py-1 w-fit">
              De tus ingresos totales
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Transacciones Recientes</h2>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="text-xs font-bold uppercase text-text-secondary">Descripción</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-text-secondary">Categoría</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase text-text-secondary">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-surface-soft transition-colors border-b border-border/50">
                    <TableCell className="font-bold text-sm text-text-primary py-4">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <CategoryIcon iconName={transaction.category_icon} className="text-purple-500" size={16} />
                        <span className="text-text-primary font-medium text-xs">
                          {transaction.category_name || 'Sin categoría'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold py-4">
                      <span className={transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'}>
                        {transaction.amount > 0 ? '+' : ''}
                        {convertAmount(Math.abs(transaction.amount)).toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} <span className="text-xs opacity-70">{displayCurrency}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-extrabold text-text-primary">Presupuestos del Mes</h2>
          </div>
          <div className="p-6 space-y-6">
            {budgetLimits.length > 0 ? (
              budgetLimits.map((limit) => {
                const percentage = limit.limit_amount > 0 
                  ? ((limit.spent_amount || 0) / limit.limit_amount) * 100 
                  : 0
                
                return (
                  <div key={limit.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-text-primary">
                        {limit.category_name || 'Sin categoría'}
                      </span>
                      <span className="text-xs font-bold text-text-secondary bg-surface-soft px-2.5 py-1 rounded-lg">
                        {convertAmount(limit.spent_amount || 0).toFixed(2)} / {convertAmount(limit.limit_amount).toFixed(2)} {displayCurrency}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-secondary">
                        {percentage.toFixed(0)}% utilizado
                      </span>
                      {percentage > 80 && (
                        <span className="bg-danger text-white rounded-pill px-3 py-1 text-xs font-bold">
                          Cerca del límite
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-text-secondary text-center py-8">
                No hay presupuestos configurados
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
