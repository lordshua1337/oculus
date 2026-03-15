'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { OculusButton } from '@/components/ui/OculusButton'
import { OculusInput } from '@/components/ui/OculusInput'

type Tab = 'email' | 'google' | 'demo'
type EmailState = 'idle' | 'loading' | 'success'
type Theme = 'light' | 'dark'

// Cubic bezier as a properly typed tuple for Framer Motion
const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1]

const cardVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.44, ease: EASE_SPRING },
  },
}

const panelVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_SPRING } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.68 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.58c1.5-1.39 2.39-3.43 2.39-5.87z"
        fill="#4285F4"
      />
      <path
        d="M8 16c2.16 0 3.97-.71 5.3-1.93l-2.58-2a4.8 4.8 0 0 1-2.72.75c-2.09 0-3.86-1.41-4.49-3.3H.84v2.07A8 8 0 0 0 8 16z"
        fill="#34A853"
      />
      <path
        d="M3.51 9.52A4.8 4.8 0 0 1 3.26 8c0-.53.09-1.04.25-1.52V4.41H.84A8 8 0 0 0 0 8c0 1.29.31 2.51.84 3.59l2.67-2.07z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.18c1.17 0 2.23.4 3.06 1.2l2.29-2.29A8 8 0 0 0 8 0a8 8 0 0 0-7.16 4.41l2.67 2.07C4.14 4.59 5.91 3.18 8 3.18z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailState, setEmailState] = useState<EmailState>('idle')
  const [theme, setTheme] = useState<Theme>('dark')

  const isDark = theme === 'dark'

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.'
    return ''
  }

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value)
      if (emailError) setEmailError('')
    },
    [emailError]
  )

  const handleSendLink = useCallback(async () => {
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }
    setEmailState('loading')
    // Supabase magic link integration will be wired here
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setEmailState('success')
  }, [email])

  const handleGoogleSignIn = useCallback(() => {
    // Google OAuth via Supabase will be wired here
  }, [])

  const handleDemoMode = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const cardBg = isDark
    ? 'rgba(29, 30, 32, 0.85)'
    : 'rgba(255, 255, 255, 0.92)'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px 16px',
      }}
    >
      {/* Theme toggle */}
      <button
        onClick={handleThemeToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast)',
          zIndex: 10,
        }}
        className="oculus-theme-toggle"
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Blue radial bloom behind card */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,109,216,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Glass card */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '440px',
          padding: '48px 40px',
          backgroundColor: cardBg,
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0, 109, 216, 0.12)',
        }}
      >
        {/* Logo */}
        <p
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--oculus-blue)',
            textAlign: 'center',
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1,
          }}
        >
          OCULUS
        </p>

        {/* Tagline */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginTop: '8px',
            marginBottom: 0,
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
          }}
        >
          The advisor intelligence layer for StockPilot clients.
        </p>

        {/* Heading */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginTop: '32px',
            marginBottom: 0,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          Welcome to Oculus
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginTop: '8px',
            marginBottom: 0,
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
          }}
        >
          Sign in to manage client portfolios and behavioral insights.
        </p>

        {/* Auth tabs */}
        <div
          role="tablist"
          aria-label="Sign-in method"
          style={{
            display: 'flex',
            gap: 0,
            marginTop: '24px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {(['email', 'google', 'demo'] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = { email: 'Email', google: 'Google', demo: 'Demo' }
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--oculus-blue)' : 'var(--text-muted)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive
                    ? '2px solid var(--oculus-blue)'
                    : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                  letterSpacing: '-0.01em',
                  marginBottom: '-1px',
                  outline: 'none',
                }}
              >
                {labels[tab]}
              </button>
            )
          })}
        </div>

        {/* Tab panels */}
        <div style={{ marginTop: '24px' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'email' && (
              <motion.div
                key="email-panel"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                role="tabpanel"
                aria-label="Email sign-in"
              >
                <AnimatePresence mode="wait">
                  {emailState === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0, 185, 130, 0.08)',
                        border: '1px solid rgba(0, 185, 130, 0.2)',
                        textAlign: 'center',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: 'var(--oculus-green)',
                          margin: 0,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        Check your inbox
                      </p>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          margin: '6px 0 0',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        We sent a sign-in link to {email}
                      </p>
                      <button
                        onClick={() => {
                          setEmailState('idle')
                          setEmail('')
                        }}
                        style={{
                          marginTop: '12px',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        Use a different email
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                      <OculusInput
                        type="email"
                        placeholder="you@yourfirm.com"
                        value={email}
                        onChange={handleEmailChange}
                        error={emailError}
                        aria-label="Work email address"
                        disabled={emailState === 'loading'}
                      />
                      <OculusButton
                        variant="primary"
                        loading={emailState === 'loading'}
                        onClick={handleSendLink}
                        style={{ width: '100%' }}
                        aria-label="Send magic sign-in link"
                      >
                        {emailState === 'loading' ? 'Sending...' : 'Send sign-in link'}
                      </OculusButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'google' && (
              <motion.div
                key="google-panel"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                role="tabpanel"
                aria-label="Google sign-in"
              >
                <OculusButton
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  style={{ width: '100%' }}
                  aria-label="Continue with Google"
                >
                  <GoogleIcon />
                  Continue with Google
                </OculusButton>
                <p
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.5,
                  }}
                >
                  We&apos;ll sign you in with your Google Workspace account.
                </p>
              </motion.div>
            )}

            {activeTab === 'demo' && (
              <motion.div
                key="demo-panel"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                role="tabpanel"
                aria-label="Demo mode"
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Explore Oculus with sample client data. No account required.
                </p>
                <OculusButton
                  variant="primary"
                  onClick={handleDemoMode}
                  style={{ width: '100%' }}
                  aria-label="Enter demo mode"
                >
                  Enter Demo Mode
                </OculusButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: '32px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            lineHeight: 1.5,
          }}
        >
          By signing in, you agree to our Terms of Service.
        </p>
      </motion.div>
    </div>
  )
}
