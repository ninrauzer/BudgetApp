import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ThemeToggle from '../ThemeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header className="fixed left-60 right-0 top-0 z-10 h-16 border-b border-border bg-surface shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/95">
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
        <div className="flex items-center gap-3">
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
                  <AvatarImage src="/avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-body-sm font-semibold text-text-primary">Usuario</p>
                  <p className="text-label text-text-muted">
                    usuario@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-expense">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
