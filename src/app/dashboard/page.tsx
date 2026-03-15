'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import { MetricCard, OculusCard, OculusBadge, OculusInput, EmptyState } from '@/components/ui'
import { ArchetypeBadge } from '@/components/dna'
import { getDemoStats } from '@/lib/demo-data'
import { getDemoClientRows } from '@/lib/demo-clients'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils/format'
import { STATUS_LABELS } from '@/lib/utils/constants'
import type { ClientStatus } from '@/lib/db/types'

// ---- Types -----------------------------------------------------------------

type StatusFilter = 'all' | ClientStatus

// ---- Constants -------------------------------------------------------------

const STATUS_BADGE_VARIANT: Record<ClientStatus, 'blue' | 'orange' | 'green' | 'purple' | 'red'> =
  {
    lead: 'blue',
    onboarding: 'orange',
    active: 'green',
    review: 'purple',
    churned: 'red',
  }

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Lead', value: 'lead' },
  { label: 'Review', value: 'review' },
  { label: 'Churned', value: 'churned' },
]

// ---- Sub-components --------------------------------------------------------

function ClientAvatar({
  firstName,
  lastName,
  brandColor,
}: {
  firstName: string
  lastName: string
  brandColor: string
}) {
  const initials = getInitials(firstName, lastName)
  const hex = brandColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const bg = `rgba(${r}, ${g}, ${b}, 0.14)`

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        borderRadius: '10px',
        backgroundColor: bg,
        color: brandColor,
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

// ---- Page ------------------------------------------------------------------

export default function DashboardPage() {
  const stats = getDemoStats()
  const allClients = getDemoClientRows()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredClients = useMemo(() => {
    const sorted = [...allClients].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    return sorted
      .filter((c) => {
        const matchesSearch =
          search.trim() === '' ||
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .slice(0, 5)
  }, [allClients, search, statusFilter])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '32px 32px 48px',
        maxWidth: 1400,
        margin: '0 auto',
        backgroundColor: 'var(--bg-base)',
        minHeight: '100vh',
      }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.04 }}
        style={{ marginBottom: '32px' }}
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
          Command Center
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: '6px',
            marginBottom: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Real-time overview of your advisory practice
        </p>
      </motion.div>

      {/* Metric cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <MetricCard
          label="Total AUM"
          value={formatCurrency(stats.totalAUM, { compact: true })}
          delta="+4.2% this quarter"
          deltaType="positive"
          icon={<DollarSign size={18} />}
        />
        <MetricCard
          label="Active Clients"
          value={stats.activeCount}
          delta={`${stats.clientCount} total`}
          deltaType="neutral"
          icon={<Users size={18} />}
        />
        <MetricCard
          label="Avg Risk Score"
          value={stats.avgRiskScore}
          delta="Moderate"
          deltaType="neutral"
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          label="Pending Reviews"
          value={stats.reviewCount}
          delta="Action needed"
          deltaType="negative"
          icon={<AlertTriangle size={18} />}
        />
      </motion.div>

      {/* Recent Clients card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
      >
        <OculusCard style={{ padding: 0, overflow: 'hidden' }}>
          {/* Card header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '20px 24px 0',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Recent Clients
            </h2>
            <div style={{ width: '240px', minWidth: '180px' }}>
              <OculusInput
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={14} />}
                aria-label="Search clients by name"
              />
            </div>
          </div>

          {/* Status filter tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '16px 24px 0',
              overflowX: 'auto',
            }}
          >
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
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
                  backgroundColor:
                    statusFilter === filter.value ? 'var(--oculus-blue)' : 'var(--bg-input)',
                  color: statusFilter === filter.value ? '#ffffff' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
                aria-pressed={statusFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--border)',
              margin: '16px 0 0',
            }}
          />

          {/* Table */}
          {filteredClients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients found"
              description="Try adjusting your search or status filter to find what you're looking for."
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {/* Table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.6fr 1fr 1fr 1fr',
                  gap: '0 16px',
                  padding: '10px 24px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {['Name', 'Archetype', 'AUM', 'Status', 'Last Contact'].map((col) => (
                  <span
                    key={col}
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {col}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              <div>
                {filteredClients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: 0.22 + index * 0.05 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.6fr 1fr 1fr 1fr',
                      gap: '0 16px',
                      padding: '14px 24px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.backgroundColor =
                        'var(--oculus-blue-soft)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    {/* Name cell */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <ClientAvatar
                        firstName={client.first_name}
                        lastName={client.last_name}
                        brandColor={client.brand_color}
                      />
                      <Link
                        href={`/dashboard/crm/${client.id}`}
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.01em',
                          textDecoration: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          transition: 'color 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--oculus-blue)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                        }}
                      >
                        {client.first_name} {client.last_name}
                      </Link>
                    </div>

                    {/* Archetype cell */}
                    <div>
                      <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
                    </div>

                    {/* AUM cell */}
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        letterSpacing: '-0.01em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCurrency(client.aum, { compact: true })}
                    </span>

                    {/* Status cell */}
                    <div>
                      <OculusBadge variant={STATUS_BADGE_VARIANT[client.status]}>
                        {STATUS_LABELS[client.status]}
                      </OculusBadge>
                    </div>

                    {/* Last Contact cell */}
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {formatRelativeTime(client.last_contact_at)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Footer link */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: filteredClients.length > 0 ? '1px solid var(--border)' : undefined,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Link
              href="/dashboard/crm"
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--oculus-blue)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.opacity = '0.7'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.opacity = '1'
              }}
            >
              View all {allClients.length} clients &rarr;
            </Link>
          </div>
        </OculusCard>
      </motion.div>
    </motion.div>
  )
}
