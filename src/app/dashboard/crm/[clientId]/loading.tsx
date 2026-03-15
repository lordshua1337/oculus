import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

export default function ClientDetailLoading() {
  return (
    <div
      style={{ padding: '32px 32px 40px', maxWidth: 1400, margin: '0 auto' }}
      aria-label="Loading client profile"
      role="status"
    >
      {/* Back link + heading */}
      <div style={{ marginBottom: 28 }}>
        <div className="skeleton-shimmer" style={{ width: 80, height: 14, borderRadius: 4, marginBottom: 12 }} />
        <SkeletonLoader variant="text-lg" width="220px" height="30px" />
        <div style={{ marginTop: 8 }}>
          <SkeletonLoader variant="text-sm" width="180px" />
        </div>
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left — info card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar + name */}
          <div
            className="skeleton-shimmer"
            style={{ height: 180, borderRadius: 'var(--radius-card)' }}
          />
          {/* Stats block */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{ height: 64, borderRadius: 'var(--radius-card)' }}
            />
          ))}
        </div>

        {/* Right — DNA sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[100, 80, 120, 90].map((w, i) => (
              <div
                key={i}
                className="skeleton-shimmer"
                style={{ width: w, height: 34, borderRadius: 'var(--radius-btn)' }}
              />
            ))}
          </div>

          {/* DNA content cards */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer"
              style={{ height: 200, borderRadius: 'var(--radius-card)' }}
            />
          ))}

          {/* Row of smaller insight cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton-shimmer"
                style={{ height: 120, borderRadius: 'var(--radius-card)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
