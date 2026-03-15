// Demo clients adapter for the Oculus advisor platform.
// Bridges DemoClient (demo-data.ts) to ClientRow / ClientNote (db/types.ts).
// All functions return new objects — no mutation.

import { DEMO_CLIENTS } from './demo-data'
import type { DemoClient } from './demo-data'
import type { ClientRow, ClientNote, NoteType } from './db/types'

// Re-export DemoClient so consumers can import from one place if needed.
export type { DemoClient }

// ---- Mode Detection ----

/**
 * Returns true when no Supabase URL is configured or we are running on the
 * server without a real database.  In practice this is always true for the
 * current demo build.
 */
export function isDemoMode(): boolean {
  return typeof window === 'undefined' || !process.env.NEXT_PUBLIC_SUPABASE_URL
}

// ---- Field Mapping ----

/**
 * Maps a single DemoClient to the ClientRow shape expected by the rest of the
 * application.  Returns a brand-new object — the source demo object is never
 * touched.
 */
export function demoClientToClientRow(demo: DemoClient): ClientRow {
  return {
    id: demo.id,
    first_name: demo.first_name,
    last_name: demo.last_name,
    email: demo.email,
    phone: demo.phone,
    status: demo.status,
    aum: demo.aum,
    brand_color: demo.brand_color,
    last_contact_at: demo.last_contact_at,
    next_review_at: demo.next_review_at,
    created_at: demo.created_at,
    updated_at: demo.updated_at,
    archetype: demo.dna.archetype.primary,
    dna_profile: demo.dna,
    risk_score: demo.dna.factors.RP.normalized,
  }
}

// ---- Bulk Accessors ----

/**
 * Returns all demo clients mapped to ClientRow objects.
 */
export function getDemoClientRows(): ClientRow[] {
  return DEMO_CLIENTS.map(demoClientToClientRow)
}

/**
 * Finds a demo client by id and returns it as a ClientRow.
 * Returns undefined when no match is found.
 */
export function getDemoClientById(id: string): ClientRow | undefined {
  const match = DEMO_CLIENTS.find((c) => c.id === id)
  if (match === undefined) {
    return undefined
  }
  return demoClientToClientRow(match)
}

// ---- localStorage Note Store ----

function notesKey(clientId: string): string {
  return `oculus_notes_${clientId}`
}

function readNotesFromStorage(clientId: string): ClientNote[] {
  try {
    const raw = window.localStorage.getItem(notesKey(clientId))
    if (raw === null) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as ClientNote[]
  } catch {
    return []
  }
}

function writeNotesToStorage(clientId: string, notes: ClientNote[]): void {
  window.localStorage.setItem(notesKey(clientId), JSON.stringify(notes))
}

/**
 * Reads persisted notes for a client from localStorage.
 * Returns an empty array on the server or on any parse error.
 */
export function getDemoNotes(clientId: string): ClientNote[] {
  if (typeof window === 'undefined') {
    return []
  }
  return readNotesFromStorage(clientId)
}

/**
 * Saves a new note for a client to localStorage.
 * Generates a UUID id and ISO timestamp automatically.
 * Returns the newly created ClientNote — never mutates the input.
 */
export function saveDemoNote(note: {
  readonly client_id: string
  readonly type: NoteType
  readonly content: string
}): ClientNote {
  const newNote: ClientNote = {
    id: crypto.randomUUID(),
    client_id: note.client_id,
    type: note.type,
    content: note.content,
    created_at: new Date().toISOString(),
  }

  const existing = readNotesFromStorage(note.client_id)
  writeNotesToStorage(note.client_id, [...existing, newNote])

  return newNote
}
