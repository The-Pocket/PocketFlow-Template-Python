'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import {
  Home,
  FileText,
  Brain,
  Database,
  Settings,
  BarChart3,
  PenTool,
  BookOpen,
  Users,
  Download,
  Upload,
  Focus,
  ChevronLeft,
  Plus,
} from 'lucide-react'

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  currentProject?: {
    id: string
    title: string
    chapters: Array<{ id: string; title: string; wordCount: number }>
  }
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  isActive?: boolean
  disabled?: boolean
}

export function Sidebar({ 
  className, 
  isCollapsed = false, 
  onToggleCollapse,
  currentProject 
}: SidebarProps) {
  const pathname = usePathname()

  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: FileText,
      isActive: pathname.startsWith('/projects'),
    },
    {
      title: 'AI Assistant',
      href: '/ai',
      icon: Brain,
      badge: 'Beta',
      isActive: pathname.startsWith('/ai'),
    },
    {
      title: 'Knowledge Base',
      href: '/knowledge',
      icon: Database,
      isActive: pathname.startsWith('/knowledge'),
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      isActive: pathname.startsWith('/analytics'),
    },
  ]

  const projectNavItems: NavItem[] = currentProject ? [
    {
      title: 'Write',
      href: `/project/${currentProject.id}/write`,
      icon: PenTool,
      isActive: pathname.includes('/write'),
    },
    {
      title: 'Chapters',
      href: `/project/${currentProject.id}/chapters`,
      icon: BookOpen,
      badge: currentProject.chapters.length,
      isActive: pathname.includes('/chapters'),
    },
    {
      title: 'Characters',
      href: `/project/${currentProject.id}/characters`,
      icon: Users,
      isActive: pathname.includes('/characters'),
    },
    {
      title: 'Focus Mode',
      href: `/project/${currentProject.id}/focus`,
      icon: Focus,
      isActive: pathname.includes('/focus'),
    },
  ] : []

  const toolsNavItems: NavItem[] = [
    {
      title: 'Import',
      href: '/tools/import',
      icon: Upload,
      isActive: pathname.includes('/import'),
    },
    {
      title: 'Export',
      href: '/tools/export',
      icon: Download,
      isActive: pathname.includes('/export'),
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      isActive: pathname.startsWith('/settings'),
    },
  ]

  const NavButton = ({ item }: { item: NavItem }) => {
    const content = (
      <Button
        variant={item.isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start',
          isCollapsed && 'justify-center px-2',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
        asChild={!item.disabled}
        disabled={item.disabled}
      >
        {item.disabled ? (
          <div>
            <item.icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </div>
        ) : (
          <Link href={item.href}>
            <item.icon className={cn('h-4 w-4', !isCollapsed && 'mr-2')} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        )}
      </Button>
    )

    if (isCollapsed) {
      return (
        <Tooltip content={item.title} side="right">
          {content}
        </Tooltip>
      )
    }

    return content
  }

  return (
    <div className={cn('flex h-full flex-col border-r bg-background', className)}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn('h-8 w-8', isCollapsed && 'mx-auto')}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {/* Main navigation */}
        <div className="space-y-1 px-3">
          {!isCollapsed && (
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Main
            </h3>
          )}
          {mainNavItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </div>

        {/* Project navigation */}
        {currentProject && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1 px-3">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {currentProject.title}
                  </h3>
                </div>
              )}
              {projectNavItems.map((item) => (
                <NavButton key={item.href} item={item} />
              ))}
            </div>

            {/* Recent chapters */}
            {!isCollapsed && currentProject.chapters.length > 0 && (
              <div className="space-y-1 px-3 mt-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Recent Chapters
                  </h3>
                  <Button variant="ghost" size="icon" className="h-4 w-4">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {currentProject.chapters.slice(0, 3).map((chapter) => (
                  <Button
                    key={chapter.id}
                    variant="ghost"
                    className="w-full justify-start text-sm h-8"
                    asChild
                  >
                    <Link href={`/project/${currentProject.id}/chapter/${chapter.id}`}>
                      <BookOpen className="h-3 w-3 mr-2" />
                      <span className="flex-1 text-left truncate">{chapter.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {chapter.wordCount}w
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tools navigation */}
        <Separator className="my-4" />
        <div className="space-y-1 px-3">
          {!isCollapsed && (
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tools
            </h3>
          )}
          {toolsNavItems.map((item) => (
            <NavButton key={item.href} item={item} />
          ))}
        </div>
      </div>

      {/* Sidebar footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <div>AI Novel Writer v1.0</div>
            <div className="mt-1">© 2024 AI Novel Writer</div>
          </div>
        </div>
      )}
    </div>
  )
}