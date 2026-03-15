'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { getDemoClientRows } from '@/lib/demo-clients'
import { ArchetypeBadge } from '@/components/dna/ArchetypeBadge'
import { OculusCard } from '@/components/ui/OculusCard'
import { formatCurrency } from '@/lib/utils/format'
import { CHART_PALETTE } from '@/lib/utils/constants'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import { PRIMARY_FACTORS } from '@/lib/dna/factors'
import type { ClientRow } from '@/lib/db/types'
import type { FactorCode } from '@/lib/dna/types'

// ---- Constants ------------------------------------------------------------

const ALL_CLIENTS = getDemoClientRows()
const FACTOR_ORDER: FactorCode[] = ['RP', 'DS', 'CN', 'TO', 'SI', 'ES', 'SP', 'IP']
const MAX_SELECTED = 3

// ---- Comparison note builder -----------------------------------------------

function buildComparisonNote(clients: ClientRow[]): string {
  if (clients.length < 2) return ''

  const archetypeNames = clients.map(
    (c) => ARCHETYPE_INFO[c.archetype]?.name ?? c.archetype
  )

  // Find the factor with the largest spread across selected clients
  let maxSpread = 0
  let divergentFactor: FactorCode = 'RP'
  for (const code of FACTOR_ORDER) {
    const values = clients.map((c) => c.dna_profile.factors[code].normalized)
    const spread = Math.max(...values) - Math.min(...values)
    if (spread > maxSpread) {
      maxSpread = spread
      divergentFactor = code
    }
  }

  // Find the factor with the smallest spread (alignment)
  let minSpread = Infinity
  let alignedFactor: FactorCode = 'ES'
  for (const code of FACTOR_ORDER) {
    const values = clients.map((c) => c.dna_profile.factors[code].normalized)
    const spread = Math.max(...values) - Math.min(...values)
    if (spread < minSpread) {
      minSpread = spread
      alignedFactor = code
    }
  }

  const divergentName = PRIMARY_FACTORS[divergentFactor].name
  const alignedName = PRIMARY_FACTORS[alignedFactor].name

  const archetypeList =
    clients.length === 2
      ? `${archetypeNames[0]} and ${archetypeNames[1]}`
      : `${archetypeNames.slice(0, -1).join(', ')}, and ${archetypeNames[archetypeNames.length - 1]}`

  const highClient = clients.reduce((best, c) =>
    c.dna_profile.factors[divergentFactor].normalized >
    best.dna_profile.factors[divergentFactor].normalized
      ? c
      : best
  )
  const lowClient = clients.reduce((best, c) =>
    c.dna_profile.factors[divergentFactor].normalized <
    best.dna_profile.factors[divergentFactor].normalized
      ? c
      : best
  )

  const spreadPct = Math.round(maxSpread * 100)

  return [
    `Comparing ${archetypeList} reveals distinct behavioral profiles that require tailored communication strategies.`,
    `The biggest divergence is in ${divergentName} — ${highClient.first_name} scores ${spreadPct} points higher than ${lowClient.first_name}, signaling very different risk tolerances and decision styles.`,
    `Both clients are most aligned on ${alignedName}, which provides a shared foundation for portfolio conversations.`,
  ].join(' ')
}

// ---- Radar data builder ----------------------------------------------------

function buildRadarData(clients: ClientRow[]) {
  return FACTOR_ORDER.map((code) => {
    const point: Record<string, string | number> = {
      factor: PRIMARY_FACTORS[code].name,
    }
    for (const client of clients) {
      const key = `${client.first_name} ${client.last_name}`
      point[key] = Math.round(client.dna_profile.factors[code].normalized * 100)
    }
    return point
  })
}

// ---- Top 3 factors helper --------------------------------------------------

