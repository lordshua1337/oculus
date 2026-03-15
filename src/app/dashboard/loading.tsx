import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function DashboardLoading() {
  return (
    <div
      style={{
        padding: '32px 32px 40px',
        maxWidth: 1400,
        margin: '0 auto',
      }}
      aria-label="Loading dashboard"
      role="status"
    >
      {/* Page heading skeleton */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonLoader variant="text-lg" width="200px" height="28px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="320px" />
        </div>
      </div>

      {/* 4 MetricCard skeletons in a row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{
              height: 120,
              borderRadius: 'var(--radius-card)',
            }}
          />
        ))}
      </div>

      {/* 1 large content area skeleton below */}
      <div
        className="skeleton-shimmer"
        style={{
          height: 360,
          borderRadius: 'var(--radius-card)',
        }}
      />
    </div>
  )
}
