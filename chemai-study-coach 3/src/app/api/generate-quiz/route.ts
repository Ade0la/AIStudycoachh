/**
 * /api/generate-quiz
 *
 * POST { notes: string }
 * → { quiz: Quiz }
 *
 * Calls the Anthropic API and asks it to generate 10 MC + 5 short-answer
 * questions from the user's chemistry notes. Returns structured JSON.
 */

import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { Quiz, MultipleChoiceQuestion, ShortAnswerQuestion } from '@/lib/types'
import { generateId } from '@/lib/utils'

// Initialize the Anthropic client.
// The SDK automatically reads process.env.ANTHROPIC_API_KEY.
const anthropic = new Anthropic()

// ─── The AI prompt ────────────────────────────────────────────────────────────

function buildPrompt(notes: string): string {
  return `You are an expert chemistry professor. A student has shared the following chemistry notes or topics. Your task is to generate a quiz to help them study.

STUDENT NOTES:
"""
${notes}
"""

Generate EXACTLY this structure of questions based on the notes:
- 10 multiple choice questions
- 5 short answer questions

Respond with ONLY valid JSON (no markdown, no explanation) in this exact format:

{
  "multipleChoice": [
    {
      "id": "mc1",
      "question": "Question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "explanation": "Brief explanation of why this is correct.",
      "topic": "Topic name (e.g. Stoichiometry)"
    }
  ],
  "shortAnswer": [
    {
      "id": "sa1",
      "question": "Question text here?",
      "sampleAnswer": "A complete model answer.",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "topic": "Topic name"
    }
  ]
}

Rules:
- correctAnswer must be the EXACT text of one of the 4 options
- Make questions relevant to the actual content of the notes
- Vary difficulty from recall to application
- Keep questions clear and unambiguous
- Topics should be specific (e.g. "Electron Configuration", "Le Chatelier's Principle") not generic`
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // 1. Parse the request body
    const body = await request.json()
    const { notes } = body as { notes: string }

    if (!notes || notes.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide at least a few sentences of chemistry notes.' },
        { status: 400 }
      )
    }

    if (notes.length > 8000) {
      return NextResponse.json(
        { error: 'Notes are too long. Please limit to 8000 characters.' },
        { status: 400 }
      )
    }

    // 2. Call the Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: buildPrompt(notes),
        },
      ],
    })

    // 3. Extract the text content from the response
    const rawText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('')

    // 4. Parse the JSON response
    let parsed: {
      multipleChoice: Omit<MultipleChoiceQuestion, 'type'>[]
      shortAnswer: Omit<ShortAnswerQuestion, 'type'>[]
    }

    try {
      // Strip any accidental markdown code fences the model might add
      const clean = rawText.replace(/```json\n?|```\n?/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      console.error('Failed to parse AI response:', rawText)
      return NextResponse.json(
        { error: 'The AI returned an unexpected format. Please try again.' },
        { status: 500 }
      )
    }

    // 5. Add 'type' field and validate the structure
    if (!parsed.multipleChoice || !parsed.shortAnswer) {
      return NextResponse.json(
        { error: 'The AI response was incomplete. Please try again.' },
        { status: 500 }
      )
    }

    const mcQuestions: MultipleChoiceQuestion[] = parsed.multipleChoice.map(q => ({
      ...q,
      id: q.id || generateId(),
      type: 'multiple-choice' as const,
    }))

    const saQuestions: ShortAnswerQuestion[] = parsed.shortAnswer.map(q => ({
      ...q,
      id: q.id || generateId(),
      type: 'short-answer' as const,
    }))

    // 6. Build the final Quiz object
    const quiz: Quiz = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      sourceNotes: notes,
      multipleChoice: mcQuestions,
      shortAnswer: saQuestions,
    }

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error('Quiz generation error:', error)

    // Friendly error for missing API key
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'API key not configured. Please check your .env.local file.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
