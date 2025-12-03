import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatLocalDate } from '@/lib/utils/dateParser';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';

interface MonthCycleInfo {
  month: number;
  month_name: string;
  start_date: string;
  end_date: string;
  days: number;
  has_override: boolean;
  override_reason: string | null;
  is_current: boolean;
  is_past: boolean;
}

interface YearCyclesResponse {
  year: number;
  start_day: number;
  months: MonthCycleInfo[];
}

interface BillingCycleGridProps {
  onEditMonth?: (month: number, year: number, cycleInfo: MonthCycleInfo) => void;
}

export default function BillingCycleGrid({ onEditMonth }: BillingCycleGridProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Fetch year cycles
  const { data: yearCycles, isLoading, error, refetch } = useQuery<YearCyclesResponse>({
    queryKey: ['billing-cycle-year', selectedYear],
    queryFn: async () => {
      const { data } = await apiClient.get(`/settings/billing-cycle/year/${selectedYear}`);
      return data;
    },
  });

  const handlePreviousYear = () => setSelectedYear(selectedYear - 1);
  const handleNextYear = () => setSelectedYear(selectedYear + 1);
  const handleCurrentYear = () => setSelectedYear(currentYear);

  const handleEdit = (month: MonthCycleInfo) => {
    if (onEditMonth) {
      onEditMonth(month.month, selectedYear, month);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-border rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-text-secondary">Cargando ciclos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-2 border-border rounded-xl p-6">
        <div className="text-center py-12">
          <p className="text-rose-600 font-medium">Error al cargar los ciclos</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-border rounded-xl shadow-card">
      {/* Header con year selector */}
      <div className="p-6 border-b-2 border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-text-primary">Ciclos del Año</h3>
            <p className="text-xs text-text-secondary mt-1">
              Día de inicio por defecto: {yearCycles?.start_day}
            </p>
          </div>

          {/* Year navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviousYear}
              className="p-2 hover:bg-surface-soft rounded-lg transition-colors"
              title="Año anterior"
            >
              <ChevronLeft className="w-5 h-5 text-text-secondary" strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-text-primary">{selectedYear}</span>
              {selectedYear !== currentYear && (
                <button
                  onClick={handleCurrentYear}
                  className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Actual
                </button>
              )}
            </div>

            <button
              onClick={handleNextYear}
              className="p-2 hover:bg-surface-soft rounded-lg transition-colors"
              title="Año siguiente"
            >
              <ChevronRight className="w-5 h-5 text-text-secondary" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-surface/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wide">
                Mes
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wide">
                Inicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wide">
                Fin
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wide">
                Días
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wide">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {yearCycles?.months.map((month) => (
              <tr
                key={month.month}
                className={cn(
                  "border-b border-border/50 transition-colors",
                  month.is_current && "bg-blue-50/50",
                  month.is_past && "opacity-60",
                  !month.is_past && "hover:bg-surface-soft"
                )}
              >
                {/* Mes */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold",
                      month.is_current ? "text-blue-600" : "text-text-primary"
                    )}>
                      {month.month_name}
                    </span>
                    {month.is_current && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded">
                        Actual
                      </span>
                    )}
                  </div>
                </td>

                {/* Inicio */}
                <td className="px-4 py-3">
                  <span className="text-sm text-text-primary font-medium">
                    {formatLocalDate(month.start_date, 'es-PE', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </td>

                {/* Fin */}
                <td className="px-4 py-3">
                  <span className="text-sm text-text-primary font-medium">
                    {formatLocalDate(month.end_date, 'es-PE', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </td>

                {/* Días */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-text-secondary font-medium">
                    {month.days}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {month.has_override ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" strokeWidth={2.5} />
                        <span className="text-xs font-bold text-amber-800">Ajustado</span>
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg">
                        Normal
                      </span>
                    )}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(month)}
                      disabled={month.is_past}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        month.is_past 
                          ? "opacity-30 cursor-not-allowed" 
                          : "hover:bg-blue-100 text-blue-600 hover:scale-110"
                      )}
                      title={month.is_past ? "No se pueden editar ciclos pasados" : "Editar ciclo"}
                    >
                      <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con info de overrides */}
      {yearCycles && yearCycles.months.some(m => m.has_override) && (
        <div className="p-4 border-t border-border/50 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-700 mt-0.5" strokeWidth={2} />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                {yearCycles.months.filter(m => m.has_override).length} {' '}
                {yearCycles.months.filter(m => m.has_override).length === 1 ? 'mes ajustado' : 'meses ajustados'}
              </p>
              <ul className="mt-2 space-y-1">
                {yearCycles.months
                  .filter(m => m.has_override)
                  .map(m => (
                    <li key={m.month} className="text-xs text-amber-800">
                      <span className="font-bold">{m.month_name}:</span> {m.override_reason || 'Sin razón especificada'}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
