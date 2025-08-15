import { ApiResponse, PaginatedResponse } from '@/types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_TIMEOUT = 30000 // 30 seconds

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

// Request configuration interface
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  requireAuth?: boolean
}

// Authentication token management
class TokenManager {
  private static instance: TokenManager
  private token: string | null = null

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  setToken(token: string): void {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  clearToken(): void {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

// Main API client class
export class ApiClient {
  private baseUrl: string
  private tokenManager: TokenManager

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.tokenManager = TokenManager.getInstance()
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.tokenManager.setToken(token)
  }

  // Clear authentication token
  clearAuthToken(): void {
    this.tokenManager.clearToken()
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated()
  }

  // Build request headers
  private buildHeaders(config: RequestConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    // Add authentication header if required and available
    if (config.requireAuth !== false) {
      const token = this.tokenManager.getToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    return headers
  }

  // Create AbortController for timeout
  private createTimeoutController(timeout: number): AbortController {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeout)
    return controller
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorCode: string | undefined

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        errorCode = errorData.code
      } catch {
        // If response is not JSON, use status text
      }

      throw new ApiError(errorMessage, response.status, errorCode)
    }

    try {
      return await response.json()
    } catch {
      throw new ApiError('Invalid JSON response', response.status)
    }
  }

  // Main request method
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      timeout = API_TIMEOUT,
    } = config

    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    const headers = this.buildHeaders(config)
    const controller = this.createTimeoutController(timeout)

    const requestInit: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, requestInit)
      return await this.handleResponse<T>(response)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new TimeoutError()
        }
        if (err.message.includes('fetch')) {
          throw new NetworkError()
        }
      }
      throw err
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Utility functions for common API patterns
export async function apiRequest<T>(
  endpoint: string,
  config?: RequestConfig
): Promise<ApiResponse<T>> {
  return apiClient.request<ApiResponse<T>>(endpoint, config)
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient.get<ApiResponse<T>>(endpoint)
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient.post<ApiResponse<T>>(endpoint, body)
}

export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient.put<ApiResponse<T>>(endpoint, body)
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient.delete<ApiResponse<T>>(endpoint)
}

// Paginated request helper
export async function apiGetPaginated<T>(
  endpoint: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<T>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  
  return apiClient.get<PaginatedResponse<T>>(`${endpoint}?${params}`)
}