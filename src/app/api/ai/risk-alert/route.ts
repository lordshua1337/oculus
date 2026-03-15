// POST /api/ai/risk-alert
// Accepts clientId + dnaProfile, returns behavioral risk alerts.
// Falls back to static rule-based alerts when no API key is present or on error.
// generateStaticAlerts is exported for direct client-side use.

import { NextRequest, NextResponse } from 'next/server'
import type { DNAProfileV2 } from '@/lib/dna/types'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import { BIAS_LABELS } from '@/lib/dna/colors'

export interface RiskAlert {
  readonly text: string
  readonly severity: 'high' | 'medium' | 'low'
}

export interface RiskAlertResponse {
  readonly alerts: readonly RiskAlert[]
  readonly source: 'static' | 'claude'
}

// ---- Pure static alert generation — no side effects, no external calls ----

export function generateStaticAlerts(dnaProfile: DNAProfileV2): RiskAlert[] {
  const alerts: RiskAlert[] = []
  const { biases, behaviorFlags } = dnaProfile

  const getBias = (key: string) => biases.find((b) => b.key === key)

  // Rule: any bias at max severity (3) → high alert naming the specific bias
  for (const bias of biases) {
    if (bias.severity === 3) {
      const label = BIAS_LABELS[bias.key] ?? bias.key
      alerts.push({
        text: `Severe ${label} detected. This client's decision-making is significantly distorted by this bias — proactive coaching is strongly recommended before any portfolio changes.`,
        severity: 'high',
      })
    }
  }

  // Rule: panicSellTendency flag + loss_aversion severity >= 2 → high panic-sell warning
  const lossAversion = getBias('loss_aversion')
  if (behaviorFlags.panicSellTendency && lossAversion && lossAversion.severity >= 2) {
    alerts.push({
      text: 'High panic-sell risk. This client combines a panic-sell behavioral pattern with elevated loss aversion — they are likely to exit positions at the worst moment during a drawdown. Establish a clear "stay the course" protocol now.',
      severity: 'high',
    })
  }

  // Rule: avoidancePattern flag → medium inaction alert
  if (behaviorFlags.avoidancePattern) {
    alerts.push({
      text: 'Inaction risk present. This client shows an avoidance pattern and may delay necessary portfolio decisions during stress. Simplify action steps and reduce perceived decision weight to prevent paralysis.',
      severity: 'medium',
    })
  }

  // Rule: overconfidence severity >= 2 + checksOften flag (proxy for high control need) → medium over-trading alert
  const overconfidence = getBias('overconfidence')
  if (overconfidence && overconfidence.severity >= 2 && behaviorFlags.checksOften) {
    alerts.push({
      text: 'Over-trading risk flagged. Elevated overconfidence combined with frequent portfolio monitoring is a known driver of excessive trading. Consider setting check-in schedules and reviewing trade frequency at your next meeting.',
      severity: 'medium',
    })
  }

  // Rule: herding severity >= 2 → medium social influence alert
  const herding = getBias('herding')
  if (herding && herding.severity >= 2) {
    alerts.push({
      text: 'Social influence vulnerability detected. This client is susceptible to herding behavior and may make allocation decisions based on peer moves or media narratives rather than their own plan. Reinforce their investment policy statement.',
      severity: 'medium',
    })
  }

  // Rule: fomo severity >= 2 + trendChase flag → high FOMO alert
  const fomo = getBias('fomo')
  if (fomo && fomo.severity >= 2 && behaviorFlags.trendChase) {
    alerts.push({
      text: 'Critical FOMO risk. Elevated FOMO bias plus a trend-chasing pattern dramatically increases the chance of chasing recent winners into overvalued positions. Address position sizing limits and entry discipline before any action.',
      severity: 'high',
    })
  }

  return alerts
}

// ---- Input validation ----

