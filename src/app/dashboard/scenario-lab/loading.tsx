import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function ScenarioLabLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading Scenario Lab"
      role="status"
    >
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonLoader variant="text-lg" width="190px" height="28px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="360px" />
        </div>
      </div>

      {/* 3 scenario tool cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ height: 220, borderRadius: 'var(--radius-card)' }}
          />
        ))}
      </div>

      {/* Recent runs section */}
      <div style={{ marginTop: 40 }}>
        <SkeletonLoader variant="text-base" width="140px" height="20px" />
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{ height: 60, borderRadius: 'var(--radius-card)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
