/**
 * Debt Management Page
 * 
 * Main page for managing loans and debts with tabs for:
 * - Dashboard: Overview metrics
 * - Loans: List of all loans
 * - Simulator: Payment strategy simulator
 */

import { useState } from 'react';
import { PiggyBank, ListChecks, Calculator } from 'lucide-react';
import { useCurrentCycle } from '@/lib/hooks/useApi';
import { CycleInfo } from '@/components/ui/cycle-info';
import DebtDashboard from '@/components/debt/DebtDashboard';
import LoanList from '@/components/debt/LoanList';
import LoanSimulator from '@/components/debt/LoanSimulator';

type TabType = 'dashboard' | 'loans' | 'simulator';

export default function DebtManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { data: currentCycle, isLoading: cycleLoading } = useCurrentCycle();

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Gestión de Deudas
          </h1>
          <CycleInfo cycleData={currentCycle} isLoading={cycleLoading} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'dashboard'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <PiggyBank className="w-4 h-4" strokeWidth={2.5} />
            RESUMEN
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'loans'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <ListChecks className="w-4 h-4" strokeWidth={2.5} />
            MIS PRÉSTAMOS
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'simulator'
                ? 'bg-primary text-white shadow-button'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            }`}
          >
            <Calculator className="w-4 h-4" strokeWidth={2.5} />
            SIMULADOR
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <DebtDashboard />}
      {activeTab === 'loans' && <LoanList />}
      {activeTab === 'simulator' && <LoanSimulator />}
    </div>
  );
}
