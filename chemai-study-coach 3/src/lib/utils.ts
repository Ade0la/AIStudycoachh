/**
 * utils.ts — Small utility helpers used across the app.
 */

/** Generate a short unique ID (good enough for localStorage keys). */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** Format a date string like "May 30, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Return a CSS color class based on a score percentage. */
export function scoreColor(pct: number): string {
  if (pct >= 80) return 'text-green-600'
  if (pct >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

/** Return a background CSS color class based on a score percentage. */
export function scoreBgColor(pct: number): string {
  if (pct >= 80) return 'bg-green-100 text-green-800'
  if (pct >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
