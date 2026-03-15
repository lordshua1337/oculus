// Shared display constants for the Oculus advisor platform.
// All values are readonly. No mutation anywhere in this file.

import type { ArchetypeKey } from '@/lib/dna/types'
import type { ClientStatus } from '@/lib/db/types'

// ---- Client Status ----

/**
 * Hex color for each ClientStatus, used in badges, tags, and charts.
 */
export const STATUS_COLORS: Readonly<Record<ClientStatus, string>> = {
  lead: '#006DD8',
  onboarding: '#FF9500',
  active: '#34C759',
  review: '#AF52DE',
  churned: '#FF3B30',
} as const

/**
 * Human-readable label for each ClientStatus.
 */
export const STATUS_LABELS: Readonly<Record<ClientStatus, string>> = {
  lead: 'Lead',
  onboarding: 'Onboarding',
  active: 'Active',
  review: 'Review',
  churned: 'Churned',
} as const

// ---- Chart Palette ----

/**
 * Brand-safe chart color palette — 10 distinct colors.
 * First 5 are drawn from the Oculus status palette for consistency.
 * Remaining 5 extend the range for multi-series charts.
 */
export const CHART_PALETTE: readonly string[] = [
  '#006DD8', // oculus blue
  '#34C759', // oculus green
  '#FF9500', // oculus orange
  '#AF52DE', // oculus purple
  '#FF3B30', // oculus red
  '#5856D6', // indigo
  '#007AFF', // sky blue
  '#00b982', // teal
  '#ff5102', // ember
  '#fca311', // amber
] as const

// ---- Risk Labels ----

/**
 * Bucket labels for integer risk scores (0–100).
 * Ranges: 0–20 Very Low, 21–40 Low, 41–60 Moderate, 61–80 High, 81–100 Very High
 */
const RISK_LABEL_MAP: Readonly<{ [key: number]: string }> = {
  0: 'Very Low',
  20: 'Low',
  40: 'Moderate',
  60: 'High',
  80: 'Very High',
} as const

export { RISK_LABEL_MAP as RISK_LABELS }

/**
 * Returns a human-readable risk label for a given score (0–100).
 * Clamps values outside [0, 100] to the nearest boundary.
 */
export function getRiskLabel(score: number | null | undefined): string {
  if (score === null || score === undefined || isNaN(score)) return '—'
  const clamped = Math.max(0, Math.min(100, score))
  if (clamped <= 20) return 'Very Low'
  if (clamped <= 40) return 'Low'
  if (clamped <= 60) return 'Moderate'
  if (clamped <= 80) return 'High'
  return 'Very High'
}

// ---- Archetype Colors ----

/**
 * Hex color for each ArchetypeKey.
 * Colors are sourced directly from ARCHETYPE_INFO in src/lib/dna/archetypes.ts
 * to ensure visual consistency across the application.
 */
export const ARCHETYPE_COLORS: Readonly<Record<ArchetypeKey, string>> = {
  systems_builder: '#006DD8',
  reassurance_seeker: '#5856D6',
  analytical_skeptic: '#007AFF',
  diy_controller: '#FF9500',
  collaborative_partner: '#34C759',
  big_picture_optimist: '#00b982',
  trend_sensitive_explorer: '#ff5102',
  avoider_under_stress: '#8E8E93',
  action_first_decider: '#fca311',
  values_anchored_steward: '#30D158',
} as const
