'use client'

import { ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface OculusButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
  className?: string
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: '12px', gap: '6px' },
  md: { padding: '10px 20px', fontSize: '14px', gap: '8px', minHeight: '44px' },
  lg: { padding: '13px 26px', fontSize: '15px', gap: '8px', minHeight: '44px' },
}

const iconSizes: Record<Size, number> = {
  sm: 12,
  md: 14,
  lg: 16,
}

export function OculusButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  onClick,
  ...rest
}: OculusButtonProps) {
  const isDisabled = disabled || loading

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-btn)',
    fontFamily: 'inherit',
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition:
      'background-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast)',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
  }

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--oculus-blue)',
      color: '#ffffff',
      boxShadow: isDisabled ? 'none' : 'var(--shadow-btn)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.25)',
    },
  }

  const variantClassMap: Record<Variant, string> = {
    primary: 'oculus-btn-variant-primary',
    outline: 'oculus-btn-variant-outline',
    ghost: 'oculus-btn-variant-ghost',
    danger: 'oculus-btn-variant-danger',
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      className={[variantClassMap[variant], className].filter(Boolean).join(' ')}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <Loader2
          size={iconSizes[size]}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      ) : null}
      {children}
    </button>
  )
}
