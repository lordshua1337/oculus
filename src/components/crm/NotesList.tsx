'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Check } from 'lucide-react'
import { OculusCard, OculusButton, OculusBadge, EmptyState } from '@/components/ui'
import { formatRelativeTime } from '@/lib/utils/format'
import type { NoteType } from '@/lib/db/types'

// Shape stored in localStorage — flat, no DB dependency.
interface LocalNote {
  readonly id: string
  readonly client_id: string
  readonly advisor_id: string
  readonly title: string
  readonly content: string
  readonly note_type: NoteType
  readonly tags: string[]
  readonly created_at: string
}

const NOTE_TYPE_BADGE: Record<NoteType, 'blue' | 'green' | 'orange' | 'purple' | 'yellow'> = {
  general: 'yellow',
  meeting: 'blue',
  call: 'green',
  compliance: 'orange',
  review: 'purple',
}

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  general: 'General',
  meeting: 'Meeting',
  call: 'Call',
  compliance: 'Compliance',
  review: 'Review',
}

const MAX_CONTENT_LENGTH = 10000

function loadNotes(clientId: string): LocalNote[] {
  try {
    const raw = localStorage.getItem(`oculus-notes-${clientId}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistNotes(clientId: string, notes: LocalNote[]): void {
  localStorage.setItem(`oculus-notes-${clientId}`, JSON.stringify(notes))
}

interface NotesListProps {
  clientId: string
}

export function NotesList({ clientId }: NotesListProps) {
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [addingNote, setAddingNote] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('general')
  const [contentError, setContentError] = useState<string | null>(null)

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load from localStorage on mount / when clientId changes.
  useEffect(() => {
    setNotes(loadNotes(clientId))
  }, [clientId])

  // Auto-focus textarea when form opens.
  useEffect(() => {
    if (addingNote && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [addingNote])

  function showToast(message: string) {
    setToast(message)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 2500)
  }

  function handleOpenForm() {
    setAddingNote(true)
    setContent('')
    setNoteType('general')
    setContentError(null)
  }

  function handleCancel() {
    setAddingNote(false)
    setContent('')
    setNoteType('general')
    setContentError(null)
  }

  function handleContentChange(value: string) {
    setContent(value)
    if (contentError) setContentError(null)
  }

  function handleSaveNote() {
    const trimmed = content.trim()

    if (!trimmed) {
      setContentError('Note content is required.')
      return
    }

    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setContentError(`Note content must be ${MAX_CONTENT_LENGTH.toLocaleString()} characters or fewer.`)
      return
    }

    const newNote: LocalNote = {
      id: crypto.randomUUID(),
      client_id: clientId,
      advisor_id: 'demo-advisor',
      title: '',
      content: trimmed,
      note_type: noteType,
      tags: [],
      created_at: new Date().toISOString(),
    }

    const updated = [newNote, ...notes]
    setNotes(updated)
    persistNotes(clientId, updated)
    setAddingNote(false)
    setContent('')
    setNoteType('general')
    setContentError(null)
    showToast('Note saved successfully.')
  }

  // Sort descending by created_at.
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Notes
          {sortedNotes.length > 0 && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                letterSpacing: '0',
              }}
            >
              {sortedNotes.length}
            </span>
          )}
        </h3>

        {!addingNote && (
          <OculusButton variant="primary" size="sm" onClick={handleOpenForm}>
            <Plus size={12} />
            Add Note
          </OculusButton>
        )}
      </div>

      {/* Add note form */}
      <AnimatePresence>
        {addingNote && (
          <motion.div
            key="add-note-form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <OculusCard style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Textarea */}
                <div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="What happened in this meeting? What did the client say? What's the follow-up?"
                    rows={4}
                    style={{
                      display: 'block',
                      width: '100%',
                      minHeight: '80px',
                      resize: 'vertical',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: `1px solid ${contentError ? '#ef4444' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-input)',
                      padding: '10px 14px',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      fontWeight: 350,
                      lineHeight: 1.5,
                      letterSpacing: '-0.01em',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                    }}
                    onFocus={(e) => {
                      if (!contentError) {
                        e.currentTarget.style.borderColor = 'var(--oculus-blue)'
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--oculus-blue-soft)'
                      }
                    }}
                    onBlur={(e) => {
                      if (!contentError) {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  />
                  {/* Character count + error */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: contentError ? 'space-between' : 'flex-end',
                      marginTop: '4px',
                    }}
                  >
                    {contentError && (
                      <span style={{ fontSize: '12px', color: '#ef4444' }}>
                        {contentError}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        color: content.length > MAX_CONTENT_LENGTH ? '#ef4444' : 'var(--text-muted)',
                      }}
                    >
                      {content.length.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Type dropdown */}
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as NoteType)}
                  className="oculus-select"
                  style={{ maxWidth: '200px' }}
                >
                  <option value="general">General</option>
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="compliance">Compliance</option>
                  <option value="review">Review</option>
                </select>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <OculusButton variant="primary" size="sm" onClick={handleSaveNote}>
                    Save Note
                  </OculusButton>
                  <OculusButton variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </OculusButton>
                </div>
              </div>
            </OculusCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes list or empty state */}
      {sortedNotes.length === 0 && !addingNote ? (
        <OculusCard>
          <EmptyState
            icon={FileText}
            title="No notes yet"
            description="Add your first note to start tracking this client."
          />
        </OculusCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence initial={false}>
            {sortedNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.22,
                  ease: 'easeOut',
                  delay: index * 0.04,
                }}
              >
                <OculusCard style={{ padding: '16px 20px' }}>
                  {/* Top row: badge + date */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <OculusBadge variant={NOTE_TYPE_BADGE[note.note_type]}>
                      {NOTE_TYPE_LABELS[note.note_type]}
                    </OculusBadge>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {formatRelativeTime(note.created_at)}
                    </span>
                  </div>

                  {/* Note content */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {note.content}
                  </p>
                </OculusCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Toast — fixed bottom-right */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 9999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#00b982',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 16px rgba(0, 185, 130, 0.35)',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <Check size={14} strokeWidth={2.5} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