function getTopFactors(client: ClientRow): Array<{ code: FactorCode; score: number; name: string }> {
  return FACTOR_ORDER.map((code) => ({
    code,
    score: client.dna_profile.factors[code].normalized,
    name: PRIMARY_FACTORS[code].name,
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

// ---- Risk label helper -----------------------------------------------------

function getRiskLabel(score: number): string {
  if (score <= 0.2) return 'Very Low'
  if (score <= 0.4) return 'Low'
  if (score <= 0.6) return 'Moderate'
  if (score <= 0.8) return 'High'
  return 'Very High'
}

// ---- Client pill -----------------------------------------------------------

interface ClientPillProps {
  client: ClientRow
  isSelected: boolean
  isDisabled: boolean
  colorIndex: number
  onToggle: (id: string) => void
}

function ClientPill({ client, isSelected, isDisabled, colorIndex, onToggle }: ClientPillProps) {
  const color = CHART_PALETTE[colorIndex % CHART_PALETTE.length]
  const fullName = `${client.first_name} ${client.last_name}`

  return (
    <button
      onClick={() => onToggle(client.id)}
      disabled={isDisabled && !isSelected}
      aria-pressed={isSelected}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '9999px',
        border: isSelected ? `2px solid ${color}` : '2px solid var(--border)',
        backgroundColor: isSelected ? `${color}18` : 'var(--bg-input)',
        color: isSelected ? color : 'var(--text-secondary)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !isSelected ? 0.45 : 1,
        transition: 'all 150ms ease',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
      }}
    >
      {isSelected && (
        <CheckCircle2
          size={14}
          strokeWidth={2.5}
          style={{ color, flexShrink: 0 }}
          aria-hidden
        />
      )}
      {fullName}
    </button>
  )
}

// ---- Client comparison card ------------------------------------------------

interface ComparisonCardProps {
  client: ClientRow
  colorIndex: number
}

function ComparisonCard({ client, colorIndex }: ComparisonCardProps) {
  const color = CHART_PALETTE[colorIndex % CHART_PALETTE.length]
  const fullName = `${client.first_name} ${client.last_name}`
  const topFactors = getTopFactors(client)

  return (
    <OculusCard
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderTop: `3px solid ${color}`,
      }}
    >
      {/* Name + color indicator */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <p
            style={{
              margin: '0 0 6px 0',
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {fullName}
          </p>
          <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
        </div>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
            marginTop: '4px',
          }}
          aria-hidden
        />
      </div>

      {/* AUM + Risk */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            AUM
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {formatCurrency(client.aum, { compact: true })}
          </p>
        </div>
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-input)',
          }}
        >
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Risk Score
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color,
              letterSpacing: '-0.01em',
            }}
          >
            {getRiskLabel(client.risk_score)}
          </p>
        </div>
      </div>

      {/* Top 3 factors */}
      <div>
        <p
          style={{
            margin: '0 0 10px 0',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Top Factors
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {topFactors.map((factor, idx) => (
            <div
              key={factor.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? color : 'var(--bg-input)',
                    border: `1px solid ${idx === 0 ? color : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: idx === 0 ? '#fff' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    fontWeight: idx === 0 ? 500 : 400,
                  }}
                >
                  {factor.name}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {/* Mini bar */}
                <div
                  style={{
                    width: '48px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--bg-input)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round(factor.score * 100)}%`,
                      backgroundColor: color,
                      borderRadius: '2px',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    minWidth: '28px',
                    textAlign: 'right',
                  }}
                >
                  {Math.round(factor.score * 100)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </OculusCard>
  )
}

// ---- Page ------------------------------------------------------------------

export default function MultiPortfolioPage() {
  const defaultIds = ALL_CLIENTS.slice(0, 2).map((c) => c.id)
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultIds)

  const selectedClients = useMemo(
    () => ALL_CLIENTS.filter((c) => selectedIds.includes(c.id)),
    [selectedIds]
  )

  const radarData = useMemo(() => buildRadarData(selectedClients), [selectedClients])

  const comparisonNote = useMemo(
    () => buildComparisonNote(selectedClients),
    [selectedClients]
  )

  function toggleClient(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Deselect — keep at least 1
        if (prev.length <= 1) return prev
        return prev.filter((x) => x !== id)
      }
      // Select — cap at MAX_SELECTED
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, id]
    })
  }

  const isAtMax = selectedIds.length >= MAX_SELECTED
  const colStyle = selectedClients.length === 3
    ? 'calc(33.333% - 10px)'
    : 'calc(50% - 8px)'

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }} className="p-6 md:p-8">
      {/* Back link */}
      <Link
        href="/dashboard/scenario-lab"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: '24px',
          transition: 'color 150ms ease',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={14} strokeWidth={2} aria-hidden />
        Scenario Lab
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
          }}
        >
          Multi-Portfolio Comparison
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          Select up to {MAX_SELECTED} clients to compare behavioral DNA and portfolio characteristics side by side.
        </p>
      </div>

      {/* Client selector */}
      <OculusCard style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.01em',
            }}
          >
            Select clients
          </p>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontWeight: 400,
            }}
          >
            {selectedIds.length} / {MAX_SELECTED} selected
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {ALL_CLIENTS.map((client) => {
            const isSelected = selectedIds.includes(client.id)
            const colorIndex = selectedIds.indexOf(client.id)
            return (
              <ClientPill
                key={client.id}
                client={client}
                isSelected={isSelected}
                isDisabled={isAtMax && !isSelected}
                colorIndex={colorIndex >= 0 ? colorIndex : 0}
                onToggle={toggleClient}
              />
            )
          })}
        </div>
      </OculusCard>

      {/* Comparison cards */}
      {selectedClients.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {selectedClients.map((client, idx) => (
            <div
              key={client.id}
              style={{
                width: colStyle,
                minWidth: '260px',
                flexGrow: 1,
              }}
            >
              <ComparisonCard client={client} colorIndex={idx} />
            </div>
          ))}
        </div>
      )}

      {/* Overlay radar chart */}
      {selectedClients.length > 0 && (
        <OculusCard style={{ marginBottom: '32px' }}>
          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            DNA Factor Overlay
          </p>
          <div style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{
                    fill: 'var(--text-muted)',
                    fontSize: 12,
                    fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                />
                {selectedClients.map((client, idx) => {
                  const key = `${client.first_name} ${client.last_name}`
                  const color = CHART_PALETTE[idx % CHART_PALETTE.length]
                  return (
                    <Radar
                      key={client.id}
                      name={key}
                      dataKey={key}
                      stroke={color}
                      fill={color}
                      fillOpacity={0.12}
                      strokeWidth={2}
                      dot={false}
                    />
                  )
                })}
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    paddingTop: '12px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </OculusCard>
      )}

      {/* Comparison note */}
      {comparisonNote && selectedClients.length >= 2 && (
        <OculusCard
          style={{
            borderLeft: `3px solid var(--oculus-blue)`,
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--oculus-blue)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            DNA Comparison Analysis
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {comparisonNote}
          </p>
        </OculusCard>
      )}
    </div>
  )
}
