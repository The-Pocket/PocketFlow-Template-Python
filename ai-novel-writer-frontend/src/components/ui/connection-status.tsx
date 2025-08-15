'use client'

import { useConnectionStatus } from '@/components/providers/websocket-provider'
import { ConnectionState } from '@/lib/websocket-manager'
import { cn } from '@/lib/utils'

interface ConnectionStatusProps {
  className?: string
  showText?: boolean
}

export function ConnectionStatus({ className, showText = false }: ConnectionStatusProps) {
  const { isConnected, connectionState, lastActivity } = useConnectionStatus()

  const getStatusColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'bg-green-500'
      case ConnectionState.CONNECTING:
      case ConnectionState.RECONNECTING:
        return 'bg-yellow-500'
      case ConnectionState.DISCONNECTED:
        return 'bg-gray-400'
      case ConnectionState.ERROR:
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'Connected'
      case ConnectionState.CONNECTING:
        return 'Connecting...'
      case ConnectionState.RECONNECTING:
        return 'Reconnecting...'
      case ConnectionState.DISCONNECTED:
        return 'Disconnected'
      case ConnectionState.ERROR:
        return 'Connection Error'
      default:
        return 'Unknown'
    }
  }

  const formatLastActivity = () => {
    if (!lastActivity) return null
    
    const now = new Date()
    const diff = now.getTime() - lastActivity.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) {
      return `${seconds}s ago`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`
    } else {
      return `${Math.floor(seconds / 3600)}h ago`
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'h-2 w-2 rounded-full transition-colors duration-200',
            getStatusColor()
          )}
        />
        {connectionState === ConnectionState.CONNECTING || 
         connectionState === ConnectionState.RECONNECTING ? (
          <div
            className={cn(
              'absolute inset-0 h-2 w-2 rounded-full animate-ping',
              getStatusColor(),
              'opacity-75'
            )}
          />
        ) : null}
      </div>
      
      {showText && (
        <div className="flex flex-col text-xs">
          <span className="text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>
          {lastActivity && isConnected && (
            <span className="text-gray-500 dark:text-gray-400">
              Last activity: {formatLastActivity()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}