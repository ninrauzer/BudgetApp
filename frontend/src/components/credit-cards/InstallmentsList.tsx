import React from 'react';

interface InstallmentType {
  id: number;
  concept: string;
  current_installment: number;
  total_installments: number;
  monthly_payment: number;
  remaining_capital?: number;
}

interface Props {
  installments: InstallmentType[] | undefined;
  loading?: boolean;
}

export const InstallmentsList: React.FC<Props> = ({ installments, loading }) => {
  if (loading) return <p className="text-sm text-text-secondary">Cargando cuotas...</p>;
  if (!installments || installments.length === 0) return <p className="text-sm text-text-secondary">Sin cuotas activas.</p>;

  return (
    <div className="space-y-3">
      {installments.map(inst => {
        const progress = (inst.current_installment / inst.total_installments) * 100;
        return (
          <div key={inst.id} className="group relative bg-white border-2 border-border rounded-xl p-4 shadow-card hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-text-primary">{inst.concept}</p>
                <p className="text-xs text-text-secondary">Cuota {inst.current_installment} de {inst.total_installments}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-text-primary tracking-tight">S/ {Number(inst.monthly_payment).toFixed(2)}</p>
                <p className="text-[11px] text-text-secondary">Pendiente: S/ {Number(inst.remaining_capital || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-text-secondary">Avance {progress.toFixed(0)}%</p>
          </div>
        );
      })}
    </div>
  );
};
