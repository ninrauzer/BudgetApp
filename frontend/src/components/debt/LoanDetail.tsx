import { useEffect, useState } from 'react'
import { X, Download, Calendar, DollarSign } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface LoanDetailProps {
  loanId: number
  onClose: () => void
}

interface AmortizationRow {
  installment_number: number
  payment_date: string
  payment_amount: number
  principal: number
  interest: number
  remaining_balance: number
  is_paid: boolean
}

interface LoanPayment {
  id: number
  payment_date: string
  amount: number
  principal: number
  interest: number
  remaining_balance: number
  installment_number: number
}

interface LoanDetail {
  id: number
  name: string
  entity: string
  original_amount: number
  current_debt: number
  annual_rate: number
  monthly_payment: number
  total_installments: number
  current_installment: number
  start_date: string
  completion_percentage: number
}

export default function LoanDetail({ loanId, onClose }: LoanDetailProps) {
  const [loan, setLoan] = useState<LoanDetail | null>(null)
  const [amortization, setAmortization] = useState<AmortizationRow[]>([])
  const [payments, setPayments] = useState<LoanPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'schedule' | 'payments' | 'charts'>('schedule')

  useEffect(() => {
    fetchLoanDetails()
  }, [loanId])

  const fetchLoanDetails = async () => {
    try {
      const [loanRes, amortRes, paymentsRes] = await Promise.all([
        fetch(`/api/loans/${loanId}`),
        fetch(`/api/loans/${loanId}/amortization`),
        fetch(`/api/loans/${loanId}/payments`)
      ])

      const loanData = await loanRes.json()
      const amortData = await amortRes.json()
      const paymentsData = await paymentsRes.json()

      setLoan(loanData)
      setAmortization(amortData.schedule || [])
      setPayments(paymentsData || [])
    } catch (error) {
      console.error('Error fetching loan details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-surface rounded-2xl p-8">
          <div className="text-text-secondary">Cargando detalles...</div>
        </div>
      </div>
    )
  }

  if (!loan) return null

  // Datos para gráfico de capital vs interés
  const chartData = amortization.slice(0, 36).map(row => ({
    cuota: row.installment_number,
    Capital: parseFloat((row.principal || 0).toFixed(2)),
    Interés: parseFloat((row.interest || 0).toFixed(2)),
    Saldo: parseFloat((row.remaining_balance || 0).toFixed(2))
  }))

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{loan.name}</h2>
            <p className="text-text-secondary text-sm mt-1">{loan.entity}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-background">
          <div>
            <p className="text-xs text-text-secondary">Monto Original</p>
            <p className="text-lg font-bold text-text-primary">
              S/ {loan.original_amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Deuda Actual</p>
            <p className="text-lg font-bold text-red-500">
              S/ {loan.current_debt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Cuota Mensual</p>
            <p className="text-lg font-bold text-orange-500">
              S/ {loan.monthly_payment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">TCEA</p>
            <p className="text-lg font-bold text-yellow-600">{loan.annual_rate.toFixed(2)}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-background border-b border-border">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'schedule'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            Tabla de Amortización
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'payments'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            Historial de Pagos
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'charts'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface'
            }`}
          >
            Gráficos
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-text-primary">
                  Cronograma de Pagos ({amortization.length} cuotas)
                </h3>
                <button className="text-sm text-primary hover:text-primary-hover flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-background sticky top-0">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-primary">Fecha</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-primary">Cuota</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-primary">Capital</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-primary">Interés</th>
                      <th className="px-4 py-3 text-right font-semibold text-text-primary">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortization.map((row, idx) => (
                      <tr 
                        key={idx}
                        className={`border-b border-border ${
                          row.installment_number <= loan.current_installment
                            ? 'bg-green-50'
                            : row.installment_number === loan.current_installment + 1
                            ? 'bg-blue-50'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-text-primary font-medium">
                          {row.installment_number}
                          {row.installment_number === loan.current_installment + 1 && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                              Próxima
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {new Date(row.payment_date).toLocaleDateString('es-PE', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-text-primary">
                          S/ {(row.payment_amount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          S/ {(row.principal || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-orange-600">
                          S/ {(row.interest || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-text-primary">
                          S/ {(row.remaining_balance || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-text-primary">
                Pagos Registrados ({payments.length})
              </h3>

              {payments.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay pagos registrados aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="bg-background rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">
                            Cuota #{payment.installment_number}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {new Date(payment.payment_date).toLocaleDateString('es-PE', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-text-primary">
                          S/ {payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          Capital: S/ {payment.principal.toFixed(2)} | 
                          Interés: S/ {payment.interest.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-8">
              {/* Gráfico de barras: Capital vs Interés */}
              <div>
                <h3 className="font-semibold text-text-primary mb-4">
                  Composición de Cuotas (Primeras 36)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="cuota" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Capital" fill="#22c55e" name="Capital" />
                    <Bar dataKey="Interés" fill="#f97316" name="Interés" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de área: Evolución del saldo */}
              <div>
                <h3 className="font-semibold text-text-primary mb-4">
                  Evolución del Saldo
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="cuota" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Saldo" 
                      stroke="#3b82f6" 
                      fill="#93c5fd" 
                      name="Saldo Restante"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
