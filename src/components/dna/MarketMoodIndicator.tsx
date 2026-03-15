import { OculusCard } from '@/components/ui/OculusCard'
import { MARKET_MOOD_COLORS } from '@/lib/dna/colors'
import type { MarketMoodProfile, MarketMoodState } from '@/lib/dna/types'

const MOOD_LABELS: Readonly<Record<MarketMoodState, string>> = {
  steady: 'Steady',
  concerned: 'Concerned',
  reactive: 'Reactive',
  panicked: 'Panicked',
  euphoric: 'Euphoric',
}

// All five mood states in a stable reference order.
const ALL_STATES: readonly MarketMoodState[] = [
  'steady',
  'concerned',
  'reactive',
  'panicked',
  'euphoric',
]

// Derive rough probabilities from the mood profile fields.
// volatilityResponse (0-1): how strongly market swings affect the user.
// panicThreshold (0-1): how easily they enter panic (lower = more prone).
// euphoriaThreshold (0-1): how easily they enter euphoria (lower = more prone).
// The active state always gets the dominant probability weight.
function deriveProbabilities(
  mood: MarketMoodProfile,
): Readonly<Record<MarketMoodState, number>> {
  const vr = Math.min(Math.max(mood.volatilityResponse, 0), 1)
  const pt = Math.min(Math.max(mood.panicThreshold, 0), 1)
  const et = Math.min(Math.max(mood.euphoriaThreshold, 0), 1)

  // Raw scores: higher means more likely in general population terms
  const raw: Record<MarketMoodState, number> = {
    steady: (1 - vr) * 0.6 + 0.15,
    concerned: vr * 0.3 + 0.1,
    reactive: vr * 0.4 + (1 - pt) * 0.2,
    panicked: (1 - pt) * 0.35 + vr * 0.2,
    euphoric: (1 - et) * 0.35 + (1 - vr) * 0.15,
  }

  // Boost the active state so it clearly dominates
  raw[mood.state] = Math.max(raw[mood.state], 0.5)

  // Normalize to sum to 1
  const total = Object.values(raw).reduce((s, v) => s + v, 0)

  return {
    steady: raw.steady / total,
    concerned: raw.concerned / total,
    reactive: raw.reactive / total,
    panicked: raw.panicked / total,
    euphoric: raw.euphoric / total,
  }
}

interface MoodRowProps {
  state: MarketMoodState
  probability: number
  isActive: boolean
}

function MoodRow({ state, probability, isActive }: MoodRowProps) {
  const color = MARKET_MOOD_COLORS[state]
  const pct = Math.round(probability * 100)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '88px 1fr 36px',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: '12px',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: isActive ? 600 : 400,
          letterSpacing: '-0.01em',
          textTransform: 'capitalize',
          lineHeight: 1,
        }}
      >
        {MOOD_LABELS[state]}
      </span>

      {/* Track */}
      <div
        style={{
          height: '6px',
          backgroundColor: 'var(--bg-input)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: '9999px',
            transition: 'width var(--transition-base)',
          }}
        />
      </div>

      {/* Percentage */}
      <span
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          textAlign: 'right',
        }}
      >
        {pct}%
      </span>
    </div>
  )
}

interface Props {
  mood: MarketMoodProfile
  className?: string
}

export function MarketMoodIndicator({ mood, className = '' }: Props) {
  const color = MARKET_MOOD_COLORS[mood.state]
  const isPulsing = mood.state === 'panicked' || mood.state === 'reactive'
  const probabilities = deriveProbabilities(mood)

  // Sort: active first, then by probability descending
  const sorted = [...ALL_STATES].sort((a, b) => {
    if (a === mood.state) return -1
    if (b === mood.state) return 1
    return probabilities[b] - probabilities[a]
  })

  return (
    <OculusCard
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Header: dot + mood label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '9999px',
            backgroundColor: color,
            flexShrink: 0,
            animation: isPulsing ? 'moodPulse 1.8s ease-in-out infinite' : 'none',
          }}
        />
        <span
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {MOOD_LABELS[mood.state]}
        </span>
      </div>

      {/* Probability bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((state) => (
          <MoodRow
            key={state}
            state={state}
            probability={probabilities[state]}
            isActive={state === mood.state}
          />
        ))}
      </div>

      <style>{`
        @keyframes moodPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.82); }
        }
      `}</style>
    </OculusCard>
  )
}
