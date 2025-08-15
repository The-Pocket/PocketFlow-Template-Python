'use client'

import * as React from 'react'

interface LayoutState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  focusMode: boolean
}

interface LayoutActions {
  toggleSidebar: () => void
  toggleMobileNav: () => void
  toggleFocusMode: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileNavOpen: (open: boolean) => void
  setFocusMode: (enabled: boolean) => void
}

type LayoutContextType = LayoutState & LayoutActions

const LayoutContext = React.createContext<LayoutContextType | undefined>(undefined)

interface LayoutProviderProps {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [focusMode, setFocusMode] = React.useState(false)
  const [screenSize, setScreenSize] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  // Handle screen size changes
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      })

      // Auto-collapse sidebar on mobile
      if (width < 768) {
        setSidebarCollapsed(true)
        setMobileNavOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle focus mode keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11' || (event.ctrlKey && event.key === 'f')) {
        event.preventDefault()
        setFocusMode(!focusMode)
      }
      
      if (event.key === 'Escape' && focusMode) {
        setFocusMode(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusMode])

  // Close mobile nav when focus mode is enabled
  React.useEffect(() => {
    if (focusMode) {
      setMobileNavOpen(false)
    }
  }, [focusMode])

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed)
  }, [sidebarCollapsed])

  const toggleMobileNav = React.useCallback(() => {
    setMobileNavOpen(!mobileNavOpen)
  }, [mobileNavOpen])

  const toggleFocusMode = React.useCallback(() => {
    setFocusMode(!focusMode)
  }, [focusMode])

  const value = React.useMemo(
    () => ({
      ...screenSize,
      sidebarCollapsed,
      mobileNavOpen,
      focusMode,
      toggleSidebar,
      toggleMobileNav,
      toggleFocusMode,
      setSidebarCollapsed,
      setMobileNavOpen,
      setFocusMode,
    }),
    [
      screenSize,
      sidebarCollapsed,
      mobileNavOpen,
      focusMode,
      toggleSidebar,
      toggleMobileNav,
      toggleFocusMode,
    ]
  )

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = React.useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg')

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

// Hook for media queries
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}