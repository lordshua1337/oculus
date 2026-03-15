import { BEHAVIOR_FLAG_LABELS } from '@/lib/dna/colors'
import type { BehaviorFlags } from '@/lib/dna/types'

// Convert camelCase string to Title Case words
function camelToTitleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

interface FlagEntry {
  readonly key: string
  readonly active: boolean
}

interface Props {
  flags: BehaviorFlags
  className?: string
}

export function BehaviorFlags({ flags, className = '' }: Props) {
  const entries: readonly FlagEntry[] = Object.entries(flags).map(([key, active]) => ({
    key,
    active: active as boolean,
  }))

  // Active flags first, then inactive
  const sorted = [...entries].sort((a, b) => {
    if (a.active === b.active) return 0
    return a.active ? -1 : 1
  })

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {sorted.map(({ key, active }) => {
        const label =
          BEHAVIOR_FLAG_LABELS[key as keyof typeof BEHAVIOR_FLAG_LABELS] ??
          camelToTitleCase(key)

        return (
          <span
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              paddingLeft: '10px',
              paddingRight: '10px',
              paddingTop: '4px',
              paddingBottom: '4px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: active ? 500 : 400,
              opacity: active ? 1 : 0.6,
              backgroundColor: active
                ? 'rgba(255, 81, 2, 0.12)'
                : 'var(--bg-input)',
              color: active ? 'var(--oculus-orange)' : 'var(--text-muted)',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {/* Active dot indicator */}
            {active && (
              <span
                aria-hidden
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--oculus-orange)',
                  flexShrink: 0,
                }}
              />
            )}
            {label}
          </span>
        )
      })}
    </div>
  )
}
