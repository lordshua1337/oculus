// GET  /api/clients/[clientId]/notes — returns all notes for a client
// POST /api/clients/[clientId]/notes — saves a new note for a client
//
// Demo mode only. Notes are persisted to localStorage via saveDemoNote.
// Non-demo mode returns empty notes (GET) or 404 (POST).

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoNotes, saveDemoNote } from '@/lib/demo-clients'
import type { NoteType } from '@/lib/db/types'

const VALID_NOTE_TYPES: ReadonlyArray<NoteType> = [
  'general',
  'meeting',
  'call',
  'compliance',
  'review',
]

function isValidNoteType(value: unknown): value is NoteType {
  return typeof value === 'string' && VALID_NOTE_TYPES.includes(value as NoteType)
}

interface RouteContext {
  params: Promise<{ clientId: string }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { clientId } = await context.params

  if (!isDemoMode()) {
    return NextResponse.json({ notes: [] }, { status: 200 })
  }

  const notes = getDemoNotes(clientId)
  return NextResponse.json({ notes }, { status: 200 })
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { clientId } = await context.params

  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const raw = body as Record<string, unknown>

  const { content, type } = raw

  if (typeof content !== 'string' || content.trim().length < 1) {
    return NextResponse.json(
      { error: 'content is required and must be a non-empty string' },
      { status: 400 }
    )
  }

  if (!isValidNoteType(type)) {
    return NextResponse.json(
      { error: `type is required and must be one of: ${VALID_NOTE_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  const note = saveDemoNote({
    client_id: clientId,
    type,
    content: content.trim(),
  })

  return NextResponse.json({ note }, { status: 201 })
}
