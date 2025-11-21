import { useEffect, useState } from 'react';
import { X, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatLocalDate } from '@/lib/utils/dateParser';

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

interface EditCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  cycleInfo: MonthCycleInfo | null;
}

interface OverrideFormData {
  override_start_date: string;
  reason: string;
}

export default function EditCycleModal({ isOpen, onClose, month, year, cycleInfo }: EditCycleModalProps) {
  const [formData, setFormData] = useState<OverrideFormData>({
    override_start_date: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OverrideFormData, string>>>({});
  
  const queryClient = useQueryClient();

  // Initialize form with current data
  useEffect(() => {
    if (isOpen && cycleInfo) {
      setFormData({
        override_start_date: cycleInfo.has_override ? cycleInfo.start_date : '',
        reason: cycleInfo.override_reason || '',
      });
      setErrors({});
    }
  }, [isOpen, cycleInfo]);

  // Create/Update override mutation
  const saveOverrideMutation = useMutation({
    mutationFn: async (data: OverrideFormData & { year: number; month: number }) => {
      const response = await fetch(`/api/settings/billing-cycle/year/${data.year}/month/${data.month}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: data.year,
          month: data.month,
          override_start_date: data.override_start_date,
          reason: data.reason || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save override');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-cycle-year', year] });
      onClose();
    },
  });

  // Delete override mutation
  const deleteOverrideMutation = useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      const response = await fetch(`/api/settings/billing-cycle/year/${year}/month/${month}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete override');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-cycle-year', year] });
      onClose();
    },
  });

  const handleChange = (field: keyof OverrideFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof OverrideFormData, string>> = {};

    if (!formData.override_start_date.trim()) {
      newErrors.override_start_date = 'La fecha de inicio es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveOverrideMutation.mutate({ ...formData, year, month });
  };

  const handleDelete = () => {
    if (!cycleInfo?.has_override) return;
    
    if (confirm('¿Estás seguro de eliminar este ajuste? El ciclo volverá al cálculo normal.')) {
      deleteOverrideMutation.mutate({ year, month });
    }
  };

  if (!isOpen || !cycleInfo) return null;

  const isPending = saveOverrideMutation.isPending || deleteOverrideMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Ajustar Ciclo - {cycleInfo.month_name} {year}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Personaliza el inicio de este ciclo de facturación
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isPending}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Ciclo actual info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" strokeWidth={2} />
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900">Ciclo Actual</p>
                <p className="text-xs text-blue-700 mt-1">
                  <span className="font-semibold">Inicio:</span>{' '}
                  {formatLocalDate(cycleInfo.start_date, 'es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Fin:</span>{' '}
                  {formatLocalDate(cycleInfo.end_date, 'es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">Duración:</span> {cycleInfo.days} días
                </p>
              </div>
            </div>
          </div>

          {/* Override date input */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Nueva Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.override_start_date}
              onChange={(e) => handleChange('override_start_date', e.target.value)}
              disabled={isPending}
              className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl text-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {errors.override_start_date && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.override_start_date}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              Usa esta fecha cuando el pago no caiga en el día habitual (por fines de semana, feriados, etc.)
            </p>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-2">
              Razón (Opcional)
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Ej: Pago anticipado - viernes, Feriado, Cambio de fecha"
              disabled={isPending}
              maxLength={100}
              className="w-full px-4 py-2.5 bg-white border-2 border-border rounded-xl text-text-primary font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-text-secondary">
              Describe brevemente por qué cambió la fecha (máx. 100 caracteres)
            </p>
          </div>

          {/* Preview de impacto */}
          {formData.override_start_date && formData.override_start_date !== cycleInfo.start_date && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={2} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-900">Vista Previa</p>
                  <p className="text-xs text-amber-700 mt-1">
                    El ciclo de {cycleInfo.month_name} iniciará el{' '}
                    {formatLocalDate(formData.override_start_date, 'es-PE', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Los ciclos siguientes se ajustarán automáticamente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            {cycleInfo.has_override && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-100 text-rose-700 font-bold text-sm rounded-xl hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                Eliminar Ajuste
              </button>
            )}
            
            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 bg-surface border-2 border-border text-text-secondary font-bold text-sm rounded-xl hover:bg-surface-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
