// POST /api/scenarios/behavioral-predictions
// Accepts scenarioType + optional clientIds, returns behavioral predictions per client.
// Uses static rule-based logic driven by DNA factors, biases, and behavior flags.
// When ANTHROPIC_API_KEY is present, enhanced predictions are supported (future).

import { NextRequest, NextResponse } from 'next/server'
import { getDemoClientRows } from '@/lib/demo-clients'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import type { ClientRow } from '@/lib/db/types'
import type { BiasKey } from '@/lib/dna/types'

// ---- Constants ----

const MAX_CLIENTS = 8

const VALID_SCENARIO_TYPES = ['market_crash', 'rate_hike', 'inflation'] as const
type ScenarioType = (typeof VALID_SCENARIO_TYPES)[number]

// ---- Output Types ----

export interface ScenarioPrediction {
  readonly clientId: string
  readonly clientName: string
  readonly archetype: string
  readonly panicProbability: number
  readonly riskLevel: 'low' | 'medium' | 'high'
  readonly primaryConcern: string
  readonly advisorNote: string
  readonly driverBiases: readonly BiasKey[]
}

interface PredictionsResponse {
  readonly predictions: readonly ScenarioPrediction[]
  readonly source: 'static'
}

// ---- Input Validation ----

function isValidScenarioType(value: unknown): value is ScenarioType {
  return typeof value === 'string' && (VALID_SCENARIO_TYPES as readonly string[]).includes(value)
}

function validateRequestBody(
  body: unknown
): body is { scenarioType: ScenarioType; clientIds?: string[] } {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  if (!isValidScenarioType(b.scenarioType)) return false
  if (b.clientIds !== undefined) {
    if (!Array.isArray(b.clientIds)) return false
    if (!b.clientIds.every((id) => typeof id === 'string')) return false
  }
  return true
}

// ---- Risk Level Helpers ----

type RiskLevel = 'low' | 'medium' | 'high'

function bumpRiskLevel(level: RiskLevel): RiskLevel {
  if (level === 'low') return 'medium'
  if (level === 'medium') return 'high'
  return 'high'
}

// Clamp a probability to [0, 1] with 2 decimal precision.
function clampProb(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100
}

// Return only bias keys where severity > 0 for the client.
function activeBiasKeys(client: ClientRow): BiasKey[] {
  return client.dna_profile.biases
    .filter((b) => b.severity > 0)
    .map((b) => b.key)
}

// ---- Static Prediction Logic ----

