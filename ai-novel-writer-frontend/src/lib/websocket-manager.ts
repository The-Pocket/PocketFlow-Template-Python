import { ProcessingStatus, Task } from '@/types'

// WebSocket event types
export interface WebSocketEvents {
  'processing-status': ProcessingStatus
  'task-update': Task
  'knowledge-base-update': { projectId: string; timestamp: Date }
  'sync-status': { status: 'syncing' | 'synced' | 'error'; message?: string }
  'ai-agent-status': { agentId: string; status: 'active' | 'idle' | 'error' }
  'real-time-collaboration': { userId: string; action: string; data: unknown }
}

export type WebSocketEventType = keyof WebSocketEvents
export type WebSocketEventHandler<T extends WebSocketEventType> = (data: WebSocketEvents[T]) => void

// Connection states
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket configuration
interface WebSocketConfig {
  url?: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  authToken?: string
}

// Default configuration
const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 seconds
  authToken: ''
}

export class WebSocketManager {
  private static instance: WebSocketManager
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private eventHandlers = new Map<WebSocketEventType, Set<WebSocketEventHandler<any>>>()
  private connectionStateHandlers = new Set<(state: ConnectionState) => void>()

  private constructor(config: WebSocketConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  static getInstance(config?: WebSocketConfig): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(config)
    }
    return WebSocketManager.instance
  }

  // Connection management
  connect(authToken?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    if (authToken) {
      this.config.authToken = authToken
    }

    this.setConnectionState(ConnectionState.CONNECTING)
    this.clearReconnectTimer()

    try {
      // Add auth token to WebSocket URL if available
      const wsUrl = this.config.authToken 
        ? `${this.config.url}?token=${encodeURIComponent(this.config.authToken)}`
        : this.config.url

      this.ws = new WebSocket(wsUrl)
      this.setupEventListeners()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.setConnectionState(ConnectionState.ERROR)
      this.scheduleReconnect()
    }
  }

  disconnect(): void {
    this.clearReconnectTimer()
    this.clearHeartbeatTimer()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.setConnectionState(ConnectionState.DISCONNECTED)
    this.reconnectAttempts = 0
  }

  // Event subscription
  on<T extends WebSocketEventType>(
    eventType: T,
    handler: WebSocketEventHandler<T>
  ): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set())
    }
    
    this.eventHandlers.get(eventType)!.add(handler)
    
    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.eventHandlers.delete(eventType)
        }
      }
    }
  }

  // Connection state subscription
  onConnectionStateChange(handler: (state: ConnectionState) => void): () => void {
    this.connectionStateHandlers.add(handler)
    
    // Return unsubscribe function
    return () => {
      this.connectionStateHandlers.delete(handler)
    }
  }

  // Send message
  send(type: string, data?: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() })
      this.ws.send(message)
    } else {
      console.warn('WebSocket not connected. Message not sent:', { type, data })
    }
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED
  }

  // Private methods
  private setupEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.setConnectionState(ConnectionState.CONNECTED)
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.clearHeartbeatTimer()
      
      if (event.code !== 1000) { // Not a normal closure
        this.setConnectionState(ConnectionState.DISCONNECTED)
        this.scheduleReconnect()
      } else {
        this.setConnectionState(ConnectionState.DISCONNECTED)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.setConnectionState(ConnectionState.ERROR)
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }

  private handleMessage(message: { type: string; data: unknown }): void {
    const { type, data } = message
    
    // Handle heartbeat response
    if (type === 'pong') {
      return
    }

    // Emit event to subscribers
    const handlers = this.eventHandlers.get(type as WebSocketEventType)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${type}:`, error)
        }
      })
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state
      this.connectionStateHandlers.forEach(handler => {
        try {
          handler(state)
        } catch (error) {
          console.error('Error in connection state handler:', error)
        }
      })
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.setConnectionState(ConnectionState.ERROR)
      return
    }

    this.reconnectAttempts++
    this.setConnectionState(ConnectionState.RECONNECTING)
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.config.reconnectInterval * this.reconnectAttempts) // Exponential backoff
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeatTimer()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping')
      }
    }, this.config.heartbeatInterval)
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

// React hook for WebSocket connection
export function useWebSocket(config?: WebSocketConfig) {
  const wsManager = WebSocketManager.getInstance(config)
  
  return {
    connect: (authToken?: string) => wsManager.connect(authToken),
    disconnect: () => wsManager.disconnect(),
    send: (type: string, data?: unknown) => wsManager.send(type, data),
    on: <T extends WebSocketEventType>(
      eventType: T,
      handler: WebSocketEventHandler<T>
    ) => wsManager.on(eventType, handler),
    onConnectionStateChange: (handler: (state: ConnectionState) => void) =>
      wsManager.onConnectionStateChange(handler),
    getConnectionState: () => wsManager.getConnectionState(),
    isConnected: () => wsManager.isConnected(),
  }
}

// Export singleton instance
export const wsManager = WebSocketManager.getInstance()