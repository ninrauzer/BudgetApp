import { Search, Wallet } from 'lucide-react'
import { useExchangeRate } from '@/lib/hooks/useApi'

interface MobileHeaderProps {
  title?: string
}

export function MobileHeader({ title = 'Dashboard' }: MobileHeaderProps) {
  const { data: exchangeRate } = useExchangeRate()
  const rate = exchangeRate?.rate || 3.38

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border md:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
            <Wallet className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold text-text-primary">BudgetApp</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface-soft transition-colors"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 text-text-secondary" strokeWidth={2} />
          </button>
          
          {/* Exchange Rate */}
          <div className="flex flex-col items-end text-xs leading-tight">
            <span className="text-text-secondary font-medium">USD/PEN</span>
            <span className="text-text-primary font-bold">{rate.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
