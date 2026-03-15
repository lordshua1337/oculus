// Barrel export for the DNA type system.
// Import all DNA types from this module.
export type {
  FactorCode,
  SubFactorCode,
  RpSubFactor,
  DsSubFactor,
  CnSubFactor,
  ToSubFactor,
  SiSubFactor,
  EsSubFactor,
  SpSubFactor,
  IpSubFactor,
  ArchetypeKey,
  BiasKey,
  MarketMoodState,
  BiasSeverity,
  FactorScore,
  BiasFlag,
  ArchetypeResult,
  FactorScores,
  MarketMoodProfile,
  BehaviorFlags,
  DNAProfileV2,
} from './types'

export type { ArchetypeInfo } from './archetypes'
export { ARCHETYPE_INFO } from './archetypes'

export type { FactorInfo } from './factors'
export { PRIMARY_FACTORS } from './factors'

export {
  BIAS_SEVERITY_COLORS,
  MARKET_MOOD_COLORS,
  BIAS_LABELS,
  BEHAVIOR_FLAG_LABELS,
} from './colors'
