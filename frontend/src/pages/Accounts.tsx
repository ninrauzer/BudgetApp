import { useState, useEffect } from 'react';
import { ArrowUpDown, Wallet, TrendingUp, TrendingDown, MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { useAccounts, useTransactions, useTransfers, useDeleteTransfer, useCreateAccount, useUpdateAccount, useDeleteAccount, useCurrentCycle } from '@/lib/hooks/useApi';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { CycleInfo } from '@/components/ui/cycle-info';
import { useToast } from '@/components/toast/ToastContext';
import DemoBanner from '../components/DemoBanner';
import TransferModal from '@/components/TransferModal';
import AccountModal, { type AccountFormData } from '@/components/AccountModal';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { SectionHeader } from '@/components/ui/section-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import type { Account, TransactionWithDetails, PaginatedResponse } from '@/lib/api/types';
import { formatCurrencyISO } from '@/lib/format';

export default function Accounts() {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedFromAccount, setSelectedFromAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);
  
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: transactionsData } = useTransactions();
  const { data: transfers = [] } = useTransfers();
  const deleteTransferMutation = useDeleteTransfer();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const { data: currentCycle, isLoading: cycleLoading } = useCurrentCycle();
  const { pushToast } = useToast();

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionsMenu !== null) setShowActionsMenu(null);
    };
    if (showActionsMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionsMenu]);

  const handleDeleteTransfer = (transferId: string) => {
    if (!confirm('¿Eliminar transferencia?')) return;
    deleteTransferMutation.mutate(transferId);
  };

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setIsAccountModalOpen(true);
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(true);
    setShowActionsMenu(null);
  };

  const handleDeleteAccount = (accountId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.')) return;
    deleteAccountMutation.mutate(accountId, {
      onSuccess: () => {
        pushToast({ title: 'Cuenta eliminada exitosamente', type: 'success' });
        setShowActionsMenu(null);
      },
      onError: (error: any) => {
        pushToast({ title: error?.response?.data?.detail || 'Error al eliminar la cuenta', type: 'error' });
      },
    });
  };

  const handleAccountSubmit = (data: AccountFormData) => {
    if (selectedAccount) {
      // Update
      updateAccountMutation.mutate(
        { id: selectedAccount.id, data },
        {
          onSuccess: () => {
            pushToast({ title: 'Cuenta actualizada exitosamente', type: 'success' });
            setIsAccountModalOpen(false);
            setSelectedAccount(null);
          },
          onError: (error: any) => {
            pushToast({ title: error?.response?.data?.detail || 'Error al actualizar la cuenta', type: 'error' });
          },
        }
      );
    } else {
      // Create
      createAccountMutation.mutate(data, {
        onSuccess: () => {
          pushToast({ title: 'Cuenta creada exitosamente', type: 'success' });
          setIsAccountModalOpen(false);
        },
        onError: (error: any) => {
          pushToast({ title: error?.response?.data?.detail || 'Error al crear la cuenta', type: 'error' });
        },
      });
    }
  };

  const { isDemoMode, applyDemoScale } = useDemoMode();

  const transactions = Array.isArray(transactionsData) ? transactionsData : (transactionsData as PaginatedResponse<TransactionWithDetails>)?.items || [];

  // Calcular transacciones recientes por cuenta
  const getRecentTransactions = (accountId: number) => {
    return transactions
      .filter((t: TransactionWithDetails) => t.account_id === accountId)
      .sort((a: TransactionWithDetails, b: TransactionWithDetails) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  };

  const handleTransferClick = (account: Account) => {
    setSelectedFromAccount(account);
    setIsTransferModalOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const displayAmount = isDemoMode ? applyDemoScale(amount) : amount;
    return formatCurrencyISO(displayAmount, currency);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full space-y-6">
      {isDemoMode && <DemoBanner />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Cuentas</h1>
          <CycleInfo cycleData={currentCycle} isLoading={cycleLoading} />
        </div>
        <div className="flex items-center gap-3">
            <button
              onClick={handleCreateAccount}
              className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-button hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              <span className="font-semibold">Nueva Cuenta</span>
            </button>
            <button
              onClick={() => {
                setSelectedFromAccount(null);
                setIsTransferModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-br from-primary to-blue-600 text-white px-6 py-3 rounded-xl shadow-button hover:shadow-lg transition-all hover:scale-105"
            >
              <ArrowUpDown className="w-5 h-5" strokeWidth={2.5} />
              <span className="font-semibold">Nueva Transferencia</span>
            </button>
          </div>
      </div>

      {/* Resumen de saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          variant="success"
          icon={Wallet}
          label="Saldo Total"
          value={new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(isDemoMode 
            ? applyDemoScale(accounts.reduce((sum, acc) => sum + acc.current_balance, 0))
            : accounts.reduce((sum, acc) => sum + acc.current_balance, 0)
          )}
          currency="PEN"
          subtitle={`${accounts.length} cuentas activas`}
        />

        <StatCard
          variant="info"
          icon={TrendingUp}
          label="Cuentas Bancarias"
          value={new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(isDemoMode
            ? applyDemoScale(accounts.filter(a => a.type === 'bank').reduce((sum, acc) => sum + acc.current_balance, 0))
            : accounts.filter(a => a.type === 'bank').reduce((sum, acc) => sum + acc.current_balance, 0)
          )}
          currency="PEN"
          subtitle={`${accounts.filter(a => a.type === 'bank').length} cuentas`}
        />

        <StatCard
          variant="purple"
          icon={TrendingDown}
          label="Efectivo"
          value={new Intl.NumberFormat('es-PE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(isDemoMode
            ? applyDemoScale(accounts.filter(a => a.type === 'cash').reduce((sum, acc) => sum + acc.current_balance, 0))
            : accounts.filter(a => a.type === 'cash').reduce((sum, acc) => sum + acc.current_balance, 0)
          )}
          currency="PEN"
          subtitle={`${accounts.filter(a => a.type === 'cash').length} cuentas`}
        />
      </div>

      {/* Lista de cuentas */}
      <Card>
        <CardContent className="p-8">
          <SectionHeader
            icon={Wallet}
            title="Mis Cuentas"
            description="Detalles y movimientos recientes"
            className="mb-6"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map(account => {
              const recentTxs = getRecentTransactions(account.id);
              const accountTypeLabel = account.type === 'bank' ? 'Cuenta Bancaria' : 'Efectivo';
              
              return (
                <Card
                  key={account.id}
                  className="bg-gradient-to-br from-background to-surface hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-6">
                    {/* Header de la cuenta */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            {accountTypeLabel}
                          </span>
                          {account.is_default && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                              ⭐ Por Defecto
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">{account.name}</h3>
                        <p className="text-sm text-text-secondary">{account.currency}</p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsMenu(showActionsMenu === account.id ? null : account.id);
                          }}
                          className="p-2 hover:bg-background rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-text-secondary" />
                        </button>
                        
                        {showActionsMenu === account.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg py-2 min-w-[180px] z-10"
                          >
                            <button
                              onClick={() => handleEditAccount(account)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors text-left"
                            >
                              <Pencil className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-text-primary">Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-background transition-colors text-left"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-500">Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Saldo */}
                    <div className="mb-4 pb-4 border-b border-border">
                      <p className="text-sm text-text-secondary mb-1">Saldo disponible</p>
                      <p className={`text-3xl font-bold ${account.current_balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatCurrency(account.current_balance, account.currency)}
                      </p>
                    </div>

                    {/* Transacciones recientes */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                        Movimientos Recientes
                      </p>
                      {recentTxs.length > 0 ? (
                        <div className="space-y-2">
                          {recentTxs.map((tx: TransactionWithDetails) => (
                            <div key={tx.id} className="flex items-center justify-between text-sm">
                              <span className="text-text-secondary truncate flex-1">
                                {isDemoMode ? '*** *** ***' : tx.description}
                              </span>
                              <span className={`font-semibold ml-2 ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {tx.type === 'income' ? '+' : '-'}
                                {formatCurrency(Math.abs(tx.amount), tx.currency || 'PEN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-secondary italic">No hay movimientos recientes</p>
                      )}
                    </div>

                    {/* Botón de transferir */}
                    <button
                      onClick={() => handleTransferClick(account)}
                      className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-3 rounded-xl transition-all font-semibold"
                    >
                      <ArrowUpDown className="w-4 h-4" strokeWidth={2.5} />
                      <span>Transferir desde aquí</span>
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {accounts.length === 0 && (
            <EmptyState
              icon={Wallet}
              message="No tienes cuentas registradas"
            />
          )}
        </CardContent>
      </Card>

      {/* Historial de Transferencias */}
      <Card>
        <CardContent className="p-8">
          <SectionHeader
            icon={ArrowUpDown}
            title="Historial de Transferencias"
            description={`Últimas ${transfers.length} transferencias`}
            className="mb-6"
          />
          {transfers.length === 0 && (
            <p className="text-text-secondary italic">No hay transferencias registradas.</p>
          )}

          {transfers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary border-b border-border">
                    <th className="py-2 text-left font-medium">Fecha</th>
                    <th className="py-2 text-left font-medium">Desde</th>
                    <th className="py-2 text-left font-medium">Hacia</th>
                    <th className="py-2 text-left font-medium">Monto</th>
                    <th className="py-2 text-left font-medium">Descripción</th>
                    <th className="py-2 text-left font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.transfer_id} className="border-b border-border/50 last:border-b-0">
                      <td className="py-2 whitespace-nowrap">{t.date}</td>
                      <td className="py-2">{t.from_account_name}</td>
                      <td className="py-2">{t.to_account_name}</td>
                      <td className="py-2 font-semibold text-text-primary">{formatCurrency(t.amount, 'PEN')}</td>
                      <td className="py-2 max-w-xs truncate" title={t.description}>{isDemoMode ? '***' : (t.description || '')}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleDeleteTransfer(t.transfer_id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold transition-colors"
                          disabled={deleteTransferMutation.isPending}
                        >
                          {deleteTransferMutation.isPending ? '...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de transferencia */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedFromAccount(null);
        }}
        accounts={accounts}
        defaultFromAccountId={selectedFromAccount?.id}
      />

      {/* Modal de cuenta */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleAccountSubmit}
        account={selectedAccount}
        isPending={createAccountMutation.isPending || updateAccountMutation.isPending}
      />
    </div>
  );
}
