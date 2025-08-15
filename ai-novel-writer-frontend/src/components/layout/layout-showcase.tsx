'use client'

import * as React from 'react'
import { AppShell } from './app-shell'
import { PageTransition } from './page-transition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { useLayout } from '@/hooks/use-layout'

// Mock data for demonstration
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined,
}

const mockProject = {
  id: '1',
  title: 'The Chronicles of AI',
  chapters: [
    { id: '1', title: 'The Beginning', wordCount: 2500 },
    { id: '2', title: 'The Journey', wordCount: 3200 },
    { id: '3', title: 'The Discovery', wordCount: 2800 },
  ],
}

export function LayoutShowcase() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    sidebarCollapsed,
    focusMode,
    toggleSidebar,
    toggleFocusMode,
  } = useLayout()

  return (
    <AppShell
      user={mockUser}
      currentProject={mockProject}
      showSidebar={true}
      showBreadcrumbs={true}
    >
      <PageTransition>
        <div className="container mx-auto p-6 space-y-8">
          <div className="text-center space-y-4">
            <Typography variant="h1">Layout System Showcase</Typography>
            <Typography variant="lead">
              Responsive layout components with navigation, breadcrumbs, and mobile support
            </Typography>
          </div>

          {/* Layout Status */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Status</CardTitle>
              <CardDescription>Current layout state and responsive breakpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={isMobile ? 'default' : 'secondary'}>
                  Mobile: {isMobile ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={isTablet ? 'default' : 'secondary'}>
                  Tablet: {isTablet ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={isDesktop ? 'default' : 'secondary'}>
                  Desktop: {isDesktop ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={sidebarCollapsed ? 'warning' : 'success'}>
                  Sidebar: {sidebarCollapsed ? 'Collapsed' : 'Expanded'}
                </Badge>
                <Badge variant={focusMode ? 'info' : 'secondary'}>
                  Focus Mode: {focusMode ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button onClick={toggleSidebar} variant="outline">
                  Toggle Sidebar
                </Button>
                <Button onClick={toggleFocusMode} variant="outline">
                  Toggle Focus Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Responsive Header</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Adaptive search bar</li>
                  <li>• Mobile hamburger menu</li>
                  <li>• Theme toggle</li>
                  <li>• User avatar and actions</li>
                  <li>• Status indicators</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Sidebar</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Collapsible design</li>
                  <li>• Project-aware navigation</li>
                  <li>• Recent chapters</li>
                  <li>• Active state management</li>
                  <li>• Tooltips when collapsed</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mobile Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Full-screen overlay</li>
                  <li>• Touch-friendly interface</li>
                  <li>• User profile section</li>
                  <li>• Auto-close on navigation</li>
                  <li>• Backdrop blur effect</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breadcrumb Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Auto-generated from routes</li>
                  <li>• Project-aware context</li>
                  <li>• Keyboard accessible</li>
                  <li>• Custom separators</li>
                  <li>• Home icon integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Transitions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Smooth fade animations</li>
                  <li>• Slide transitions</li>
                  <li>• Scale effects for focus</li>
                  <li>• Route-based triggers</li>
                  <li>• Framer Motion powered</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Focus Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Distraction-free writing</li>
                  <li>• Hide sidebar & breadcrumbs</li>
                  <li>• Keyboard shortcuts (F11)</li>
                  <li>• Escape to exit</li>
                  <li>• Smooth transitions</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Try It Out</CardTitle>
              <CardDescription>Test the responsive layout features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Typography variant="h4" className="mb-2">Desktop</Typography>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Click the collapse button in sidebar</li>
                    <li>• Use the theme toggle in header</li>
                    <li>• Try the search functionality</li>
                    <li>• Press F11 for focus mode</li>
                  </ul>
                </div>
                <div>
                  <Typography variant="h4" className="mb-2">Mobile</Typography>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Tap hamburger menu to open nav</li>
                    <li>• Use search icon in header</li>
                    <li>• Swipe to close mobile nav</li>
                    <li>• Resize window to test breakpoints</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  )
}