import { PRIMARY_FACTORS } from '@/lib/dna/factors'
import type { FactorCode } from '@/lib/dna/types'

interface FactorBarProps {
  factorCode: FactorCode
  score: number
  className?: string
}

export function FactorBar({ factorCode, score, className = '' }: FactorBarProps) {
  const factor = PRIMARY_FACTORS[factorCode]
  const clamped = Math.min(Math.max(score, 0), 100)

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {/* Row 1: factor name + score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {factor.name}
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {clamped}
        </span>
      </div>

      {/* Row 2: track bar with fill and dot */}
      <div
        style={{
          position: 'relative',
          height: '8px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '9999px',
          overflow: 'visible',
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: factor.color,
            borderRadius: '9999px',
          }}
        />

        {/* Score dot at fill endpoint */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${clamped}%`,
            transform: 'translate(-50%, -50%)',
            width: '14px',
            height: '14px',
            borderRadius: '9999px',
            backgroundColor: factor.color,
            border: '2.5px solid #ffffff',
            boxShadow: `0 1px 4px rgba(0,0,0,0.16)`,
            zIndex: 1,
          }}
        />
      </div>

      {/* Row 3: low + high labels */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1,
          }}
        >
          {factor.lowLabel}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1,
          }}
        >
          {factor.highLabel}
        </span>
      </div>
    </div>
  )
}
