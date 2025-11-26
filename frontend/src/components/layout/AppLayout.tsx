import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileHeader } from './MobileHeader'
import { BottomNav } from './BottomNav'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { HiddenModulesProvider } from '@/contexts/HiddenModulesContext'
import { cn } from '@/lib/utils'
import { ToastProvider } from '@/components/toast/ToastContext'
import ToastViewport from '@/components/toast/ToastViewport'

function AppLayoutContent() {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Desktop Header (hidden on mobile) */}
      <Header />
      
      {/* Mobile Header (hidden on desktop) */}
      <MobileHeader />
      
      <div className={cn(
        "transition-all duration-300",
        // Desktop: padding for sidebar + header
        "md:pt-16",
        isCollapsed ? "md:pl-20" : "md:pl-60",
        // Mobile: padding for mobile header + bottom nav (reducido)
        "pt-[49px] pb-[57px] md:pb-0"
      )}>
        <main className="bg-background">
          <div className="px-3 py-3 md:px-8 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (mobile only) */}
      <BottomNav />
    </div>
  )
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <HiddenModulesProvider>
        <ToastProvider>
          <AppLayoutContent />
          <ToastViewport />
        </ToastProvider>
      </HiddenModulesProvider>
    </SidebarProvider>
  )
}
