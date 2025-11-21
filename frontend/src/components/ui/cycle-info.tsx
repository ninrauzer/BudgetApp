import { formatLocalDate, getUserTimezone } from '@/lib/utils/dateParser';

interface CycleInfoProps {
  cycleData?: {
    cycle_name: string;
    start_date: string;
    end_date: string;
  } | null;
  isLoading?: boolean;
}

/**
 * CycleInfo - Muestra solo el ciclo actual como texto
 * El exchange rate se muestra en el header global
 * Componente reutilizable para todas las páginas con datos monetarios
 */
export function CycleInfo({ cycleData, isLoading = false }: CycleInfoProps) {
  if (isLoading || !cycleData) {
    return (
      <div className="h-5 w-60 bg-gray-200 rounded animate-pulse" />
    );
  }

  const userTimezone = getUserTimezone();

  const startDate = formatLocalDate(cycleData.start_date, 'es-PE', { 
    day: 'numeric', 
    month: 'short' 
  }, userTimezone);
  
  const endDate = formatLocalDate(cycleData.end_date, 'es-PE', { 
    day: 'numeric', 
    month: 'short' 
  }, userTimezone);

  return (
    <p className="text-sm text-text-secondary">
      Ciclo: {cycleData.cycle_name} ({startDate} - {endDate})
    </p>
  );
}

