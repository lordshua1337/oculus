// POST /api/reports/generate
// Accepts clientId + reportType, returns a personalized financial report.
// Falls back to static template-filled markdown when no API key is present or on error.
// Never exposes the API key or raw upstream errors to the client.

import { NextRequest, NextResponse } from 'next/server'
import { getDemoClientById } from '@/lib/demo-clients'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import type { ClientRow } from '@/lib/db/types'
import type { ReportType } from '@/lib/db/types'

// ---- Response types ----

interface ReportResponse {
  readonly report: string
  readonly source: 'static' | 'claude'
  readonly clientName: string
}

// ---- Input validation ----

const VALID_REPORT_TYPES: readonly ReportType[] = ['quarterly', 'annual', 'tax', 'compliance']

function isValidReportType(value: unknown): value is ReportType {
  return typeof value === 'string' && (VALID_REPORT_TYPES as string[]).includes(value)
}

function validateRequestBody(body: unknown): body is { clientId: string; reportType: ReportType } {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  if (typeof b.clientId !== 'string' || b.clientId.trim().length === 0) return false
  if (!isValidReportType(b.reportType)) return false
  return true
}

// ---- Formatting helpers ----

function formatAUM(aum: number): string {
  if (aum >= 1_000_000) {
    return `$${(aum / 1_000_000).toFixed(2)}M`
  }
  if (aum >= 1_000) {
    return `$${(aum / 1_000).toFixed(0)}K`
  }
  return `$${aum.toLocaleString()}`
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function currentQuarter(): string {
  const month = new Date().getMonth()
  const q = Math.floor(month / 3) + 1
  return `Q${q} ${new Date().getFullYear()}`
}

function currentYear(): number {
  return new Date().getFullYear()
}

// ---- Report context builder ----

export function buildReportContext(client: ClientRow, reportType: ReportType): string {
  const archetypeInfo = ARCHETYPE_INFO[client.dna_profile.archetype.primary]
  const archetypeName = archetypeInfo?.name ?? client.dna_profile.archetype.primary
  const communicationRule = archetypeInfo?.communicationRule ?? ''

  const topFactors = Object.entries(client.dna_profile.factors)
    .sort(([, a], [, b]) => b.normalized - a.normalized)
    .slice(0, 3)
    .map(([code, score]) => `${code}: ${(score.normalized * 100).toFixed(0)}/100`)
    .join(', ')

  const activeBiases = client.dna_profile.biases
    .filter((b) => b.severity > 0)
    .sort((a, b) => b.severity - a.severity)
    .map((b) => `${b.key} (severity ${b.severity}/3)`)
    .join(', ')

  const clientName = `${client.first_name} ${client.last_name}`
  const today = new Date().toISOString().split('T')[0]

  return [
    `Client: ${clientName}`,
    `AUM: ${formatAUM(client.aum)}`,
    `Archetype: ${archetypeName} — ${archetypeInfo?.tagline ?? ''}`,
    `Communication Rule: ${communicationRule}`,
    `Top Factor Scores: ${topFactors}`,
    `Active Biases: ${activeBiases || 'none detected'}`,
    `Report Type: ${reportType}`,
    `Report Date: ${today}`,
  ].join('\n')
}

// ---- Static report templates ----

function getStaticQuarterlyReport(client: ClientRow): string {
  const name = `${client.first_name} ${client.last_name}`
  const archetypeInfo = ARCHETYPE_INFO[client.dna_profile.archetype.primary]
  const archetypeName = archetypeInfo?.name ?? client.dna_profile.archetype.primary
  const quarter = currentQuarter()
  const aum = formatAUM(client.aum)

  const topBias = client.dna_profile.biases.find((b) => b.severity > 0)
  const biasNote = topBias
    ? `Your behavioral profile indicates a tendency toward **${topBias.key.replace(/_/g, ' ')}** (severity ${topBias.severity}/3). This quarter, we observed this pattern in your response to short-term market fluctuations, and we have structured recommendations accordingly.`
    : 'Your behavioral profile shows strong discipline this quarter with no significant bias activity detected.'

  const strengths = client.dna_profile.strengths.slice(0, 2).join(' and ')
  const vulnerability = client.dna_profile.vulnerabilities[0] ?? 'over-trading during volatility'

  return `# ${quarter} Quarterly Review — ${name}

**Prepared:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
**AUM Under Management:** ${aum}
**Behavioral Archetype:** ${archetypeName}

---

## Performance Summary

Your portfolio maintained its strategic allocation through ${quarter}. Total assets under management stand at **${aum}**, reflecting disciplined execution against your long-term plan. Market conditions this quarter created several decision points; your ${archetypeName} profile guided our approach to each.

Key performance highlights:
- Portfolio rebalanced within target bands
- Risk exposure held within your approved tolerance range
- No reactive trades executed outside of the quarterly plan

---

## Behavioral Insights

${biasNote}

As a **${archetypeName}**, your primary strength lies in ${strengths}. This quarter, we leaned into that by structuring communications to match your decision-making style. One area to watch: ${vulnerability} — we will continue monitoring this in the coming quarter.

**Advisor Note (Communication Style):** ${archetypeInfo?.communicationRule ?? 'Standard advisory approach applied.'}

---

## Recommendations for Next Quarter

1. **Rebalancing Review** — Review current allocation drift versus target weights at next meeting.
2. **Behavioral Check-In** — Schedule a brief call before any significant allocation changes to run through the decision framework together.
3. **Goal Progress Update** — Revisit your ${currentYear()} financial goals and adjust projections based on ${quarter} performance data.

---

*This report is confidential and prepared exclusively for ${name}. Past performance is not indicative of future results.*`
}

function getStaticAnnualReport(client: ClientRow): string {
  const name = `${client.first_name} ${client.last_name}`
  const archetypeInfo = ARCHETYPE_INFO[client.dna_profile.archetype.primary]
  const archetypeName = archetypeInfo?.name ?? client.dna_profile.archetype.primary
  const year = currentYear() - 1
  const aum = formatAUM(client.aum)

  const activeBiases = client.dna_profile.biases.filter((b) => b.severity > 0)
  const biasCount = activeBiases.length
  const biasSection =
    biasCount > 0
      ? `Over the year, we tracked **${biasCount} active behavioral bias${biasCount > 1 ? 'es' : ''}** in your profile. The most significant was **${activeBiases[0].key.replace(/_/g, ' ')}**. Through proactive coaching conversations, we mitigated the impact of these biases on your long-term outcomes.`
      : 'You demonstrated exceptional behavioral discipline throughout the year. Your profile showed no significant active biases — a strong indicator of decision-making maturity.'

  const strengths = client.dna_profile.strengths.join(', ')
  const clientSince = formatDate(client.created_at)

  return `# ${year} Annual Review — ${name}

**Prepared:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
**AUM Under Management:** ${aum}
**Client Since:** ${clientSince}
**Behavioral Archetype:** ${archetypeName}

---

## Year in Review

${year} was a year of [market context here]. For ${name}, the year demonstrated consistent execution against the long-term financial plan. AUM closed the year at **${aum}**, with portfolio allocations maintained in alignment with your approved investment policy.

We navigated [number] significant market events together this year — each one an opportunity to apply your behavioral profile to make better, calmer decisions.

---

## Behavioral Growth

${biasSection}

**Archetype Summary — ${archetypeName}**
Your core strengths: ${strengths}

This year, your ${archetypeName} profile proved particularly valuable during [Q2/Q3 volatility period]. Your natural tendency to ${archetypeInfo?.description?.toLowerCase() ?? 'follow your investment plan'} meant you avoided the reactive behavior that cost many investors significant returns.

---

## Goal Progress

| Goal | Status | Notes |
|------|--------|-------|
| Primary wealth accumulation | On Track | Consistent contributions maintained |
| Risk management | Achieved | Stayed within approved tolerance all year |
| Behavioral discipline | Excellent | Biases monitored and managed proactively |

---

## Looking Ahead to ${year + 1}

1. **Portfolio Strategy** — Review long-term allocation targets and update for any life changes.
2. **Behavioral Baseline** — Update your DNA profile to capture any shifts in risk tolerance or goals.
3. **Estate and Tax Coordination** — Schedule coordination meeting with your tax advisor in Q1.

---

*This report is confidential and prepared exclusively for ${name}. All figures as of December 31, ${year}.*`
}

function getStaticTaxReport(client: ClientRow): string {
  const name = `${client.first_name} ${client.last_name}`
  const archetypeInfo = ARCHETYPE_INFO[client.dna_profile.archetype.primary]
  const year = currentYear() - 1
  const aum = formatAUM(client.aum)

  const anchoringBias = client.dna_profile.biases.find((b) => b.key === 'anchoring' && b.severity > 0)
  const dispositionBias = client.dna_profile.biases.find(
    (b) => b.key === 'disposition_effect' && b.severity > 0
  )

  const behavioralTaxNote =
    dispositionBias
      ? `**Behavioral Note:** Your profile shows a **disposition effect** bias (severity ${dispositionBias.severity}/3) — a tendency to hold losing positions too long and sell winners too early. This directly impacts tax-loss harvesting effectiveness. We recommend reviewing all positions with unrealized losses over $2,500 before year-end.`
      : anchoringBias
        ? `**Behavioral Note:** Your **anchoring** bias (severity ${anchoringBias.severity}/3) may cause you to anchor to original purchase prices when evaluating tax-loss harvesting candidates. We recommend using current market fundamentals — not entry price — as the decision framework.`
        : `**Behavioral Note:** No significant behavioral biases detected that would impair tax-related decision-making. Your ${archetypeInfo?.name ?? 'profile'} archetype supports systematic, plan-based execution of tax strategies.`

  return `# Tax Summary Report — ${name} — ${year}

**Prepared:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
**AUM Under Management:** ${aum}
**Tax Year:** ${year}

---

## Capital Gains Summary

This report provides a summary of realized capital gains and tax-loss harvesting activity for ${year}. Share this with your tax professional to ensure accurate filing.

| Category | Estimated Amount | Notes |
|----------|-----------------|-------|
| Short-term realized gains | — | Positions held < 12 months |
| Long-term realized gains | — | Positions held > 12 months |
| Harvested losses applied | — | Applied against gains |
| Net taxable gain/(loss) | — | Subject to applicable rates |

*Exact figures will be provided on your 1099 from the custodian.*

---

## Tax-Loss Harvesting Opportunities

Based on your current portfolio, the following opportunities were identified for ${year} and early ${year + 1}:

- **Reviewed** all positions with unrealized losses > $1,000
- **Wash-sale rules** applied to all harvested positions (30-day replacement window)
- **Tax-aware rebalancing** applied where applicable to minimize gain realization

${behavioralTaxNote}

---

## Year-End Actions Taken

1. Harvested available losses in eligible positions
2. Ensured long-term holding periods on appreciated assets were preserved
3. Coordinated with rebalancing schedule to avoid inadvertent wash sales

---

## Recommendations for ${year + 1}

1. **Q1 Review** — Assess carry-forward losses from ${year} for strategic deployment
2. **Qualified Dividend Tracking** — Verify holding periods for dividend-paying positions
3. **Roth Conversion Opportunity** — Given current income levels, evaluate partial Roth conversion in a low-bracket year

---

*This report is for informational purposes only and does not constitute tax advice. Consult your tax professional for filing guidance. Prepared exclusively for ${name}.*`
}

function getStaticComplianceReport(client: ClientRow): string {
  const name = `${client.first_name} ${client.last_name}`
  const archetypeInfo = ARCHETYPE_INFO[client.dna_profile.archetype.primary]
  const archetypeName = archetypeInfo?.name ?? client.dna_profile.archetype.primary
  const aum = formatAUM(client.aum)
  const riskScore = (client.dna_profile.factors.RP.normalized * 100).toFixed(0)
  const lastContact = formatDate(client.last_contact_at)
  const nextReview = client.next_review_at ? formatDate(client.next_review_at) : 'To be scheduled'
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const highBiases = client.dna_profile.biases.filter((b) => b.severity >= 2)
  const riskAssessment =
    Number(riskScore) < 40
      ? 'Conservative'
      : Number(riskScore) < 65
        ? 'Moderate'
        : 'Aggressive'

  return `# Compliance Review Report — ${name}

**Report Date:** ${today}
**Review Period:** Last 12 months
**AUM Under Management:** ${aum}
**Compliance Status:** Active — No Deficiencies Noted

---

## Client Profile Summary

| Field | Value |
|-------|-------|
| Client Name | ${name} |
| Account Status | ${client.status.charAt(0).toUpperCase() + client.status.slice(1)} |
| Behavioral Archetype | ${archetypeName} |
| Risk Tolerance Score | ${riskScore}/100 (${riskAssessment}) |
| Last Contact Date | ${lastContact} |
| Next Scheduled Review | ${nextReview} |

---

## Risk Assessment

**Behavioral Risk Profile**
Client is classified as a **${archetypeName}** with a risk tolerance score of **${riskScore}/100**, indicating a **${riskAssessment}** risk posture. All portfolio allocations have been maintained in alignment with this documented tolerance.

${
  highBiases.length > 0
    ? `**Elevated Behavioral Risk Flags (${highBiases.length}):**\n${highBiases.map((b) => `- ${b.key.replace(/_/g, ' ')} — severity ${b.severity}/3`).join('\n')}\n\nAdvisor has documented awareness of these biases and has implemented appropriate communication and monitoring protocols.`
    : '**No elevated behavioral risk flags.** Client profile shows no biases at moderate or severe levels requiring escalated monitoring.'
}

---

## Suitability Review

- [x] Investment objectives documented and on file
- [x] Risk tolerance formally assessed using behavioral DNA methodology
- [x] Portfolio allocation matches documented risk profile
- [x] Client communication frequency meets firm standard (minimum quarterly)
- [x] Conflicts of interest disclosed
- [x] Fee disclosures current and acknowledged

---

## Regulatory Notes

All recommendations made during the review period were documented and suitability-verified against the client's approved investment policy statement. No material changes to financial situation, investment objectives, or risk tolerance were reported by the client.

**Advisor Attestation:** Portfolio management practices for ${name} comply with applicable regulatory requirements and firm policy as of ${today}.

---

## Next Steps

1. Schedule next review: **${nextReview}**
2. Update behavioral DNA profile if more than 12 months since last assessment
3. Confirm continued suitability of current allocation at next client meeting

---

*This compliance report is for internal use only. Prepared in accordance with firm compliance policy.*`
}

export function getStaticReport(client: ClientRow, reportType: ReportType): string {
  switch (reportType) {
    case 'quarterly':
      return getStaticQuarterlyReport(client)
    case 'annual':
      return getStaticAnnualReport(client)
    case 'tax':
      return getStaticTaxReport(client)
    case 'compliance':
      return getStaticComplianceReport(client)
  }
}

// ---- Claude prompt builder ----

function buildClaudePrompt(client: ClientRow, reportType: ReportType): string {
  const context = buildReportContext(client, reportType)
  const clientName = `${client.first_name} ${client.last_name}`
  const reportLabel =
    reportType === 'quarterly'
      ? 'Quarterly Review'
      : reportType === 'annual'
        ? 'Annual Review'
        : reportType === 'tax'
          ? 'Tax Summary'
          : 'Compliance Review'

  return `You are a senior financial advisor writing a personalized ${reportLabel} report for a client. Use the client profile below to write a detailed, professional report in Markdown format.

${context}

Requirements:
- Use Markdown with clear headings and sections
- Make the content specific to this client — reference their archetype, biases, and AUM
- Tone should be professional yet personalized
- Report length: 400-600 words
- Include: summary, behavioral insights (personalized to their archetype and biases), specific recommendations, and next steps
- Do not include placeholder text like "[insert value here]"
- Do not invent specific portfolio performance numbers; describe in qualitative terms
- Open with a title: "# ${reportLabel} — ${clientName}"

Write the full report now:`
}

// ---- Claude API call ----

async function fetchClaudeReport(
  client: ClientRow,
  reportType: ReportType,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: buildClaudePrompt(client, reportType),
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

  return textBlock.text
}

// ---- Route handler ----

export async function POST(
  request: NextRequest
): Promise<NextResponse<ReportResponse | { error: string }>> {
  const body = await request.json().catch(() => null)

  if (!validateRequestBody(body)) {
    return NextResponse.json(
      {
        error:
          'Invalid input: body must include clientId (non-empty string) and reportType (one of: quarterly, annual, tax, compliance)',
      },
      { status: 400 }
    )
  }

  const { clientId, reportType } = body

  const client = getDemoClientById(clientId)
  if (!client) {
    return NextResponse.json(
      { error: `Client not found: ${clientId}` },
      { status: 404 }
    )
  }

  const clientName = `${client.first_name} ${client.last_name}`
  const staticReport = getStaticReport(client, reportType)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { report: staticReport, source: 'static', clientName },
      { status: 200 }
    )
  }

  try {
    const claudeReport = await fetchClaudeReport(client, reportType, apiKey)
    return NextResponse.json(
      { report: claudeReport, source: 'claude', clientName },
      { status: 200 }
    )
  } catch (err) {
    console.error('AI report generation failed, falling back to static:', err)
    return NextResponse.json(
      { report: staticReport, source: 'static', clientName },
      { status: 200 }
    )
  }
}
