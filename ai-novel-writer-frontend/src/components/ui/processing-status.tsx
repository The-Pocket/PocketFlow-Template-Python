'use client'

import { useProcessingStatus } from '@/components/providers/websocket-provider'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle, Clock } from 'lucide-react'

interface ProcessingStatusProps {
  className?: string
  compact?: boolean
}

export function ProcessingStatus({ className, compact = false }: ProcessingStatusProps) {
  const processingStatus = useProcessingStatus()

  if (!processingStatus) {
    return null
  }

  const { activeAgents, currentTasks, queueLength, estimatedCompletion } = processingStatus
  const hasActiveTasks = currentTasks.length > 0 || activeAgents.length > 0

  if (!hasActiveTasks && queueLength === 0) {
    return null
  }

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'writing':
        return <Loader2 className="h-3 w-3 animate-spin" />
      case 'analysis':
        return <Clock className="h-3 w-3" />
      case 'research':
        return <Loader2 className="h-3 w-3 animate-spin" />
      case 'consistency-check':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Loader2 className="h-3 w-3 animate-spin" />
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400'
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-gray-700 dark:text-gray-300">
          {currentTasks.length > 0 
            ? `${currentTasks.length} task${currentTasks.length > 1 ? 's' : ''} running`
            : `${activeAgents.length} agent${activeAgents.length > 1 ? 's' : ''} active`
          }
        </span>
        {queueLength > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            (+{queueLength} queued)
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Active AI Agents ({activeAgents.length})
          </h4>
          <div className="space-y-1">
            {activeAgents.map((agent, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">{agent}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Tasks */}
      {currentTasks.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Current Tasks ({currentTasks.length})
          </h4>
          <div className="space-y-2">
            {currentTasks.map((task) => (
              <div key={task.id} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {getTaskIcon(task.type)}
                  <span className="text-gray-700 dark:text-gray-300">
                    {task.description}
                  </span>
                  <span className={cn('text-xs', getTaskStatusColor(task.status))}>
                    {task.status}
                  </span>
                </div>
                
                {task.progress > 0 && (
                  <div className="ml-5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span>{task.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Information */}
      {queueLength > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{queueLength} task{queueLength > 1 ? 's' : ''} in queue</span>
          {estimatedCompletion && (
            <span>
              • ETA: {new Date(estimatedCompletion).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}