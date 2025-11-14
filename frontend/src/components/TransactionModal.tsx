import { useState, useEffect } from 'react';
import { X, Plus, Calendar, DollarSign, FileText, Tag, CreditCard } from 'lucide-react';
import type { Transaction, Category, Account } from '../lib/api';
import ExchangeRateDisplay from './ExchangeRateDisplay';
import CategorySelect from './CategorySelect';
import { useDefaultAccount } from '../contexts/DefaultAccountContext';
import { useDefaultCurrency } from '../contexts/DefaultCurrencyContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<Transaction>) => void;
  transaction?: Transaction;
  categories: Category[];
  accounts: Account[];
  isLoading?: boolean;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  categories,
  accounts,
  isLoading = false
}: TransactionModalProps) {
  const { defaultAccountId } = useDefaultAccount();
  const { defaultCurrency } = useDefaultCurrency();
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    category_id: undefined,
    account_id: defaultAccountId || undefined,
    notes: '',
    currency: defaultCurrency,
    exchange_rate: undefined
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date.split('T')[0],
        currency: transaction.currency || defaultCurrency,
        exchange_rate: transaction.exchange_rate
      });
    } else {
      setFormData({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        category_id: undefined,
        account_id: defaultAccountId || undefined,
        notes: '',
        currency: defaultCurrency,
        exchange_rate: undefined
      });
    }
  }, [transaction, isOpen, defaultAccountId, defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-3xl shadow-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-extrabold text-text-primary">
            {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-danger/10 rounded-xl transition-colors text-text-secondary hover:text-danger"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-3">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'income')}
                className={`p-4 rounded-2xl transition-all font-bold ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-button'
                    : 'border-2 border-border bg-surface text-text-secondary hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ingreso
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'expense')}
                className={`p-4 rounded-2xl transition-all font-bold ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white shadow-button'
                    : 'border-2 border-border bg-surface text-text-secondary hover:border-red-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />
                  Gasto
                </div>
              </button>
            </div>
          </div>

          {/* Date and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monto
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">
              💱 Moneda
            </label>
            <select
              value={formData.currency || 'PEN'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="PEN">S/ Soles Peruanos (PEN)</option>
              <option value="USD">$ Dólares Americanos (USD)</option>
            </select>
          </div>

          {/* Exchange Rate Display */}
          {formData.date && formData.amount && (
            <ExchangeRateDisplay 
              currency={formData.currency}
              date={formData.date}
              amount={formData.amount}
            />
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Descripción
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Ej: Pago de servicios"
            />
          </div>

          {/* Category and Account */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoría
              </label>
              <CategorySelect
                categories={filteredCategories}
                value={formData.category_id}
                onChange={(categoryId) => handleChange('category_id', categoryId)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Cuenta
              </label>
              <select
                required
                value={formData.account_id || ''}
                onChange={(e) => handleChange('account_id', parseInt(e.target.value))}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccionar cuenta</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Información adicional..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-surface border-2 border-border text-text-primary rounded-2xl font-bold hover:bg-surface-soft transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-button"
            >
              {isLoading ? 'Guardando...' : transaction ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
