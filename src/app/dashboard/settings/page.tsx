'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Check, Info } from 'lucide-react'
import { OculusCard } from '@/components/ui/OculusCard'
import { OculusButton } from '@/components/ui/OculusButton'
import { OculusInput } from '@/components/ui/OculusInput'
import { isDemoMode } from '@/lib/demo-clients'

// ---- Types ----

interface ProfileSettings {
  name: string
  email: string
  firm: string
}

interface NotificationSettings {
  emailAlerts: boolean
  pushAlerts: boolean
  weeklyDigest: boolean
  clientReviews: boolean
}

interface PersistedSettings {
  profile: ProfileSettings
  notifications: NotificationSettings
  brandColor: string
}

// ---- Constants ----

const STORAGE_KEY = 'oculus-settings'

const PRESET_COLORS = [
  '#006DD8',
  '#00b982',
  '#ff5102',
  '#fca311',
  '#AF52DE',
  '#FF3B30',
]

const DEFAULT_SETTINGS: PersistedSettings = {
  profile: { name: '', email: '', firm: '' },
  notifications: {
    emailAlerts: true,
    pushAlerts: false,
    weeklyDigest: true,
    clientReviews: true,
  },
  brandColor: '#006DD8',
}

// ---- Helpers ----

function loadSettings(): PersistedSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>
    return {
      profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile ?? {}) },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications ?? {}),
      },
      brandColor: parsed.brandColor ?? DEFAULT_SETTINGS.brandColor,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

// ---- Toggle Component ----

interface ToggleProps {
  checked: boolean
  onChange: (next: boolean) => void
  id: string
}

function Toggle({ checked, onChange, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 44,
        height: 26,
        borderRadius: 13,
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transition: 'background-color 200ms ease',
        backgroundColor: checked ? 'var(--oculus-blue)' : 'var(--bg-input)',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.20)',
          transition: 'transform 200ms ease',
          transform: checked ? 'translateX(20px)' : 'translateX(3px)',
        }}
      />
    </button>
  )
}

// ---- Toggle Row Component ----

interface ToggleRowProps {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            cursor: 'pointer',
            marginBottom: 2,
          }}
        >
          {label}
        </label>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--text-muted)',
            letterSpacing: '-0.01em',
          }}
        >
          {description}
        </p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  )
}

// ---- Section Label ----

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: '0 0 16px 0',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </p>
  )
}

// ---- Main Page ----

