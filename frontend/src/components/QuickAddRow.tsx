import { useState, useEffect, useRef } from 'react';
import { Plus, Check, X } from 'lucide-react';
import type { Transaction, Category, Account } from '@/lib/api';
import CategorySelect from './CategorySelect';
import { useDefaultAccount } from '../contexts/DefaultAccountContext';
import { useDefaultCurrency } from '../contexts/DefaultCurrencyContext';

interface QuickAddRowProps {
  onSave: (transaction: Partial<Transaction>) => Promise<void>;
  categories: Category[];
  accounts: Account[];
  recentTransactions?: Transaction[];
}

interface Suggestion {
  category_id: number;
  account_id: number;
  amount?: number;
}

export default function QuickAddRow({ onSave, categories, accounts, recentTransactions = [] }: QuickAddRowProps) {
  const { defaultAccountId } = useDefaultAccount();
  const { defaultCurrency } = useDefaultCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    description: '',
    category_id: undefined,
    account_id: defaultAccountId || undefined,
    currency: defaultCurrency,
  });

  // Smart autocomplete: find similar transactions based on description
  const getSuggestions = (description: string): Suggestion | null => {
    if (!description || description.length < 3) return null;
    
    const desc = description.toLowerCase();
    const similar = recentTransactions.find(t => 
      t.description && (
        t.description.toLowerCase().includes(desc) || 
        desc.includes(t.description.toLowerCase())
      )
    );

    if (similar) {
      return {
        category_id: similar.category_id,
        account_id: similar.account_id,
        amount: similar.amount,
      };
    }
    return null;
  };

  useEffect(() => {
    if (formData.description && formData.description.length >= 3) {
      const suggestion = getSuggestions(formData.description);
      if (suggestion && !formData.category_id) {
        setShowSuggestions(true);
        // Auto-apply suggestion after a short delay
        const timer = setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            category_id: suggestion.category_id,
            account_id: suggestion.account_id,
            amount: suggestion.amount || prev.amount,
          }));
          setShowSuggestions(false);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [formData.description]);

  const handleChange = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.description || !formData.amount || !formData.category_id || !formData.account_id) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      // Reset form with default account and currency
      setFormData({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        description: '',
        category_id: undefined,
        account_id: defaultAccountId || undefined,
        currency: defaultCurrency,
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      description: '',
      category_id: undefined,
      account_id: defaultAccountId || undefined,
      currency: defaultCurrency,
    });
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (!isAdding) {
    return (
      <tr className="border-b border-border/50 bg-surface hover:bg-primary/5">
        <td colSpan={8} className="p-0">
          <button
            onClick={() => setIsAdding(true)}
            data-quick-add-trigger
            className="w-full px-6 py-4 text-left transition-colors flex items-center gap-3 text-text-secondary hover:text-primary group"
          >
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-semibold">Agregar transacción rápida...</span>
            <span className="text-xs text-text-muted ml-2 bg-surface-soft px-2 py-1 rounded-lg">(Ctrl+N)</span>
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-info/5">
      {/* Date */}
      <td className="p-3">
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border-2 border-border/50 rounded-2xl px-4 py-2.5 text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          autoFocus
        />
      </td>

      {/* Description */}
      <td className="p-3 relative">
        <input
          ref={descriptionRef}
          type="text"
          placeholder="Descripción..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border-2 border-border/50 rounded-2xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
        {showSuggestions && (
          <div className="absolute top-full left-0 mt-1 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl shadow-md z-10 border-2 border-primary/30">
            ✨ Autocompletando...
          </div>
        )}
      </td>

      {/* Category */}
      <td className="p-3">
        <CategorySelect
          categories={filteredCategories}
          value={formData.category_id}
          onChange={(categoryId) => handleChange('category_id', categoryId)}
          placeholder="Categoría..."
          className="text-sm"
        />
      </td>

      {/* Account */}
      <td className="p-3">
        <select
          value={formData.account_id || ''}
          onChange={(e) => handleChange('account_id', e.target.value ? parseInt(e.target.value) : undefined)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border-2 border-border/50 rounded-2xl px-4 py-2.5 text-sm text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        >
          <option value="">Cuenta...</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </td>

      {/* Amount */}
      <td className="p-3">
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount || ''}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border-2 border-border/50 rounded-2xl px-4 py-2.5 text-sm text-right text-text-primary font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
      </td>

      {/* Currency */}
      <td className="p-3">
        <select
          value={formData.currency || 'PEN'}
          onChange={(e) => handleChange('currency', e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white border-2 border-border/50 rounded-2xl px-4 py-2.5 text-sm font-bold text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        >
          <option value="PEN">PEN</option>
          <option value="USD">USD</option>
        </select>
      </td>

      {/* Type */}
      <td className="p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange('type', 'income')}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              formData.type === 'income'
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-white border-2 border-border/50 text-text-secondary hover:border-emerald-500 hover:text-emerald-500 hover:shadow-md'
            }`}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'expense')}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              formData.type === 'expense'
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/30'
                : 'bg-white border-2 border-border/50 text-text-secondary hover:border-red-500 hover:text-red-500 hover:shadow-md'
            }`}
          >
            -
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="p-3">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !formData.description || !formData.amount || !formData.category_id || !formData.account_id}
            className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-green-500/30 hover:shadow-lg hover:scale-105"
            title="Guardar (Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 disabled:opacity-40 transition-all shadow-md shadow-red-500/30 hover:shadow-lg hover:scale-105"
            title="Cancelar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
