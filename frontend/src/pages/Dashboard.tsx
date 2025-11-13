import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react'

// Datos de ejemplo - luego vendrán del API
const mockStats = {
  totalIncome: 45230.50,
  totalExpenses: 32150.75,
  balance: 13079.75,
  savingsRate: 28.9,
  incomeChange: 12.5,
  expensesChange: -8.2,
}

const mockRecentTransactions = [
  { id: 1, description: 'Salario Enero', amount: 15000, type: 'income', date: '2025-01-01', category: 'Salario' },
  { id: 2, description: 'Supermercado', amount: -250.50, type: 'expense', date: '2025-01-02', category: 'Alimentación' },
  { id: 3, description: 'Netflix', amount: -15.99, type: 'expense', date: '2025-01-03', category: 'Entretenimiento' },
  { id: 4, description: 'Gasolina', amount: -45.00, type: 'expense', date: '2025-01-04', category: 'Transporte' },
  { id: 5, description: 'Freelance', amount: 500, type: 'income', date: '2025-01-05', category: 'Ingresos Extra' },
]

const mockBudgets = [
  { category: 'Alimentación', spent: 450, limit: 800, percentage: 56 },
  { category: 'Transporte', spent: 180, limit: 300, percentage: 60 },
  { category: 'Entretenimiento', spent: 95, limit: 200, percentage: 47 },
  { category: 'Servicios', spent: 320, limit: 400, percentage: 80 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats)
  const [transactions, setTransactions] = useState(mockRecentTransactions)
  const [budgets, setBudgets] = useState(mockBudgets)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de tus finanzas personales
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpIcon className="mr-1 h-3 w-3" />
              +{stats.incomeChange}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowDownIcon className="mr-1 h-3 w-3" />
              {stats.expensesChange}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponible para invertir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Ahorro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.savingsRate}%</div>
            <p className="text-xs text-muted-foreground">
              De tus ingresos totales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          transaction.type === 'income'
                            ? 'text-green-600 font-semibold'
                            : 'text-red-600'
                        }
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        ${Math.abs(transaction.amount).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Presupuestos del Mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgets.map((budget) => (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <span className="text-muted-foreground">
                    ${budget.spent} / ${budget.limit}
                  </span>
                </div>
                <Progress value={budget.percentage} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{budget.percentage}% utilizado</span>
                  {budget.percentage > 80 && (
                    <Badge variant="warning" className="text-xs">
                      Cerca del límite
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
