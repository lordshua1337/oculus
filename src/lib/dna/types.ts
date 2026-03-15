// StockPilot DNA Type System
// All types are readonly to enforce immutability.

// ---- Primary Factor Codes ----
// RP = Risk Perception
// DS = Decision Style
// CN = Control Needs
// TO = Time Orientation
// SI = Social Influence
// ES = Emotional Sensitivity
// SP = Stress Profile
// IP = Information Processing
export type FactorCode = 'RP' | 'DS' | 'CN' | 'TO' | 'SI' | 'ES' | 'SP' | 'IP'

// ---- Sub-Factor Codes ----
// 3 sub-factors per primary factor, 24 total.
// RP sub-factors
export type RpSubFactor = 'RP_LT' | 'RP_VL' | 'RP_PT'
// DS sub-factors
export type DsSubFactor = 'DS_AT' | 'DS_DC' | 'DS_RE'
// CN sub-factors
export type CnSubFactor = 'CN_AU' | 'CN_VF' | 'CN_MI'
// TO sub-factors
export type ToSubFactor = 'TO_HS' | 'TO_PF' | 'TO_RW'
// SI sub-factors
export type SiSubFactor = 'SI_PR' | 'SI_CF' | 'SI_EX'
// ES sub-factors
export type EsSubFactor = 'ES_VL' | 'ES_RG' | 'ES_EX'
// SP sub-factors
export type SpSubFactor = 'SP_TH' | 'SP_RB' | 'SP_AV'
// IP sub-factors
export type IpSubFactor = 'IP_DD' | 'IP_IT' | 'IP_SF'

export type SubFactorCode =
  | RpSubFactor
  | DsSubFactor
  | CnSubFactor
  | ToSubFactor
  | SiSubFactor
  | EsSubFactor
  | SpSubFactor
  | IpSubFactor

// ---- Archetype Keys ----
// 10 behavioral archetypes derived from factor scoring.
export type ArchetypeKey =
  | 'systems_builder'
  | 'reassurance_seeker'
  | 'analytical_skeptic'
  | 'diy_controller'
  | 'collaborative_partner'
  | 'big_picture_optimist'
  | 'trend_sensitive_explorer'
  | 'avoider_under_stress'
  | 'action_first_decider'
  | 'values_anchored_steward'

// ---- Bias Keys ----
// 16 behavioral finance biases that can be flagged in a user's profile.
export type BiasKey =
  | 'loss_aversion'
  | 'myopic_loss_aversion'
  | 'disposition_effect'
  | 'anchoring'
  | 'regret_avoidance'
  | 'overconfidence'
  | 'recency_bias'
  | 'herding'
  | 'fomo'
  | 'confirmation_bias'
  | 'inertia'
  | 'mental_accounting'
  | 'sunk_cost'
  | 'availability_heuristic'
  | 'present_bias'
  | 'narrative_bias'

// ---- Market Mood State ----
// Describes the user's emotional state relative to market conditions.
export type MarketMoodState = 'panicked' | 'reactive' | 'euphoric' | 'concerned' | 'steady'

// ---- Bias Severity Scale ----
// 0 = not present, 1 = mild, 2 = moderate, 3 = strong
export type BiasSeverity = 0 | 1 | 2 | 3

// ---- Factor Score ----
// Scores for a single primary factor across multiple dimensions.
export interface FactorScore {
  readonly raw: number
  readonly normalized: number
  readonly percentile: number
  readonly confidence: number
}

// ---- Bias Flag ----
// A detected bias and its measured severity.
export interface BiasFlag {
  readonly key: BiasKey
  readonly severity: BiasSeverity
}

// ---- Archetype Result ----
// The output of archetype classification, including ranked scores.
export interface ArchetypeResult {
  readonly primary: ArchetypeKey
  readonly secondary?: ArchetypeKey
  readonly scores: Readonly<Partial<Record<ArchetypeKey, number>>>
}

// ---- Factor Scores ----
// A score entry for each of the 8 primary factors.
export type FactorScores = Readonly<Record<FactorCode, FactorScore>>

// ---- Market Mood Profile ----
// Captures how the user responds to different market environments.
export interface MarketMoodProfile {
  readonly state: MarketMoodState
  readonly volatilityResponse: number
  readonly panicThreshold: number
  readonly euphoriaThreshold: number
}

// ---- Behavior Flags ----
// Boolean flags for common behavioral patterns detected from assessment.
export interface BehaviorFlags {
  readonly panicSellTendency: boolean
  readonly avoidancePattern: boolean
  readonly trendChase: boolean
  readonly checksOften: boolean
  readonly anchoringToEntry: boolean
}

// ---- DNA Profile V2 ----
// The complete behavioral DNA profile for a user.
// This is the primary output of the assessment engine.
export interface DNAProfileV2 {
  readonly archetype: ArchetypeResult
  readonly factors: FactorScores
  readonly biases: readonly BiasFlag[]
  readonly marketMood: MarketMoodProfile
  readonly behaviorFlags: BehaviorFlags
  readonly behavioralRule: string
  readonly strengths: readonly string[]
  readonly vulnerabilities: readonly string[]
}
