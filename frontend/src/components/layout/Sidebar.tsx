import { NavLink } from 'react-router-dom'
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
  Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transacciones', href: '/transactions', icon: Receipt },
  { name: 'Presupuestos', href: '/budget', icon: PiggyBank },
  { name: 'Análisis', href: '/analysis', icon: BarChart3 },
  { name: 'Tarjetas de Crédito', href: '/credit-cards', icon: CreditCard },
  { name: 'Deudas', href: '/debts', icon: CreditCard },
  { name: 'Cuentas', href: '/accounts', icon: Wallet },
  { name: 'UI Kit', href: '/ui-kit', icon: Palette },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-surface border-r border-border shadow-lg transition-all duration-300",
      isCollapsed ? "w-20" : "w-60"
    )}>
      {/* Logo/Brand Header */}
      <div className={cn(
        "flex h-16 items-center justify-between border-b border-border px-4 transition-all duration-300",
        isCollapsed ? "px-2" : "px-6"
      )}>
        {isCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-button">
            <Wallet className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-button">
              <Wallet className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold text-text-primary">BudgetApp</span>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all',
                isActive
                  ? 'bg-primary text-white shadow-button'
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

      {/* Collapse Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={toggleCollapse}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
            "bg-surface-soft text-text-secondary hover:bg-primary/10 hover:text-primary",
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
  )
}
