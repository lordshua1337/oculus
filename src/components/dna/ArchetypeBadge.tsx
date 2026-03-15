import {
  Cpu,
  Shield,
  Search,
  Wrench,
  Users,
  TrendingUp,
  Zap,
  Anchor,
  Target,
  Heart,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import type { ArchetypeKey } from '@/lib/dna/types'

// ---- Icon lookup -----------------------------------------------------------

const ICON_MAP: Readonly<Record<string, LucideIcon>> = {
  cpu: Cpu,
  shield: Shield,
  search: Search,
  wrench: Wrench,
  users: Users,
  'trending-up': TrendingUp,
  zap: Zap,
  anchor: Anchor,
  target: Target,
  heart: Heart,
}

// ---- Size config -----------------------------------------------------------

interface SizeConfig {
  fontSize: string
  iconSize: number
  paddingX: string
  paddingY: string
}

const SIZE_CONFIG: Readonly<Record<'sm' | 'md' | 'lg', SizeConfig>> = {
  sm: { fontSize: '12px', iconSize: 12, paddingX: '8px', paddingY: '2px' },
  md: { fontSize: '13px', iconSize: 14, paddingX: '10px', paddingY: '4px' },
  lg: { fontSize: '14px', iconSize: 16, paddingX: '12px', paddingY: '6px' },
}

// ---- Props -----------------------------------------------------------------

interface ArchetypeBadgeProps {
  archetypeKey: ArchetypeKey
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ---- Component -------------------------------------------------------------

export function ArchetypeBadge({
  archetypeKey,
  size = 'md',
  className = '',
}: ArchetypeBadgeProps) {
  const info = ARCHETYPE_INFO[archetypeKey]
  const config = SIZE_CONFIG[size]

  // Fallback for unknown archetype keys
  if (!info) {
    const FallbackIcon = HelpCircle
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(142, 142, 147, 0.15)',
          paddingLeft: config.paddingX,
          paddingRight: config.paddingX,
          paddingTop: config.paddingY,
          paddingBottom: config.paddingY,
          fontSize: config.fontSize,
          fontWeight: 500,
          color: '#8E8E93',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <FallbackIcon size={config.iconSize} strokeWidth={2} aria-hidden />
        Unknown
      </span>
    )
  }

  const IconComponent = ICON_MAP[info.icon] ?? HelpCircle

  // Parse hex color to get rgba with opacity
  const hex = info.color
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const bgColor = `rgba(${r}, ${g}, ${b}, 0.15)`

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        backgroundColor: bgColor,
        paddingLeft: config.paddingX,
        paddingRight: config.paddingX,
        paddingTop: config.paddingY,
        paddingBottom: config.paddingY,
        fontSize: config.fontSize,
        fontWeight: 500,
        color: info.color,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <IconComponent size={config.iconSize} strokeWidth={2} aria-hidden />
      {info.name}
    </span>
  )
}
