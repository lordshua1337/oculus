'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  Eye,
  FileText,
  Search,
  X,
  ChevronsUpDown,
} from 'lucide-react'
import type { ClientRow } from '@/lib/db/types'
import { OculusBadge, OculusInput } from '@/components/ui'
import { ArchetypeBadge } from '@/components/dna/ArchetypeBadge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils/constants'

// ---- Types -----------------------------------------------------------------

type SortKey = 'name' | 'aum' | 'status' | 'risk'
type SortDir = 'asc' | 'desc'

interface CRMTableProps {
  clients: ClientRow[]
}

// ---- Helpers ---------------------------------------------------------------

// Map ClientStatus to OculusBadge variant
const STATUS_VARIANT_MAP: Record<string, 'blue' | 'green' | 'orange' | 'yellow' | 'red' | 'purple'> = {
  lead: 'blue',
  onboarding: 'orange',
  active: 'green',
  review: 'purple',
  churned: 'red',
}

// Returns the colored dot style for a risk score
function getRiskDotColor(score: number): string {
  if (score > 66) return '#FF3B30'
  if (score >= 33) return '#FF9500'
  return '#34C759'
}

// Derive sort value for a client given a sort key
function getSortValue(client: ClientRow, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return `${client.last_name} ${client.first_name}`.toLowerCase()
    case 'aum':
      return client.aum
    case 'status':
      return client.status
    case 'risk':
      return client.risk_score
    default:
      return ''
  }
}

// ---- Sort Icon -------------------------------------------------------------

function SortIcon({ column, sortKey, sortDir }: {
  column: SortKey
  sortKey: SortKey
  sortDir: SortDir
}) {
  if (column !== sortKey) {
    return <ChevronsUpDown size={13} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
  }
  if (sortDir === 'asc') {
    return <ArrowUp size={13} style={{ color: 'var(--oculus-blue)' }} />
  }
  return <ArrowDown size={13} style={{ color: 'var(--oculus-blue)' }} />
}

// ---- Row animation variants ------------------------------------------------

const ROW_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
}

// ---- Component -------------------------------------------------------------

export function CRMTable({ clients }: CRMTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Handle column header click — toggle dir if same key, else set new key + asc
  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedFiltered = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = query
      ? clients.filter(c => {
          const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
          const statusLabel = STATUS_LABELS[c.status]?.toLowerCase() ?? ''
          return (
            fullName.includes(query) ||
            c.archetype.toLowerCase().includes(query) ||
            c.status.toLowerCase().includes(query) ||
            statusLabel.includes(query)
          )
        })
      : clients

    return [...filtered].sort((a, b) => {
      const aVal = getSortValue(a, sortKey)
      const bVal = getSortValue(b, sortKey)

      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }

      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [clients, search, sortKey, sortDir])

  // Columns definition for header rendering
  const columns: { label: string; key: SortKey | null; align?: 'right' }[] = [
    { label: 'Name', key: 'name' },
    { label: 'Archetype', key: null },
    { label: 'AUM', key: 'aum', align: 'right' },
    { label: 'Risk', key: 'risk' },
    { label: 'Status', key: 'status' },
    { label: 'Last Contact', key: null },
    { label: 'Actions', key: null },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search bar */}
      <div style={{ position: 'relative', maxWidth: '360px' }}>
        <OculusInput
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search size={15} />}
          aria-label="Search clients"
        />
        <AnimatePresence>
          {search.length > 0 && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={() => setSearch('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
                padding: '2px',
                borderRadius: '4px',
              }}
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Table scroll container */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '720px',
            fontSize: '13px',
          }}
        >
          {/* Header */}
          <thead>
            <tr
              style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {columns.map(col => (
                <th
                  key={col.label}
                  onClick={col.key ? () => handleSort(col.key!) : undefined}
                  style={{
                    padding: '10px 16px',
                    fontWeight: 500,
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: col.key === sortKey ? 'var(--oculus-blue)' : 'var(--text-muted)',
                    textAlign: col.align === 'right' ? 'right' : 'left',
                    cursor: col.key ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {col.key && (
                      <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedFiltered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '48px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                  }}
                >
                  No clients match your search
                </td>
              </tr>
            ) : (
              sortedFiltered.map((client, index) => {
                const fullName = `${client.first_name} ${client.last_name}`
                const riskDotColor = getRiskDotColor(client.risk_score)
                const statusVariant = STATUS_VARIANT_MAP[client.status] ?? 'blue'
                const shouldAnimate = index < 15

                const rowContent = (
                  <>
                    {/* Name */}
                    <td style={{ padding: '0 16px', minHeight: '56px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '10px 0' }}>
                        <Link
                          href={`/dashboard/crm/${client.id}`}
                          style={{
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--oculus-blue)'
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'
                          }}
                        >
                          {fullName}
                        </Link>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {client.email}
                        </span>
                      </div>
                    </td>

                    {/* Archetype */}
                    <td style={{ padding: '0 16px' }}>
                      <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
                    </td>

                    {/* AUM */}
                    <td
                      style={{
                        padding: '0 16px',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatCurrency(client.aum, { compact: true })}
                    </td>

                    {/* Risk */}
                    <td style={{ padding: '0 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: riskDotColor,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>
                          {client.risk_score}
                        </span>
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0 16px' }}>
                      <OculusBadge variant={statusVariant}>
                        {STATUS_LABELS[client.status]}
                      </OculusBadge>
                    </td>

                    {/* Last Contact */}
                    <td
                      style={{
                        padding: '0 16px',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {client.last_contact_at
                        ? formatRelativeTime(client.last_contact_at)
                        : 'Never'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Link
                          href={`/dashboard/crm/${client.id}`}
                          title="View client"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-muted)',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--oculus-blue)'
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'
                          }}
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          title="Notes (coming soon)"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: 0,
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--oculus-blue)'
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                          }}
                        >
                          <FileText size={15} />
                        </button>
                      </span>
                    </td>
                  </>
                )

                const rowStyle: React.CSSProperties = {
                  borderBottom: '1px solid var(--border)',
                  backgroundColor:
                    index % 2 === 0
                      ? 'var(--bg-primary)'
                      : 'var(--bg-secondary)',
                  transition: 'background-color 0.15s',
                  minHeight: '56px',
                }

                if (shouldAnimate) {
                  return (
                    <motion.tr
                      key={client.id}
                      custom={index}
                      variants={ROW_VARIANTS}
                      initial="hidden"
                      animate="visible"
                      style={rowStyle}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          'rgba(0, 109, 216, 0.04)'
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                          index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'
                      }}
                    >
                      {rowContent}
                    </motion.tr>
                  )
                }

                return (
                  <tr
                    key={client.id}
                    style={rowStyle}
                    onMouseEnter={e => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        'rgba(0, 109, 216, 0.04)'
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                        index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)'
                    }}
                  >
                    {rowContent}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
