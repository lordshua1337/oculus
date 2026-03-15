import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface OculusInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: ReactNode
  className?: string
}

export const OculusInput = forwardRef<HTMLInputElement, OculusInputProps>(
  function OculusInput({ error, icon, className = '', ...rest }, ref) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          {icon ? (
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            className={['oculus-input', error ? 'oculus-input--error' : '', className]
              .filter(Boolean)
              .join(' ')}
            style={{
              paddingLeft: icon ? '38px' : undefined,
            }}
            aria-invalid={error ? 'true' : undefined}
            {...rest}
          />
        </div>
        {error ? (
          <span
            style={{
              fontSize: '12px',
              color: '#ef4444',
              letterSpacing: '-0.01em',
            }}
            role="alert"
          >
            {error}
          </span>
        ) : null}
      </div>
    )
  }
)
