'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { OculusCard } from '@/components/ui/OculusCard'
import { OculusButton } from '@/components/ui/OculusButton'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error context without leaking sensitive data to the UI
    console.error('[Dashboard Error]', error.message, error.digest)
  }, [error])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        background: 'var(--bg-base)',
      }}
    >
      <motion.div
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        transition={fadeInUp.transition}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <OculusCard
          style={{
            padding: '40px 36px',
            textAlign: 'center',
            borderTop: '3px solid var(--oculus-orange)',
          }}
        >
          {/* Icon */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(255, 81, 2, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={48} style={{ color: 'var(--oculus-orange)' }} />
            </div>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 10px',
            }}
          >
            Something went wrong
          </h2>

          {/* Message */}
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}
          >
            {error.message
              ? error.message
              : 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Try Again button */}
          <OculusButton
            onClick={reset}
            variant="primary"
            size="md"
            style={{ width: '100%' }}
          >
            Try Again
          </OculusButton>

          {/* Digest for support */}
          {error.digest ? (
            <p
              style={{
                marginTop: 16,
                fontSize: 11,
                color: 'var(--text-muted)',
                letterSpacing: '0.03em',
                fontFamily: 'monospace',
              }}
            >
              Error ID: {error.digest}
            </p>
          ) : null}
        </OculusCard>
      </motion.div>
    </div>
  )
}
