'use client'

import * as React from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { ProcessingStatus } from '@/components/ui/processing-status'
import { AuthStatus } from '@/components/auth/auth-status'

interface HeaderProps {
  onMenuToggle?: () => void
  showMenuButton?: boolean
}

export function Header({ onMenuToggle, showMenuButton = true }: HeaderProps) {
  const [showSearch, setShowSearch] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Left section - Logo and menu */}
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuToggle}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AI</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">AI Novel Writer</h1>
            </div>
          </div>
        </div>

        {/* Center section - Search (desktop) */}
        <div className="flex-1 mx-6 hidden md:flex justify-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, chapters..."
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Right section - Actions and user */}
        <div className="flex items-center space-x-2">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Status indicators */}
          <div className="hidden sm:flex items-center space-x-2">
            <ConnectionStatus />
            <ProcessingStatus />
          </div>

          {/* Notifications */}
          <Tooltip content="Notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
            </Button>
          </Tooltip>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Authentication status */}
          <AuthStatus />
        </div>
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects, chapters..."
              className="pl-10 pr-4"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}