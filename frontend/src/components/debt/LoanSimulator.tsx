import { useState, useEffect } from 'react'
import { Calculator, TrendingDown, Calendar, CheckSquare, Square } from 'lucide-react'

interface Loan {
  id: number
  name: string
  entity: string
  current_debt: number
  annual_rate: number
  monthly_payment: number
  status: string
}

interface SimulationResult {
  strategy: string
  total_months_saved: number
  total_interest_saved: number
  total_debt_payoff_date: string
  current_total_interest: number
  simulated_total_interest: number
  loans: Array<{
    loan_id: number
    loan_name: string
    current_months_remaining: number
    simulated_months_remaining: number
    months_saved: number
    current_total_interest: number
    simulated_total_interest: number
    interest_saved: number
  }>
}

export default function LoanSimulator() {
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche')
  const [extraPayment, setExtraPayment] = useState<number>(0)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loans, setLoans] = useState<Loan[]>([])
  const [selectedLoanIds, setSelectedLoanIds] = useState<number[]>([])
  const [loansLoading, setLoansLoading] = useState(true)

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    try {
      const response = await fetch('/api/loans')
      const data = await response.json()
      const activeLoans = data.filter((loan: Loan) => loan.status === 'active')
      setLoans(activeLoans)
      // Select all active loans by default
      setSelectedLoanIds(activeLoans.map((loan: Loan) => loan.id))
    } catch (error) {
      console.error('Error fetching loans:', error)
    } finally {
      setLoansLoading(false)
    }
  }

  const toggleLoanSelection = (loanId: number) => {
    setSelectedLoanIds(prev => 
      prev.includes(loanId)
        ? prev.filter(id => id !== loanId)
        : [...prev, loanId]
    )
  }

  const runSimulation = async () => {
    if (selectedLoanIds.length === 0) {
      alert('Por favor selecciona al menos un préstamo para simular')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/loans/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          extra_payment: extraPayment > 0 ? {
            amount: extraPayment,
            start_month: 1
          } : null,
          include_all_loans: false,
          loan_ids: selectedLoanIds
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error running simulation:', error)
      alert('Error al ejecutar la simulación. Por favor verifica que los préstamos tengan datos válidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Simulador de Pago de Deudas</h2>
        <p className="text-text-secondary text-sm mt-1">
          Compara estrategias para pagar tus deudas más rápido
        </p>
      </div>

      {/* Configuración del simulador */}
      <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Configuración</h3>
        
        <div className="space-y-4">
          {/* Selector de préstamos */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Préstamos a Simular
            </label>
            {loansLoading ? (
              <div className="text-sm text-text-secondary py-2">Cargando préstamos...</div>
            ) : loans.length === 0 ? (
              <div className="text-sm text-text-secondary py-2">No hay préstamos activos</div>
            ) : (
              <div className="space-y-2">
                {loans.map((loan) => (
                  <button
                    key={loan.id}
                    onClick={() => toggleLoanSelection(loan.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedLoanIds.includes(loan.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {selectedLoanIds.includes(loan.id) ? (
                      <CheckSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary">{loan.name}</div>
                      <div className="text-sm text-text-secondary">
                        {loan.entity} • Deuda: S/ {loan.current_debt.toLocaleString('es-PE', { minimumFractionDigits: 2 })} • 
                        Tasa: {loan.annual_rate}% • Cuota: S/ {loan.monthly_payment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </button>
                ))}
                <p className="text-xs text-text-secondary mt-2">
                  Selecciona los préstamos que deseas incluir en la simulación
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Estrategia de Pago
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setStrategy('avalanche')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  strategy === 'avalanche'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold text-text-primary">Avalancha (Avalanche)</div>
                <div className="text-sm text-text-secondary mt-1">
                  Paga primero el préstamo con mayor tasa de interés. Ahorra más dinero en intereses.
                </div>
              </button>
              
              <button
                onClick={() => setStrategy('snowball')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  strategy === 'snowball'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold text-text-primary">Bola de Nieve (Snowball)</div>
                <div className="text-sm text-text-secondary mt-1">
                  Paga primero el préstamo con menor saldo. Mayor motivación psicológica.
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Pago Extra Mensual (opcional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">S/</span>
                <input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 pl-8 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                  step="100"
                  min="0"
                />
              </div>
              <button
                onClick={runSimulation}
                disabled={loading}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                {loading ? 'Simulando...' : 'Simular'}
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Cantidad adicional que puedes destinar mensualmente para acelerar el pago
            </p>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Resultados de Simulación</h3>
          
          <div className="bg-surface/90 backdrop-blur-md border border-primary rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-text-primary capitalize">
                  {result.strategy === 'avalanche' ? 'Estrategia Avalancha' : 'Estrategia Bola de Nieve'}
                </h4>
                <p className="text-sm text-text-secondary mt-1">
                  {result.strategy === 'avalanche' 
                    ? 'Paga primero el préstamo con mayor tasa de interés' 
                    : 'Paga primero el préstamo con menor saldo'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-text-secondary">Meses Ahorrados</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {result.total_months_saved} meses
                </p>
                {result.total_months_saved > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    ¡Terminas {result.total_months_saved} meses antes!
                  </p>
                )}
              </div>

              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-text-secondary">Intereses Ahorrados</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  S/ {result.total_interest_saved.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
                {result.total_interest_saved > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    ¡Ahorras en intereses!
                  </p>
                )}
              </div>

              <div className="bg-background/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-text-secondary">Interés Total</span>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  S/ {result.simulated_total_interest.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  vs S/ {result.current_total_interest.toLocaleString('es-PE', { minimumFractionDigits: 2 })} actual
                </p>
              </div>
            </div>

            {/* Detalle por préstamo */}
            {result.loans && result.loans.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-text-primary">Detalle por Préstamo</h5>
                {result.loans.map((loan) => (
                  <div key={loan.loan_id} className="bg-background/30 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-text-primary">{loan.loan_name}</div>
                      {loan.months_saved > 0 && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          -{loan.months_saved} meses
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Meses actuales:</span>
                        <span className="ml-2 text-text-primary font-semibold">{loan.current_months_remaining}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Con estrategia:</span>
                        <span className="ml-2 text-text-primary font-semibold">{loan.simulated_months_remaining}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Interés actual:</span>
                        <span className="ml-2 text-text-primary font-semibold">
                          S/ {loan.current_total_interest.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Interés simulado:</span>
                        <span className="ml-2 text-text-primary font-semibold">
                          S/ {loan.simulated_total_interest.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!result && !loading && (
        <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-12 text-center">
          <Calculator className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary">Configura los parámetros y ejecuta la simulación</p>
          <p className="text-text-secondary text-sm mt-2">
            Compara diferentes estrategias para encontrar la mejor forma de pagar tus deudas
          </p>
        </div>
      )}
    </div>
  )
}
