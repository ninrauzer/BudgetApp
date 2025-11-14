import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

function AppLayoutContent() {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "pl-20" : "pl-60"
      )}>
        <Header />
        <main className="pt-16">
          <div className="px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppLayoutContent />
    </SidebarProvider>
  )
}
