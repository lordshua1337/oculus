import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function MultiPortfolioLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading Multi-Portfolio Comparison"
      role="status"
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonLoader variant="text-lg" width="240px" height="28px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="340px" />
        </div>
      </div>

      {/* Portfolio selector row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ width: 160, height: 44, borderRadius: 'var(--radius-card)' }}
          />
        ))}
        <div className="skeleton-shimmer" style={{ width: 36, height: 36, borderRadius: '50%' }} />
      </div>

      {/* Comparison table / chart */}
      <div
        className="skeleton-shimmer"
        style={{ height: 320, borderRadius: 'var(--radius-card)', marginBottom: 24 }}
      />

      {/* Metrics comparison row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-shimmer"
            style={{ height: 110, borderRadius: 'var(--radius-card)' }}
          />
        ))}
      </div>
    </div>
  )
}
