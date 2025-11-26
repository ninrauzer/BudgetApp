import { NavLink } from 'react-router-dom'
import { Home, Receipt, BarChart3, PiggyBank, MoreHorizontal, Settings, Calendar, CreditCard, User, HelpCircle, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Trans', href: '/transactions', icon: Receipt },
  { name: 'Analytics', href: '/analysis', icon: BarChart3 },
  { name: 'Budget', href: '/budget', icon: PiggyBank },
]

const bankingPages = [
  { name: 'Cuentas', href: '/accounts', icon: Wallet },
  { name: 'Préstamos', href: '/debts', icon: CreditCard },
  { name: 'Crédito', href: '/credit-cards', icon: CreditCard },
]

const morePages = [
  { name: 'Configuración', href: '/settings', icon: Settings },
  { name: 'Perfil', href: '/profile', icon: User },
  { name: 'Ayuda', href: '/help', icon: HelpCircle },
]

export function BottomNav() {
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      {/* More Menu */}
      {showMoreMenu && (
        <div className="fixed bottom-[57px] right-2 bg-white rounded-2xl shadow-xl border-2 border-border z-50 md:hidden overflow-hidden">
          <div className="py-2">
            {/* Bancos Section */}
            <div className="px-4 py-2">
              <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                <Wallet className="w-4 h-4" strokeWidth={2.5} />
                <span>Bancos</span>
              </div>
            </div>
            {bankingPages.map((page) => (
              <NavLink
                key={page.name}
                to={page.href}
                onClick={() => setShowMoreMenu(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 pl-8 hover:bg-surface transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-text-primary'
                  )
                }
              >
                <page.icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium whitespace-nowrap">{page.name}</span>
              </NavLink>
            ))}

            {/* Divider */}
            <div className="my-2 mx-4 h-px bg-border" />

            {/* Other Pages */}
            {morePages.map((page) => (
              <NavLink
                key={page.name}
                to={page.href}
                onClick={() => setShowMoreMenu(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-text-primary'
                  )
                }
              >
                <page.icon className="w-5 h-5" strokeWidth={2} />
                <span className="text-sm font-medium whitespace-nowrap">{page.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border md:hidden z-40 safe-area-inset-bottom">
        <div className="flex justify-around items-center px-1 py-1.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0',
                  isActive
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-all flex-shrink-0',
                      isActive ? 'scale-110' : 'scale-100'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    'text-[10px] font-medium leading-tight',
                    isActive ? 'font-bold' : 'font-normal'
                  )}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0',
              showMoreMenu
                ? 'text-primary bg-primary/10'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-soft'
            )}
          >
            <MoreHorizontal
              className={cn(
                'h-5 w-5 transition-all flex-shrink-0',
                showMoreMenu ? 'scale-110' : 'scale-100'
              )}
              strokeWidth={showMoreMenu ? 2.5 : 2}
            />
            <span className={cn(
              'text-[10px] font-medium leading-tight',
              showMoreMenu ? 'font-bold' : 'font-normal'
            )}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
