'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Breadcrumb, useBreadcrumbs } from './breadcrumb'

interface AppShellProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
  }
  currentProject?: {
    id: string
    title: string
    chapters: Array<{ id: string; title: string; wordCount: number }>
  }
  showSidebar?: boolean
  showBreadcrumbs?: boolean
  className?: string
}

export function AppShell({
  children,
  user,
  currentProject,
  showSidebar = true,
  showBreadcrumbs = true,
  className,
}: AppShellProps) {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
  const breadcrumbs = useBreadcrumbs(pathname, currentProject)

  // Check if we're in focus mode
  const isFocusMode = pathname.includes('/focus')

  // Auto-collapse sidebar on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={cn('min-h-screen bg-background', isFocusMode && 'focus-mode', className)}>
      {/* Header */}
      <Header
        onMenuToggle={() => setIsMobileNavOpen(true)}
        showMenuButton={showSidebar}
        user={user}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        {showSidebar && !isFocusMode && (
          <aside
            className={cn(
              'hidden md:flex flex-col transition-all duration-300 ease-in-out',
              isSidebarCollapsed ? 'w-16' : 'w-64'
            )}
          >
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              currentProject={currentProject}
            />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumbs */}
          {showBreadcrumbs && !isFocusMode && breadcrumbs.length > 0 && (
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container py-3 px-4">
                <Breadcrumb items={breadcrumbs} />
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        user={user}
        currentProject={currentProject}
      />
    </div>
  )
}

// Layout wrapper for pages that need the app shell
export function withAppShell<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    showSidebar?: boolean
    showBreadcrumbs?: boolean
  }
) {
  const WrappedComponent = (props: P) => {
    return (
      <AppShell
        showSidebar={options?.showSidebar}
        showBreadcrumbs={options?.showBreadcrumbs}
      >
        <Component {...props} />
      </AppShell>
    )
  }

  WrappedComponent.displayName = `withAppShell(${Component.displayName || Component.name})`
  return WrappedComponent
}