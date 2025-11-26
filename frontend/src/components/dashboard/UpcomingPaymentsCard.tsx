/**
 * Upcoming Payments Card - Próximos pagos de préstamos
 */
import { Calendar, AlertCircle } from 'lucide-react';
import { useUpcomingPayments } from '../../hooks/useDashboardMetrics';
import { formatCurrencyISO } from '@/lib/format';

export function UpcomingPaymentsCard() {
  const { data, isLoading } = useUpcomingPayments();

  if (isLoading || !data) {
    return (
      <div className="bg-white border-2 border-border rounded-xl shadow-card">
        <div className="p-6"><div className="animate-pulse h-40 bg-gray-200 rounded"></div></div>
      </div>
    );
  }

  const hasPayments = data.payments.length > 0;

  return (
    <div className="bg-white border-2 border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all shadow-card">
      <div className="p-4 md:p-6 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-extrabold text-text-primary">Próximos Pagos</h3>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-[10px] md:text-xs text-text-secondary">7 días</span>
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-text-secondary" />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {!hasPayments ? (
          <div className="text-center py-6 md:py-8">
            <p className="text-sm md:text-base text-text-secondary">✨ No hay pagos pendientes en los próximos 7 días</p>
          </div>
        ) : (
          <>
            {/* Lista de pagos */}
            <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
              {data.payments.map((payment) => (
                <div key={payment.loan_id} className="flex items-center justify-between p-2.5 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-sm md:text-base font-bold text-text-primary">{payment.loan_name}</p>
                    <p className="text-[10px] md:text-xs text-text-secondary">{payment.entity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm md:text-base font-bold text-text-primary">
                      {formatCurrencyISO(payment.amount, 'PEN')}
                    </p>
                    <p className="text-[10px] md:text-xs text-text-secondary">
                      {payment.days_until_due === 0 ? 'Hoy' : `${payment.days_until_due}d`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className={`p-3 md:p-4 rounded-lg border-2 ${data.has_deficit ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-start gap-2 md:gap-3">
                {data.has_deficit && <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-bold text-text-primary mb-1">
                    Total a pagar: {formatCurrencyISO(data.total_amount, 'PEN')}
                  </p>
                  <p className={`text-[10px] md:text-xs font-bold ${data.has_deficit ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {data.has_deficit 
                      ? `⚠️ Déficit: ${formatCurrencyISO(Math.abs(data.deficit), 'PEN')}`
                      : `✅ Saldo suficiente: +${formatCurrencyISO(data.deficit, 'PEN')}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
