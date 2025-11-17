import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, TrendingDown, Calendar } from 'lucide-react'
import LoanForm from './LoanForm'
import LoanDetail from './LoanDetail'

interface Loan {
  id: number
  name: string
  entity: string
  original_amount: number
  current_debt: number
  monthly_payment: number
  annual_rate: number
  current_installment: number
  base_installments_paid?: number
  total_installments: number
  completion_percentage: number
  status: string
  currency: string
  remaining_installments: number
  start_date: string
  payment_day?: number
}

export default function LoanList() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [detailLoanId, setDetailLoanId] = useState<number | null>(null)

  useEffect(() => {
    fetchLoans()
    
    // Listen for loan updates (e.g., when a transaction is created)
    const handleLoanUpdate = () => {
      fetchLoans()
    }
    
    window.addEventListener('loanUpdated', handleLoanUpdate)
    
    return () => {
      window.removeEventListener('loanUpdated', handleLoanUpdate)
    }
  }, [])

  const fetchLoans = async () => {
    try {
      // Add timestamp to avoid cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/loans?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      const data = await response.json()
      setLoans(data)
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este préstamo?')) return
    
    try {
      await fetch(`/api/loans/${id}`, { method: 'DELETE' })
      setLoans(loans.filter(loan => loan.id !== id))
    } catch (error) {
      console.error('Error deleting loan:', error)
    }
  }

  const handleEdit = async (loan: Loan) => {
    try {
      // Obtener datos completos del préstamo
      const response = await fetch(`/api/loans/${loan.id}`)
      if (!response.ok) throw new Error('Error al cargar el préstamo')
      
      const fullLoan = await response.json()
      setEditingLoan(fullLoan)
      setShowForm(true)
    } catch (error) {
      console.error('Error loading loan:', error)
    }
  }

  const handleFormSuccess = () => {
    fetchLoans()
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingLoan(null)
  }

  // Calcular próxima fecha de pago
  const getNextPaymentDate = (paymentDay?: number) => {
    if (!paymentDay) return 'No definida'
    
    const today = new Date()
    const currentDay = today.getDate()
    
    // Si el día de pago ya pasó este mes, calcular para el próximo mes
    let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay)
    
    if (currentDay >= paymentDay) {
      nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay)
    }
    
    return nextPayment.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Cargando préstamos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de nuevo préstamo */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Mis Préstamos</h2>
          <p className="text-text-secondary text-sm mt-1">
            {loans.length} préstamo{loans.length !== 1 ? 's' : ''} activo{loans.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Préstamo
        </button>
      </div>

      {/* Lista de préstamos */}
      {loans.length === 0 ? (
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-12 text-center">
          <TrendingDown className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary">No tienes préstamos registrados</p>
          <p className="text-text-secondary text-sm mt-2">Comienza agregando tu primer préstamo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loans.map((loan) => (
            <div 
              key={loan.id}
              className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{loan.name}</h3>
                  <p className="text-text-secondary text-sm">{loan.entity}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(loan)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button 
                    onClick={() => handleDelete(loan.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Deuda Actual</p>
                    <p className="font-semibold text-text-primary">
                      S/ {loan.current_debt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary">TCEA</p>
                    <p className="font-semibold text-orange-400">{loan.annual_rate.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary">Cuota Mensual</p>
                    <p className="font-semibold text-text-primary">
                      S/ {loan.monthly_payment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary">Cuotas Restantes</p>
                    <p className="font-semibold text-blue-400">
                      {loan.remaining_installments} de {loan.total_installments}
                    </p>
                  </div>
                </div>

                {/* Próxima fecha de pago */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-blue-900 font-semibold">Próximo Pago</p>
                      <p className="text-blue-700 text-xs">
                        {getNextPaymentDate(loan.payment_day)}
                        {loan.payment_day && <span className="ml-1">(Día {loan.payment_day})</span>}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Progreso</span>
                    <span>{loan.completion_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${loan.completion_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <button 
                  onClick={() => setDetailLoanId(loan.id)}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  Ver Detalles →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showForm && (
        <LoanForm
          loan={editingLoan}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Modal de detalle */}
      {detailLoanId && (
        <LoanDetail
          loanId={detailLoanId}
          onClose={() => setDetailLoanId(null)}
        />
      )}
    </div>
  )
}
