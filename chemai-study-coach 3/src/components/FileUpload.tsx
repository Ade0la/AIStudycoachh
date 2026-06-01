/**
 * FileUpload.tsx
 * Lets users upload a PDF, TXT, PNG, or JPG file.
 * Extracted text is passed back via onTextExtracted so NoteInput
 * can drop it straight into the notes textarea.
 *
 * Text extraction strategy:
 *  - TXT  → read with FileReader in the browser (no server needed)
 *  - PDF  → send to /api/extract-text (uses pdf-parse on the server)
 *  - Images → send to /api/extract-text (uses Claude vision on the server)
 */

'use client'

import { useRef, useState } from 'react'

interface FileUploadProps {
  onTextExtracted: (text: string) => void
}

const ACCEPTED = '.pdf,.txt,.png,.jpg,.jpeg'
const MAX_SIZE_MB = 10

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  async function processFile(file: File) {
    // Size guard
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setStatus('error')
      setMessage(`File is too large. Max size is ${MAX_SIZE_MB}MB.`)
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()

    // ── TXT: read directly in browser ──────────────────────────────────────
    if (ext === 'txt') {
      setStatus('loading')
      setMessage('Reading text file…')
      try {
        const text = await readFileAsText(file)
        if (!text.trim()) throw new Error('The file appears to be empty.')
        onTextExtracted(text)
        setStatus('done')
        setMessage(`✓ Loaded "${file.name}"`)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Failed to read file.')
      }
      return
    }

    // ── PDF or Image: send to server route ─────────────────────────────────
    if (ext === 'pdf' || ['png', 'jpg', 'jpeg'].includes(ext ?? '')) {
      setStatus('loading')
      setMessage(ext === 'pdf' ? 'Extracting text from PDF…' : 'Reading image with AI…')
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Extraction failed.')
        if (!data.text?.trim()) throw new Error('No readable text found in this file.')

        onTextExtracted(data.text)
        setStatus('done')
        setMessage(`✓ Loaded "${file.name}"`)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Failed to extract text.')
      }
      return
    }

    setStatus('error')
    setMessage('Unsupported file type. Please use PDF, TXT, PNG, or JPG.')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  return (
    <div className="w-full">
      {/* Drop zone / click trigger */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center gap-2
          border-2 border-dashed rounded-xl p-6 cursor-pointer
          transition-colors duration-150
          ${isDragging
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-white dark:bg-gray-900'
          }
          ${status === 'loading' ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        {/* Icon */}
        <div className="text-2xl">
          {status === 'loading' ? '⏳' : status === 'done' ? '✅' : status === 'error' ? '⚠️' : '📄'}
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {status === 'loading'
              ? message
              : 'Upload a file'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            PDF, TXT, PNG, JPG · drag & drop or click
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Status message below the zone */}
      {(status === 'done' || status === 'error') && (
        <p className={`mt-2 text-xs px-1 ${status === 'done' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {message}
          {status === 'done' && (
            <button
              onClick={() => { setStatus('idle'); setMessage('') }}
              className="ml-2 underline opacity-60 hover:opacity-100"
            >
              clear
            </button>
          )}
        </p>
      )}
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsText(file)
  })
}
