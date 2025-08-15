// Core data types for the AI Novel Writer Frontend

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// NextAuth types
export interface AuthUser {
  id: string
  email: string
  name: string
  token?: string
}

export interface AuthSession {
  user: AuthUser
  accessToken?: string
  expires: string
}

export interface Project {
  id: string
  title: string
  genre: string
  description: string
  createdAt: Date
  updatedAt: Date
  wordCount: number
  chapters: Chapter[]
  metadata: ProjectMetadata
}

export interface ProjectMetadata {
  targetWordCount?: number
  deadline?: Date
  tags: string[]
  status: 'draft' | 'in-progress' | 'completed' | 'published'
}

export interface Chapter {
  id: string
  title: string
  content: string
  wordCount: number
  position: number
  scenes: Scene[]
  lastEditedAt: Date
  projectId: string
}

export interface Scene {
  id: string
  title: string
  content: string
  wordCount: number
  position: number
  chapterId: string
}

export interface AIPersona {
  id: string
  name: string
  specialization: string
  systemPrompt: string
  avatar: string
  capabilities: string[]
  isCustom: boolean
  isActive: boolean
}

export interface ProcessingStatus {
  activeAgents: string[]
  currentTasks: Task[]
  queueLength: number
  estimatedCompletion: Date | null
}

export interface Task {
  id: string
  type: 'writing' | 'analysis' | 'research' | 'consistency-check'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  description: string
  startedAt?: Date
  completedAt?: Date
}

export interface StoryElement {
  id: string
  type: 'character' | 'location' | 'plot-point' | 'theme'
  name: string
  description: string
  attributes: Record<string, unknown>
  relationships: Relationship[]
  timeline: TimelineEntry[]
}

export interface Relationship {
  id: string
  fromElementId: string
  toElementId: string
  type: string
  description: string
  strength: number
}

export interface TimelineEntry {
  id: string
  elementId: string
  timestamp: Date
  event: string
  description: string
}

export interface KnowledgeBase {
  id: string
  projectId: string
  elements: StoryElement[]
  relationships: Relationship[]
  timeline: TimelineEntry[]
  lastUpdated: Date
}

export interface WritingProgress {
  projectId: string
  dailyWordCounts: { date: string; words: number }[]
  totalWords: number
  goalWords: number
  streak: number
  averageWordsPerDay: number
  estimatedCompletion: Date | null
}

export interface Activity {
  id: string
  type: 'project-created' | 'chapter-added' | 'writing-session' | 'ai-assistance'
  description: string
  timestamp: Date
  projectId?: string
  metadata?: Record<string, unknown>
}

// UI State types
export interface AppState {
  // User & Authentication
  user: User | null
  isAuthenticated: boolean

  // Current Project Context
  currentProject: Project | null
  currentChapter: Chapter | null
  currentPosition: TimelinePosition | null

  // AI State
  activePersona: AIPersona
  availablePersonas: AIPersona[]
  aiProcessingStatus: ProcessingStatus

  // UI State
  sidebarOpen: boolean
  focusMode: boolean
  theme: 'light' | 'dark' | 'system'

  // Offline State
  isOnline: boolean
  pendingSync: SyncItem[]
  lastSyncTime: Date | null
}

export interface TimelinePosition {
  chapterId: string
  sceneId?: string
  wordPosition: number
}

export interface SyncItem {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'project' | 'chapter' | 'scene'
  data: unknown
  timestamp: Date
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateProjectForm {
  title: string
  genre: string
  description: string
  targetWordCount?: number
  deadline?: Date
  tags: string[]
}

export interface CreateChapterForm {
  title: string
  position?: number
}

export interface AIRequestForm {
  prompt: string
  context: string
  personaId: string
  type: 'completion' | 'rewrite' | 'expand' | 'improve'
}