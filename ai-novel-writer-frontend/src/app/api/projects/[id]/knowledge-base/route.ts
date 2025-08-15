import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { KnowledgeBase, ApiResponse } from '@/types'

// GET /api/projects/[id]/knowledge-base - Get knowledge base for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const { id: projectId } = params

    // Forward request to backend
    const response = await apiClient.get<ApiResponse<KnowledgeBase>>(`/projects/${projectId}/knowledge-base`, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/knowledge-base/refresh - Trigger knowledge base refresh
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const { id: projectId } = params

    // Forward request to backend
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/projects/${projectId}/knowledge-base/refresh`, {}, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error refreshing knowledge base:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}