import { useState, useEffect } from 'react'
import { X, Calculator } from 'lucide-react'

interface LoanFormProps {
  loan?: Loan | null
  onClose: () => void
  onSuccess: () => void
}

interface Loan {
  id: number
  name: string
  entity: string
  original_amount: number
  current_debt: number
  annual_rate: number
  monthly_payment: number
  total_installments: number
  current_installment: number  // Calculated property
  base_installments_paid?: number  // Manual/editable base count (optional for compatibility)
  start_date: string
  payment_day?: number
  currency: string
  notes?: string
}

interface LoanFormData {
  name: string
  entity: string
  original_amount: string
  annual_rate: string
  total_installments: string
  base_installments_paid: string
  start_date: string
  payment_day: string
  currency: string
  notes: string
}

export default function LoanForm({ loan, onClose, onSuccess }: LoanFormProps) {
  const [formData, setFormData] = useState<LoanFormData>({
    name: '',
    entity: '',
    original_amount: '',
    annual_rate: '',
    total_installments: '',
    base_installments_paid: '0',
    start_date: new Date().toISOString().split('T')[0],
    payment_day: '5',
    currency: 'PEN',
    notes: ''
  })
  
  const [calculatedPayment, setCalculatedPayment] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validar que los campos requeridos estén completos
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.entity.trim() !== '' &&
      formData.original_amount !== '' &&
      formData.annual_rate !== '' &&
      formData.total_installments !== '' &&
      formData.start_date !== '' &&
      formData.payment_day !== ''
    )
  }

  // Cargar datos si es edición
  useEffect(() => {
    if (loan) {
      setFormData({
        name: loan.name || '',
        entity: loan.entity || '',
        original_amount: loan.original_amount?.toString() || '',
        annual_rate: loan.annual_rate?.toString() || '',
        total_installments: loan.total_installments?.toString() || '',
        base_installments_paid: loan.base_installments_paid?.toString() || '0',
        start_date: loan.start_date || new Date().toISOString().split('T')[0],
        payment_day: loan.payment_day ? loan.payment_day.toString() : '5',
        currency: loan.currency || 'PEN',
        notes: loan.notes || ''
      })
      setCalculatedPayment(loan.monthly_payment || null)
    }
  }, [loan])

  // Auto-calcular cuota mensual usando fórmula francesa
  useEffect(() => {
    const amount = parseFloat(formData.original_amount)
    const rate = parseFloat(formData.annual_rate)
    const installments = parseInt(formData.total_installments)

    if (amount > 0 && rate > 0 && installments > 0) {
      // Fórmula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
      // donde r = tasa mensual (TEA a TEM)
      const monthlyRate = Math.pow(1 + rate / 100, 1/12) - 1
      const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                     (Math.pow(1 + monthlyRate, installments) - 1)
      
      setCalculatedPayment(payment)
    } else {
      setCalculatedPayment(null)
    }
  }, [formData.original_amount, formData.annual_rate, formData.total_installments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name,
        entity: formData.entity,
        original_amount: parseFloat(formData.original_amount),
        annual_rate: parseFloat(formData.annual_rate),
        total_installments: parseInt(formData.total_installments),
        monthly_payment: calculatedPayment || 0,  // Include calculated payment
        base_installments_paid: parseInt(formData.base_installments_paid),
        start_date: formData.start_date,
        payment_frequency: 'monthly',
        payment_day: parseInt(formData.payment_day),
        currency: formData.currency,
        notes: formData.notes || undefined
      }

      console.log('Sending loan payload:', payload)

      const url = loan ? `/api/loans/${loan.id}` : '/api/loans'
      const method = loan ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Log the error details for debugging
        console.error('Loan creation error:', {
          status: response.status,
          detail: errorData.detail,
          errors: errorData.errors,
          fullResponse: errorData
        })
        const errorMsg = errorData.detail || errorData.errors?.[0]?.msg || 'Error al guardar el préstamo'
        throw new Error(errorMsg)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="text-2xl font-bold text-text-primary">
            {loan ? 'Editar Préstamo' : 'Nuevo Préstamo'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Nombre del Préstamo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Préstamo BBVA 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Entidad Financiera *
                </label>
                <input
                  type="text"
                  required
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="BBVA"
                />
              </div>
            </div>
          </div>

          {/* Montos y Tasas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Montos y Tasas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Monto Original *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    S/
                  </span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.original_amount}
                    onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 pl-8 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="15000.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  TCEA (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.annual_rate}
                    onChange={(e) => setFormData({ ...formData, annual_rate: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="14.27"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    %
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">Tasa Efectiva Anual</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cuotas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">Cuotas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Total de Cuotas *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.total_installments}
                  onChange={(e) => setFormData({ ...formData, total_installments: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="47"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Cuotas Base Pagadas *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.base_installments_paid}
                  onChange={(e) => setFormData({ ...formData, base_installments_paid: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Cuotas pagadas manualmente (se sumarán automáticamente las cuotas pagadas vía transacciones)
                </p>
              </div>
            </div>
          </div>

          {/* Fecha de Inicio y Día de Pago */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Día de Pago Mensual *
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={formData.payment_day}
                onChange={(e) => setFormData({ ...formData, payment_day: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: 5"
              />
              <p className="text-xs text-text-secondary mt-1">Día del mes para pago (1-31)</p>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notas (Opcional)
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Información adicional sobre el préstamo..."
            />
          </div>

          {/* Cuota Calculada */}
          {calculatedPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Cuota Mensual Calculada</p>
                  <p className="text-2xl font-bold text-blue-700">
                    S/ {calculatedPayment.toFixed(2)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Calculado con sistema de amortización francés
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-background text-text-secondary rounded-lg hover:bg-surface-soft transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : loan ? 'Actualizar' : 'Crear Préstamo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
