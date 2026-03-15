// Demo data for the Oculus advisor platform.
// All data is deterministic — no Math.random().
// totalAUM = 16090000 (sum of all 8 clients).

import type { DNAProfileV2 } from './dna/types'
import type { ClientStatus } from './db/types'

export interface DemoClient {
  readonly id: string
  readonly first_name: string
  readonly last_name: string
  readonly email: string
  readonly phone: string
  readonly status: ClientStatus
  readonly aum: number
  readonly brand_color: string
  readonly last_contact_at: string
  readonly next_review_at: string
  readonly created_at: string
  readonly updated_at: string
  readonly dna: DNAProfileV2
}

// ---- Client 1: Sarah Mitchell ----
// Archetype: big_picture_optimist
// AUM: 2,400,000 | status: active
// High TO (85), Low RP (35) | mood: steady
const sarahMitchell: DemoClient = {
  id: 'sarah-mitchell',
  first_name: 'Sarah',
  last_name: 'Mitchell',
  email: 'sarah.mitchell@example.com',
  phone: '(415) 555-0101',
  status: 'active',
  aum: 2400000,
  brand_color: '#00b982',
  last_contact_at: '2026-03-01T10:00:00Z',
  next_review_at: '2026-06-01T10:00:00Z',
  created_at: '2024-01-15T09:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',
  dna: {
    archetype: {
      primary: 'big_picture_optimist',
      secondary: 'values_anchored_steward',
      scores: {
        big_picture_optimist: 0.82,
        values_anchored_steward: 0.61,
        collaborative_partner: 0.44,
      },
    },
    factors: {
      RP: { raw: 2.8, normalized: 35, percentile: 32, confidence: 0.88 },
      DS: { raw: 3.5, normalized: 50, percentile: 48, confidence: 0.84 },
      CN: { raw: 3.2, normalized: 46, percentile: 44, confidence: 0.81 },
      TO: { raw: 6.1, normalized: 85, percentile: 87, confidence: 0.91 },
      SI: { raw: 3.0, normalized: 43, percentile: 41, confidence: 0.80 },
      ES: { raw: 4.8, normalized: 66, percentile: 64, confidence: 0.86 },
      SP: { raw: 4.2, normalized: 59, percentile: 57, confidence: 0.82 },
      IP: { raw: 4.5, normalized: 63, percentile: 61, confidence: 0.85 },
    },
    biases: [
      { key: 'recency_bias', severity: 1 },
      { key: 'anchoring', severity: 1 },
    ],
    marketMood: {
      state: 'steady',
      volatilityResponse: 0.28,
      panicThreshold: 0.72,
      euphoriaThreshold: 0.55,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: false,
      trendChase: false,
      checksOften: false,
      anchoringToEntry: true,
    },
    behavioralRule:
      'Lead with 10-year horizon data. Anchor recommendations to long-term compounding narratives. Avoid short-term volatility framing.',
    strengths: [
      'Exceptional patience during market downturns',
      'Strong long-term conviction that prevents panic selling',
    ],
    vulnerabilities: [
      'May anchor too heavily to original entry price, resisting rebalancing',
      'Mild recency bias can distort assessment of recent market events',
    ],
  },
}

