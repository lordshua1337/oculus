import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function RebalancerLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading Rebalancer"
      role="status"
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonLoader variant="text-lg" width="160px" height="28px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="300px" />
        </div>
      </div>

      {/* Two-panel layout — current vs target */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SkeletonLoader variant="text-base" width="120px" height="18px" />
            <div className="skeleton-shimmer" style={{ height: 260, borderRadius: 'var(--radius-card)' }} />
          </div>
        ))}
      </div>

      {/* Trade list */}
      <SkeletonLoader variant="text-base" width="140px" height="18px" />
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ height: 52, borderRadius: 'var(--radius-card)' }}
          />
        ))}
      </div>

      {/* Action button row */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <div className="skeleton-shimmer" style={{ width: 140, height: 40, borderRadius: 'var(--radius-btn)' }} />
        <div className="skeleton-shimmer" style={{ width: 110, height: 40, borderRadius: 'var(--radius-btn)' }} />
      </div>
    </div>
  )
}
