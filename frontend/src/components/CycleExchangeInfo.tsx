import { useEffect, useState } from 'react';
import { useCurrentCycle } from '@/lib/hooks/useApi';
import { exchangeRateApi } from '@/lib/api';

export function CycleExchangeInfo() {
  const { data: currentCycle } = useCurrentCycle();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    exchangeRateApi.getRate()
      .then(data => setExchangeRate(data.rate))
      .catch(err => console.error('Error fetching exchange rate:', err));
  }, []);

  if (!currentCycle || !exchangeRate) {
    return null;
  }

  const startDate = new Date(currentCycle.start_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  const endDate = new Date(currentCycle.end_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

  return (
    <p className="text-sm text-text-secondary mt-1">
      Ciclo: {currentCycle.cycle_name} ({startDate} - {endDate}) • USD/PEN {exchangeRate.toFixed(2)}
    </p>
  );
}
