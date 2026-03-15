import type { BiasSeverity, BiasKey, MarketMoodState, BehaviorFlags } from './types'

export const BIAS_SEVERITY_COLORS: Readonly<Record<BiasSeverity, string>> = {
  0: '#8E8E93',
  1: '#fca311',
  2: '#ff5102',
  3: '#FF3B30',
} as const

export const MARKET_MOOD_COLORS: Readonly<Record<MarketMoodState, string>> = {
  steady: '#34C759',
  concerned: '#fca311',
  reactive: '#ff5102',
  panicked: '#FF3B30',
  euphoric: '#007AFF',
} as const

export const BIAS_LABELS: Readonly<Record<BiasKey, string>> = {
  loss_aversion: 'Loss Aversion',
  myopic_loss_aversion: 'Myopic Loss Aversion',
  disposition_effect: 'Disposition Effect',
  anchoring: 'Anchoring',
  regret_avoidance: 'Regret Avoidance',
  overconfidence: 'Overconfidence',
  recency_bias: 'Recency Bias',
  herding: 'Herding',
  fomo: 'FOMO',
  confirmation_bias: 'Confirmation Bias',
  inertia: 'Inertia',
  mental_accounting: 'Mental Accounting',
  sunk_cost: 'Sunk Cost Fallacy',
  availability_heuristic: 'Availability Heuristic',
  present_bias: 'Present Bias',
  narrative_bias: 'Narrative Bias',
} as const

export const BEHAVIOR_FLAG_LABELS: Readonly<Record<keyof BehaviorFlags, string>> = {
  panicSellTendency: 'Panic Sell Tendency',
  avoidancePattern: 'Avoidance Pattern',
  trendChase: 'Trend Chasing',
  checksOften: 'Frequent Portfolio Checking',
  anchoringToEntry: 'Anchoring to Entry Price',
} as const
