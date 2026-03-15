'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OculusCard } from '@/components/ui/OculusCard'
import { generateStaticAlerts, type RiskAlert } from '@/app/api/ai/risk-alert/route'
import type { DNAProfileV2 } from '@/lib/dna/types'

interface RiskAlertPanelProps {
  readonly clientId: string
  readonly dnaProfile: DNAProfileV2
}

const SEVERITY_DOT_COLORS: Record<RiskAlert['severity'], string> = {
  high: '#FF3B30',
  medium: '#ff5102',
  low: '#fca311',
}

const SEVERITY_BG_COLORS: Record<RiskAlert['severity'], string> = {
  high: 'rgba(255, 59, 48, 0.08)',
  medium: 'rgba(255, 81, 2, 0.08)',
  low: 'rgba(252, 163, 17, 0.08)',
}

const SEVERITY_BORDER_COLORS: Record<RiskAlert['severity'], string> = {
  high: 'rgba(255, 59, 48, 0.2)',
  medium: 'rgba(255, 81, 2, 0.2)',
  low: 'rgba(252, 163, 17, 0.2)',
}

const SEVERITY_LABEL: Record<RiskAlert['severity'], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const SEVERITY_ORDER: Record<RiskAlert['severity'], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function sortBySeverity(alerts: readonly RiskAlert[]): readonly RiskAlert[] {
  return [...alerts].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

function AlertRow({ alert, index }: { alert: RiskAlert; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: 'easeOut' }}
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: SEVERITY_BG_COLORS[alert.severity],
        border: `1px solid ${SEVERITY_BORDER_COLORS[alert.severity]}`,
      }}
    >
      {/* Severity dot + label */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          paddingTop: '2px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: SEVERITY_DOT_COLORS[alert.severity],
            boxShadow: `0 0 6px ${SEVERITY_DOT_COLORS[alert.severity]}`,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: SEVERITY_DOT_COLORS[alert.severity],
            lineHeight: 1,
          }}
        >
          {SEVERITY_LABEL[alert.severity]}
        </span>
      </div>

      {/* Alert text */}
      <p
        style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.55',
          color: 'var(--text-secondary)',
          letterSpacing: '-0.01em',
        }}
      >
        {alert.text}
      </p>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{
            height: '72px',
            borderRadius: '12px',
            opacity: 1 - i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export function RiskAlertPanel({ clientId, dnaProfile }: RiskAlertPanelProps) {
  const [alerts, setAlerts] = useState<readonly RiskAlert[]>(() =>
    sortBySeverity(generateStaticAlerts(dnaProfile))
  )
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<'static' | 'claude'>('static')

  useEffect(() => {
    let cancelled = false

    async function fetchAlerts() {
      setLoading(true)

      try {
        const response = await fetch('/api/ai/risk-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, dnaProfile }),
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = (await response.json()) as {
          alerts: readonly RiskAlert[]
          source: 'static' | 'claude'
        }

        if (!cancelled) {
          setAlerts(sortBySeverity(data.alerts))
          setSource(data.source)
        }
      } catch (err) {
        // API failed — keep the static alerts already rendered
        console.error('Risk alert fetch failed, using static fallback:', err)
        if (!cancelled) {
          setAlerts(sortBySeverity(generateStaticAlerts(dnaProfile)))
          setSource('static')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchAlerts()

    return () => {
      cancelled = true
    }
  }, [clientId, dnaProfile])

  const highCount = alerts.filter((a) => a.severity === 'high').length
  const mediumCount = alerts.filter((a) => a.severity === 'medium').length

  return (
    <OculusCard>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Behavioral Risk Alerts
          </h3>

          {/* Summary badges — only visible when alerts are loaded */}
          <AnimatePresence>
            {!loading && alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', gap: '6px' }}
              >
                {highCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(255, 59, 48, 0.1)',
                      color: '#FF3B30',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {highCount} High
                  </span>
                )}
                {mediumCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(255, 81, 2, 0.1)',
                      color: '#ff5102',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {mediumCount} Medium
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Source indicator */}
        {!loading && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.01em',
            }}
          >
            {source === 'claude' ? 'AI-enhanced' : 'Rule-based'}
          </motion.span>
        )}
      </motion.div>

      {/* Body */}
      {loading ? (
        <LoadingSkeleton />
      ) : alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            lineHeight: '1.55',
          }}
        >
          No behavioral alerts for current market conditions.
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {alerts.map((alert, i) => (
            <AlertRow key={`${alert.severity}-${i}`} alert={alert} index={i} />
          ))}
        </div>
      )}
    </OculusCard>
  )
}
