'use client'

import { OculusCard } from '@/components/ui/OculusCard'
import { ArchetypeBadge } from './ArchetypeBadge'
import { PRIMARY_FACTORS } from '@/lib/dna/factors'
import { BIAS_LABELS, BIAS_SEVERITY_COLORS, MARKET_MOOD_COLORS } from '@/lib/dna/colors'
import type { ClientRow } from '@/lib/db/types'
import type { BiasSeverity, FactorCode } from '@/lib/dna/types'

// Severity labels for the bias pill
const SEVERITY_LABELS: Readonly<Record<BiasSeverity, string>> = {
  0: 'None',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
}

// Severity background colors matching BiasGrid pattern
const SEVERITY_BG: Readonly<Record<BiasSeverity, string>> = {
  0: 'rgba(142, 142, 147, 0.12)',
  1: 'rgba(252, 163, 17, 0.12)',
  2: 'rgba(255, 81, 2, 0.12)',
  3: 'rgba(255, 59, 48, 0.12)',
}

// Mood state labels matching MarketMoodIndicator pattern
const MOOD_LABELS: Readonly<Record<string, string>> = {
  steady: 'Steady',
  concerned: 'Concerned',
  reactive: 'Reactive',
  panicked: 'Panicked',
  euphoric: 'Euphoric',
}

interface Props {
  client: ClientRow
  className?: string
}

export function DNASummary({ client, className = '' }: Props) {
  const dna = client.dna_profile

  // Handle missing DNA profile gracefully
  if (!dna) {
    return (
      <OculusCard
        className={className}
        style={{ minWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          DNA profile not available
        </span>
      </OculusCard>
    )
  }

  // Derive top 3 factors by normalized score descending
  const topFactors = (Object.entries(dna.factors) as [FactorCode, { normalized: number }][])
    .sort((a, b) => b[1].normalized - a[1].normalized)
    .slice(0, 3)

  // Derive highest-severity bias (if any)
  const sortedBiases = [...dna.biases].sort((a, b) => b.severity - a.severity)
  const topBias = sortedBiases[0] ?? null

  const moodColor = MARKET_MOOD_COLORS[dna.marketMood.state]
  const moodLabel = MOOD_LABELS[dna.marketMood.state] ?? dna.marketMood.state

  return (
    <OculusCard
      className={className}
      style={{
        minWidth: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
      }}
    >
      {/* Row 1: Archetype badge */}
      <div>
        <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
      </div>

      {/* Row 2: Top Factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          Top Factors
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {topFactors.map(([code, score]) => {
            const info = PRIMARY_FACTORS[code]
            const displayName = info?.name ?? code
            const normalized = score.normalized

            return (
              <div
                key={code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1,
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {(normalized * 100).toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 3: Highest-severity bias */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {topBias && topBias.severity > 0 ? (
          <>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1,
                flexShrink: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {BIAS_LABELS[topBias.key]}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 'var(--radius-badge)',
                padding: '3px 7px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.03em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                color: BIAS_SEVERITY_COLORS[topBias.severity],
                backgroundColor: SEVERITY_BG[topBias.severity],
              }}
            >
              {SEVERITY_LABELS[topBias.severity]}
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1,
            }}
          >
            No biases
          </span>
        )}
      </div>

      {/* Row 4: Compact mood display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          aria-hidden
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: moodColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: moodColor,
            lineHeight: 1,
          }}
        >
          {moodLabel}
        </span>
      </div>
    </OculusCard>
  )
}
