import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import { ToastProvider } from '@/components/toast/ToastContext'
import ToastViewport from '@/components/toast/ToastViewport'

function AppLayoutContent() {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <div className={cn(
        "pt-16 transition-all duration-300",
        isCollapsed ? "pl-20" : "pl-60"
      )}>
        <main className="bg-background">
          <div className="px-8 py-6">
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
      <ToastProvider>
        <AppLayoutContent />
        <ToastViewport />
      </ToastProvider>
    </SidebarProvider>
  )
}
