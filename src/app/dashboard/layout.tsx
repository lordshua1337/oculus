'use client'

import { Navigation } from '@/components/common/Navigation'
import { SidebarProvider } from '@/lib/context/sidebar-context'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: -60,
          left: 16,
          zIndex: 999,
          padding: '8px 16px',
          borderRadius: 'var(--radius-btn)',
          background: 'var(--oculus-blue)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'top var(--transition-fast)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '16px'
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-60px'
        }}
      >
        Skip to content
      </a>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100vh',
          background: 'var(--bg-base)',
        }}
      >
        {/* Sidebar — Navigation handles both desktop sticky and mobile overlay */}
        <Navigation />

        {/* Main content — full width on mobile (sidebar is overlay, not push) */}
        <main
          id="main-content"
          style={{
            flex: 1,
            overflow: 'auto',
            minWidth: 0,
          }}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
