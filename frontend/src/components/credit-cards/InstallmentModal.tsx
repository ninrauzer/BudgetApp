import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstallmentModalProps {
  cardId?: number;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

export interface FormData {
  concept: string;
  original_amount: number;
  total_installments: number;
  current_installment: number;
  monthly_payment: number;
  monthly_principal?: number;
  monthly_interest?: number;
  interest_rate?: number;
}

export const InstallmentModal: React.FC<InstallmentModalProps> = ({
  cardId,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [form, setForm] = useState<FormData>({
    concept: '',
    original_amount: 0,
    total_installments: 6,
    current_installment: 1,
    monthly_payment: 0,
    monthly_principal: 0,
    monthly_interest: 0,
    interest_rate: 0,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'concept' ? value : Number(value)
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.concept.trim()) {
      setError('Descripción requerida');
      return;
    }
    if (form.original_amount <= 0) {
      setError('Monto debe ser mayor a 0');
      return;
    }
    if (form.total_installments < 1) {
      setError('Total de cuotas debe ser >= 1');
      return;
    }
    if (form.current_installment > form.total_installments) {
      setError(`Cuota actual no puede exceder ${form.total_installments}`);
      return;
    }
    if (form.monthly_payment <= 0) {
      setError('Pago mensual debe ser mayor a 0');
      return;
    }

    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <h2 className="text-xl font-bold text-text-primary">Agregar Cuota</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* Concepto */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">
              Descripción *
            </label>
            <input
              type="text"
              name="concept"
              value={form.concept}
              onChange={handleChange}
              placeholder="ej: BM Ferretería, Netflix"
              className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Monto Original */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">
              Monto Original (S/) *
            </label>
            <input
              type="number"
              name="original_amount"
              value={form.original_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Total Cuotas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Total Cuotas *
              </label>
              <select
                name="total_installments"
                value={form.total_installments}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {[3, 6, 12, 18, 24].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Cuota Actual *
              </label>
              <input
                type="number"
                name="current_installment"
                value={form.current_installment}
                onChange={handleChange}
                min="1"
                max={form.total_installments}
                className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Pago Mensual */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">
              Pago Mensual (S/) *
            </label>
            <input
              type="number"
              name="monthly_payment"
              value={form.monthly_payment}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Capital/Interés Mensual */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Capital Mensual
              </label>
              <input
                type="number"
                name="monthly_principal"
                value={form.monthly_principal}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Interés Mensual
              </label>
              <input
                type="number"
                name="monthly_interest"
                value={form.monthly_interest}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* TEA */}
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">
              TEA (%) - Tasa Anual Efectiva
            </label>
            <input
              type="number"
              name="interest_rate"
              value={form.interest_rate}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-bold text-text-secondary hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all",
                "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30",
                "hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
