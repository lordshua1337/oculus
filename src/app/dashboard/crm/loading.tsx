import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function CRMLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading CRM"
      role="status"
    >
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <SkeletonLoader variant="text-lg" width="160px" height="28px" />
          <div style={{ marginTop: 8 }}>
            <SkeletonLoader variant="text-sm" width="280px" />
          </div>
        </div>
        <div className="skeleton-shimmer" style={{ width: 120, height: 38, borderRadius: 'var(--radius-btn)' }} />
      </div>

      {/* 5 kanban columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {[0, 1, 2, 3, 4].map((col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <SkeletonLoader variant="text-sm" width="90px" height="14px" />
              <div className="skeleton-shimmer" style={{ width: 22, height: 18, borderRadius: 4 }} />
            </div>
            {/* Cards — staggered count per column */}
            {Array.from({ length: col === 2 ? 4 : col === 0 ? 3 : 2 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer"
                style={{ height: 88 + (i % 2) * 20, borderRadius: 'var(--radius-card)' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
