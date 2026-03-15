'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, Table2 } from 'lucide-react'
import { getDemoClientRows } from '@/lib/demo-clients'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils/constants'
import { CRMKanban, CRMTable } from '@/components/crm'
import type { ClientStatus } from '@/lib/db/types'

// ---- Types -----------------------------------------------------------------

type ViewMode = 'kanban' | 'table'
type StatusFilter = 'all' | ClientStatus

// ---- Constants -------------------------------------------------------------

export const CRM_COLUMNS: ReadonlyArray<{
  readonly status: ClientStatus
  readonly label: string
  readonly color: string
}> = [
  { status: 'lead', label: STATUS_LABELS.lead, color: STATUS_COLORS.lead },
  { status: 'onboarding', label: STATUS_LABELS.onboarding, color: STATUS_COLORS.onboarding },
  { status: 'active', label: STATUS_LABELS.active, color: STATUS_COLORS.active },
  { status: 'review', label: STATUS_LABELS.review, color: STATUS_COLORS.review },
  { status: 'churned', label: STATUS_LABELS.churned, color: STATUS_COLORS.churned },
] as const

const STATUS_FILTER_ORDER: ReadonlyArray<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Lead', value: 'lead' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Active', value: 'active' },
  { label: 'Review', value: 'review' },
  { label: 'Churned', value: 'churned' },
] as const

// ---- Page ------------------------------------------------------------------

export default function CRMPage() {
  const clients = getDemoClientRows()

  const [view, setView] = useState<ViewMode>('kanban')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredClients = useMemo(() => {
    if (statusFilter === 'all') {
      return clients
    }
    return clients.filter((c) => c.status === statusFilter)
  }, [clients, statusFilter])

  // Count per status for filter tabs
  const statusCounts = useMemo<Record<StatusFilter, number>>(() => {
    const counts: Record<StatusFilter, number> = {
      all: clients.length,
      lead: 0,
      onboarding: 0,
      active: 0,
      review: 0,
      churned: 0,
    }
    for (const c of clients) {
      counts[c.status] = (counts[c.status] ?? 0) + 1
    }
    return counts
  }, [clients])

  return (
    <div
      style={{
        padding: '32px 32px 48px',
        maxWidth: 1400,
        margin: '0 auto',
        backgroundColor: 'var(--bg-base)',
        minHeight: '100vh',
      }}
    >
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Client Pipeline
        </h1>

        {/* View toggle */}
        <div
          role="group"
          aria-label="View mode"
          style={{
            display: 'flex',
            gap: '4px',
            padding: '4px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <button
            onClick={() => setView('kanban')}
            aria-pressed={view === 'kanban'}
            title="Kanban view"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, color 150ms ease',
              backgroundColor: view === 'kanban' ? 'var(--oculus-blue)' : 'transparent',
              color: view === 'kanban' ? '#ffffff' : 'var(--text-muted)',
              fontFamily: 'inherit',
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('table')}
            aria-pressed={view === 'table'}
            title="Table view"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 150ms ease, color 150ms ease',
              backgroundColor: view === 'table' ? 'var(--oculus-blue)' : 'transparent',
              color: view === 'table' ? '#ffffff' : 'var(--text-muted)',
              fontFamily: 'inherit',
            }}
          >
            <Table2 size={16} />
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div
        role="tablist"
        aria-label="Filter by client status"
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '24px',
          overflowX: 'auto',
        }}
      >
        {STATUS_FILTER_ORDER.map((filter) => {
          const isActive = statusFilter === filter.value
          return (
            <button
              key={filter.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setStatusFilter(filter.value)}
              style={{
                padding: '5px 14px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'background-color 150ms ease, color 150ms ease',
                backgroundColor: isActive ? 'var(--oculus-blue)' : 'var(--bg-input)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
              }}
            >
              {filter.label}{' '}
              <span
                style={{
                  opacity: isActive ? 0.8 : 0.6,
                  fontSize: '11px',
                }}
              >
                {statusCounts[filter.value]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main view */}
      {view === 'kanban' ? (
        <CRMKanban clients={filteredClients} />
      ) : (
        <CRMTable clients={filteredClients} />
      )}
    </div>
  )
}
