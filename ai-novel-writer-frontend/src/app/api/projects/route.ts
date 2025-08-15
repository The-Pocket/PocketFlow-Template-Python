import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { Project, CreateProjectForm, ApiResponse } from '@/types'

// GET /api/projects - Get all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward request to backend
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects', {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching projects:', error)
    
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

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const body: CreateProjectForm = await request.json()
    
    // Validate required fields
    if (!body.title || !body.genre) {
      return NextResponse.json(
        { success: false, error: 'Title and genre are required' },
        { status: 400 }
      )
    }

    // Forward request to backend
    const response = await apiClient.post<ApiResponse<Project>>('/projects', body, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    
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