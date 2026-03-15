import { Brain } from 'lucide-react'
import { OculusCard } from '@/components/ui/OculusCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { BIAS_LABELS, BIAS_SEVERITY_COLORS } from '@/lib/dna/colors'
import type { BiasFlag, BiasSeverity } from '@/lib/dna/types'

// Severity 0 = None, 1 = Mild, 2 = Moderate, 3 = Severe
const SEVERITY_LABELS: Readonly<Record<BiasSeverity, string>> = {
  0: 'None',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
}

// Translucent backgrounds keyed by severity color
function getSeverityBg(severity: BiasSeverity): string {
  const colorMap: Readonly<Record<BiasSeverity, string>> = {
    0: 'rgba(142, 142, 147, 0.12)',
    1: 'rgba(252, 163, 17, 0.12)',
    2: 'rgba(255, 81, 2, 0.12)',
    3: 'rgba(255, 59, 48, 0.12)',
  }
  return colorMap[severity]
}

interface Props {
  biases?: readonly BiasFlag[] | null
  className?: string
}

export function BiasGrid({ biases, className = '' }: Props) {
  // Normalize to empty array on undefined/null
  const safe: readonly BiasFlag[] = biases ?? []

  if (safe.length === 0) {
    return (
      <EmptyState
        icon={Brain}
        title="No Active Biases"
        description="No significant behavioral biases were detected in this assessment."
        className={className}
      />
    )
  }

  // Sort: severity descending (3 -> 0), then alphabetical by bias key
  const sorted = [...safe].sort((a, b) => {
    if (b.severity !== a.severity) return b.severity - a.severity
    return a.key.localeCompare(b.key)
  })

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
      }}
    >
      {sorted.map((bias) => {
        const color = BIAS_SEVERITY_COLORS[bias.severity]
        const label = SEVERITY_LABELS[bias.severity]
        const bg = getSeverityBg(bias.severity)

        return (
          <OculusCard
            key={bias.key}
            style={{
              padding: '14px 16px',
              borderLeft: `3px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Bias name */}
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {BIAS_LABELS[bias.key]}
            </span>

            {/* Severity pill */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                borderRadius: 'var(--radius-badge)',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.03em',
                lineHeight: 1,
                color,
                backgroundColor: bg,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          </OculusCard>
        )
      })}
    </div>
  )
}
