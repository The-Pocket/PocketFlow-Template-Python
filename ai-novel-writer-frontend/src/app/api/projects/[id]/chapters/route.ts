import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { Chapter, CreateChapterForm, ApiResponse } from '@/types'

// GET /api/projects/[id]/chapters - Get all chapters for a project
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
    const response = await apiClient.get<ApiResponse<Chapter[]>>(`/projects/${projectId}/chapters`, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    
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

// POST /api/projects/[id]/chapters - Create a new chapter
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
    const body: CreateChapterForm = await request.json()
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Chapter title is required' },
        { status: 400 }
      )
    }

    // Forward request to backend
    const response = await apiClient.post<ApiResponse<Chapter>>(`/projects/${projectId}/chapters`, body, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating chapter:', error)
    
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