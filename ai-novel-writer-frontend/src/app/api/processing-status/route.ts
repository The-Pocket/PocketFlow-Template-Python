import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { ProcessingStatus, ApiResponse } from '@/types'

// GET /api/processing-status - Get current AI processing status
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
    const response = await apiClient.get<ApiResponse<ProcessingStatus>>('/processing-status', {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching processing status:', error)
    
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