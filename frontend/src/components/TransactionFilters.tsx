import { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import type { TransactionFilters } from '@/lib/api';
import type { Category, Account } from '@/lib/api';
import { useCurrentCycle, useBillingCycle } from '@/lib/hooks/useApi';
import { parseLocalDate, getUserTimezone } from '@/lib/utils/dateParser';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  categories: Category[];
  accounts: Account[];
}

export default function TransactionFiltersComponent({ 
  filters, 
  onFiltersChange,
  categories,
  accounts
}: TransactionFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { data: currentCycle } = useCurrentCycle();
  const { data: billingCycle } = useBillingCycle();
  
  // Helper function to calculate cycle dates
  const getCycleDates = (offset: number = 0) => {
    if (!billingCycle || !currentCycle) return { start_date: '', end_date: '' };
    
    const userTimezone = getUserTimezone();
    const currentStart = parseLocalDate(currentCycle.start_date, userTimezone);
    const start = new Date(currentStart);
    start.setMonth(start.getMonth() + offset);
    
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0]
    };
  };
  
  const handlePeriodChange = (period: string) => {
    if (period === 'custom') {
      // Don't change dates, let user pick manually
      return;
    }
    
    if (period === '') {
      // Clear date filters
      const newFilters = { ...filters };
      delete newFilters.start_date;
      delete newFilters.end_date;
      onFiltersChange(newFilters);
      return;
    }
    
    let dates = { start_date: '', end_date: '' };
    
    switch(period) {
      case 'current':
        dates = getCycleDates(0);
        break;
      case 'previous':
        dates = getCycleDates(-1);
        break;
      case 'last_3':
        dates = {
          start_date: getCycleDates(-2).start_date,
          end_date: getCycleDates(0).end_date
        };
        break;
    }
    
    onFiltersChange({ ...filters, ...dates });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof TransactionFilters] !== undefined && key !== 'skip' && key !== 'limit'
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar and Filter Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar transacciones..."
            className="w-full bg-surface border border-border rounded-2xl pl-12 pr-4 py-3.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm ${
            showFilters
              ? 'bg-primary text-white shadow-button'
              : 'bg-surface border border-border text-text-primary hover:bg-surface-soft'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2.5 py-0.5 bg-white/30 backdrop-blur-sm rounded-pill text-xs font-extrabold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">Filtros Avanzados</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-text-secondary hover:text-danger font-semibold flex items-center gap-1 transition-colors px-3 py-1.5 hover:bg-danger/5 rounded-xl"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Period Selector */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Período
              </label>
              <select
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                onChange={(e) => handlePeriodChange(e.target.value)}
                value={filters.start_date && filters.end_date ? 'custom' : ''}
              >
                <option value="">Todos</option>
                <option value="current">📅 Este ciclo</option>
                <option value="previous">⏮️ Ciclo anterior</option>
                <option value="last_3">📊 Últimos 3 ciclos</option>
                <option value="custom">🎯 Rango personalizado</option>
              </select>
            </div>
            
            {/* Date Range */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">Tipo</label>
              <select
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              >
                <option value="">Todos</option>
                <option value="income">💚 Ingresos</option>
                <option value="expense">🔴 Gastos</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">Categoría</label>
              <select
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.category_id || ''}
                onChange={(e) => handleFilterChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2">Cuenta</label>
              <select
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={filters.account_id || ''}
                onChange={(e) => handleFilterChange('account_id', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Todas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
