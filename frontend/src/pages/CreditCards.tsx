import { useState } from 'react';
import { 
  CreditCard as CreditCardIcon, 
  Calendar, 
  Calculator, 
  AlertCircle,
  TrendingUp 
} from 'lucide-react';
import { 
  useCreditCards, 
  useCreditCardSummary, 
  useCycleTimeline, 
  usePurchaseAdvisor 
} from '@/hooks/useCreditCards';
import { formatCurrencyISO } from '@/lib/format';

// Helper para formatear montos en PEN
const formatCurrency = (amount: number) => formatCurrencyISO(amount, 'PEN');

export default function CreditCardsPage() {
  const { data: cards, isLoading, error } = useCreditCards();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [purchaseInstallments, setPurchaseInstallments] = useState<string>('6');

  // Seleccionar automáticamente la primera tarjeta
  const firstCardId = cards?.[0]?.id;
  const activeCardId = selectedCardId || firstCardId || null;

  // Queries para la tarjeta seleccionada
  const { data: cardSummary } = useCreditCardSummary(activeCardId || 0);
  const { data: timeline } = useCycleTimeline(activeCardId || 0);
  const { data: advisor } = usePurchaseAdvisor(
    activeCardId || 0,
    purchaseAmount ? parseFloat(purchaseAmount) : undefined,
    purchaseInstallments ? parseInt(purchaseInstallments) : undefined
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tarjetas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Error al cargar tarjetas</p>
          <p className="text-sm text-gray-500 mt-2">{String(error)}</p>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona tus tarjetas, planifica compras y optimiza tu crédito
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
          <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No hay tarjetas registradas</h2>
          <p className="text-gray-600 mb-6">
            Agrega tu primera tarjeta para comenzar a planificar tus compras
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona tus tarjetas, planifica compras y optimiza tu crédito
          </p>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCardId(card.id)}
            className={`
              bg-white rounded-2xl border-2 p-6 text-left transition-all
              ${activeCardId === card.id 
                ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{card.name}</h3>
                <p className="text-sm text-gray-600">{card.bank}</p>
              </div>
              <div className={`
                p-2 rounded-lg
                ${card.available_credit / card.credit_limit > 0.5 
                  ? 'bg-emerald-100' 
                  : 'bg-orange-100'
                }
              `}>
                <CreditCardIcon className={`
                  w-5 h-5
                  ${card.available_credit / card.credit_limit > 0.5 
                    ? 'text-emerald-600' 
                    : 'text-orange-600'
                  }
                `} strokeWidth={2} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Crédito Disponible</span>
                <span className="font-bold text-gray-900">
                  {Math.round((card.available_credit / card.credit_limit) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all
                    ${card.available_credit / card.credit_limit > 0.5 
                      ? 'bg-emerald-500' 
                      : 'bg-orange-500'
                    }
                  `}
                  style={{ width: `${(card.available_credit / card.credit_limit) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponible:</span>
                <span className="text-sm font-bold text-emerald-600">
                  {formatCurrency(card.available_credit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Saldo Actual:</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(card.current_balance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Límite:</span>
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(card.credit_limit)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Timeline & Calculator */}
      {activeCardId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cycle Timeline */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan-100">
                <Calendar className="w-6 h-6 text-cyan-600" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Ciclo de Facturación</h2>
                <p className="text-xs text-gray-600">¿Cuál es el mejor momento para comprar?</p>
              </div>
            </div>

            {timeline ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Próximo Corte</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(timeline.current_cycle.statement_date).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      en {timeline.current_cycle.days_until_close} días
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Próximo Pago</p>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(timeline.current_cycle.due_date).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      en {timeline.current_cycle.days_until_payment} días
                    </p>
                  </div>
                </div>

                <div className={`
                  rounded-lg p-4 border-2
                  ${timeline.float_calculator.if_buy_today.float_days >= 45
                    ? 'bg-emerald-50 border-emerald-200'
                    : timeline.float_calculator.if_buy_today.float_days >= 30
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-rose-50 border-rose-200'
                  }
                `}>
                  <p className="text-sm font-bold text-gray-900 mb-2">Si compras hoy:</p>
                  <p className={`
                    text-2xl font-black mb-2
                    ${timeline.float_calculator.if_buy_today.float_days >= 45
                      ? 'text-emerald-600'
                      : timeline.float_calculator.if_buy_today.float_days >= 30
                      ? 'text-amber-600'
                      : 'text-rose-600'
                    }
                  `}>
                    {timeline.float_calculator.if_buy_today.float_days} días
                  </p>
                  <p className="text-xs text-gray-700">
                    de crédito gratis hasta el{' '}
                    {new Date(timeline.float_calculator.if_buy_today.payment_due).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-400/90 to-emerald-500/90 rounded-lg p-4 text-white">
                  <p className="text-xs text-white/70 mb-1 uppercase tracking-wider">
                    🟢 Ventana Óptima
                  </p>
                  <p className="text-lg font-bold mb-2">
                    {new Date(timeline.timeline.best_purchase_window.start).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short'
                    })} - {new Date(timeline.timeline.best_purchase_window.end).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                  <p className="text-sm text-white/90">
                    {timeline.timeline.best_purchase_window.reason}
                  </p>
                  <p className="text-xs text-white/70 mt-2">
                    Hasta {timeline.timeline.best_purchase_window.float_days} días de crédito gratis
                  </p>
                </div>

                <div className="space-y-2">
                  {timeline.timeline.cycle_phases.map((phase, idx) => (
                    <div
                      key={idx}
                      className={`
                        rounded-lg p-3 text-sm
                        ${phase.phase === 'optimal'
                          ? 'bg-emerald-50 border border-emerald-200'
                          : phase.phase === 'normal'
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-rose-50 border border-rose-200'
                        }
                      `}
                    >
                      <p className="font-bold text-gray-900">{phase.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(phase.date_range[0]).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short'
                        })} - {new Date(phase.date_range[1]).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Cargando timeline...</p>
              </div>
            )}
          </div>

          {/* Purchase Advisor */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calculator className="w-6 h-6 text-purple-600" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Asesor de Compras</h2>
                <p className="text-xs text-gray-600">¿Cuotas o revolvente?</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de la compra
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de cuotas
                </label>
                <select
                  value={purchaseInstallments}
                  onChange={(e) => setPurchaseInstallments(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="3">3 cuotas</option>
                  <option value="6">6 cuotas</option>
                  <option value="9">9 cuotas</option>
                  <option value="12">12 cuotas</option>
                  <option value="18">18 cuotas</option>
                  <option value="24">24 cuotas</option>
                </select>
              </div>
            </div>

            {advisor ? (
              <div className="space-y-4">
                <div className={`
                  rounded-lg p-4 border-2
                  ${advisor.recommendation.best_option === 'revolvente'
                    ? 'bg-emerald-50 border-emerald-200'
                    : advisor.recommendation.best_option === 'installments'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-amber-50 border-amber-200'
                  }
                `}>
                  <p className="text-xs text-gray-600 mb-1 uppercase tracking-wider">
                    💡 Recomendación
                  </p>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {advisor.recommendation.best_option === 'revolvente' && 'Pagar en Revolvente'}
                    {advisor.recommendation.best_option === 'installments' && 'Pagar en Cuotas'}
                    {advisor.recommendation.best_option === 'depends' && 'Depende de tu liquidez'}
                  </p>
                  <p className="text-sm text-gray-700">
                    {advisor.recommendation.reason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">Revolvente</p>
                    <p className="text-2xl font-black text-gray-900 mb-1">
                      {formatCurrency(advisor.revolvente_option.total_to_pay)}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">
                      Sin intereses
                    </p>
                  </div>

                  {advisor.installments_option && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2">
                        {advisor.installments_option.installments} Cuotas
                      </p>
                      <p className="text-2xl font-black text-gray-900 mb-1">
                        {formatCurrency(advisor.installments_option.total_to_pay)}
                      </p>
                      <p className="text-xs text-orange-600 font-medium">
                        +{formatCurrency(advisor.installments_option.total_interest)} interés
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-2">Impacto en crédito</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Utilización:</span>
                    <span className={`
                      text-sm font-bold
                      ${advisor.impact_on_credit.utilization_after < 50
                        ? 'text-emerald-600'
                        : advisor.impact_on_credit.utilization_after < 70
                        ? 'text-amber-600'
                        : 'text-rose-600'
                      }
                    `}>
                      {advisor.impact_on_credit.utilization_before.toFixed(1)}% → {advisor.impact_on_credit.utilization_after.toFixed(1)}%
                    </span>
                  </div>
                  {advisor.impact_on_credit.warning && (
                    <p className="text-xs text-gray-600 mt-2">
                      {advisor.impact_on_credit.warning}
                    </p>
                  )}
                </div>

                {advisor.recommendation.considerations.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-xs text-amber-900 font-bold mb-2 uppercase tracking-wider">
                      ⚠️ Consideraciones
                    </p>
                    <ul className="space-y-1">
                      {advisor.recommendation.considerations.map((item, idx) => (
                        <li key={idx} className="text-xs text-amber-900">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : purchaseAmount && parseFloat(purchaseAmount) > 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Calculando...</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm">Ingresa un monto para ver la comparación</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Installments Summary */}
      {cardSummary && cardSummary.active_installments.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-100">
              <TrendingUp className="w-6 h-6 text-orange-600" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Cuotas Activas</h2>
              <p className="text-xs text-gray-600">
                {formatCurrency(cardSummary.total_monthly_installments)}/mes comprometido
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {cardSummary.active_installments.map((installment) => (
              <div
                key={installment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-bold text-gray-900">{installment.concept}</p>
                  <p className="text-xs text-gray-600">
                    Cuota {installment.current_installment}/{installment.total_installments} •{' '}
                    {formatCurrency(installment.monthly_payment)}/mes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(installment.remaining_capital || 0)}
                  </p>
                  <p className="text-xs text-gray-600">restante</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
