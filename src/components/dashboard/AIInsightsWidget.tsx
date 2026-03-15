'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { OculusCard } from '@/components/ui'
import { SkeletonLoader } from '@/components/ui'

interface PracticeData {
  totalAUM: number
  clientCount: number
  archetypeDistribution: Record<string, number>
}

interface InsightsResponse {
  insights: string[]
  source: 'static' | 'claude'
}

type WidgetState =
  | { status: 'loading' }
  | { status: 'success'; insights: string[]; source: 'static' | 'claude' }
  | { status: 'error' }

interface AIInsightsWidgetProps {
  practiceData: PracticeData
}

const STAGGER_DELAY_MS = 80

export function AIInsightsWidget({ practiceData }: AIInsightsWidgetProps) {
  const [widgetState, setWidgetState] = useState<WidgetState>({ status: 'loading' })
  const [visibleCount, setVisibleCount] = useState(0)

  const fetchInsights = useCallback(async () => {
    setWidgetState({ status: 'loading' })
    setVisibleCount(0)

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ practiceData }),
      })

      if (!response.ok) {
        setWidgetState({ status: 'error' })
        return
      }

      const data = (await response.json()) as InsightsResponse
      setWidgetState({ status: 'success', insights: data.insights, source: data.source })
    } catch {
      setWidgetState({ status: 'error' })
    }
  }, [practiceData])

  useEffect(() => {
    void fetchInsights()
  }, [fetchInsights])

  useEffect(() => {
    if (widgetState.status !== 'success') return

    const count = widgetState.insights.length
    let current = 0

    const interval = setInterval(() => {
      current += 1
      setVisibleCount(current)
      if (current >= count) clearInterval(interval)
    }, STAGGER_DELAY_MS)

    return () => clearInterval(interval)
  }, [widgetState])

  return (
    <OculusCard>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles
            size={18}
            style={{ color: 'var(--oculus-blue)', flexShrink: 0 }}
          />
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            AI Practice Insights
          </h2>
        </div>

        <button
          onClick={() => { void fetchInsights() }}
          disabled={widgetState.status === 'loading'}
          aria-label="Refresh insights"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            cursor: widgetState.status === 'loading' ? 'not-allowed' : 'pointer',
            color: widgetState.status === 'loading' ? 'var(--text-muted)' : 'var(--text-secondary)',
            transition: 'background var(--transition-fast), color var(--transition-fast)',
            padding: 0,
          }}
        >
          <RefreshCw
            size={14}
            style={{
              animation: widgetState.status === 'loading' ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </button>
      </div>

      {/* Loading state */}
      {widgetState.status === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SkeletonLoader variant="text-base" width="90%" />
          <SkeletonLoader variant="text-base" width="75%" />
          <SkeletonLoader variant="text-base" width="82%" />
        </div>
      )}

      {/* Error state */}
      {widgetState.status === 'error' && (
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0',
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              margin: '0 0 12px',
            }}
          >
            Unable to generate insights
          </p>
          <button
            onClick={() => { void fetchInsights() }}
            style={{
              fontSize: 13,
              color: 'var(--oculus-blue)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Success state */}
      {widgetState.status === 'success' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {widgetState.source === 'static' && (
            <p
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                margin: '0 0 4px',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Demo insights
            </p>
          )}

          {widgetState.insights.map((insight, index) => (
            <div
              key={index}
              style={{
                borderLeft: '3px solid var(--oculus-blue)',
                paddingLeft: 12,
                opacity: index < visibleCount ? 1 : 0,
                transform: index < visibleCount ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </OculusCard>
  )
}