function isValidDNAProfile(value: unknown): value is DNAProfileV2 {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.archetype !== 'object' || v.archetype === null) return false
  if (!Array.isArray(v.biases)) return false
  if (typeof v.behaviorFlags !== 'object' || v.behaviorFlags === null) return false
  if (typeof v.marketMood !== 'object' || v.marketMood === null) return false
  return true
}

function validateRequestBody(body: unknown): body is { clientId: string; dnaProfile: DNAProfileV2 } {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  if (typeof b.clientId !== 'string' || b.clientId.trim().length === 0) return false
  if (!isValidDNAProfile(b.dnaProfile)) return false
  return true
}

// ---- Prompt builder — only validated, structured fields enter the prompt ----

function buildPrompt(dnaProfile: DNAProfileV2): string {
  const archetypeInfo = ARCHETYPE_INFO[dnaProfile.archetype.primary]
  const archetypeName = archetypeInfo?.name ?? dnaProfile.archetype.primary
  const communicationRule = archetypeInfo?.communicationRule ?? ''

  const topBiases = [...dnaProfile.biases]
    .filter((b) => b.severity > 0)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 5)
    .map((b) => {
      const label = BIAS_LABELS[b.key] ?? b.key
      return `${label} (severity ${b.severity}/3)`
    })
    .join(', ')

  const activeFlags = Object.entries(dnaProfile.behaviorFlags)
    .filter(([, v]) => v === true)
    .map(([k]) => k)
    .join(', ')

  return `You are an expert behavioral finance coach analyzing a client's psychological investment profile. Generate 2-4 concise, actionable behavioral risk alerts for a financial advisor.

Client Archetype: ${archetypeName}
Advisor Communication Rule: ${communicationRule}
Top Active Biases: ${topBiases || 'none'}
Behavior Flags: ${activeFlags || 'none'}
Market Mood State: ${dnaProfile.marketMood.state}

Return a JSON object with an "alerts" array. Each alert must have:
- "text": a 2-3 sentence advisor-facing warning, specific to the profile above
- "severity": one of "high", "medium", or "low"

Prioritize high-impact behavioral risks. Be specific, not generic. Respond with only valid JSON: {"alerts": [{"text": "...", "severity": "high"}, ...]}`
}

// ---- Claude API call ----

async function fetchClaudeAlerts(dnaProfile: DNAProfileV2, apiKey: string): Promise<readonly RiskAlert[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: buildPrompt(dnaProfile),
        },
      ],
    }),
  })

  if (!response.ok) {
    const status = response.status
    console.error('Anthropic API error status:', status)
    throw new Error(`Anthropic API returned ${status}`)
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>
  }

  const textBlock = data.content.find((block) => block.type === 'text')
  if (!textBlock) {
    throw new Error('No text block in Anthropic response')
  }

  const parsed = JSON.parse(textBlock.text) as { alerts: RiskAlert[] }
  if (!Array.isArray(parsed.alerts)) {
    throw new Error('Anthropic response did not contain alerts array')
  }

  return parsed.alerts
}

// ---- Route handler ----

export async function POST(
  request: NextRequest
): Promise<NextResponse<RiskAlertResponse | { error: string }>> {
  const body = await request.json().catch(() => null)

  if (!validateRequestBody(body)) {
    return NextResponse.json(
      {
        error:
          'Invalid input: body must include clientId (non-empty string) and a valid dnaProfile (object with archetype, biases, behaviorFlags, marketMood)',
      },
      { status: 400 }
    )
  }

  const { dnaProfile } = body
  const staticAlerts = generateStaticAlerts(dnaProfile)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ alerts: staticAlerts, source: 'static' }, { status: 200 })
  }

  try {
    const claudeAlerts = await fetchClaudeAlerts(dnaProfile, apiKey)
    return NextResponse.json({ alerts: claudeAlerts, source: 'claude' }, { status: 200 })
  } catch (err) {
    console.error('AI risk alert generation failed, falling back to static:', err)
    return NextResponse.json({ alerts: staticAlerts, source: 'static' }, { status: 200 })
  }
}
