import { useRecentTransactions, useCurrentCycle } from '@/lib/hooks/useApi';
import { formatCurrencyISO } from '@/lib/format';
import CategoryIcon from '@/components/CategoryIcon';
import { useDemoMode } from '@/lib/hooks/useDemoMode';
import { CycleInfo } from '@/components/ui/cycle-info';
import {
  AvailableBalanceCard,
  SpendingStatusCard,
  CashflowCard,
  DebtRiskCard,
  UpcomingPaymentsCard,
  MonthProjectionCard,
  ProblemCategoryCard
} from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const { obfuscateDescription } = useDemoMode();
  const { data: transactions = [], isLoading: transactionsLoading } = useRecentTransactions(5);
  const { data: currentCycle, isLoading: cycleLoading } = useCurrentCycle();
  const queryClient = useQueryClient();

  // Refetch upcoming payments on mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['upcoming-payments'] });
  }, [queryClient])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-text-primary">Dashboard Financiero</h1>
        <CycleInfo 
          cycleData={currentCycle} 
          isLoading={cycleLoading}
        />
      </div>

      {/* ZONA DE DECISIÓN - 5 Métricas Críticas */}
      <div className="space-y-4 md:space-y-6">
        {/* 1. Disponible del Ciclo - Tarjeta Hero */}
        <AvailableBalanceCard />

        {/* 2-4. Carrusel de métricas en mobile, grid en desktop */}
        <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 pb-2 md:pb-0">
            <div className="flex-shrink-0 w-[280px] md:w-auto">
              <SpendingStatusCard />
            </div>
            <div className="flex-shrink-0 w-[280px] md:w-auto">
              <CashflowCard />
            </div>
            <div className="flex-shrink-0 w-[280px] md:w-auto">
              <DebtRiskCard />
            </div>
          </div>
        </div>

        {/* 5. Próximos Pagos - Ancho completo */}
        <UpcomingPaymentsCard />
      </div>

      {/* CONTEXTO - Para tomar decisiones */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-lg md:text-2xl font-extrabold text-text-primary">Contexto para Decidir</h2>
        
        <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 md:overflow-visible">
          <div className="flex md:grid md:grid-cols-2 gap-4 md:gap-6 pb-2 md:pb-0">
            {/* 6. Proyección del Mes */}
            <div className="flex-shrink-0 w-[280px] md:w-auto">
              <MonthProjectionCard />
            </div>

            {/* 7. Categoría Problema */}
            <div className="flex-shrink-0 w-[280px] md:w-auto">
              <ProblemCategoryCard />
            </div>
          </div>
        </div>
      </div>

      {/* OPERACIONES - Acceso rápido */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-lg md:text-2xl font-extrabold text-text-primary">Últimas Transacciones</h2>
        
        {/* Últimas Transacciones - Full Width */}
        <div className="bg-white border-2 border-border rounded-xl hover:border-primary/30 hover:shadow-md transition-all">
          <div className="p-6 border-b-2 border-border flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-text-primary">Actividad Reciente</h3>
            <a href="/transactions" className="text-sm font-bold text-primary hover:underline">
              Ver todas →
            </a>
          </div>
          <div className="p-6">
            {transactionsLoading ? (
              <p className="text-text-secondary text-center py-8">Cargando...</p>
            ) : transactions.length === 0 ? (
              <p className="text-text-secondary text-center py-8">No hay transacciones recientes</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="text-xs font-bold uppercase text-text-secondary">Fecha</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-text-secondary">Descripción</TableHead>
                    <TableHead className="text-xs font-bold uppercase text-text-secondary">Categoría</TableHead>
                    <TableHead className="text-right text-xs font-bold uppercase text-text-secondary">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-surface-soft transition-colors border-b border-border/50">
                      <TableCell className="font-medium text-sm text-text-secondary py-4">
                        {new Date(transaction.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                      </TableCell>
                      <TableCell className="font-bold text-sm text-text-primary py-4">
                        {obfuscateDescription(transaction.description, transaction.category_name)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${transaction.type === 'income' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                            <CategoryIcon 
                              iconName={transaction.category_icon} 
                              className={transaction.type === 'income' ? 'text-emerald-600' : 'text-orange-600'} 
                              size={18} 
                            />
                          </div>
                          <span className="text-text-primary font-medium text-sm">
                            {transaction.category_name || 'Sin categoría'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-bold py-4">
                        <span className={transaction.type === 'income' ? 'text-emerald-600' : 'text-orange-600'}>
                          {formatCurrencyISO(Math.abs(transaction.amount), transaction.currency || 'PEN')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
