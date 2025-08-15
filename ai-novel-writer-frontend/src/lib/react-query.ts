import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, ApiError, NetworkError, TimeoutError } from './api-client'
import { 
  Project, 
  Chapter, 
  KnowledgeBase, 
  WritingProgress, 
  AIPersona, 
  ProcessingStatus,
  Activity,
  CreateProjectForm,
  CreateChapterForm,
  ApiResponse,
  PaginatedResponse
} from '@/types'

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof ApiError && error.status === 401) {
          return false
        }
        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        // Retry network errors and server errors up to 3 times
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        // Retry network errors up to 2 times
        if (error instanceof NetworkError || error instanceof TimeoutError) {
          return failureCount < 2
        }
        return false
      },
    },
  },
})

// Query keys factory
export const queryKeys = {
  // Projects
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectChapters: (projectId: string) => ['projects', projectId, 'chapters'] as const,
  
  // Chapters
  chapters: ['chapters'] as const,
  chapter: (id: string) => ['chapters', id] as const,
  
  // Knowledge Base
  knowledgeBase: (projectId: string) => ['knowledge-base', projectId] as const,
  
  // AI Personas
  personas: ['personas'] as const,
  persona: (id: string) => ['personas', id] as const,
  
  // Progress & Analytics
  writingProgress: (projectId: string) => ['writing-progress', projectId] as const,
  
  // Activities
  activities: ['activities'] as const,
  projectActivities: (projectId: string) => ['activities', projectId] as const,
  
  // Processing Status
  processingStatus: ['processing-status'] as const,
}

// Project queries
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async (): Promise<Project[]> => {
      const response = await apiClient.get<ApiResponse<Project[]>>('/api/projects')
      return response.data
    },
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: async (): Promise<Project> => {
      const response = await apiClient.get<ApiResponse<Project>>(`/api/projects/${projectId}`)
      return response.data
    },
    enabled: !!projectId,
  })
}

export function useProjectChapters(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectChapters(projectId),
    queryFn: async (): Promise<Chapter[]> => {
      const response = await apiClient.get<ApiResponse<Chapter[]>>(`/api/projects/${projectId}/chapters`)
      return response.data
    },
    enabled: !!projectId,
  })
}

// Chapter queries
export function useChapter(chapterId: string) {
  return useQuery({
    queryKey: queryKeys.chapter(chapterId),
    queryFn: async (): Promise<Chapter> => {
      const response = await apiClient.get<ApiResponse<Chapter>>(`/api/chapters/${chapterId}`)
      return response.data
    },
    enabled: !!chapterId,
  })
}

// Knowledge Base queries
export function useKnowledgeBase(projectId: string) {
  return useQuery({
    queryKey: queryKeys.knowledgeBase(projectId),
    queryFn: async (): Promise<KnowledgeBase> => {
      const response = await apiClient.get<ApiResponse<KnowledgeBase>>(`/api/projects/${projectId}/knowledge-base`)
      return response.data
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - knowledge base updates frequently
  })
}

// AI Personas queries
export function usePersonas() {
  return useQuery({
    queryKey: queryKeys.personas,
    queryFn: async (): Promise<AIPersona[]> => {
      const response = await apiClient.get<ApiResponse<AIPersona[]>>('/api/personas')
      return response.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - personas don't change often
  })
}

// Writing Progress queries
export function useWritingProgress(projectId: string) {
  return useQuery({
    queryKey: queryKeys.writingProgress(projectId),
    queryFn: async (): Promise<WritingProgress> => {
      const response = await apiClient.get<ApiResponse<WritingProgress>>(`/api/projects/${projectId}/progress`)
      return response.data
    },
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute - progress updates frequently
  })
}

// Activities queries
export function useActivities(limit: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.activities, limit],
    queryFn: async (): Promise<Activity[]> => {
      const response = await apiClient.get<PaginatedResponse<Activity>>(`/api/activities?limit=${limit}`)
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds - activities are real-time
  })
}

