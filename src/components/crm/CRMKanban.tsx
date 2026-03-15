'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical } from 'lucide-react'
import { OculusCard } from '@/components/ui/OculusCard'
import { ArchetypeBadge } from '@/components/dna/ArchetypeBadge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants'
import type { ClientRow, ClientStatus } from '@/lib/db/types'

// ---- Constants ---------------------------------------------------------------

const STORAGE_KEY = 'oculus-crm-order'

const COLUMN_ORDER: ClientStatus[] = [
  'lead',
  'onboarding',
  'active',
  'review',
  'churned',
]

interface ColumnConfig {
  readonly id: ClientStatus
  readonly label: string
  readonly color: string
}

const COLUMNS: readonly ColumnConfig[] = COLUMN_ORDER.map((id) => ({
  id,
  label: STATUS_LABELS[id],
  color: STATUS_COLORS[id],
}))

// ---- Types -------------------------------------------------------------------

type GroupedClients = Record<ClientStatus, ClientRow[]>

// ---- Persistence helpers -----------------------------------------------------

function loadOrder(): Partial<Record<string, string[]>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<Record<string, string[]>>) : {}
  } catch {
    return {}
  }
}

function saveOrder(grouped: GroupedClients): void {
  if (typeof window === 'undefined') return
  try {
    const order: Record<string, string[]> = {}
    for (const status of COLUMN_ORDER) {
      order[status] = grouped[status].map((c) => c.id)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // localStorage may be unavailable — silently skip
  }
}

// ---- Grouping with optional localStorage order restoration ------------------

function groupClients(
  clients: ClientRow[],
  savedOrder: Partial<Record<string, string[]>>
): GroupedClients {
  // Build an id -> client map for O(1) lookup
  const byId = new Map<string, ClientRow>(clients.map((c) => [c.id, c]))

  const grouped: GroupedClients = {
    lead: [],
    onboarding: [],
    active: [],
    review: [],
    churned: [],
  }

  // Restore order from localStorage first
  for (const status of COLUMN_ORDER) {
    const orderedIds = savedOrder[status] ?? []
    for (const id of orderedIds) {
      const client = byId.get(id)
      // Only restore if the client still exists in the current status column
      if (client && client.status === status) {
        grouped[status].push(client)
        byId.delete(id)
      }
    }
  }

  // Place remaining clients (new ones or those whose status changed) into
  // their actual status column, appended after any restored entries
  for (const client of byId.values()) {
    grouped[client.status].push(client)
  }

  return grouped
}

// ---- CRMCard sub-component --------------------------------------------------

interface CRMCardProps {
  readonly client: ClientRow
  readonly isDragging?: boolean
}

function CRMCard({ client, isDragging = false }: CRMCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: client.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      layout
    >
      <OculusCard
        style={{
          padding: '14px 16px',
          cursor: 'default',
          transform: isDragging ? 'scale(1.02)' : undefined,
          boxShadow: isDragging
            ? '0 12px 32px rgba(0, 109, 216, 0.22), 0 4px 12px rgba(0, 0, 0, 0.12)'
            : undefined,
          border: isDragging ? '1.5px solid #006DD8' : undefined,
          transition: 'transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          {/* Drag handle */}
          <button
            {...listeners}
            {...attributes}
            aria-label="Drag to reorder"
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'grab',
              color: 'var(--text-muted)',
              flexShrink: 0,
              marginTop: '1px',
              touchAction: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <GripVertical size={14} strokeWidth={2} />
          </button>

          {/* Card body */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + archetype row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <Link
                href={`/dashboard/crm/${client.id}`}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {client.first_name} {client.last_name}
              </Link>
              <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
            </div>

            {/* AUM + last contact row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--oculus-blue)',
                  letterSpacing: '-0.01em',
                }}
              >
                {formatCurrency(client.aum, { compact: true })}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatRelativeTime(client.last_contact_at)}
              </span>
            </div>
          </div>
        </div>
      </OculusCard>
    </motion.div>
  )
}

// ---- CRMColumn sub-component ------------------------------------------------

interface CRMColumnProps {
  readonly column: ColumnConfig
  readonly clients: ClientRow[]
}

function CRMColumn({ column, clients }: CRMColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const clientIds = clients.map((c) => c.id)

  // Parse column color hex -> rgba for background tint
  const hex = column.color
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const headerBg = `rgba(${r}, ${g}, ${b}, 0.08)`
  const dropHighlight = `rgba(${r}, ${g}, ${b}, 0.06)`

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '260px',
        width: '260px',
        flexShrink: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '12px 12px 0 0',
          backgroundColor: headerBg,
          border: `1px solid rgba(${r}, ${g}, ${b}, 0.15)`,
          borderBottom: 'none',
          marginBottom: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Status dot */}
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: column.color,
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {column.label}
          </span>
        </div>
        {/* Count badge */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: column.color,
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
            borderRadius: '10px',
            padding: '2px 8px',
            lineHeight: 1.6,
            minWidth: '22px',
            textAlign: 'center',
          }}
        >
          {clients.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px',
          minHeight: '120px',
          borderRadius: '0 0 14px 14px',
          border: `1px solid rgba(${r}, ${g}, ${b}, 0.15)`,
          borderTop: 'none',
          backgroundColor: isOver ? dropHighlight : 'var(--bg-card)',
          transition: 'background-color 150ms ease',
        }}
      >
        <SortableContext items={clientIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {clients.map((client) => (
              <CRMCard key={client.id} client={client} />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Empty state */}
        {clients.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 12px',
              border: `1.5px dashed rgba(${r}, ${g}, ${b}, 0.25)`,
              borderRadius: '10px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Drop clients here
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ---- Drag overlay card (no useSortable — standalone render) -----------------

function DragOverlayCard({ client }: { readonly client: ClientRow }) {
  return (
    <OculusCard
      style={{
        padding: '14px 16px',
        transform: 'scale(1.02)',
        boxShadow: '0 12px 32px rgba(0, 109, 216, 0.22), 0 4px 12px rgba(0, 0, 0, 0.12)',
        border: '1.5px solid #006DD8',
        cursor: 'grabbing',
        pointerEvents: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span
          style={{
            color: 'var(--text-muted)',
            flexShrink: 0,
            marginTop: '1px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <GripVertical size={14} strokeWidth={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {client.first_name} {client.last_name}
            </span>
            <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--oculus-blue)',
                letterSpacing: '-0.01em',
              }}
            >
              {formatCurrency(client.aum, { compact: true })}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {formatRelativeTime(client.last_contact_at)}
            </span>
          </div>
        </div>
      </div>
    </OculusCard>
  )
}

// ---- Main CRMKanban component -----------------------------------------------

interface CRMKanbanProps {
  readonly clients: ClientRow[]
  readonly onStatusChange?: (clientId: string, newStatus: ClientStatus) => void
}

export function CRMKanban({ clients, onStatusChange }: CRMKanbanProps) {
  const [grouped, setGrouped] = useState<GroupedClients>(() =>
    groupClients(clients, loadOrder())
  )
  const [activeCard, setActiveCard] = useState<ClientRow | null>(null)

  // Sync if the prop clients array changes (e.g. after server refresh)
  useEffect(() => {
    setGrouped(groupClients(clients, loadOrder()))
  }, [clients])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const draggedId = event.active.id as string
      let found: ClientRow | undefined
      for (const status of COLUMN_ORDER) {
        found = grouped[status].find((c) => c.id === draggedId)
        if (found) break
      }
      setActiveCard(found ?? null)
    },
    [grouped]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveCard(null)

      if (!over) return

      const draggedId = active.id as string
      const overId = over.id as string

      // Find source column
      let sourceStatus: ClientStatus | null = null
      for (const status of COLUMN_ORDER) {
        if (grouped[status].some((c) => c.id === draggedId)) {
          sourceStatus = status
          break
        }
      }

      if (!sourceStatus) return

      // Determine target column — over.id can be a column id or a card id
      let targetStatus: ClientStatus | null = null
      if ((COLUMN_ORDER as readonly string[]).includes(overId)) {
        targetStatus = overId as ClientStatus
      } else {
        // over.id is a card id — find which column it belongs to
        for (const status of COLUMN_ORDER) {
          if (grouped[status].some((c) => c.id === overId)) {
            targetStatus = status
            break
          }
        }
      }

      if (!targetStatus) return
      if (sourceStatus === targetStatus) return

      // Move the card to the target column
      setGrouped((prev) => {
        const sourceList = prev[sourceStatus!].filter((c) => c.id !== draggedId)
        const movedClient = prev[sourceStatus!].find((c) => c.id === draggedId)
        if (!movedClient) return prev

        const updatedClient: ClientRow = { ...movedClient, status: targetStatus! }
        const targetList = [...prev[targetStatus!], updatedClient]

        const next: GroupedClients = {
          ...prev,
          [sourceStatus!]: sourceList,
          [targetStatus!]: targetList,
        }

        saveOrder(next)
        return next
      })

      onStatusChange?.(draggedId, targetStatus)
    },
    [grouped, onStatusChange]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'flex-start',
        }}
      >
        {COLUMNS.map((column) => (
          <CRMColumn
            key={column.id}
            column={column}
            clients={grouped[column.id]}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeCard ? <DragOverlayCard client={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
