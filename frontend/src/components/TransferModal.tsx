import { useState } from 'react';
import { X, ArrowRight, Calendar } from 'lucide-react';
import type { Account } from '@/lib/api/types';
import { useCreateTransfer } from '@/lib/hooks/useApi';
import { useToast } from './toast/ToastContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  defaultFromAccountId?: number;
}

interface TransferFormData {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  date: string;
  description: string;
}

export default function TransferModal({
  isOpen,
  onClose,
  accounts,
  defaultFromAccountId
}: TransferModalProps) {
  // (queryClient ya gestionado en hook useCreateTransfer)
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<TransferFormData>({
    from_account_id: defaultFromAccountId || 0,
    to_account_id: 0,
    amount: 0,
    date: today,
    description: ''
  });

  const createTransferMutation = useCreateTransfer();
  const { pushToast } = useToast();

  const resetForm = () => {
    setFormData({
      from_account_id: defaultFromAccountId || 0,
      to_account_id: 0,
      amount: 0,
      date: today,
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.from_account_id === formData.to_account_id) {
      alert('Las cuentas de origen y destino deben ser diferentes');
      return;
    }

    if (formData.amount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    createTransferMutation.mutate(formData, {
      onSuccess: (resp) => {
        pushToast({
          title: 'Transferencia creada',
          message: `${resp.amount.toFixed(2)} de ${resp.from_account_name} a ${resp.to_account_name}`,
          type: 'success'
        });
        onClose();
        resetForm();
      },
      onError: () => {
        pushToast({
          title: 'Error',
          message: 'No se pudo crear la transferencia',
          type: 'error'
        });
      }
    });
  };

  const fromAccount = accounts.find(a => a.id === formData.from_account_id);
  const toAccount = accounts.find(a => a.id === formData.to_account_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Nueva Transferencia</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de cuentas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Desde
              </label>
              <select
                value={formData.from_account_id}
                onChange={(e) => setFormData({ ...formData, from_account_id: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value={0}>Seleccionar cuenta</option>
                {accounts.filter(a => a.id !== formData.to_account_id).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
              {fromAccount && (
                <p className="text-sm text-text-secondary mt-2">
                  Saldo: {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: fromAccount.currency
                  }).format(fromAccount.current_balance)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Hacia
              </label>
              <select
                value={formData.to_account_id}
                onChange={(e) => setFormData({ ...formData, to_account_id: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value={0}>Seleccionar cuenta</option>
                {accounts.filter(a => a.id !== formData.from_account_id).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
              {toAccount && (
                <p className="text-sm text-text-secondary mt-2">
                  Saldo: {new Intl.NumberFormat('es-PE', {
                    style: 'currency',
                    currency: toAccount.currency
                  }).format(toAccount.current_balance)}
                </p>
              )}
            </div>
          </div>

          {/* Visualización del flujo */}
          {fromAccount && toAccount && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-1">Origen</p>
                  <p className="font-bold text-text-primary">{fromAccount.name}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-primary" strokeWidth={2.5} />
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-1">Destino</p>
                  <p className="font-bold text-text-primary">{toAccount.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Monto {fromAccount && `(${fromAccount.currency})`}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Descripción (Opcional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Pago de tarjeta, ahorro mensual..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-background hover:bg-border text-text-primary rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createTransferMutation.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-xl font-semibold shadow-button hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTransferMutation.isPending ? 'Procesando...' : 'Realizar Transferencia'}
            </button>
          </div>

          {createTransferMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-500 text-sm">
                Error al crear transferencia. Por favor intenta nuevamente.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
