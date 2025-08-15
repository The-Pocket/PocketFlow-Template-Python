'use client'

import { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { WebSocketProvider } from './websocket-provider'
import { ThemeProvider } from './theme-provider'
import { SessionProvider } from './session-provider'
import { LayoutProvider } from '@/hooks/use-layout'

interface AppProvidersProps {
  children: ReactNode
  authToken?: string
}

export function AppProviders({ children, authToken }: AppProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" storageKey="ai-novel-writer-theme">
        <LayoutProvider>
          <QueryProvider>
            <WebSocketProvider 
              autoConnect={!!authToken} 
              authToken={authToken}
            >
              {children}
            </WebSocketProvider>
          </QueryProvider>
        </LayoutProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}