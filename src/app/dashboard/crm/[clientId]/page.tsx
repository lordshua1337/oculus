'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { getDemoClientById } from '@/lib/demo-clients'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import { STATUS_LABELS } from '@/lib/utils/constants'
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format'
import { getRiskLabel } from '@/lib/utils/constants'
import { OculusCard, OculusBadge } from '@/components/ui'
import {
  ArchetypeBadge,
  ArchetypeCard,
  RadarChartV2,
  FactorBars,
  BiasGrid,
  MarketMoodIndicator,
  BehaviorFlags,
} from '@/components/dna'
import { NotesList, HoldingsTable } from '@/components/crm'
import type { ClientStatus } from '@/lib/db/types'

// ---- Types -----------------------------------------------------------------

type TabKey = 'dna' | 'notes' | 'portfolio'

// ---- Constants -------------------------------------------------------------

const STATUS_BADGE_VARIANT: Record<ClientStatus, 'blue' | 'orange' | 'green' | 'purple' | 'red'> =
  {
    lead: 'blue',
    onboarding: 'orange',
    active: 'green',
    review: 'purple',
    churned: 'red',
  }

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: 'dna', label: 'DNA' },
  { key: 'notes', label: 'Notes' },
  { key: 'portfolio', label: 'Portfolio' },
]

// ---- Helper ----------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

// ---- Sub-components --------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '12px',
      }}
    >
      {children}
    </span>
  )
}

// ---- Page ------------------------------------------------------------------

export default function ClientDetailPage() {
  const { clientId } = useParams() as { clientId: string }
  const client = getDemoClientById(clientId)
  const [activeTab, setActiveTab] = useState<TabKey>('dna')

  // --- Not found state ---
  if (client === undefined) {
    return (
      <div
        style={{
          padding: '32px',
          maxWidth: 1400,
          margin: '0 auto',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <p
          style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          Client not found
        </p>
        <Link
          href="/dashboard/crm"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--oculus-blue)',
            textDecoration: 'none',
          }}
        >
          &larr; Back to Clients
        </Link>
      </div>
    )
  }

  // --- Archetype color setup ---
  const archetypeInfo = ARCHETYPE_INFO[client.archetype]
  const archetypeColor = archetypeInfo?.color ?? '#006DD8'
  const { r, g, b } = hexToRgb(archetypeColor)
  const heroTint = `rgba(${r}, ${g}, ${b}, 0.04)`

  return (
    <div
      style={{
        padding: '32px 32px 64px',
        maxWidth: 1400,
        margin: '0 auto',
        backgroundColor: 'var(--bg-base)',
        minHeight: '100vh',
      }}
    >
      {/* Back button */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/dashboard/crm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--oculus-blue)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
          }}
        >
          <ChevronLeft size={15} />
          Back to Clients
        </Link>
      </div>

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {client.first_name} {client.last_name}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              margin: '6px 0 0',
              letterSpacing: '-0.01em',
            }}
          >
            {client.email}
          </p>
        </div>

        <div style={{ flexShrink: 0, paddingTop: '4px' }}>
          <ArchetypeBadge archetypeKey={client.archetype} size="lg" />
        </div>
      </div>

      {/* Responsive grid style */}
      <style>{`
        .client-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 45%) minmax(0, 55%);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .client-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Two-column layout */}
      <div className="client-detail-grid">
        {/* ---- LEFT COLUMN ---- */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Client Info Card */}
          <OculusCard
            style={{
              backgroundColor: heroTint,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <SectionLabel>Client Info</SectionLabel>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Name */}
              <InfoRow label="Name">
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {client.first_name} {client.last_name}
                </span>
              </InfoRow>

              {/* Email */}
              <InfoRow label="Email">
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {client.email}
                </span>
              </InfoRow>

              {/* Phone */}
              {client.phone !== undefined && (
                <InfoRow label="Phone">
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {client.phone}
                  </span>
                </InfoRow>
              )}

              {/* AUM */}
              <InfoRow label="AUM">
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatCurrency(client.aum)}
                </span>
              </InfoRow>

              {/* Status */}
              <InfoRow label="Status">
                <OculusBadge variant={STATUS_BADGE_VARIANT[client.status]}>
                  {STATUS_LABELS[client.status]}
                </OculusBadge>
              </InfoRow>

              {/* Risk Score */}
              <InfoRow label="Risk Score">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Math.round(client.risk_score)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    / 100 — {getRiskLabel(client.risk_score)}
                  </span>
                </div>
              </InfoRow>

              {/* Last Contact */}
              <InfoRow label="Last Contact">
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {formatRelativeTime(client.last_contact_at)}
                </span>
              </InfoRow>
            </div>
          </OculusCard>

          {/* Radar Chart Card */}
          <OculusCard>
            <SectionLabel>DNA Factor Profile</SectionLabel>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChartV2 factors={client.dna_profile.factors} size={260} showLabels={true} />
            </div>
          </OculusCard>
        </motion.div>

        {/* ---- RIGHT COLUMN ---- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Tab row */}
          <div
            role="tablist"
            aria-label="Client detail sections"
            style={{
              display: 'flex',
              gap: '0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderBottom: isActive ? '2px solid var(--oculus-blue)' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--oculus-blue)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'color 150ms ease, border-color 150ms ease',
                    fontFamily: 'inherit',
                    letterSpacing: '-0.01em',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'dna' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Archetype Card */}
              <ArchetypeCard archetypeKey={client.archetype} />

              {/* Factor Bars */}
              <OculusCard>
                <SectionLabel>Factor Breakdown</SectionLabel>
                <FactorBars factors={client.dna_profile.factors} />
              </OculusCard>

              {/* Bias Grid */}
              <OculusCard>
                <SectionLabel>Active Biases</SectionLabel>
                <BiasGrid biases={client.dna_profile.biases} />
              </OculusCard>

              {/* Market Mood — MarketMoodIndicator already renders an OculusCard */}
              <div>
                <SectionLabel>Market Mood</SectionLabel>
                <MarketMoodIndicator mood={client.dna_profile.marketMood} />
              </div>

              {/* Behavior Flags */}
              <OculusCard>
                <SectionLabel>Behavior Flags</SectionLabel>
                <BehaviorFlags flags={client.dna_profile.behaviorFlags} />
              </OculusCard>
            </div>
          )}

          {activeTab === 'notes' && (
            <NotesList clientId={clientId} />
          )}

          {activeTab === 'portfolio' && (
            <HoldingsTable clientId={clientId} />
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ---- InfoRow helper --------------------------------------------------------

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ textAlign: 'right' }}>{children}</div>
    </div>
  )
}
