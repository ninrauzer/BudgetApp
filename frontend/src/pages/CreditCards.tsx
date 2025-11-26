import { useState } from 'react';
import { 
  CreditCard as CreditCardIcon, 
  Calendar, 
  Calculator, 
  AlertCircle,
  TrendingUp,
  Plus
} from 'lucide-react';
import { 
  useCreditCards, 
  useCreditCardSummary, 
  useCycleTimeline, 
  usePurchaseAdvisor,
  useCreateCreditCard
} from '@/hooks/useCreditCards';
import { formatCurrencyISO } from '@/lib/format';
import CreditCardModal from '@/components/CreditCardModal';
import TimelineView from '@/components/TimelineView';
import type { CreateCreditCardPayload } from '@/lib/api/creditCards';

// Helper para formatear montos en PEN
const formatCurrency = (amount: number) => formatCurrencyISO(amount, 'PEN');

export default function CreditCardsPage() {
  const { data: cards, isLoading, error } = useCreditCards();
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [purchaseInstallments, setPurchaseInstallments] = useState<string>('6');
  const [showModal, setShowModal] = useState(false);

  const createCardMutation = useCreateCreditCard();

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
      <>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tus tarjetas, planifica compras y optimiza tu crédito
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors shadow-lg shadow-purple-500/30 font-medium"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Nueva Tarjeta
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
            <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No hay tarjetas registradas</h2>
            <p className="text-gray-600 mb-6">
              Agrega tu primera tarjeta para comenzar a planificar tus compras
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors shadow-lg shadow-purple-500/30 font-medium"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Agregar Primera Tarjeta
            </button>
          </div>
        </div>

        <CreditCardModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={(payload) => {
            createCardMutation.mutate(payload as CreateCreditCardPayload, {
              onSuccess: () => {
                setShowModal(false);
              }
            });
          }}
          isPending={createCardMutation.isPending}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tarjetas de Crédito</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona tus tarjetas, planifica compras y optimiza tu crédito
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors shadow-lg shadow-purple-500/30 font-medium"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Nueva Tarjeta
          </button>
        </div>

      {/* Cards List */}
      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-2 md:pb-0">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCardId(card.id)}
            className={`
              flex-shrink-0 w-[280px] md:w-auto
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

            <div className="space-y-2 border-t border-gray-200 pt-3">
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

              {/* Desglose de deuda */}
              {card.current_balance > 0 && (
                <div className="bg-orange-50 rounded-lg p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-700 font-medium">Deuda Revolvente:</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(card.revolving_debt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-700 font-medium">En Cuotas:</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(card.current_balance - card.revolving_debt)}
                    </span>
                  </div>
                </div>
              )}

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
      </div>

      {/* Timeline - Full Width */}
      {activeCardId && timeline && (
        <TimelineView timeline={timeline} />
      )}

      {/* Purchase Advisor & Installments */}
      {activeCardId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purchase Advisor - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6">
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
              <div className="space-y-6">
                {/* ⚠️ ADVERTENCIA: Crédito Insuficiente */}
                {advisor.error && advisor.warning ? (
                  <div className="rounded-lg p-5 border-2 border-red-300 bg-red-50">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">❌</div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-red-900 mb-2">
                          {advisor.warning.title}
                        </p>
                        <p className="text-sm text-red-800 mb-3">
                          {advisor.warning.message}
                        </p>
                        <div className="bg-white rounded p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monto solicitado:</span>
                            <span className="font-bold text-red-600">
                              {formatCurrency(advisor.warning.details.requested_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Crédito disponible:</span>
                            <span className="font-bold text-emerald-600">
                              {formatCurrency(advisor.warning.details.available_credit)}
                            </span>
                          </div>
                          <div className="border-t pt-2 flex justify-between bg-red-50">
                            <span className="text-gray-700 font-medium">Te falta:</span>
                            <span className="font-black text-red-600">
                              {formatCurrency(advisor.warning.details.short_by)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-red-700 mt-3 italic">
                          💡 {advisor.warning.details.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                {/* Recomendación */}
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
                    {advisor.recommendation.best_option === 'revolvente' && '✨ Pagar en Revolvente'}
                    {advisor.recommendation.best_option === 'installments' && '📊 Pagar en Cuotas'}
                    {advisor.recommendation.best_option === 'depends' && '⚖️ Depende de tu liquidez'}
                  </p>
                  <p className="text-sm text-gray-700">
                    {advisor.recommendation.reason}
                  </p>
                </div>

                {/* Comparativa de Opciones */}
                <div className="grid grid-cols-2 gap-4">
                  {/* OPCIÓN 1: REVOLVENTE */}
                  <div className="bg-emerald-50 rounded-xl p-5 border-2 border-emerald-200">
                    <div className="mb-4">
                      <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">
                        Opción 1: Revolvente
                      </p>
                      <p className="text-xs text-gray-600">Se agrega como deuda revolvente</p>
                    </div>

                    <div className="space-y-3 bg-white rounded-lg p-3">
                      <div>
                        <p className="text-xs text-gray-600">Monto original</p>
                        <p className="text-lg font-black text-gray-900">{formatCurrency(parseFloat(purchaseAmount) || 0)}</p>
                      </div>
                      <div className="border-t pt-2">
                        <p className="text-xs text-gray-600">Intereses</p>
                        <p className="text-sm font-bold text-emerald-600">0% (sin intereses)</p>
                      </div>
                      <div className="border-t pt-2 bg-emerald-100 rounded p-2">
                        <p className="text-xs text-emerald-700 font-medium">Total a pagar</p>
                        <p className="text-xl font-black text-emerald-700">
                          {formatCurrency(advisor.revolvente_option.total_to_pay)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-emerald-700 bg-emerald-100 rounded p-2">
                      ✅ Pago flexible en revolvente. Puedes pagar el total o parcialmente.
                    </div>
                  </div>

                  {/* OPCIÓN 2: CUOTAS */}
                  {advisor.installments_option && (
                    <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                      <div className="mb-4">
                        <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">
                          Opción 2: En {advisor.installments_option.installments} Cuotas
                        </p>
                        <p className="text-xs text-gray-600">Se agrega como cuota fija con intereses</p>
                      </div>

                      <div className="space-y-3 bg-white rounded-lg p-3">
                        <div>
                          <p className="text-xs text-gray-600">Monto original</p>
                          <p className="text-lg font-black text-gray-900">{formatCurrency(parseFloat(purchaseAmount) || 0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Cuota mensual</p>
                          <p className="text-sm font-bold text-blue-600">
                            {formatCurrency((advisor.installments_option.total_to_pay / advisor.installments_option.installments))}
                          </p>
                        </div>
                        <div className="border-t pt-2">
                          <p className="text-xs text-gray-600">Intereses ({advisor.installments_option.tea}% TEA)</p>
                          <p className="text-sm font-bold text-orange-600">
                            +{formatCurrency(advisor.installments_option.total_interest)}
                          </p>
                        </div>
                        <div className="border-t pt-2 bg-blue-100 rounded p-2">
                          <p className="text-xs text-blue-700 font-medium">Total a pagar</p>
                          <p className="text-xl font-black text-blue-700">
                            {formatCurrency(advisor.installments_option.total_to_pay)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded p-2">
                        📅 {advisor.installments_option.installments} cuotas de {formatCurrency((advisor.installments_option.total_to_pay / advisor.installments_option.installments))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumen de Impacto */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-3">
                    📊 Comparativa de Impacto
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Diferencia de costo</p>
                      <p className="text-lg font-bold text-orange-600">
                        +{formatCurrency(advisor.installments_option ? advisor.installments_option.total_interest : 0)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">por financiamiento</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ahorro si pagas revolvente</p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(advisor.installments_option ? advisor.installments_option.total_interest : 0)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">vs cuotas</p>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calculator className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-500">Ingresa un monto para ver la comparación</p>
              </div>
            )}
          </div>

          {/* Installments Summary - 1 column */}
          {cardSummary && cardSummary.active_installments.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-100">
                  <TrendingUp className="w-6 h-6 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Cuotas Activas</h2>
                  <p className="text-xs text-gray-600">
                    {formatCurrency(cardSummary.total_monthly_installments)}/mes
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cardSummary.active_installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-bold text-sm text-gray-900">{installment.concept.substring(0, 20)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {installment.current_installment}/{installment.total_installments}
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatCurrency(installment.monthly_payment)}/mes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      </div>

      <CreditCardModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(payload) => {
          createCardMutation.mutate(payload as CreateCreditCardPayload, {
            onSuccess: () => {
              setShowModal(false);
            }
          });
        }}
        isPending={createCardMutation.isPending}
      />
    </>
  );
}
