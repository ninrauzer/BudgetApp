import { Bell, Search, Settings, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import ThemeToggle from '../ThemeToggle'
import ExchangeRateDisplay from '../ExchangeRateDisplay'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { isCollapsed } = useSidebar()
  const { logout, username, userType } = useAuth()
  const navigate = useNavigate()
  
  // Get OAuth user info from localStorage
  const oauthUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  const displayName = oauthUser?.name || username || 'Usuario'
  const displayEmail = oauthUser?.email || 'usuario@example.com'
  const displayPicture = oauthUser?.picture || null
  const isDemo = oauthUser?.is_demo || userType === 'demo'
  
  const handleLogout = () => {
    // Clear OAuth tokens
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Clear basic auth
    logout()
    navigate('/login')
  }
  
  return (
    <header className={cn(
      "hidden md:block fixed right-0 top-0 z-10 h-16 border-b border-border bg-surface shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/95 transition-all duration-300",
      isCollapsed ? "left-20" : "left-60"
    )}>
      <div className="flex h-full items-center justify-between px-8">
        {/* Search */}
        <div className="flex w-96 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={2} />
            <Input
              type="search"
              placeholder="Buscar transacciones..."
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Exchange Rate Display */}
          <ExchangeRateDisplay />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-text-secondary hover:text-text-primary">
            <Bell className="h-5 w-5" strokeWidth={2} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger shadow-sm" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10 ring-2 ring-border">
                  {displayPicture && <AvatarImage src={displayPicture} alt={displayName} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-body-sm font-semibold text-text-primary">{displayName}</p>
                  <p className="text-label text-text-muted">
                    {displayEmail}
                  </p>
                  {isDemo && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full w-fit">
                      DEMO
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" strokeWidth={2.5} />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" strokeWidth={2.5} />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
