import type { ArchetypeKey } from './types'

export interface ArchetypeInfo {
  readonly key: ArchetypeKey
  readonly name: string
  readonly tagline: string
  readonly description: string
  readonly communicationRule: string
  readonly color: string
  readonly icon: string
}

export const ARCHETYPE_INFO: Readonly<Record<ArchetypeKey, ArchetypeInfo>> = {
  systems_builder: {
    key: 'systems_builder',
    name: 'Money Architect',
    tagline: 'The Strategic Engineer',
    description:
      'Systematic, data-driven investor who builds portfolios like systems. Optimizes for structure, consistency, and measurable outcomes.',
    communicationRule:
      'Lead with frameworks, processes, and measurable outcomes — show the system behind the recommendation.',
    color: '#006DD8',
    icon: 'cpu',
  },
  reassurance_seeker: {
    key: 'reassurance_seeker',
    name: 'Safe Harbor',
    tagline: 'The Security-First Investor',
    description:
      'Needs constant validation and reassurance before acting. Prioritizes capital preservation and emotional safety over returns.',
    communicationRule:
      'Acknowledge concerns first, then provide clear evidence of safety before introducing any action.',
    color: '#5856D6',
    icon: 'shield',
  },
  analytical_skeptic: {
    key: 'analytical_skeptic',
    name: 'Data Hawk',
    tagline: 'The Evidence Demander',
    description:
      'Will not act without robust proof. Questions every assumption and demands citations, back-tests, and historical precedent.',
    communicationRule:
      'Lead with data, sources, and evidence — never make claims without supporting proof they can verify.',
    color: '#007AFF',
    icon: 'search',
  },
  diy_controller: {
    key: 'diy_controller',
    name: 'Self-Made Investor',
    tagline: 'The Independent Operator',
    description:
      'Wants full control and minimal hand-holding. Prefers to research independently and make autonomous decisions.',
    communicationRule:
      'Give tools and information, not directives — frame everything as options they can choose from.',
    color: '#FF9500',
    icon: 'wrench',
  },
  collaborative_partner: {
    key: 'collaborative_partner',
    name: 'Strategy Partner',
    tagline: 'The Team Player',
    description:
      'Values the advisor relationship and collaborative decision-making. Sees investing as a shared journey.',
    communicationRule:
      'Use inclusive language and invite their input — make every recommendation feel like a joint decision.',
    color: '#34C759',
    icon: 'users',
  },
  big_picture_optimist: {
    key: 'big_picture_optimist',
    name: 'Marathon Runner',
    tagline: 'The Long-Game Player',
    description:
      'Patient, growth-focused investor who tunes out short-term noise and stays locked on long-horizon outcomes.',
    communicationRule:
      'Anchor every conversation to the long-term vision — minimize discussion of short-term volatility.',
    color: '#00b982',
    icon: 'trending-up',
  },
  trend_sensitive_explorer: {
    key: 'trend_sensitive_explorer',
    name: 'Momentum Rider',
    tagline: 'The Trend Spotter',
    description:
      'Follows market momentum and emerging themes. FOMO-prone and energized by narratives and recent winners.',
    communicationRule:
      'Acknowledge the trend, then redirect energy toward position sizing and risk limits before acting.',
    color: '#ff5102',
    icon: 'zap',
  },
  avoider_under_stress: {
    key: 'avoider_under_stress',
    name: 'Steady Hand',
    tagline: 'The Calm Anchor',
    description:
      'Avoids decisions under pressure and tends to freeze during volatility. Needs low-friction, low-stakes action paths.',
    communicationRule:
      'Remove friction from every step and break actions into the smallest possible units to avoid paralysis.',
    color: '#8E8E93',
    icon: 'anchor',
  },
  action_first_decider: {
    key: 'action_first_decider',
    name: 'First Mover',
    tagline: 'The Quick Trigger',
    description:
      'Acts fast and optimizes later. Biased toward motion and can under-research before committing.',
    communicationRule:
      'Match their pace but always surface the one key risk before they execute — keep it to a single sentence.',
    color: '#fca311',
    icon: 'target',
  },
  values_anchored_steward: {
    key: 'values_anchored_steward',
    name: 'Purpose Investor',
    tagline: 'The Mission-Driven Allocator',
    description:
      'ESG and values-first investor who filters every decision through ethical and impact lenses.',
    communicationRule:
      'Always connect returns to impact — lead with how the investment aligns with their stated values.',
    color: '#30D158',
    icon: 'heart',
  },
} as const
