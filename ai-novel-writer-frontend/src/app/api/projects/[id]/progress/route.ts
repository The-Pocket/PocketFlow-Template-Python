import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { WritingProgress, ApiResponse } from '@/types'

// GET /api/projects/[id]/progress - Get writing progress for a project
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
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '30' // Default to 30 days

    // Forward request to backend with query parameters
    const response = await apiClient.get<ApiResponse<WritingProgress>>(`/projects/${projectId}/progress?days=${days}`, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching writing progress:', error)
    
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

// POST /api/projects/[id]/progress/goal - Update writing goal
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
    const { goalWords, deadline } = await request.json()

    if (typeof goalWords !== 'number' || goalWords <= 0) {
      return NextResponse.json(
        { success: false, error: 'Goal words must be a positive number' },
        { status: 400 }
      )
    }

    // Forward request to backend
    const response = await apiClient.post<ApiResponse<WritingProgress>>(`/projects/${projectId}/progress/goal`, {
      goalWords,
      deadline
    }, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating writing goal:', error)
    
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