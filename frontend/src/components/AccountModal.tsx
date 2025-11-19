import { useEffect, useState } from 'react';
import { X, Wallet } from 'lucide-react';
import type { Account } from '@/lib/api/types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  account?: Account | null;
  isPending?: boolean;
}

export interface AccountFormData {
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'debit_card' | 'digital_wallet';
  icon: string;
  balance: number;
  currency: 'PEN' | 'USD';
  is_active: boolean;
}

const accountTypes = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'bank', label: 'Cuenta Bancaria' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'digital_wallet', label: 'Billetera Digital' },
];

export default function AccountModal({ isOpen, onClose, onSubmit, account, isPending = false }: AccountModalProps) {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'bank',
    icon: 'wallet',
    balance: 0,
    currency: 'PEN',
    is_active: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type as AccountFormData['type'],
        icon: account.icon || 'wallet',
        balance: account.initial_balance || 0,
        currency: account.currency as 'PEN' | 'USD',
        is_active: account.is_active,
      });
    } else {
      setFormData({
        name: '',
        type: 'bank',
        icon: 'wallet',
        balance: 0,
        currency: 'PEN',
        is_active: true,
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const handleChange = (field: keyof AccountFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof AccountFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-primary to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Wallet className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {account ? 'Editar Cuenta' : 'Nueva Cuenta'}
                </h2>
                <p className="text-sm text-blue-100">
                  {account ? 'Modifica los datos de la cuenta' : 'Registra una nueva cuenta'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Nombre de la Cuenta *
            </label>
            <input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              type="text"
              placeholder="Ej: BCP Soles, Efectivo Casa"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Tipo de Cuenta *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary"
            >
              {accountTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Saldo Inicial */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Saldo Inicial *
              </label>
              <input
                value={formData.balance}
                onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary"
              />
              {errors.balance && (
                <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
              )}
            </div>

            {/* Moneda */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Moneda *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-primary"
              >
                <option value="PEN">PEN (Soles)</option>
                <option value="USD">USD (Dólares)</option>
              </select>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border">
            <input
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              type="checkbox"
              id="is_active"
              className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-text-primary cursor-pointer">
              Cuenta activa
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-background border border-border text-text-primary rounded-xl font-semibold hover:bg-border/20 transition-all"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl font-semibold shadow-button hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending ? 'Guardando...' : (account ? 'Actualizar' : 'Crear Cuenta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
