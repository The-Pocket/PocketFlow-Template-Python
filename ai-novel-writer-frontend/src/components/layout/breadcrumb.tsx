'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  isCurrentPage?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
}

export function Breadcrumb({ 
  items, 
  className, 
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true 
}: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/dashboard', icon: Home }, ...items]
    : items

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const ItemIcon = item.icon

          return (
            <li key={index} className="flex items-center space-x-1">
              {index > 0 && (
                <span className="text-muted-foreground/50" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-1 hover:text-foreground transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1'
                  )}
                >
                  {ItemIcon && <ItemIcon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    'flex items-center space-x-1',
                    isLast && 'text-foreground font-medium'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {ItemIcon && <ItemIcon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Hook to generate breadcrumbs from pathname
export function useBreadcrumbs(pathname: string, projectData?: any) {
  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Handle different route patterns
    if (segments[0] === 'dashboard') {
      breadcrumbs.push({ label: 'Dashboard', href: '/dashboard', isCurrentPage: segments.length === 1 })
    }

    if (segments[0] === 'projects') {
      breadcrumbs.push({ label: 'Projects', href: '/projects', isCurrentPage: segments.length === 1 })
    }

    if (segments[0] === 'project' && segments[1]) {
      const projectId = segments[1]
      const projectTitle = projectData?.title || `Project ${projectId}`
      
      breadcrumbs.push({ 
        label: 'Projects', 
        href: '/projects' 
      })
      breadcrumbs.push({ 
        label: projectTitle, 
        href: `/project/${projectId}`,
        isCurrentPage: segments.length === 2
      })

      if (segments[2]) {
        const section = segments[2]
        const sectionLabels: Record<string, string> = {
          write: 'Write',
          chapters: 'Chapters',
          characters: 'Characters',
          knowledge: 'Knowledge Base',
          settings: 'Settings',
          focus: 'Focus Mode',
        }

        breadcrumbs.push({
          label: sectionLabels[section] || section,
          href: `/project/${projectId}/${section}`,
          isCurrentPage: segments.length === 3
        })

        // Handle chapter-specific pages
        if (section === 'chapter' && segments[3]) {
          const chapterId = segments[3]
          const chapterTitle = projectData?.chapters?.find((c: any) => c.id === chapterId)?.title || `Chapter ${chapterId}`
          
          breadcrumbs.push({
            label: chapterTitle,
            href: `/project/${projectId}/chapter/${chapterId}`,
            isCurrentPage: segments.length === 4
          })
        }
      }
    }

    if (segments[0] === 'ai') {
      breadcrumbs.push({ label: 'AI Assistant', href: '/ai', isCurrentPage: segments.length === 1 })
    }

    if (segments[0] === 'knowledge') {
      breadcrumbs.push({ label: 'Knowledge Base', href: '/knowledge', isCurrentPage: segments.length === 1 })
    }

    if (segments[0] === 'analytics') {
      breadcrumbs.push({ label: 'Analytics', href: '/analytics', isCurrentPage: segments.length === 1 })
    }

    if (segments[0] === 'settings') {
      breadcrumbs.push({ label: 'Settings', href: '/settings', isCurrentPage: segments.length === 1 })
    }

    if (segments[0] === 'tools') {
      breadcrumbs.push({ label: 'Tools', href: '/tools' })
      
      if (segments[1]) {
        const toolLabels: Record<string, string> = {
          import: 'Import',
          export: 'Export',
        }
        
        breadcrumbs.push({
          label: toolLabels[segments[1]] || segments[1],
          href: `/tools/${segments[1]}`,
          isCurrentPage: segments.length === 2
        })
      }
    }

    return breadcrumbs
  }, [pathname, projectData])
}