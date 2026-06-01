/**
 * /api/extract-text
 *
 * POST (multipart/form-data) { file: File }
 * → { text: string }
 *
 * Handles:
 *  - PDF  → pdf-parse (pure JS, works on Vercel serverless)
 *  - Images (PNG/JPG) → Anthropic Claude vision API
 *
 * TXT files are handled client-side in FileUpload.tsx and never reach here.
 */

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ── PDF extraction ──────────────────────────────────────────────────────
    if (ext === 'pdf') {
      try {
        // Dynamic import avoids issues with pdf-parse's test file loading
        const pdfParse = (await import('pdf-parse')).default
        const result = await pdfParse(buffer)
        const text = result.text?.trim()

        if (!text) {
          return NextResponse.json(
            { error: 'No text found in this PDF. It may be a scanned image PDF — try exporting as text first.' },
            { status: 422 }
          )
        }

        return NextResponse.json({ text })
      } catch (err) {
        console.error('PDF parse error:', err)
        return NextResponse.json(
          { error: 'Could not parse this PDF. Make sure it is a text-based PDF, not a scanned image.' },
          { status: 422 }
        )
      }
    }

    // ── Image OCR via Claude vision ─────────────────────────────────────────
    if (['png', 'jpg', 'jpeg'].includes(ext ?? '')) {
      const mediaType = ext === 'png' ? 'image/png' : 'image/jpeg'
      const base64 = buffer.toString('base64')

      const message = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: `This is a photo of chemistry notes or a textbook page. 
Please extract ALL text visible in this image as accurately as possible.
Preserve equations, formulas, and structure where possible.
Output ONLY the extracted text, nothing else — no commentary, no "Here is the text:", just the raw content.`,
              },
            ],
          },
        ],
      })

      const text = message.content
        .filter(b => b.type === 'text')
        .map(b => (b as { type: 'text'; text: string }).text)
        .join('')
        .trim()

      if (!text) {
        return NextResponse.json(
          { error: 'Could not extract text from this image.' },
          { status: 422 }
        )
      }

      return NextResponse.json({ text })
    }

    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 })
  } catch (error) {
    console.error('extract-text error:', error)
    return NextResponse.json(
      { error: 'Text extraction failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Increase body size limit for file uploads (default is 4MB in Next.js)
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
}
