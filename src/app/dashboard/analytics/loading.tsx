import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function AnalyticsLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading Analytics"
      role="status"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <SkeletonLoader variant="text-lg" width="150px" height="28px" />
          <div style={{ marginTop: 8 }}>
            <SkeletonLoader variant="text-sm" width="260px" />
          </div>
        </div>
        {/* Date range picker skeleton */}
        <div className="skeleton-shimmer" style={{ width: 200, height: 38, borderRadius: 'var(--radius-btn)' }} />
      </div>

      {/* 4 metric tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ height: 108, borderRadius: 'var(--radius-card)' }}
          />
        ))}
      </div>

      {/* Main chart */}
      <div
        className="skeleton-shimmer"
        style={{ height: 300, borderRadius: 'var(--radius-card)', marginBottom: 24 }}
      />

      {/* Two secondary charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ height: 220, borderRadius: 'var(--radius-card)' }}
          />
        ))}
      </div>
    </div>
  )
}
