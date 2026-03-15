'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useSidebar } from '@/lib/context/sidebar-context'

interface NavItem {
  href: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  label: string
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Command Center', exact: true },
  { href: '/dashboard/crm', icon: Users, label: 'Clients' },
  { href: '/dashboard/scenario-lab', icon: FlaskConical, label: 'Scenario Lab' },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

function isActive(href: string, pathname: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

function ThemeToggle() {
  useEffect(() => {
    const saved = localStorage.getItem('oculus-theme')
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme')
    const next = current === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('oculus-theme', next)
  }

  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.getAttribute('data-theme') === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      }}
      className="oculus-btn-variant-ghost"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export function Navigation() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          transition: 'width 300ms ease, min-width 300ms ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: collapsed ? 0 : 20,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: 'var(--oculus-blue)',
              fontWeight: 700,
              fontSize: collapsed ? 13 : 16,
              letterSpacing: collapsed ? '0.08em' : '-0.02em',
              whiteSpace: 'nowrap',
              transition: 'font-size 300ms ease',
            }}
          >
            {collapsed ? 'OC' : 'OCULUS'}
          </span>
        </div>

        {/* Nav items */}
        <nav
          aria-label="Main navigation"
          style={{
            flex: 1,
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflowY: 'auto',
          }}
        >
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
            const active = isActive(href, pathname, exact)
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  height: 40,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--oculus-blue)' : 'var(--text-secondary)',
                  background: active ? 'rgba(0,109,216,0.12)' : 'transparent',
                  transition:
                    'background var(--transition-fast), color var(--transition-fast)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                className={active ? '' : 'nav-item-hover'}
                onMouseEnter={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background =
                      'var(--bg-input)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ overflow: 'hidden' }}>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom controls */}
        <div
          style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: collapsed ? 'center' : 'flex-start',
          }}
        >
          <ThemeToggle />
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast), color var(--transition-fast)',
            }}
            className="oculus-btn-variant-ghost"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-drawer"
        className="md:hidden flex items-center justify-center"
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 10,
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-card)',
          zIndex: 50,
        }}
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                zIndex: 60,
              }}
            />

            {/* Drawer */}
            <motion.aside
              id="mobile-nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: 240,
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 70,
              }}
            >
              {/* Mobile header */}
              <div
                style={{
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: 'var(--oculus-blue)',
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '-0.02em',
                  }}
                >
                  OCULUS
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mobile nav items */}
              <nav
                aria-label="Main navigation"
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
                  const active = isActive(href, pathname, exact)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '9px 12px',
                        borderRadius: 10,
                        height: 40,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        color: active ? 'var(--oculus-blue)' : 'var(--text-secondary)',
                        background: active ? 'rgba(0,109,216,0.12)' : 'transparent',
                        transition:
                          'background var(--transition-fast), color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-input)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                        }
                      }}
                    >
                      <Icon size={20} style={{ flexShrink: 0 }} />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile bottom */}
              <div
                style={{
                  padding: '12px 8px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <ThemeToggle />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
