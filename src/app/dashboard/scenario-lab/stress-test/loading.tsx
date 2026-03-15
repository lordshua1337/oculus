import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function StressTestLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading Stress Test"
      role="status"
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonLoader variant="text-lg" width="180px" height="28px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="300px" />
        </div>
      </div>

      {/* Scenario tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[140, 120, 160, 110, 130].map((w, i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ width: w, height: 36, borderRadius: 'var(--radius-btn)' }}
          />
        ))}
      </div>

      {/* Main input panel */}
      <div
        className="skeleton-shimmer"
        style={{ height: 200, borderRadius: 'var(--radius-card)', marginBottom: 24 }}
      />

      {/* Result cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ height: 140, borderRadius: 'var(--radius-card)' }}
          />
        ))}
      </div>

      {/* Chart area */}
      <div
        className="skeleton-shimmer"
        style={{ height: 280, borderRadius: 'var(--radius-card)', marginTop: 24 }}
      />
    </div>
  )
}
