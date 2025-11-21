import { useEffect, useState } from 'react';
import { useCurrentCycle } from '@/lib/hooks/useApi';
import { exchangeRateApi } from '@/lib/api';
import { formatLocalDate, getUserTimezone } from '@/lib/utils/dateParser';

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

  const userTimezone = getUserTimezone();

  const startDate = formatLocalDate(currentCycle.start_date, 'es-PE', { day: 'numeric', month: 'short' }, userTimezone);
  const endDate = formatLocalDate(currentCycle.end_date, 'es-PE', { day: 'numeric', month: 'short' }, userTimezone);

  return (
    <p className="text-sm text-text-secondary mt-1">
      Ciclo: {currentCycle.cycle_name} ({startDate} - {endDate}) • USD/PEN {exchangeRate.toFixed(2)}
    </p>
  );
}
