'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useWebSocket, ConnectionState, WebSocketEventType, WebSocketEventHandler } from '@/lib/websocket-manager'
import { ProcessingStatus, Task } from '@/types'

interface WebSocketContextType {
  connectionState: ConnectionState
  isConnected: boolean
  connect: (authToken?: string) => void
  disconnect: () => void
  send: (type: string, data?: unknown) => void
  on: <T extends WebSocketEventType>(
    eventType: T,
    handler: WebSocketEventHandler<T>
  ) => () => void
  processingStatus: ProcessingStatus | null
  lastActivity: Date | null
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode
  autoConnect?: boolean
  authToken?: string
}

export function WebSocketProvider({ 
  children, 
  autoConnect = false, 
  authToken 
}: WebSocketProviderProps) {
  const ws = useWebSocket()
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null)
  const [lastActivity, setLastActivity] = useState<Date | null>(null)

  // Subscribe to connection state changes
  useEffect(() => {
    const unsubscribe = ws.onConnectionStateChange((state) => {
      setConnectionState(state)
    })

    return unsubscribe
  }, [ws])

  // Subscribe to processing status updates
  useEffect(() => {
    const unsubscribe = ws.on('processing-status', (status: ProcessingStatus) => {
      setProcessingStatus(status)
      setLastActivity(new Date())
    })

    return unsubscribe
  }, [ws])

  // Subscribe to task updates
  useEffect(() => {
    const unsubscribe = ws.on('task-update', (task: Task) => {
      // Update processing status with the new task
      setProcessingStatus(prev => {
        if (!prev) return prev
        
        const updatedTasks = prev.currentTasks.map(t => 
          t.id === task.id ? task : t
        )
        
        // If task is not in current tasks, add it
        if (!updatedTasks.find(t => t.id === task.id)) {
          updatedTasks.push(task)
        }
        
        return {
          ...prev,
          currentTasks: updatedTasks
        }
      })
      setLastActivity(new Date())
    })

    return unsubscribe
  }, [ws])

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && authToken) {
      ws.connect(authToken)
    }

    return () => {
      if (autoConnect) {
        ws.disconnect()
      }
    }
  }, [ws, autoConnect, authToken])

  const contextValue: WebSocketContextType = {
    connectionState,
    isConnected: connectionState === ConnectionState.CONNECTED,
    connect: ws.connect,
    disconnect: ws.disconnect,
    send: ws.send,
    on: ws.on,
    processingStatus,
    lastActivity,
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}

// Custom hooks for specific WebSocket events
export function useProcessingStatus(): ProcessingStatus | null {
  const { processingStatus } = useWebSocketContext()
  return processingStatus
}

export function useConnectionStatus(): { 
  isConnected: boolean
  connectionState: ConnectionState
  lastActivity: Date | null
} {
  const { isConnected, connectionState, lastActivity } = useWebSocketContext()
  return { isConnected, connectionState, lastActivity }
}

export function useWebSocketEvent<T extends WebSocketEventType>(
  eventType: T,
  handler: WebSocketEventHandler<T>
) {
  const { on } = useWebSocketContext()
  
  useEffect(() => {
    const unsubscribe = on(eventType, handler)
    return unsubscribe
  }, [on, eventType, handler])
}