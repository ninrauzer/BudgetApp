import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  BarChart3, 
  Settings,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/contexts/SidebarContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transacciones', href: '/transactions', icon: Receipt },
  { name: 'Presupuestos', href: '/budget', icon: PiggyBank },
  { name: 'Análisis', href: '/analysis', icon: BarChart3 },
  { name: 'Cuentas', href: '/accounts', icon: Wallet },
  { name: 'Configuración', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-surface border-r border-border shadow-lg transition-all duration-300",
      isCollapsed ? "w-20" : "w-60"
    )}>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-border px-6 justify-between">
        <div className={cn(
          "flex items-center gap-3 transition-opacity duration-200",
          isCollapsed && "opacity-0"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-button">
            <Wallet className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          {!isCollapsed && <span className="text-xl font-extrabold text-text-primary">BudgetApp</span>}
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-soft hover:bg-primary/10 text-text-secondary hover:text-primary transition-colors ml-auto"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
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
    </aside>
  )
}
