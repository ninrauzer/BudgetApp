import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { exchangeRateApi } from '@/lib/api';

interface ExchangeRateDisplayProps {
  currency?: 'PEN' | 'USD';
  date: string;
  amount: number;
}

export default function ExchangeRateDisplay({ currency, date, amount }: ExchangeRateDisplayProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      if (currency !== 'USD' || !date) {
        setRate(null);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const response = await exchangeRateApi.getRate(date);
        setRate(response.rate);
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [currency, date]);

  if (currency !== 'USD' || !rate) {
    return null;
  }

  const converted = (amount * rate).toFixed(2);

  return (
    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-start gap-2 text-sm">
        <DollarSign className="w-4 h-4 text-primary mt-0.5" strokeWidth={2.5} />
        <div className="flex-1">
          {loading && (
            <p className="text-text-muted">⏳ Consultando tipo de cambio BCRP...</p>
          )}
          {error && (
            <p className="text-danger">⚠️ No se pudo obtener el tipo de cambio</p>
          )}
          {!loading && !error && rate && (
            <div>
              <p className="font-bold text-primary">
                💱 Tipo de cambio: S/ {rate.toFixed(4)} por dólar
              </p>
              {amount > 0 && (
                <p className="text-text-secondary mt-1">
                  ${amount.toFixed(2)} USD <strong className="text-text-primary">≈ S/ {converted}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
