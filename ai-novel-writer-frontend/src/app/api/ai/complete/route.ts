import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, persona } = await req.json()

    const fullPrompt = context
      ? `Context: ${context}\n\nContinue writing: ${prompt}`
      : prompt

    const result = await streamText({
      model: openai('gpt-4'),
      prompt: fullPrompt,
      system:
        persona?.systemPrompt ||
        'You are a creative writing assistant. Help continue the story in a natural, engaging way.',
    })

    return result.toAIStreamResponse()
  } catch (error) {
    console.error('AI Completion API Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}