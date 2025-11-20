import { Calendar, DollarSign } from 'lucide-react';

interface CycleInfoProps {
  cycleData?: {
    cycle_name: string;
    start_date: string;
    end_date: string;
  } | null;
  exchangeRate?: number | null;
  isLoading?: boolean;
}

/**
 * CycleInfo - Muestra el ciclo actual y tipo de cambio USD/PEN como texto
 * Componente reutilizable para todas las páginas con datos monetarios
 */
export function CycleInfo({ cycleData, exchangeRate, isLoading = false }: CycleInfoProps) {
  if (isLoading || !cycleData) {
    return (
      <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
    );
  }

  const startDate = new Date(cycleData.start_date).toLocaleDateString('es-PE', { 
    day: 'numeric', 
    month: 'short' 
  });
  
  const endDate = new Date(cycleData.end_date).toLocaleDateString('es-PE', { 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <p className="text-sm text-text-secondary">
      Ciclo: {cycleData.cycle_name} ({startDate} - {endDate}) {exchangeRate && `• USD/PEN ${exchangeRate.toFixed(2)}`}
    </p>
  );
}