// ---- Client 2: James Chen ----
// Archetype: values_anchored_steward
// AUM: 1,800,000 | status: active
// High SI (78), High ES (82) | mood: concerned
const jamesChen: DemoClient = {
  id: 'james-chen',
  first_name: 'James',
  last_name: 'Chen',
  email: 'james.chen@example.com',
  phone: '(212) 555-0202',
  status: 'active',
  aum: 1800000,
  brand_color: '#30D158',
  last_contact_at: '2026-02-20T14:00:00Z',
  next_review_at: '2026-05-20T14:00:00Z',
  created_at: '2024-03-10T09:00:00Z',
  updated_at: '2026-02-20T14:00:00Z',
  dna: {
    archetype: {
      primary: 'values_anchored_steward',
      secondary: 'collaborative_partner',
      scores: {
        values_anchored_steward: 0.86,
        collaborative_partner: 0.67,
        big_picture_optimist: 0.48,
      },
    },
    factors: {
      RP: { raw: 3.4, normalized: 48, percentile: 46, confidence: 0.83 },
      DS: { raw: 3.0, normalized: 43, percentile: 40, confidence: 0.82 },
      CN: { raw: 3.6, normalized: 51, percentile: 49, confidence: 0.80 },
      TO: { raw: 5.2, normalized: 72, percentile: 70, confidence: 0.87 },
      SI: { raw: 5.6, normalized: 78, percentile: 76, confidence: 0.90 },
      ES: { raw: 5.9, normalized: 82, percentile: 80, confidence: 0.89 },
      SP: { raw: 4.0, normalized: 56, percentile: 54, confidence: 0.81 },
      IP: { raw: 4.3, normalized: 61, percentile: 59, confidence: 0.84 },
    },
    biases: [
      { key: 'confirmation_bias', severity: 2 },
      { key: 'herding', severity: 1 },
      { key: 'narrative_bias', severity: 1 },
    ],
    marketMood: {
      state: 'concerned',
      volatilityResponse: 0.48,
      panicThreshold: 0.55,
      euphoriaThreshold: 0.65,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: false,
      trendChase: false,
      checksOften: true,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Always connect portfolio actions to stated values and ESG alignment. Use peer-group social proof carefully — confirmation bias is active.',
    strengths: [
      'Strong ethical conviction provides consistent investment framework',
      'High emotional steadiness supports rational decision-making under mild stress',
    ],
    vulnerabilities: [
      'Confirmation bias may cause dismissal of contradictory evidence',
      'Herding tendency makes him susceptible to ESG narrative trends without independent verification',
    ],
  },
}

// ---- Client 3: Maria Rodriguez ----
// Archetype: action_first_decider
// AUM: 890,000 | status: onboarding
// High DS (88), High RP (79) | mood: euphoric
const mariaRodriguez: DemoClient = {
  id: 'maria-rodriguez',
  first_name: 'Maria',
  last_name: 'Rodriguez',
  email: 'maria.rodriguez@example.com',
  phone: '(305) 555-0303',
  status: 'onboarding',
  aum: 890000,
  brand_color: '#fca311',
  last_contact_at: '2026-03-10T16:00:00Z',
  next_review_at: '2026-04-10T16:00:00Z',
  created_at: '2026-02-28T09:00:00Z',
  updated_at: '2026-03-10T16:00:00Z',
  dna: {
    archetype: {
      primary: 'action_first_decider',
      secondary: 'trend_sensitive_explorer',
      scores: {
        action_first_decider: 0.91,
        trend_sensitive_explorer: 0.74,
        diy_controller: 0.52,
      },
    },
    factors: {
      RP: { raw: 5.7, normalized: 79, percentile: 81, confidence: 0.87 },
      DS: { raw: 6.3, normalized: 88, percentile: 90, confidence: 0.92 },
      CN: { raw: 5.0, normalized: 70, percentile: 68, confidence: 0.83 },
      TO: { raw: 2.5, normalized: 33, percentile: 30, confidence: 0.78 },
      SI: { raw: 4.8, normalized: 66, percentile: 64, confidence: 0.81 },
      ES: { raw: 3.2, normalized: 45, percentile: 43, confidence: 0.80 },
      SP: { raw: 2.8, normalized: 38, percentile: 36, confidence: 0.77 },
      IP: { raw: 2.6, normalized: 35, percentile: 33, confidence: 0.75 },
    },
    biases: [
      { key: 'fomo', severity: 2 },
      { key: 'overconfidence', severity: 2 },
      { key: 'recency_bias', severity: 1 },
    ],
    marketMood: {
      state: 'euphoric',
      volatilityResponse: 0.22,
      panicThreshold: 0.40,
      euphoriaThreshold: 0.30,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: false,
      trendChase: true,
      checksOften: false,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Match her pace but surface the single key risk before every execution. Use position sizing as the primary control lever.',
    strengths: [
      'High decisiveness prevents analysis paralysis',
      'Comfortable with risk allows growth-oriented allocations',
    ],
    vulnerabilities: [
      'FOMO drives premature entry into high-momentum positions without sufficient research',
      'Overconfidence may lead to under-sizing of risk and over-concentration',
    ],
  },
}

// ---- Client 4: Robert Park ----
// Archetype: reassurance_seeker
// AUM: 3,100,000 | status: review
// Low ES (22), Low RP (28) | mood: reactive
const robertPark: DemoClient = {
  id: 'robert-park',
  first_name: 'Robert',
  last_name: 'Park',
  email: 'robert.park@example.com',
  phone: '(312) 555-0404',
  status: 'review',
  aum: 3100000,
  brand_color: '#5856D6',
  last_contact_at: '2026-03-05T11:00:00Z',
  next_review_at: '2026-03-20T11:00:00Z',
  created_at: '2023-06-01T09:00:00Z',
  updated_at: '2026-03-05T11:00:00Z',
  dna: {
    archetype: {
      primary: 'reassurance_seeker',
      secondary: 'avoider_under_stress',
      scores: {
        reassurance_seeker: 0.89,
        avoider_under_stress: 0.65,
        collaborative_partner: 0.50,
      },
    },
    factors: {
      RP: { raw: 2.2, normalized: 28, percentile: 24, confidence: 0.90 },
      DS: { raw: 2.5, normalized: 33, percentile: 30, confidence: 0.85 },
      CN: { raw: 2.8, normalized: 38, percentile: 36, confidence: 0.82 },
      TO: { raw: 3.0, normalized: 43, percentile: 40, confidence: 0.80 },
      SI: { raw: 4.2, normalized: 59, percentile: 57, confidence: 0.83 },
      ES: { raw: 1.8, normalized: 22, percentile: 18, confidence: 0.91 },
      SP: { raw: 4.5, normalized: 63, percentile: 61, confidence: 0.84 },
      IP: { raw: 3.8, normalized: 53, percentile: 51, confidence: 0.82 },
    },
    biases: [
      { key: 'loss_aversion', severity: 3 },
      { key: 'myopic_loss_aversion', severity: 2 },
      { key: 'regret_avoidance', severity: 2 },
    ],
    marketMood: {
      state: 'reactive',
      volatilityResponse: 0.82,
      panicThreshold: 0.25,
      euphoriaThreshold: 0.80,
    },
    behaviorFlags: {
      panicSellTendency: true,
      avoidancePattern: false,
      trendChase: false,
      checksOften: false,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Acknowledge concerns before any recommendation. Provide downside protection evidence first. Never lead with upside — it triggers skepticism.',
    strengths: [
      'Strong capital preservation instinct prevents speculative overreach',
      'Thorough review process catches risks that faster investors miss',
    ],
    vulnerabilities: [
      'Severe loss aversion causes flight to cash at market bottoms',
      'Myopic focus on short-term portfolio value triggers premature sell decisions',
    ],
  },
}

// ---- Client 5: Emily Watson ----
// Archetype: values_anchored_steward
// AUM: 450,000 | status: lead
// High SI (75), High TO (80) | mood: steady
const emilyWatson: DemoClient = {
  id: 'emily-watson',
  first_name: 'Emily',
  last_name: 'Watson',
  email: 'emily.watson@example.com',
  phone: '(503) 555-0505',
  status: 'lead',
  aum: 450000,
  brand_color: '#30D158',
  last_contact_at: '2026-03-08T13:00:00Z',
  next_review_at: '2026-04-08T13:00:00Z',
  created_at: '2026-02-15T09:00:00Z',
  updated_at: '2026-03-08T13:00:00Z',
  dna: {
    archetype: {
      primary: 'values_anchored_steward',
      secondary: 'big_picture_optimist',
      scores: {
        values_anchored_steward: 0.80,
        big_picture_optimist: 0.62,
        collaborative_partner: 0.55,
      },
    },
    factors: {
      RP: { raw: 3.6, normalized: 51, percentile: 49, confidence: 0.79 },
      DS: { raw: 3.2, normalized: 46, percentile: 43, confidence: 0.77 },
      CN: { raw: 3.0, normalized: 43, percentile: 40, confidence: 0.75 },
      TO: { raw: 5.8, normalized: 80, percentile: 79, confidence: 0.85 },
      SI: { raw: 5.4, normalized: 75, percentile: 74, confidence: 0.86 },
      ES: { raw: 4.6, normalized: 64, percentile: 62, confidence: 0.82 },
      SP: { raw: 4.0, normalized: 56, percentile: 54, confidence: 0.78 },
      IP: { raw: 4.2, normalized: 59, percentile: 57, confidence: 0.80 },
    },
    biases: [
      { key: 'herding', severity: 1 },
      { key: 'present_bias', severity: 1 },
    ],
    marketMood: {
      state: 'steady',
      volatilityResponse: 0.32,
      panicThreshold: 0.65,
      euphoriaThreshold: 0.58,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: false,
      trendChase: false,
      checksOften: false,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Lead with impact alignment and long-term wealth-building narrative. Connect every recommendation to her stated values framework.',
    strengths: [
      'Values-driven framework provides consistent decision filter',
      'Long time horizon enables compounding-focused allocation strategy',
    ],
    vulnerabilities: [
      'Herding tendency may attract her to popular ESG funds over best-fit options',
      'Present bias can delay contributions when near-term expenses feel more urgent',
    ],
  },
}

// ---- Client 6: David Kim ----
// Archetype: systems_builder
// AUM: 5,200,000 | status: active
// High CN (92), High SP (88), High IP (90) | mood: steady
const davidKim: DemoClient = {
  id: 'david-kim',
  first_name: 'David',
  last_name: 'Kim',
  email: 'david.kim@example.com',
  phone: '(650) 555-0606',
  status: 'active',
  aum: 5200000,
  brand_color: '#006DD8',
  last_contact_at: '2026-03-12T09:00:00Z',
  next_review_at: '2026-06-12T09:00:00Z',
  created_at: '2022-11-01T09:00:00Z',
  updated_at: '2026-03-12T09:00:00Z',
  dna: {
    archetype: {
      primary: 'systems_builder',
      secondary: 'analytical_skeptic',
      scores: {
        systems_builder: 0.94,
        analytical_skeptic: 0.76,
        diy_controller: 0.68,
      },
    },
    factors: {
      RP: { raw: 4.5, normalized: 63, percentile: 61, confidence: 0.93 },
      DS: { raw: 3.8, normalized: 53, percentile: 51, confidence: 0.90 },
      CN: { raw: 6.6, normalized: 92, percentile: 94, confidence: 0.95 },
      TO: { raw: 5.8, normalized: 80, percentile: 82, confidence: 0.92 },
      SI: { raw: 2.2, normalized: 29, percentile: 26, confidence: 0.88 },
      ES: { raw: 5.2, normalized: 72, percentile: 70, confidence: 0.91 },
      SP: { raw: 6.3, normalized: 88, percentile: 89, confidence: 0.94 },
      IP: { raw: 6.5, normalized: 90, percentile: 91, confidence: 0.95 },
    },
    biases: [
      { key: 'overconfidence', severity: 1 },
    ],
    marketMood: {
      state: 'steady',
      volatilityResponse: 0.18,
      panicThreshold: 0.80,
      euphoriaThreshold: 0.70,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: false,
      trendChase: false,
      checksOften: true,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Lead with quantitative frameworks and back-tested data. Provide structured decision trees. Never present options without selection criteria.',
    strengths: [
      'Systematic approach eliminates emotional bias from portfolio decisions',
      'Deep information processing ensures thorough due diligence before committing',
    ],
    vulnerabilities: [
      'Overconfidence in his own models may cause under-weighting of tail risk scenarios',
      'High control need can create friction when delegation is the optimal strategy',
    ],
  },
}

// ---- Client 7: Lisa Thompson ----
// Archetype: collaborative_partner
// AUM: 1,500,000 | status: active
// High SI (85), Moderate ES (65) | mood: concerned
const lisaThompson: DemoClient = {
  id: 'lisa-thompson',
  first_name: 'Lisa',
  last_name: 'Thompson',
  email: 'lisa.thompson@example.com',
  phone: '(617) 555-0707',
  status: 'active',
  aum: 1500000,
  brand_color: '#34C759',
  last_contact_at: '2026-03-03T15:00:00Z',
  next_review_at: '2026-06-03T15:00:00Z',
  created_at: '2023-09-01T09:00:00Z',
  updated_at: '2026-03-03T15:00:00Z',
  dna: {
    archetype: {
      primary: 'collaborative_partner',
      secondary: 'values_anchored_steward',
      scores: {
        collaborative_partner: 0.85,
        values_anchored_steward: 0.58,
        reassurance_seeker: 0.42,
      },
    },
    factors: {
      RP: { raw: 3.8, normalized: 53, percentile: 51, confidence: 0.85 },
      DS: { raw: 3.4, normalized: 48, percentile: 46, confidence: 0.83 },
      CN: { raw: 3.0, normalized: 43, percentile: 40, confidence: 0.80 },
      TO: { raw: 4.8, normalized: 66, percentile: 64, confidence: 0.84 },
      SI: { raw: 6.1, normalized: 85, percentile: 86, confidence: 0.91 },
      ES: { raw: 4.7, normalized: 65, percentile: 63, confidence: 0.86 },
      SP: { raw: 3.8, normalized: 53, percentile: 51, confidence: 0.82 },
      IP: { raw: 3.5, normalized: 50, percentile: 48, confidence: 0.81 },
    },
    biases: [
      { key: 'recency_bias', severity: 1 },
      { key: 'availability_heuristic', severity: 1 },
    ],
    marketMood: {
      state: 'concerned',
      volatilityResponse: 0.52,
      panicThreshold: 0.50,
      euphoriaThreshold: 0.62,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: false,
      trendChase: false,
      checksOften: false,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Use inclusive language throughout. Frame every recommendation as a joint decision. Invite her perspective before presenting conclusions.',
    strengths: [
      'High social intelligence makes advisor relationship a genuine asset',
      'Collaborative mindset enables transparent communication of concerns',
    ],
    vulnerabilities: [
      'Recency bias may cause over-weighting of recent news in portfolio discussions',
      'Availability heuristic can amplify concern about highly publicized market events',
    ],
  },
}

// ---- Client 8: Michael Torres ----
// Archetype: avoider_under_stress
// AUM: 750,000 | status: churned
// Low DS (25), Low ES (30) | mood: panicked
const michaelTorres: DemoClient = {
  id: 'michael-torres',
  first_name: 'Michael',
  last_name: 'Torres',
  email: 'michael.torres@example.com',
  phone: '(702) 555-0808',
  status: 'churned',
  aum: 750000,
  brand_color: '#8E8E93',
  last_contact_at: '2026-01-15T12:00:00Z',
  next_review_at: '2026-04-15T12:00:00Z',
  created_at: '2023-03-01T09:00:00Z',
  updated_at: '2026-01-15T12:00:00Z',
  dna: {
    archetype: {
      primary: 'avoider_under_stress',
      secondary: 'reassurance_seeker',
      scores: {
        avoider_under_stress: 0.87,
        reassurance_seeker: 0.60,
        analytical_skeptic: 0.38,
      },
    },
    factors: {
      RP: { raw: 2.8, normalized: 38, percentile: 35, confidence: 0.82 },
      DS: { raw: 2.0, normalized: 25, percentile: 21, confidence: 0.85 },
      CN: { raw: 2.4, normalized: 32, percentile: 29, confidence: 0.80 },
      TO: { raw: 3.2, normalized: 46, percentile: 43, confidence: 0.78 },
      SI: { raw: 3.5, normalized: 50, percentile: 48, confidence: 0.79 },
      ES: { raw: 2.3, normalized: 30, percentile: 26, confidence: 0.86 },
      SP: { raw: 3.0, normalized: 43, percentile: 40, confidence: 0.77 },
      IP: { raw: 2.8, normalized: 38, percentile: 36, confidence: 0.78 },
    },
    biases: [
      { key: 'inertia', severity: 2 },
      { key: 'regret_avoidance', severity: 2 },
      { key: 'loss_aversion', severity: 2 },
    ],
    marketMood: {
      state: 'panicked',
      volatilityResponse: 0.90,
      panicThreshold: 0.20,
      euphoriaThreshold: 0.90,
    },
    behaviorFlags: {
      panicSellTendency: false,
      avoidancePattern: true,
      trendChase: false,
      checksOften: false,
      anchoringToEntry: false,
    },
    behavioralRule:
      'Remove all friction from every interaction. Break every recommended action into the smallest possible unit. Never present multiple options simultaneously.',
    strengths: [
      'Inertia keeps him from making impulsive trades during minor volatility',
      'Loss aversion prevents overexposure to speculative positions',
    ],
    vulnerabilities: [
      'Avoidance pattern causes paralysis during critical rebalancing windows',
      'Regret avoidance leads to holding losing positions far past optimal exit points',
    ],
  },
}

// ---- Exports ----

export const DEMO_CLIENTS: readonly DemoClient[] = Object.freeze([
  sarahMitchell,
  jamesChen,
  mariaRodriguez,
  robertPark,
  emilyWatson,
  davidKim,
  lisaThompson,
  michaelTorres,
])

export function getDemoStats(): {
  readonly totalAUM: number
  readonly clientCount: number
  readonly avgRiskScore: number
  readonly activeCount: number
  readonly reviewCount: number
  readonly leadCount: number
} {
  const totalAUM = DEMO_CLIENTS.reduce((sum, c) => sum + c.aum, 0)
  const clientCount = DEMO_CLIENTS.length
  const avgRiskScore =
    DEMO_CLIENTS.reduce((sum, c) => sum + c.dna.factors.RP.normalized, 0) / clientCount
  const activeCount = DEMO_CLIENTS.filter((c) => c.status === 'active').length
  const reviewCount = DEMO_CLIENTS.filter((c) => c.status === 'review').length
  const leadCount = DEMO_CLIENTS.filter((c) => c.status === 'lead').length

  return {
    totalAUM,
    clientCount,
    avgRiskScore: Math.round(avgRiskScore * 100) / 100,
    activeCount,
    reviewCount,
    leadCount,
  }
}

export function getDemoArchetypeDistribution(): Readonly<Record<string, number>> {
  const distribution: Record<string, number> = {}

  for (const client of DEMO_CLIENTS) {
    const key = client.dna.archetype.primary
    distribution[key] = (distribution[key] ?? 0) + 1
  }

  return Object.freeze(distribution)
}
