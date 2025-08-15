# API Integration Documentation

This document describes the API client and backend integration implementation for the AI Novel Writer Frontend.

## Overview

The API integration consists of four main components:

1. **API Client** (`src/lib/api-client.ts`) - HTTP client with authentication and error handling
2. **WebSocket Manager** (`src/lib/websocket-manager.ts`) - Real-time connection management
3. **React Query Setup** (`src/lib/react-query.ts`) - Server state management and caching
4. **API Route Handlers** (`src/app/api/*/route.ts`) - Next.js API routes for backend proxying

## Features Implemented

### ✅ API Client Utility
- **Authentication**: Token-based auth with automatic header injection
- **Error Handling**: Typed errors (ApiError, NetworkError, TimeoutError)
- **Request/Response**: JSON handling with TypeScript types
- **Timeout Management**: Configurable request timeouts
- **Token Management**: Automatic token storage and retrieval

### ✅ WebSocket Connection Manager
- **Real-time Connection**: Automatic connection management with reconnection
- **Event System**: Type-safe event subscription and handling
- **Connection States**: CONNECTING, CONNECTED, DISCONNECTED, RECONNECTING, ERROR
- **Heartbeat**: Automatic ping/pong for connection health
- **Error Recovery**: Exponential backoff reconnection strategy

### ✅ React Query Integration
- **Caching Strategy**: Intelligent caching with stale-while-revalidate
- **Query Keys**: Organized query key factory for cache management
- **Mutations**: Optimistic updates with rollback on failure
- **Error Handling**: Automatic retry logic for network/server errors
- **Prefetching**: Smart prefetching for related data

### ✅ API Route Handlers
- **Projects**: CRUD operations for novel projects
- **Chapters**: Chapter management and auto-save functionality
- **Knowledge Base**: Story element and relationship management
- **AI Personas**: Custom AI assistant management
- **Processing Status**: Real-time AI processing status
- **Activities**: User activity tracking and history

## Usage Examples

### Basic API Client Usage

```typescript
import { apiClient } from '@/lib/api-client'

// Set authentication token
apiClient.setAuthToken('your-jwt-token')

// Make authenticated requests
const projects = await apiClient.get('/api/projects')
const newProject = await apiClient.post('/api/projects', {
  title: 'My Novel',
  genre: 'Fantasy'
})
```

### React Query Hooks

```typescript
import { useProjects, useCreateProject } from '@/lib/react-query'

function ProjectsList() {
  const { data: projects, isLoading, error } = useProjects()
  const createProject = useCreateProject()

  const handleCreate = async () => {
    await createProject.mutateAsync({
      title: 'New Project',
      genre: 'Sci-Fi'
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  )
}
```

### WebSocket Integration

```typescript
import { useWebSocketContext, useWebSocketEvent } from '@/components/providers/websocket-provider'

function RealTimeStatus() {
  const { isConnected, connect } = useWebSocketContext()

  // Subscribe to processing status updates
  useWebSocketEvent('processing-status', (status) => {
    console.log('AI processing status:', status)
  })

  // Subscribe to task updates
  useWebSocketEvent('task-update', (task) => {
    console.log('Task updated:', task)
  })

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={() => connect('auth-token')}>Connect</button>
    </div>
  )
}
```

### Auto-Save with Debouncing

```typescript
import { useAutoSave } from '@/hooks/use-api'
import { useUpdateChapter } from '@/lib/react-query'

function TextEditor({ chapterId, initialContent }) {
  const [content, setContent] = useState(initialContent)
  const updateChapter = useUpdateChapter()

  const autoSave = useAutoSave(
    async (content: string) => {
      await updateChapter.mutateAsync({
        chapterId,
        updates: { content }
      })
    },
    2000 // 2 second delay
  )

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    autoSave(newContent)
  }

  return (
    <textarea
      value={content}
      onChange={(e) => handleContentChange(e.target.value)}
    />
  )
}
```

## Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Chapters
- `GET /api/projects/[id]/chapters` - List project chapters
- `POST /api/projects/[id]/chapters` - Create new chapter
- `GET /api/chapters/[id]` - Get chapter details
- `PUT /api/chapters/[id]` - Update chapter
- `PATCH /api/chapters/[id]/content` - Auto-save chapter content
- `DELETE /api/chapters/[id]` - Delete chapter

### AI Features
- `GET /api/personas` - List AI personas
- `POST /api/personas` - Create custom persona
- `GET /api/processing-status` - Get AI processing status

### Knowledge Base
- `GET /api/projects/[id]/knowledge-base` - Get project knowledge base
- `POST /api/projects/[id]/knowledge-base/refresh` - Refresh knowledge base

### Analytics
- `GET /api/projects/[id]/progress` - Get writing progress
- `POST /api/projects/[id]/progress/goal` - Update writing goal
- `GET /api/activities` - Get recent activities

## WebSocket Events

### Incoming Events
- `processing-status` - AI processing status updates
- `task-update` - Individual task progress updates
- `knowledge-base-update` - Knowledge base changes
- `sync-status` - Synchronization status
- `ai-agent-status` - AI agent status changes

### Outgoing Events
- `ping` - Heartbeat ping
- `test-message` - Test message for debugging

## Error Handling

The system includes comprehensive error handling:

### API Errors
- **401 Unauthorized**: Automatic token refresh or redirect to login
- **403 Forbidden**: Permission denied with user-friendly message
- **404 Not Found**: Resource not found handling
- **500 Server Error**: Automatic retry with exponential backoff

### Network Errors
- **Connection Failed**: Offline mode activation
- **Timeout**: Retry with longer timeout
- **Rate Limiting**: Automatic backoff and retry

### WebSocket Errors
- **Connection Lost**: Automatic reconnection with exponential backoff
- **Authentication Failed**: Token refresh and reconnection
- **Message Parsing**: Graceful error handling for malformed messages

## Performance Optimizations

### Caching Strategy
- **Stale-while-revalidate**: Show cached data while fetching updates
- **Background refetch**: Update cache without blocking UI
- **Selective invalidation**: Only invalidate related queries

### Request Optimization
- **Request deduplication**: Prevent duplicate simultaneous requests
- **Prefetching**: Load related data proactively
- **Pagination**: Efficient loading of large datasets

### WebSocket Optimization
- **Connection pooling**: Reuse connections across components
- **Event batching**: Batch multiple events for efficiency
- **Selective subscriptions**: Only subscribe to needed events

## Testing

The integration includes comprehensive error handling and fallback mechanisms:

1. **Network failures**: Graceful degradation to offline mode
2. **Authentication errors**: Automatic token refresh
3. **Server errors**: Retry logic with exponential backoff
4. **WebSocket disconnections**: Automatic reconnection
5. **Malformed responses**: Safe parsing with error boundaries

## Next Steps

This implementation provides the foundation for:

1. **Authentication integration** (Task 2.1)
2. **AI streaming features** (Task 5.2)
3. **Real-time collaboration** (Task 7.2)
4. **Offline synchronization** (Task 13.2)

The API client and WebSocket manager are designed to be extensible and can easily accommodate additional features as they are implemented.