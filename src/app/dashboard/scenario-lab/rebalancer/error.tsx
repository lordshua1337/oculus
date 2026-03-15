'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { OculusButton } from '@/components/ui/OculusButton'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RebalancerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Rebalancer Error]', error.message, error.digest)
  }, [error])

  return (
    <div
      style={{
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 32,
      }}
    >
      <div style={{ padding: 12, borderRadius: 16, background: 'rgba(255,59,48,0.1)' }}>
        <AlertCircle size={40} color="#FF3B30" />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
        Something went wrong
      </h2>
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          maxWidth: 320,
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {error.message || 'Failed to load the rebalancer. Please try again.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <OculusButton variant="primary" onClick={reset}>
          Try Again
        </OculusButton>
        <OculusButton variant="outline" onClick={() => { window.location.href = '/dashboard/scenario-lab' }}>
          Back to Scenario Lab
        </OculusButton>
      </div>
    </div>
  )
}
