import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  BarChart3, 
  Settings,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  Palette,
  ChevronDown,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'
import { useHiddenModules } from '@/contexts/HiddenModulesContext'

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, id: 'dashboard' },
  { name: 'Transacciones', href: '/transactions', icon: Receipt, id: 'transactions' },
  { name: 'Presupuestos', href: '/budget', icon: PiggyBank, id: 'budget' },
  { name: 'Análisis', href: '/analysis', icon: BarChart3, id: 'analysis' },
]

const bankingGroup = [
  { name: 'Cuentas', href: '/accounts', icon: Wallet, id: 'accounts' },
  { name: 'Préstamos', href: '/debts', icon: CreditCard, id: 'debts' },
  { name: 'Crédito', href: '/credit-cards', icon: CreditCard, id: 'credit-cards' },
]

const bottomNavigation = [
  { name: 'UI Kit', href: '/ui-kit', icon: Palette, id: 'ui-kit' },
  { name: 'Configuración', href: '/settings', icon: Settings, id: 'settings' },
]

interface SidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { isCollapsed, toggleCollapse } = useSidebar()
  const [isBankingOpen, setIsBankingOpen] = useState(true)
  const { isModuleHidden } = useHiddenModules()

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose()
    }
  }, [window.location.pathname])

  // Filter visible items - will re-render when hiddenModules changes
  const visibleMainNav = mainNavigation.filter(item => !isModuleHidden(item.id))
  const visibleBankingGroup = bankingGroup.filter(item => !isModuleHidden(item.id))
  const visibleBottomNav = bottomNavigation.filter(item => !isModuleHidden(item.id))
  const hasBankingItems = visibleBankingGroup.length > 0

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-surface border-r border-border shadow-lg transition-all duration-300 z-50",
        // Desktop: fixed positioning
        "md:z-30",
        // Mobile: drawer behavior
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-20" : "w-60"
      )}>
      {/* Logo/Brand Header */}
      <div className={cn(
        "flex h-16 items-center justify-between border-b border-border px-4 transition-all duration-300",
        isCollapsed ? "px-2" : "px-6"
      )}>
        {isCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-button">
            <Wallet className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-button">
              <Wallet className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold text-text-primary">BudgetApp</span>
          </div>
        )}

        {/* Close button (mobile only) */}
        {isMobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-soft transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-6 w-6 text-text-secondary" strokeWidth={2} />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-2 overflow-y-auto flex-1 p-4">
        {/* Main Navigation */}
        {visibleMainNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all',
                isActive
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/40'
                  : 'text-text-secondary hover:bg-surface-soft hover:text-text-primary',
                isCollapsed && 'justify-center'
              )
            }
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}

        {/* Divider - only show if there are banking items */}
        {!isCollapsed && hasBankingItems && <div className="my-2 h-px bg-border" />}

        {/* Banking Group - only show if there are items */}
        {hasBankingItems && (
          <div>
            {/* Banking Header - Collapsible */}
            <button
              onClick={() => setIsBankingOpen(!isBankingOpen)}
              className={cn(
                'group relative w-full flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all',
                'text-text-secondary hover:bg-surface-soft hover:text-text-primary',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? "Bancos" : undefined}
            >
              <Wallet className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
              {!isCollapsed && (
                <>
                  <span>Bancos</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-auto transition-transform",
                    isBankingOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>

            {/* Banking Items */}
            {isBankingOpen && !isCollapsed && (
              <div className="mt-1 space-y-1 pl-2 border-l-2 border-border">
                {visibleBankingGroup.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold transition-all',
                        isActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-text-secondary hover:bg-surface-soft hover:text-text-primary'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={2.5} />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Navigation */}
        {visibleBottomNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold transition-all',
                isActive
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/40'
                  : 'text-text-secondary hover:bg-surface-soft hover:text-text-primary',
                isCollapsed && 'justify-center'
              )
            }
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button (desktop only) */}
      <div className="absolute bottom-4 left-4 right-4 hidden md:block">
        <button
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition-all",
            "bg-surface-soft text-text-secondary hover:bg-indigo-500/10 hover:text-indigo-600",
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" strokeWidth={2.5} />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" strokeWidth={2.5} />
              <span>Colapsar</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  )
}
