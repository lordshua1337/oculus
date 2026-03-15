// POST /api/ai/insights
// Accepts practiceData and returns AI-generated or static fallback insights.
// Never exposes API key or raw errors to client.

import { NextRequest, NextResponse } from 'next/server'

interface PracticeData {
  totalAUM: number
  clientCount: number
  archetypeDistribution: Record<string, number>
  recentAlerts?: string[]
}

interface InsightsResponse {
  insights: string[]
  source: 'static' | 'claude'
}

const STATIC_FALLBACK_INSIGHTS: readonly string[] = [
  'Consider proactively reaching out to clients with loss-aversion profiles before any anticipated market volatility — early touchpoints dramatically reduce reactive calls and churn risk.',
  'Clients in the "review" pipeline often respond better to structured agendas sent 48 hours in advance. A simple framework shared beforehand increases decision-making confidence and shortens meeting time.',
  'Archetype distribution in your book reveals relationship patterns: if more than 30% of clients share the same primary archetype, your communication style may be under-serving the rest of the book.',
]

function validatePracticeData(body: unknown): body is { practiceData: PracticeData } {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  if (typeof b.practiceData !== 'object' || b.practiceData === null) return false

  const pd = b.practiceData as Record<string, unknown>
  if (typeof pd.totalAUM !== 'number' || pd.totalAUM < 0) return false
  if (typeof pd.clientCount !== 'number' || !Number.isInteger(pd.clientCount) || pd.clientCount < 0) return false
  if (typeof pd.archetypeDistribution !== 'object' || pd.archetypeDistribution === null) return false

  return true
}

function buildPrompt(pd: PracticeData): string {
  const archetypeSummary = Object.entries(pd.archetypeDistribution)
    .map(([archetype, count]) => `${archetype}: ${count}`)
    .join(', ')

  const aumFormatted =
    pd.totalAUM >= 1_000_000
      ? `$${(pd.totalAUM / 1_000_000).toFixed(1)}M`
      : pd.totalAUM >= 1_000
        ? `$${(pd.totalAUM / 1_000).toFixed(0)}K`
        : `$${pd.totalAUM}`

  const alertsSection =
    pd.recentAlerts && pd.recentAlerts.length > 0
      ? `\nRecent alerts: ${pd.recentAlerts.join('; ')}`
      : ''

  return `You are an expert financial advisor coach analyzing a wealth management practice. Provide 3 concise, actionable insights based on the following practice data.

Practice summary:
- Total AUM: ${aumFormatted}
- Total clients: ${pd.clientCount}
- Client archetype distribution: ${archetypeSummary}${alertsSection}

Return exactly 3 insights as a JSON array of strings. Each insight should be a single paragraph (2-4 sentences) that is specific, actionable, and directly relevant to the data above. Focus on behavioral patterns, client relationship opportunities, and practice management improvements. Do not use bullet points within the insight text. Respond with only valid JSON in this format: {"insights": ["...", "...", "..."]}`
}

async function fetchClaudeInsights(pd: PracticeData): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: buildPrompt(pd),
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

  const parsed = JSON.parse(textBlock.text) as { insights: string[] }
  if (!Array.isArray(parsed.insights)) {
    throw new Error('Anthropic response did not contain insights array')
  }

  return parsed.insights
}

export async function POST(request: NextRequest): Promise<NextResponse<InsightsResponse | { error: string }>> {
  const body = await request.json().catch(() => null)

  if (!validatePracticeData(body)) {
    return NextResponse.json(
      { error: 'Invalid input: practiceData must include totalAUM (number >= 0), clientCount (integer >= 0), and archetypeDistribution (object)' },
      { status: 400 }
    )
  }

  const { practiceData } = body

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { insights: [...STATIC_FALLBACK_INSIGHTS], source: 'static' },
      { status: 200 }
    )
  }

  try {
    const insights = await fetchClaudeInsights(practiceData)
    return NextResponse.json({ insights, source: 'claude' }, { status: 200 })
  } catch (err) {
    console.error('AI insights generation failed:', err)
    return NextResponse.json(
      { insights: [...STATIC_FALLBACK_INSIGHTS], source: 'static' },
      { status: 200 }
    )
  }
}
