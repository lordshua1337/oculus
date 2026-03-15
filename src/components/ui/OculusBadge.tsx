import { HTMLAttributes } from 'react'

type BadgeVariant = 'blue' | 'green' | 'orange' | 'yellow' | 'red' | 'purple'

interface OculusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  blue: {
    backgroundColor: 'rgba(0, 109, 216, 0.1)',
    color: 'var(--oculus-blue)',
  },
  green: {
    backgroundColor: 'rgba(0, 185, 130, 0.1)',
    color: 'var(--oculus-green)',
  },
  orange: {
    backgroundColor: 'rgba(255, 81, 2, 0.1)',
    color: 'var(--oculus-orange)',
  },
  yellow: {
    backgroundColor: 'rgba(252, 163, 17, 0.1)',
    color: 'var(--oculus-yellow)',
  },
  red: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  purple: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
  },
}

export function OculusBadge({
  variant = 'blue',
  children,
  className = '',
  ...rest
}: OculusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: 'var(--radius-badge)',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
      }}
      className={className}
      {...rest}
    >
      {children}
    </span>
  )
}
