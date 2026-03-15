import { ElementType } from 'react'
import { OculusButton } from './OculusButton'

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  icon: ElementType
  title: string
  description: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: '0',
      }}
      className={className}
    >
      {/* Icon container with branded soft bg */}
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--oculus-blue-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <Icon
          size={24}
          style={{ color: 'var(--oculus-blue)', opacity: 0.7 }}
          aria-hidden="true"
        />
      </div>

      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0,
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          maxWidth: '320px',
          margin: 0,
          letterSpacing: '-0.01em',
          marginBottom: action ? '24px' : 0,
        }}
      >
        {description}
      </p>

      {action ? (
        <OculusButton variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </OculusButton>
      ) : null}
    </div>
  )
}
