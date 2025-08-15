import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'
import { AIPersona, ApiResponse } from '@/types'

// GET /api/personas - Get all available AI personas
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
    const response = await apiClient.get<ApiResponse<AIPersona[]>>('/personas', {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching personas:', error)
    
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

// POST /api/personas - Create a custom AI persona
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.systemPrompt) {
      return NextResponse.json(
        { success: false, error: 'Name and system prompt are required' },
        { status: 400 }
      )
    }

    // Forward request to backend
    const response = await apiClient.post<ApiResponse<AIPersona>>('/personas', body, {
      headers: { Authorization: authHeader }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating persona:', error)
    
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