export default function SettingsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_SETTINGS.profile)
  const [notifications, setNotifications] = useState<NotificationSettings>(
    DEFAULT_SETTINGS.notifications
  )
  const [brandColor, setBrandColor] = useState(DEFAULT_SETTINGS.brandColor)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Hydrate from localStorage once mounted
  useEffect(() => {
    const stored = loadSettings()
    setProfile(stored.profile)
    setNotifications(stored.notifications)
    setBrandColor(stored.brandColor)
    setMounted(true)
  }, [])

  const handleProfileChange = useCallback(
    (field: keyof ProfileSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile((prev) => ({ ...prev, [field]: e.target.value }))
      setSaveSuccess(false)
    },
    []
  )

  const handleNotificationChange = useCallback(
    (field: keyof NotificationSettings) => (next: boolean) => {
      setNotifications((prev) => ({ ...prev, [field]: next }))
      setSaveSuccess(false)
    },
    []
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveSuccess(false)

    const settings: PersistedSettings = { profile, notifications, brandColor }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      // Brief artificial delay so the button state is visible
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }, [profile, notifications, brandColor])

  const handleSignOut = useCallback(() => {
    window.localStorage.clear()
    router.push('/auth')
  }, [router])

  const saveButtonLabel = saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'

  // Don't render form content until hydrated to avoid mismatch
  if (!mounted) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <div
          style={{
            height: 200,
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      {/* Demo Mode Banner */}
      {isDemoMode() && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'rgba(0, 109, 216, 0.08)',
            border: '1px solid rgba(0, 109, 216, 0.18)',
            borderRadius: 12,
            padding: '10px 16px',
            marginBottom: 24,
          }}
        >
          <Info size={15} style={{ color: 'var(--oculus-blue)', flexShrink: 0 }} />
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.01em',
            }}
          >
            Demo mode — settings persist in localStorage only.
          </p>
        </motion.div>
      )}

      {/* Page Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 28 }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}
        >
          Settings
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 14,
            color: 'var(--text-muted)',
            letterSpacing: '-0.01em',
          }}
        >
          Manage your profile, notifications, and preferences.
        </p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <OculusCard>
            <SectionLabel>Profile</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label
                  htmlFor="profile-name"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    marginBottom: 6,
                  }}
                >
                  Name
                </label>
                <OculusInput
                  id="profile-name"
                  type="text"
                  placeholder="Your full name"
                  value={profile.name}
                  onChange={handleProfileChange('name')}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-email"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <OculusInput
                  id="profile-email"
                  type="email"
                  placeholder="you@yourfirm.com"
                  value={profile.email}
                  onChange={handleProfileChange('email')}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-firm"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    marginBottom: 6,
                  }}
                >
                  Firm Name
                </label>
                <OculusInput
                  id="profile-firm"
                  type="text"
                  placeholder="Your firm or practice name"
                  value={profile.firm}
                  onChange={handleProfileChange('firm')}
                />
              </div>
            </div>
          </OculusCard>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <OculusCard>
            <SectionLabel>Notifications</SectionLabel>
            <div>
              <ToggleRow
                id="notif-email"
                label="Email Alerts"
                description="Get notified about important client changes"
                checked={notifications.emailAlerts}
                onChange={handleNotificationChange('emailAlerts')}
              />
              <ToggleRow
                id="notif-push"
                label="Push Notifications"
                description="Browser push notifications for urgent alerts"
                checked={notifications.pushAlerts}
                onChange={handleNotificationChange('pushAlerts')}
              />
              <ToggleRow
                id="notif-digest"
                label="Weekly Digest"
                description="Summary of practice metrics every Monday"
                checked={notifications.weeklyDigest}
                onChange={handleNotificationChange('weeklyDigest')}
              />
              {/* Last row has no bottom border */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingTop: 14,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <label
                    htmlFor="notif-reviews"
                    style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      marginBottom: 2,
                    }}
                  >
                    Client Review Reminders
                  </label>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Reminders when reviews are due
                  </p>
                </div>
                <Toggle
                  id="notif-reviews"
                  checked={notifications.clientReviews}
                  onChange={handleNotificationChange('clientReviews')}
                />
              </div>
            </div>
          </OculusCard>
        </motion.div>

        {/* Brand Color Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <OculusCard>
            <SectionLabel>Brand Color</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {/* Native color picker */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  letterSpacing: '-0.01em',
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: brandColor,
                    border: '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => {
                      setBrandColor(e.target.value)
                      setSaveSuccess(false)
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                    aria-label="Pick a custom brand color"
                  />
                </span>
                Custom
              </label>

              {/* Preset swatches */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((color) => {
                  const isActive = brandColor.toLowerCase() === color.toLowerCase()
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setBrandColor(color)
                        setSaveSuccess(false)
                      }}
                      title={color}
                      aria-label={`Set brand color to ${color}`}
                      aria-pressed={isActive}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: color,
                        border: isActive
                          ? `2px solid var(--text-primary)`
                          : '2px solid transparent',
                        boxShadow: isActive
                          ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${color}`
                          : 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'box-shadow 150ms ease, border-color 150ms ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isActive && (
                        <Check
                          size={14}
                          strokeWidth={2.5}
                          style={{ color: '#ffffff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Current hex preview */}
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 12,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {brandColor.toUpperCase()}
            </p>
          </OculusCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <OculusButton
            variant="primary"
            loading={saving}
            onClick={handleSave}
            style={{
              minWidth: 140,
              backgroundColor: saveSuccess ? 'var(--oculus-green)' : undefined,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={saveButtonLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {saveSuccess && <Check size={14} strokeWidth={2.5} />}
                {saveButtonLabel}
              </motion.span>
            </AnimatePresence>
          </OculusButton>
        </motion.div>

        {/* Sign Out Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Sign out of Oculus
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  letterSpacing: '-0.01em',
                }}
              >
                Clears local session and returns to login.
              </p>
            </div>
            <OculusButton
              variant="outline"
              onClick={handleSignOut}
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)' }}
            >
              <LogOut size={14} />
              Sign Out
            </OculusButton>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
