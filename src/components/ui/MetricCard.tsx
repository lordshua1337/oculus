import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { OculusCard } from './OculusCard'

type DeltaType = 'positive' | 'negative' | 'neutral'

interface MetricCardProps {
  label: string
  value: string | number
  delta?: string | number
  deltaType?: DeltaType
  icon?: ReactNode
  className?: string
}

const deltaConfig: Record<
  DeltaType,
  { color: string; bgColor: string; Icon: typeof TrendingUp }
> = {
  positive: {
    color: 'var(--oculus-green)',
    bgColor: 'rgba(0, 185, 130, 0.1)',
    Icon: TrendingUp,
  },
  negative: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    Icon: TrendingDown,
  },
  neutral: {
    color: 'var(--text-muted)',
    bgColor: 'rgba(122, 125, 133, 0.1)',
    Icon: Minus,
  },
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = 'neutral',
  icon,
  className = '',
}: MetricCardProps) {
  const deltaConf = deltaConfig[deltaType]
  const DeltaIcon = deltaConf.Icon

  return (
    <OculusCard
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '20px 24px',
        borderLeft: '3px solid var(--oculus-blue)',
      }}
    >
      {/* Subtle background gradient accent for visual personality */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '100%',
          background:
            'linear-gradient(270deg, var(--oculus-blue-soft) 0%, transparent 100%)',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top row: label + icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {label}
          </span>
          {icon ? (
            <span
              style={{
                color: 'var(--oculus-blue)',
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </span>
          ) : null}
        </div>

        {/* Value */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginBottom: delta !== undefined ? '12px' : 0,
          }}
        >
          {value}
        </div>

        {/* Delta indicator */}
        {delta !== undefined ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: deltaConf.bgColor,
              borderRadius: '6px',
              padding: '3px 8px',
            }}
          >
            <DeltaIcon
              size={12}
              style={{ color: deltaConf.color, flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: deltaConf.color,
                letterSpacing: '-0.01em',
              }}
            >
              {delta}
            </span>
          </div>
        ) : null}
      </div>
    </OculusCard>
  )
}
