'use client'

import { useState } from 'react'
import { useProjects, useCreateProject } from '@/lib/react-query'
import { useWebSocketContext } from '@/components/providers/websocket-provider'
import { ConnectionStatus } from '@/components/ui/connection-status'
import { ProcessingStatus } from '@/components/ui/processing-status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ApiDemo() {
  const [projectTitle, setProjectTitle] = useState('')
  const [projectGenre, setProjectGenre] = useState('')
  
  // React Query hooks
  const { data: projects, isLoading, error } = useProjects()
  const createProjectMutation = useCreateProject()
  
  // WebSocket context
  const { isConnected, connect, disconnect, send } = useWebSocketContext()

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectTitle.trim() || !projectGenre.trim()) return

    try {
      await createProjectMutation.mutateAsync({
        title: projectTitle,
        genre: projectGenre,
        description: `A ${projectGenre} novel titled "${projectTitle}"`,
        tags: [projectGenre.toLowerCase()],
      })
      setProjectTitle('')
      setProjectGenre('')
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleWebSocketTest = () => {
    if (isConnected) {
      send('test-message', { message: 'Hello from frontend!', timestamp: new Date() })
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Integration Demo</h1>
        <ConnectionStatus showText />
      </div>

      {/* WebSocket Controls */}
      <Card>
        <CardHeader>
          <CardTitle>WebSocket Connection</CardTitle>
          <CardDescription>
            Test real-time connection to the backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => connect('demo-token')} 
              disabled={isConnected}
              variant={isConnected ? 'secondary' : 'default'}
            >
              Connect
            </Button>
            <Button 
              onClick={disconnect} 
              disabled={!isConnected}
              variant="outline"
            >
              Disconnect
            </Button>
            <Button 
              onClick={handleWebSocketTest} 
              disabled={!isConnected}
              variant="outline"
            >
              Send Test Message
            </Button>
          </div>
          
          <ProcessingStatus />
        </CardContent>
      </Card>

      {/* Project Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
          <CardDescription>
            Test API integration with React Query
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Project Title
                </label>
                <Input
                  id="title"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div>
                <label htmlFor="genre" className="block text-sm font-medium mb-1">
                  Genre
                </label>
                <Input
                  id="genre"
                  value={projectGenre}
                  onChange={(e) => setProjectGenre(e.target.value)}
                  placeholder="e.g., Fantasy, Sci-Fi, Romance"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={createProjectMutation.isPending}
              className="w-full"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Data fetched via React Query
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-4">Loading projects...</div>
          )}
          
          {error && (
            <div className="text-red-600 text-center py-4">
              Error loading projects: {error.message}
            </div>
          )}
          
          {projects && projects.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No projects yet. Create your first project above!
            </div>
          )}
          
          {projects && projects.length > 0 && (
            <div className="space-y-2">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.genre} • {project.wordCount} words
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {project.description}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}