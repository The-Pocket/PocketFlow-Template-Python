import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { Activity, PaginatedResponse } from '@/types'

// GET /api/activities - Get recent activities
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'
    const projectId = searchParams.get('projectId')

    // Build query parameters
    const queryParams = new URLSearchParams({
      page,
      limit,
    })

    if (projectId) {
      queryParams.append('projectId', projectId)
    }

    // Forward request to backend
    const response = await apiClient.get<PaginatedResponse<Activity>>(`/activities?${queryParams}`, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching activities:', error)
    
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