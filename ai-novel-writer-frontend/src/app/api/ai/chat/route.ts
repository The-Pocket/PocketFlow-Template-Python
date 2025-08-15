import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, persona } = await req.json()

    const result = await streamText({
      model: openai('gpt-4'),
      messages,
      system: persona?.systemPrompt || 'You are a helpful AI writing assistant.',
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error('AI Chat API Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}