import { useEffect, useState } from 'react'
import { TrendingDown, Calendar, Percent, Wallet } from 'lucide-react'

interface DebtSummary {
  total_current_debt: number
  total_monthly_payment: number
  weighted_avg_rate: number
  active_loans: number
  projected_payoff_date: string
  total_interest_paid: number
  total_principal_paid: number
}

export default function DebtDashboard() {
  const [summary, setSummary] = useState<DebtSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    
    // Listen for loan updates
    const handleLoanUpdate = () => {
      fetchDashboard()
    }
    
    window.addEventListener('loanUpdated', handleLoanUpdate)
    
    return () => {
      window.removeEventListener('loanUpdated', handleLoanUpdate)
    }
  }, [])

  const fetchDashboard = async () => {
    try {
      // Add timestamp to avoid cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/loans/dashboard/summary?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching debt dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Cargando resumen de deudas...</div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">No se pudo cargar el resumen</div>
      </div>
    )
  }

  const completionPercentage = summary.total_principal_paid > 0
    ? ((summary.total_principal_paid / (summary.total_principal_paid + summary.total_current_debt)) * 100).toFixed(1)
    : 0

  const totalOriginalDebt = summary.total_principal_paid + summary.total_current_debt

  return (
    <div className="space-y-6">
      {/* Métricas principales - Carousel on mobile */}
      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-2 md:pb-0">
          <div className="flex-shrink-0 w-[280px] md:w-auto bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Deuda Total Actual</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  S/ {summary.total_current_debt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-xl">
                <Wallet className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-[280px] md:w-auto bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Pago Mensual Total</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  S/ {summary.total_monthly_payment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-[280px] md:w-auto bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">TCEA Promedio Ponderada</p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {summary.weighted_avg_rate.toFixed(2)}%
                </p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <Percent className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-[280px] md:w-auto bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Fecha Proyectada de Pago</p>
              <p className="text-xl font-bold text-text-primary mt-1">
                {summary.projected_payoff_date 
                  ? new Date(summary.projected_payoff_date).toLocaleDateString('es-PE', { 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  : 'N/A'
                }
              </p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Progreso general */}
      <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Progreso de Pago Total</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Pagado: S/ {summary.total_principal_paid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              <span>{completionPercentage}% completado</span>
            </div>
            <div className="w-full bg-background rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Deuda Original</p>
              <p className="font-semibold text-text-primary">
                S/ {totalOriginalDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-text-secondary">Total Pagado</p>
              <p className="font-semibold text-green-400">
                S/ {summary.total_principal_paid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-text-secondary">Saldo Restante</p>
              <p className="font-semibold text-red-400">
                S/ {summary.total_current_debt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de préstamos activos */}
      <div className="bg-blue-500/10 backdrop-blur-md border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Préstamos Activos</p>
            <p className="text-2xl font-bold text-text-primary">{summary.active_loans}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
