'use client'

import { OculusCard } from '@/components/ui/OculusCard'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import type { ArchetypeKey, FactorScores } from '@/lib/dna/types'
import { ArchetypeBadge } from './ArchetypeBadge'
import { RadarChartV2 } from './RadarChartV2'

// ---- Props -----------------------------------------------------------------

interface ArchetypeCardProps {
  archetypeKey: ArchetypeKey
  factors?: FactorScores
  className?: string
}

// ---- Component -------------------------------------------------------------

export function ArchetypeCard({ archetypeKey, factors, className = '' }: ArchetypeCardProps) {
  const info = ARCHETYPE_INFO[archetypeKey]

  if (!info) {
    return (
      <OculusCard className={className}>
        <ArchetypeBadge archetypeKey={archetypeKey} size="lg" />
      </OculusCard>
    )
  }

  // Parse hex color for left border and tinted bg on the rule block
  const hex = info.color
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const ruleBg = `rgba(${r}, ${g}, ${b}, 0.05)`

  return (
    <OculusCard className={className}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Badge */}
        <div>
          <ArchetypeBadge archetypeKey={archetypeKey} size="lg" />
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {info.tagline}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {info.description}
        </p>

        {/* Communication Rule */}
        <div
          style={{
            borderLeft: `3px solid ${info.color}`,
            backgroundColor: ruleBg,
            borderRadius: '0 8px 8px 0',
            padding: '10px 14px',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: info.color,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              Communication Rule
            </strong>
            {info.communicationRule}
          </p>
        </div>

        {/* Radar chart (only when factors provided) */}
        {factors !== undefined && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '4px',
            }}
          >
            <RadarChartV2 factors={factors} size={160} showLabels={false} />
          </div>
        )}
      </div>
    </OculusCard>
  )
}