export function generateStaticPrediction(
  client: ClientRow,
  scenarioType: ScenarioType
): ScenarioPrediction {
  const dna = client.dna_profile
  const flags = dna.behaviorFlags
  const factors = dna.factors
  const archetype = dna.archetype.primary

  const archetypeInfo = ARCHETYPE_INFO[archetype]
  const communicationRule = archetypeInfo?.communicationRule ?? ''
  const archetypeName = archetypeInfo?.name ?? archetype

  const clientName = `${client.first_name} ${client.last_name}`
  const biasKeys = activeBiasKeys(client)

  const hasLossAversion = biasKeys.includes('loss_aversion')
  const rpNormalized = factors.RP.normalized // 0-1, higher = more risk-seeking
  const esNormalized = factors.ES.normalized // 0-1, higher = more emotionally sensitive
  const spNormalized = factors.SP.normalized // 0-1, higher = higher stress profile
  const toNormalized = factors.TO.normalized // 0-1, higher = shorter time orientation

  let riskLevel: RiskLevel = 'low'
  let panicProbability = 0.1
  let primaryConcern = ''

  if (scenarioType === 'market_crash') {
    // High-risk path: panicSellTendency + loss_aversion both present.
    if (flags.panicSellTendency && hasLossAversion) {
      riskLevel = 'high'
      panicProbability = clampProb(0.7 + esNormalized * 0.2)
      primaryConcern =
        'Likely to panic-sell into the downturn, locking in losses and missing the recovery.'
    } else if (rpNormalized >= 0.6 && esNormalized <= 0.4) {
      // Higher risk posture (comfortable with risk) but low emotional sensitivity — medium risk.
      riskLevel = 'medium'
      panicProbability = clampProb(0.3 + esNormalized * 0.2)
      primaryConcern =
        'May take on excess risk during the crash, buying aggressively without adequate downside protection.'
    } else if (flags.panicSellTendency) {
      // Panic tendency without strong loss_aversion — medium risk.
      riskLevel = 'medium'
      panicProbability = clampProb(0.4 + esNormalized * 0.25)
      primaryConcern =
        'Elevated chance of reactive selling, especially if losses become visible in account statements.'
    } else {
      riskLevel = 'low'
      panicProbability = clampProb(0.1 + esNormalized * 0.15)
      primaryConcern =
        'Likely to stay the course but may need reassurance as paper losses accumulate.'
    }
  } else if (scenarioType === 'rate_hike') {
    // Short time orientation (TO) increases sensitivity to rate changes.
    if (toNormalized >= 0.6) {
      riskLevel = 'medium'
      panicProbability = clampProb(0.35 + toNormalized * 0.2)
      primaryConcern =
        'Short-term focus makes this client sensitive to rising borrowing costs and bond price drops.'
    } else if (toNormalized >= 0.4) {
      riskLevel = 'medium'
      panicProbability = clampProb(0.25 + esNormalized * 0.15)
      primaryConcern =
        'May overweight the impact of rate hikes on their portfolio and request unnecessary rebalancing.'
    } else {
      riskLevel = 'low'
      panicProbability = clampProb(0.1 + toNormalized * 0.1)
      primaryConcern =
        'Long-term orientation insulates this client from most rate hike anxiety.'
    }
  } else {
    // inflation scenario
    // Low stress profile (SP) means less buffer against sustained financial pressure.
    if (spNormalized <= 0.35) {
      riskLevel = 'medium'
      panicProbability = clampProb(0.4 + (1 - spNormalized) * 0.2)
      primaryConcern =
        'Low stress resilience means sustained inflation will erode confidence in the plan over time.'
    } else if (hasLossAversion) {
      riskLevel = 'medium'
      panicProbability = clampProb(0.3 + esNormalized * 0.15)
      primaryConcern =
        'Loss aversion may cause this client to shift to cash, sacrificing real returns to inflation.'
    } else {
      riskLevel = 'low'
      panicProbability = clampProb(0.15 + esNormalized * 0.1)
      primaryConcern =
        'Client is likely to adapt to the inflation environment with minimal behavioral disruption.'
    }
  }

  // Avoidance pattern bumps risk up one level (freezing under pressure is a risk multiplier).
  if (flags.avoidancePattern) {
    riskLevel = bumpRiskLevel(riskLevel)
    panicProbability = clampProb(panicProbability + 0.1)
  }

  const advisorNote = buildAdvisorNote(scenarioType, riskLevel, communicationRule, archetypeName)

  return {
    clientId: client.id,
    clientName,
    archetype: archetypeName,
    panicProbability,
    riskLevel,
    primaryConcern,
    advisorNote,
    driverBiases: biasKeys,
  }
}

// ---- Advisor Note Builder ----

function buildAdvisorNote(
  scenarioType: ScenarioType,
  riskLevel: RiskLevel,
  communicationRule: string,
  archetypeName: string
): string {
  const scenarioLabel =
    scenarioType === 'market_crash'
      ? 'a market crash'
      : scenarioType === 'rate_hike'
        ? 'rate hikes'
        : 'inflation'

  const urgencyPrefix =
    riskLevel === 'high'
      ? 'Proactive outreach required before the scenario escalates.'
      : riskLevel === 'medium'
        ? 'Schedule a check-in call early in the scenario.'
        : 'Monitor passively; reach out only if client contacts first.'

  return `${urgencyPrefix} As a ${archetypeName}: ${communicationRule} Frame your conversation around ${scenarioLabel} using this lens.`
}

// ---- Batch Prediction ----

export function generateAllStaticPredictions(
  clients: readonly ClientRow[],
  scenarioType: ScenarioType
): ScenarioPrediction[] {
  return clients.map((client) => generateStaticPrediction(client, scenarioType))
}

// ---- Route Handler ----

export async function POST(
  request: NextRequest
): Promise<NextResponse<PredictionsResponse | { error: string }>> {
  const body = await request.json().catch(() => null)

  if (!validateRequestBody(body)) {
    return NextResponse.json(
      {
        error:
          'Invalid input: body must include scenarioType (one of: market_crash, rate_hike, inflation). clientIds is optional string[].',
      },
      { status: 400 }
    )
  }

  const { scenarioType, clientIds } = body

  let clients = getDemoClientRows()

  if (clientIds !== undefined && clientIds.length > 0) {
    const idSet = new Set(clientIds)
    clients = clients.filter((c) => idSet.has(c.id))
  }

  // Enforce max client cap.
  const capped = clients.slice(0, MAX_CLIENTS)

  const predictions = generateAllStaticPredictions(capped, scenarioType)

  return NextResponse.json({ predictions, source: 'static' }, { status: 200 })
}