export function useProjectActivities(projectId: string, limit: number = 20) {
  return useQuery({
    queryKey: [...queryKeys.projectActivities(projectId), limit],
    queryFn: async (): Promise<Activity[]> => {
      const response = await apiClient.get<PaginatedResponse<Activity>>(`/api/projects/${projectId}/activities?limit=${limit}`)
      return response.data
    },
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Processing Status queries
export function useProcessingStatus() {
  return useQuery({
    queryKey: queryKeys.processingStatus,
    queryFn: async (): Promise<ProcessingStatus> => {
      const response = await apiClient.get<ApiResponse<ProcessingStatus>>('/api/processing-status')
      return response.data
    },
    staleTime: 5 * 1000, // 5 seconds - very frequent updates
    refetchInterval: 10 * 1000, // Poll every 10 seconds
  })
}

// Project mutations
export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectData: CreateProjectForm): Promise<Project> => {
      const response = await apiClient.post<ApiResponse<Project>>('/api/projects', projectData)
      return response.data
    },
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects })
      
      // Add the new project to the cache
      queryClient.setQueryData(queryKeys.project(newProject.id), newProject)
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }): Promise<Project> => {
      const response = await apiClient.put<ApiResponse<Project>>(`/api/projects/${projectId}`, updates)
      return response.data
    },
    onSuccess: (updatedProject) => {
      // Update the project in cache
      queryClient.setQueryData(queryKeys.project(updatedProject.id), updatedProject)
      
      // Update the project in the projects list
      queryClient.setQueryData(queryKeys.projects, (oldProjects: Project[] | undefined) => {
        if (!oldProjects) return oldProjects
        return oldProjects.map(project => 
          project.id === updatedProject.id ? updatedProject : project
        )
      })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectId: string): Promise<void> => {
      await apiClient.delete(`/api/projects/${projectId}`)
    },
    onSuccess: (_, projectId) => {
      // Remove project from cache
      queryClient.removeQueries({ queryKey: queryKeys.project(projectId) })
      
      // Remove from projects list
      queryClient.setQueryData(queryKeys.projects, (oldProjects: Project[] | undefined) => {
        if (!oldProjects) return oldProjects
        return oldProjects.filter(project => project.id !== projectId)
      })
      
      // Remove related data
      queryClient.removeQueries({ queryKey: queryKeys.projectChapters(projectId) })
      queryClient.removeQueries({ queryKey: queryKeys.knowledgeBase(projectId) })
      queryClient.removeQueries({ queryKey: queryKeys.writingProgress(projectId) })
    },
  })
}

// Chapter mutations
export function useCreateChapter() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ projectId, chapterData }: { projectId: string; chapterData: CreateChapterForm }): Promise<Chapter> => {
      const response = await apiClient.post<ApiResponse<Chapter>>(`/api/projects/${projectId}/chapters`, chapterData)
      return response.data
    },
    onSuccess: (newChapter, { projectId }) => {
      // Invalidate chapters list
      queryClient.invalidateQueries({ queryKey: queryKeys.projectChapters(projectId) })
      
      // Add to cache
      queryClient.setQueryData(queryKeys.chapter(newChapter.id), newChapter)
      
      // Update project word count
      queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
    },
  })
}

export function useUpdateChapter() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ chapterId, updates }: { chapterId: string; updates: Partial<Chapter> }): Promise<Chapter> => {
      const response = await apiClient.put<ApiResponse<Chapter>>(`/api/chapters/${chapterId}`, updates)
      return response.data
    },
    onSuccess: (updatedChapter) => {
      // Update chapter in cache
      queryClient.setQueryData(queryKeys.chapter(updatedChapter.id), updatedChapter)
      
      // Update in chapters list
      queryClient.setQueryData(queryKeys.projectChapters(updatedChapter.projectId), (oldChapters: Chapter[] | undefined) => {
        if (!oldChapters) return oldChapters
        return oldChapters.map(chapter => 
          chapter.id === updatedChapter.id ? updatedChapter : chapter
        )
      })
      
      // Update project word count
      queryClient.invalidateQueries({ queryKey: queryKeys.project(updatedChapter.projectId) })
    },
  })
}

// Content auto-save mutation
export function useAutoSaveChapter() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ chapterId, content }: { chapterId: string; content: string }): Promise<Chapter> => {
      const response = await apiClient.patch<ApiResponse<Chapter>>(`/api/chapters/${chapterId}/content`, { content })
      return response.data
    },
    onSuccess: (updatedChapter) => {
      // Update chapter in cache without invalidating queries (silent update)
      queryClient.setQueryData(queryKeys.chapter(updatedChapter.id), updatedChapter)
    },
    // Don't show loading states for auto-save
    meta: {
      silent: true,
    },
  })
}

// Utility functions for cache management
export function invalidateProjectData(projectId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.projectChapters(projectId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeBase(projectId) })
  queryClient.invalidateQueries({ queryKey: queryKeys.writingProgress(projectId) })
}

export function prefetchProject(projectId: string) {
  queryClient.prefetchQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Project>>(`/api/projects/${projectId}`)
      return response.data
    },
  })
}

// Error boundary for React Query
export function isQueryError(error: unknown): error is ApiError | NetworkError | TimeoutError {
  return error instanceof ApiError || error instanceof NetworkError || error instanceof TimeoutError
}