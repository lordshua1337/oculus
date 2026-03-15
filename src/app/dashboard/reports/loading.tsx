import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function ReportsLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading Reports"
      role="status"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <SkeletonLoader variant="text-lg" width="140px" height="28px" />
          <div style={{ marginTop: 8 }}>
            <SkeletonLoader variant="text-sm" width="260px" />
          </div>
        </div>
        <div className="skeleton-shimmer" style={{ width: 130, height: 38, borderRadius: 'var(--radius-btn)' }} />
      </div>

      {/* Sidebar + preview split */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar — report list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonLoader variant="text-sm" width="100px" height="14px" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{ height: 56, borderRadius: 'var(--radius-card)' }}
            />
          ))}
        </div>

        {/* Preview area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Preview header */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton-shimmer"
                style={{ width: 90, height: 32, borderRadius: 'var(--radius-btn)' }}
              />
            ))}
          </div>
          {/* Preview document body */}
          <div className="skeleton-shimmer" style={{ height: 560, borderRadius: 'var(--radius-card)' }} />
        </div>
      </div>
    </div>
  )
}
