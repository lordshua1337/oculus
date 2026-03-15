import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function SettingsLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 860, margin: '0 auto' }}
      aria-label="Loading Settings"
      role="status"
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <SkeletonLoader variant="text-lg" width="120px" height="28px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="240px" />
        </div>
      </div>

      {/* Settings sections */}
      {[0, 1, 2, 3].map((section) => (
        <div
          key={section}
          style={{
            marginBottom: 32,
            paddingBottom: 32,
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Section label */}
          <SkeletonLoader variant="text-base" width="160px" height="18px" />
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Form rows — label + input pairs */}
            {Array.from({ length: section === 0 ? 3 : 2 }).map((_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'center' }}>
                <SkeletonLoader variant="text-sm" width="120px" height="14px" />
                <div className="skeleton-shimmer" style={{ height: 40, borderRadius: 'var(--radius-input)' }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save button */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <div className="skeleton-shimmer" style={{ width: 100, height: 40, borderRadius: 'var(--radius-btn)' }} />
        <div className="skeleton-shimmer" style={{ width: 120, height: 40, borderRadius: 'var(--radius-btn)' }} />
      </div>
    </div>
  )
}
