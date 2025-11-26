import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Loader2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import TransactionTable from '../components/TransactionTable';
import TransactionFiltersComponent from '../components/TransactionFilters';
import TransactionModal from '../components/TransactionModal';
import QuickAddRow from '../components/QuickAddRow';
import FloatingActionButton from '../components/FloatingActionButton';
import { CycleInfo } from '@/components/ui/cycle-info';
import { 
  useTransactions, 
  useCategories, 
  useAccounts,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCurrentCycle,
  useQuickTemplates
} from '@/lib/hooks/useApi';
import type { TransactionFilters, Transaction } from '@/lib/api';
import { exchangeRateApi } from '@/lib/api';
import { formatCurrencyISO } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useDefaultAccount } from '../contexts/DefaultAccountContext';
import { useDemoMode } from '@/lib/hooks/useDemoMode';

export default function Transactions() {
  const { defaultAccountId } = useDefaultAccount();
  const { applyDemoScale, obfuscateDescription } = useDemoMode();
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  
  // Get current billing cycle info
  const { data: currentCycle } = useCurrentCycle();

  // Set initial filters to current cycle dates
  useEffect(() => {
    if (currentCycle && !filtersInitialized) {
      setFilters({
        start_date: currentCycle.start_date,
        end_date: currentCycle.end_date,
      });
      setFiltersInitialized(true);
    }
  }, [currentCycle, filtersInitialized]);

  // Fetch exchange rate when switching to USD
  useEffect(() => {
    if (displayCurrency === 'USD') {
      setRateLoading(true);
      exchangeRateApi.getRate()
        .then(data => setExchangeRate(data.rate))
        .catch(err => console.error('Error fetching exchange rate:', err))
        .finally(() => setRateLoading(false));
    }
  }, [displayCurrency]);

  // Convert amount based on display currency
  const convertAmount = (amountPEN: number) => {
    if (displayCurrency === 'USD' && exchangeRate) {
      return amountPEN / exchangeRate;
    }
    return amountPEN;
  };

  // Queries
  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions(filters);
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  // Mutations
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Extract transactions from paginated response
  const transactions = transactionsResponse?.items || [];

  // Calculate totals
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.income += t.amount;
      } else {
        acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = totals.income - totals.expense;

  const handleSave = async (transaction: Partial<Transaction>) => {
    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ 
          id: editingTransaction.id, 
          data: transaction 
        });
      } else {
        await createMutation.mutateAsync(transaction);
      }
      
      // If transaction is linked to a loan, notify loan list to refresh
      if (transaction.loan_id) {
        window.dispatchEvent(new CustomEvent('loanUpdated'));
      }
      
      setIsModalOpen(false);
      setEditingTransaction(undefined);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      try {
        // Check if transaction being deleted is linked to a loan
        const transactionToDelete = transactions.find(t => t.id === id);
        const hasLoanLink = transactionToDelete?.loan_id;
        
        await deleteMutation.mutateAsync(id);
        
        // If transaction was linked to a loan, notify loan list to refresh
        if (hasLoanLink) {
          window.dispatchEvent(new CustomEvent('loanUpdated'));
        }
        
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleNewTransaction = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (transaction: Transaction) => {
    try {
      // Create a copy without the id
      const { id, created_at, updated_at, ...transactionData } = transaction;
      await createMutation.mutateAsync(transactionData as any);
    } catch (error) {
      console.error('Error duplicating transaction:', error);
    }
  };

  const handleQuickAddFocus = () => {
    const quickAddButton = document.querySelector('[data-quick-add-trigger]') as HTMLButtonElement;
    if (quickAddButton) {
      quickAddButton.click();
      setTimeout(() => {
        const firstInput = document.querySelector('[data-quick-add-trigger]')?.closest('tr')?.nextElementSibling?.querySelector('input');
        if (firstInput instanceof HTMLElement) {
          firstInput.focus();
        }
      }, 100);
    }
  };

  // Quick templates from database
  const { data: quickTemplates = [] } = useQuickTemplates();

  const handleTemplateSelect = async (template: any) => {
    try {
      await createMutation.mutateAsync({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        amount: template.amount,
        description: template.description,
        category_id: template.category_id,
        account_id: defaultAccountId || accounts[0]?.id || 1,
      } as any);
    } catch (error) {
      console.error('Error creating transaction from template:', error);
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
        {/* Header - Responsive */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Transacciones</h1>
            
            {/* Mobile: Collapse Toggle */}
            <button
              onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              className="md:hidden p-2 bg-surface border border-border hover:bg-surface-soft hover:border-primary/50 text-text-secondary hover:text-primary rounded-xl transition-all"
              title={isHeaderCollapsed ? "Expandir filtros" : "Colapsar filtros"}
            >
              {isHeaderCollapsed ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {currentCycle && (
            <CycleInfo cycleData={currentCycle} isLoading={rateLoading} />
          )}
          
          {/* Controls - Horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 mt-3">
            <div className="flex gap-2 md:gap-3 items-center pb-2 min-w-max md:min-w-0">
              {/* Desktop: Collapse Toggle */}
              <button
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="hidden md:flex p-3 bg-surface border border-border hover:bg-surface-soft hover:border-primary/50 text-text-secondary hover:text-primary rounded-xl transition-all"
                title={isHeaderCollapsed ? "Expandir filtros" : "Colapsar filtros"}
              >
                {isHeaderCollapsed ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>

              {/* Currency Toggle */}
              <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
                <button
                  onClick={() => setDisplayCurrency('PEN')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    displayCurrency === 'PEN'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  PEN
                </button>
                <button
                  onClick={() => setDisplayCurrency('USD')}
                  disabled={rateLoading}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    displayCurrency === 'USD'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  } disabled:opacity-50`}
                >
                  {rateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : 'USD'}
                </button>
              </div>

              {/* New Transaction Button */}
              <button
                onClick={handleNewTransaction}
                className="flex px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Nueva Transacción</span>
                <span className="sm:hidden">Nueva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Summary & Filters Section */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isHeaderCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
        )}>
          {/* Summary Cards - Carousel on mobile, grid on desktop */}
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 mb-6">
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 pb-2 md:pb-0">
              {/* Income Card */}
              <div className="flex-shrink-0 w-[280px] md:w-auto bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-3xl p-6 md:p-8 shadow-card text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <span className="text-white/90 text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-pill">
                  +{transactions.filter(t => t.type === 'income').length}
                </span>
              </div>
              <p className="text-white/80 text-sm mb-3 font-semibold uppercase tracking-wide">Ingresos Totales</p>
              <p className="text-4xl font-extrabold text-white tracking-tight">
                {formatCurrencyISO(convertAmount(applyDemoScale(totals.income)), displayCurrency)}
              </p>
            </div>

              {/* Expense Card */}
              <div className="flex-shrink-0 w-[280px] md:w-auto bg-gradient-to-br from-red-400 to-red-500 rounded-3xl p-6 md:p-8 shadow-card text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
                <span className="text-white/90 text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-pill">
                  +{transactions.filter(t => t.type === 'expense').length}
                </span>
              </div>
              <p className="text-white/80 text-sm mb-3 font-semibold uppercase tracking-wide">Gastos Totales</p>
              <p className="text-4xl font-extrabold text-white tracking-tight">
                {formatCurrencyISO(convertAmount(applyDemoScale(totals.expense)), displayCurrency)}
              </p>
            </div>

              {/* Balance Card */}
              <div className={`flex-shrink-0 w-[280px] md:w-auto rounded-3xl p-6 md:p-8 shadow-card text-white ${
                balance >= 0 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-orange-400 to-orange-500'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-pill">
                    {transactions.length} total
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-3 font-semibold uppercase tracking-wide">Balance Neto</p>
                <p className="text-4xl font-extrabold text-white tracking-tight">
                  {balance >= 0 ? '' : '-'}{formatCurrencyISO(convertAmount(applyDemoScale(Math.abs(balance))), displayCurrency)}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <TransactionFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            accounts={accounts}
          />
        </div>

        {/* Loading State */}
        {transactionsLoading && (
          <div className="bg-surface border border-border rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-text-secondary">Cargando transacciones...</p>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {!transactionsLoading && (
          <TransactionTable
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            deleteConfirm={deleteConfirm}
            applyDemoScale={applyDemoScale}
            obfuscateDescription={obfuscateDescription}
            quickAddRow={
              <QuickAddRow
                onSave={async (transaction) => {
                  await createMutation.mutateAsync(transaction as any);
                }}
                categories={categories}
                accounts={accounts}
                recentTransactions={transactions.slice(0, 20)}
              />
            }
          />
        )}

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransaction(undefined);
          }}
          onSave={handleSave}
          transaction={editingTransaction}
          categories={categories}
          accounts={accounts}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Toast */}
        {deleteConfirm !== null && (
          <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up">
            <Trash2 className="w-5 h-5" />
            <div>
              <p className="font-medium">¿Confirmar eliminación?</p>
              <p className="text-sm text-red-100">Haz clic de nuevo para confirmar</p>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton
          onQuickAdd={handleQuickAddFocus}
          onTemplateSelect={handleTemplateSelect}
          templates={quickTemplates}
        />
      </div>
  );
}
