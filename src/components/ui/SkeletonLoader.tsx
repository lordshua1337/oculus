import { CSSProperties } from 'react'

type SkeletonVariant =
  | 'text-sm'
  | 'text-base'
  | 'text-lg'
  | 'block'
  | 'card'
  | 'avatar'

interface SkeletonLoaderProps {
  variant?: SkeletonVariant
  className?: string
  width?: string | number
  height?: string | number
}

const variantDimensions: Record<SkeletonVariant, CSSProperties> = {
  'text-sm': {
    height: '12px',
    width: '60%',
    borderRadius: '4px',
  },
  'text-base': {
    height: '16px',
    width: '80%',
    borderRadius: '4px',
  },
  'text-lg': {
    height: '22px',
    width: '70%',
    borderRadius: '4px',
  },
  block: {
    height: '48px',
    width: '100%',
    borderRadius: 'var(--radius-input)',
  },
  card: {
    height: '120px',
    width: '100%',
    borderRadius: 'var(--radius-card)',
  },
  avatar: {
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    flexShrink: 0,
  },
}

export function SkeletonLoader({
  variant = 'text-base',
  className = '',
  width,
  height,
}: SkeletonLoaderProps) {
  const base = variantDimensions[variant]

  return (
    <div
      className={['skeleton-shimmer', className].filter(Boolean).join(' ')}
      style={{
        ...base,
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
        display: 'block',
      }}
      aria-busy="true"
      aria-label="Loading..."
      role="status"
    />
  )
}
