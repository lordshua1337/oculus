import { HTMLAttributes, CSSProperties } from 'react'

interface OculusCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  onClick?: () => void
  className?: string
  children: React.ReactNode
  style?: CSSProperties
}

export function OculusCard({
  hover = false,
  onClick,
  className = '',
  children,
  style: styleProp,
  ...rest
}: OculusCardProps) {
  const isInteractive = hover || Boolean(onClick)

  const baseStyle: CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
    transition: 'box-shadow var(--transition-base), transform var(--transition-fast)',
    cursor: onClick ? 'pointer' : undefined,
    ...styleProp,
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      style={baseStyle}
      className={[
        isInteractive ? 'oculus-card-hover' : '',
        onClick
          ? 'focus-visible:outline-2 focus-visible:outline-offset-2'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}
