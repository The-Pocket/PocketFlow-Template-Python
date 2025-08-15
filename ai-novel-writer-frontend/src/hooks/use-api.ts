import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/react-query'
import { debounce } from '@/lib/utils'
import { Project, Chapter, ApiResponse } from '@/types'

// Hook for handling authentication
export function useAuth() {
  const queryClient = useQueryClient()

  const setAuthToken = useCallback((token: string) => {
    apiClient.setAuthToken(token)
    // Invalidate all queries when auth changes
    queryClient.invalidateQueries()
  }, [queryClient])

  const clearAuth = useCallback(() => {
    apiClient.clearAuthToken()
    // Clear all cached data when logging out
    queryClient.clear()
  }, [queryClient])

  const isAuthenticated = useCallback(() => {
    return apiClient.isAuthenticated()
  }, [])

  return {
    setAuthToken,
    clearAuth,
    isAuthenticated,
  }
}

// Hook for auto-saving content with debouncing
export function useAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  delay: number = 2000
) {
  const debouncedSave = useCallback(
    (data: T) => {
      const timeoutId = setTimeout(async () => {
        try {
          await saveFn(data)
        } catch (err) {
          console.error('Auto-save failed:', err)
          // Could show a toast notification here
        }
      }, delay)
      
      // Clear previous timeout if called again
      return () => clearTimeout(timeoutId)
    },
    [saveFn, delay]
  )

  return debouncedSave
}

// Hook for optimistic updates
export function useOptimisticUpdate() {
  const queryClient = useQueryClient()

  const updateOptimistically = useCallback(
    <T>(queryKey: unknown[], updater: (old: T | undefined) => T) => {
      // Cancel any outgoing refetches
      queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<T>(queryKey)

      // Optimistically update to the new value
      queryClient.setQueryData<T>(queryKey, updater)

      // Return a context object with the snapshotted value
      return { previousData }
    },
    [queryClient]
  )

  const rollbackOptimisticUpdate = useCallback(
    <T>(queryKey: unknown[], previousData: T | undefined) => {
      queryClient.setQueryData(queryKey, previousData)
    },
    [queryClient]
  )

  return {
    updateOptimistically,
    rollbackOptimisticUpdate,
  }
}

// Hook for handling offline/online state
export function useNetworkStatus() {
  const queryClient = useQueryClient()

  const handleOnline = useCallback(() => {
    // Refetch all queries when coming back online
    queryClient.refetchQueries({
      type: 'active',
      stale: true,
    })
  }, [queryClient])

  const handleOffline = useCallback(() => {
    // Could pause queries or show offline indicator
    console.log('Application is offline')
  }, [])

  return {
    handleOnline,
    handleOffline,
  }
}

// Hook for prefetching related data
export function usePrefetch() {
  const queryClient = useQueryClient()

  const prefetchProject = useCallback(
    (projectId: string) => {
      // Prefetch project data
      queryClient.prefetchQuery({
        queryKey: queryKeys.project(projectId),
        queryFn: async () => {
          const response = await apiClient.get<ApiResponse<Project>>(`/api/projects/${projectId}`)
          return response.data
        },
      })

      // Prefetch chapters
      queryClient.prefetchQuery({
        queryKey: queryKeys.projectChapters(projectId),
        queryFn: async () => {
          const response = await apiClient.get<ApiResponse<Chapter[]>>(`/api/projects/${projectId}/chapters`)
          return response.data
        },
      })
    },
    [queryClient]
  )

  const prefetchChapter = useCallback(
    (chapterId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.chapter(chapterId),
        queryFn: async () => {
          const response = await apiClient.get<ApiResponse<Chapter>>(`/api/chapters/${chapterId}`)
          return response.data
        },
      })
    },
    [queryClient]
  )

  return {
    prefetchProject,
    prefetchChapter,
  }
}

// Hook for handling API errors
export function useErrorHandler() {
  const { clearAuth } = useAuth()

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        // Handle authentication errors
        if ('status' in error && error.status === 401) {
          clearAuth()
          // Redirect to login or show auth modal
          return
        }

        // Handle network errors
        if (error.name === 'NetworkError') {
          // Show offline indicator or retry option
          console.error('Network error:', error.message)
          return
        }

        // Handle timeout errors
        if (error.name === 'TimeoutError') {
          // Show timeout message
          console.error('Request timeout:', error.message)
          return
        }

        // Handle other API errors
        console.error('API error:', error.message)
      }
    },
    [clearAuth]
  )

  return { handleError }
}

// Hook for batch operations
export function useBatchOperations() {
  const queryClient = useQueryClient()

  const batchInvalidate = useCallback(
    (queryKeys: unknown[][]) => {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey })
      })
    },
    [queryClient]
  )

  const batchPrefetch = useCallback(
    (queries: Array<{ queryKey: unknown[]; queryFn: () => Promise<unknown> }>) => {
      queries.forEach(({ queryKey, queryFn }) => {
        queryClient.prefetchQuery({ queryKey, queryFn })
      })
    },
    [queryClient]
  )

  return {
    batchInvalidate,
    batchPrefetch,
  }
}