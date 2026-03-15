'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingDown, ArrowUpRight, Flame, ChevronLeft } from 'lucide-react'
import { getDemoClientRows } from '@/lib/demo-clients'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import { ArchetypeBadge } from '@/components/dna/ArchetypeBadge'
import { OculusCard } from '@/components/ui/OculusCard'
import type { ClientRow } from '@/lib/db/types'
import type { BiasKey } from '@/lib/dna/types'

// ---- Scenario definitions --------------------------------------------------

type ScenarioId = 'market-crash' | 'rate-hike' | 'inflation-surge'

interface Scenario {
  readonly id: ScenarioId
  readonly name: string
  readonly description: string
  readonly Icon: React.ElementType
  readonly color: string
}

const SCENARIOS: readonly Scenario[] = [
  {
    id: 'market-crash',
    name: 'Market Crash',
    description: 'Equity selloff of 30%+. Triggers panic, flight-to-safety, and reactive behavior.',
    Icon: TrendingDown,
    color: '#FF3B30',
  },
  {
    id: 'rate-hike',
    name: 'Rate Hike',
    description: 'Rapid interest rate increase. Short-term thinkers face elevated reinvestment risk.',
    Icon: ArrowUpRight,
    color: '#FF9500',
  },
  {
    id: 'inflation-surge',
    name: 'Inflation Surge',
    description: 'Persistent inflation erodes purchasing power. Low SP clients struggle to stay the course.',
    Icon: Flame,
    color: '#fca311',
  },
] as const

// ---- Stress score computation ----------------------------------------------

/**
 * Returns a behavioral stress score (0-100) for a client under a given scenario.
 * Higher = more behaviorally at-risk.
 *
 * Market Crash: driven by high loss_aversion bias, low ES (emotional stability),
 * low RP (risk perception / tolerance). Robert Park should score highest.
 *
 * Rate Hike: driven by short-term TO orientation (low TO = short-term thinker),
 * presence of present_bias or myopic_loss_aversion.
 *
 * Inflation Surge: driven by low SP (stress profile) and inertia / avoidance flags.
 */
function computeStressScore(client: ClientRow, scenarioId: ScenarioId): number {
  const { factors, biases, behaviorFlags, marketMood } = client.dna_profile

  const biasSeverity = (key: BiasKey): number => {
    const found = biases.find((b) => b.key === key)
    return found ? found.severity : 0
  }

  let score = 0

  if (scenarioId === 'market-crash') {
    // Core: loss_aversion severity (0-3) -> weight 20 pts each
    const lossAversionScore = biasSeverity('loss_aversion') * 20
    // Low ES (emotional stability) = higher crash risk: invert normalized (100 - ES)
    const esVulnerability = 100 - factors.ES.normalized
    // Low RP tolerance = more risk under crash: invert normalized
    const rpVulnerability = 100 - factors.RP.normalized
    // panicSellTendency flag adds flat boost
    const panicBoost = behaviorFlags.panicSellTendency ? 15 : 0
    // Market mood: panicked/reactive add points
    const moodBoost =
      marketMood.state === 'panicked' ? 12 : marketMood.state === 'reactive' ? 8 : 0
    // myopic_loss_aversion compounds the effect
    const myopicBoost = biasSeverity('myopic_loss_aversion') * 6
    // regret_avoidance adds hesitation
    const regretBoost = biasSeverity('regret_avoidance') * 4

    score =
      lossAversionScore * 0.35 +
      esVulnerability * 0.25 +
      rpVulnerability * 0.20 +
      panicBoost +
      moodBoost +
      myopicBoost +
      regretBoost
  } else if (scenarioId === 'rate-hike') {
    // Short-term orientation = higher risk: invert TO (low TO = short-term = risky)
    const toVulnerability = 100 - factors.TO.normalized
    // present_bias amplifies short-term focus
    const presentBiasBoost = biasSeverity('present_bias') * 8
    // myopic_loss_aversion sensitive to rate environment
    const myopicBoost = biasSeverity('myopic_loss_aversion') * 7
    // fomo can drive chasing higher-yield instruments at wrong time
    const fomoBoost = biasSeverity('fomo') * 5
    // High DS (impulsive decision style) increases reactive reallocation risk
    const dsRisk = factors.DS.normalized * 0.15
    // Avoidance pattern delays necessary rebalancing
    const avoidanceBoost = behaviorFlags.avoidancePattern ? 10 : 0

    score =
      toVulnerability * 0.45 +
      presentBiasBoost +
      myopicBoost +
      fomoBoost +
      dsRisk +
      avoidanceBoost
  } else {
    // inflation-surge
    // Low SP (stress profile) = can't hold through sustained erosion
    const spVulnerability = 100 - factors.SP.normalized
    // Inertia = failure to reposition against inflation
    const inertiaBoost = biasSeverity('inertia') * 9
    // Avoidance pattern prevents action
    const avoidanceBoost = behaviorFlags.avoidancePattern ? 12 : 0
    // Anchoring to entry price resists inflation-adjusted rebalancing
    const anchoringBoost = behaviorFlags.anchoringToEntry ? 8 : 0
    // regret_avoidance causes paralysis
    const regretBoost = biasSeverity('regret_avoidance') * 5
    // Low RP adds vulnerability to real-return erosion
    const rpVulnerability = (100 - factors.RP.normalized) * 0.15

    score =
      spVulnerability * 0.45 +
      inertiaBoost +
      avoidanceBoost +
      anchoringBoost +
      regretBoost +
      rpVulnerability
  }

  return Math.min(100, Math.max(0, Math.round(score)))
}

// ---- Score tier helpers ----------------------------------------------------

function getTierColor(score: number): string {
  if (score >= 65) return '#FF3B30'
  if (score >= 40) return '#FF9500'
  return '#34C759'
}

function getTierLabel(score: number): string {
  if (score >= 65) return 'High Risk'
  if (score >= 40) return 'Moderate'
  return 'Low Risk'
}

// ---- Behavioral prediction text --------------------------------------------

function buildPredictionText(client: ClientRow, score: number, scenarioId: ScenarioId): string {
  const archInfo = ARCHETYPE_INFO[client.dna_profile.archetype.primary]
  const name = archInfo?.name ?? 'this client'
  const { biases, behaviorFlags, marketMood } = client.dna_profile

  const hasLossAversion = biases.some((b) => b.key === 'loss_aversion' && b.severity >= 2)
  const hasInertia = biases.some((b) => b.key === 'inertia' && b.severity >= 1)
  const hasFomo = biases.some((b) => b.key === 'fomo' && b.severity >= 1)
  const hasPresentBias = biases.some((b) => b.key === 'present_bias' && b.severity >= 1)

  if (scenarioId === 'market-crash') {
    if (score >= 65) {
      if (behaviorFlags.panicSellTendency || hasLossAversion) {
        return `${name} profile indicates likely capitulation near market bottom. Loss aversion will override the long-term plan.`
      }
      return `${name} profile shows high emotional reactivity to drawdowns. Expect increased check-ins and pressure to de-risk.`
    }
    if (score >= 40) {
      return `${name} will feel discomfort but is unlikely to act impulsively. Monitor for slow drift toward cash without explicit trigger.`
    }
    return `${name} archetype is resilient under market crashes. Systematic framing keeps decisions on track.`
  }

  if (scenarioId === 'rate-hike') {
    if (score >= 65) {
      if (hasFomo || hasPresentBias) {
        return `${name} may chase higher-yield instruments at inopportune times. Short-term orientation amplifies duration risk.`
      }
      return `${name} profile suggests reactive reallocation away from rate-sensitive holdings before the situation stabilizes.`
    }
    if (score >= 40) {
      return `${name} will require proactive guidance on duration exposure. Without intervention, may under-rebalance.`
    }
    return `${name} archetype is naturally positioned for rate environments. Long-term orientation limits reactive behavior.`
  }

  // inflation-surge
  if (score >= 65) {
    if (hasInertia || behaviorFlags.avoidancePattern) {
      return `${name} will delay inflation-hedging rebalancing. Inertia and avoidance patterns create a real-return drag.`
    }
    return `${name} profile shows inadequate stress tolerance for sustained purchasing-power erosion. Expect disengagement.`
  }
  if (score >= 40) {
    const moodNote =
      marketMood.state === 'concerned' ? ' Current concerned market mood amplifies this.' : ''
    return `${name} may struggle to maintain allocation discipline through prolonged inflation.${moodNote}`
  }
  return `${name} archetype handles inflation-driven stress well. Existing stress profile supports long-horizon real-return thinking.`
}

// ---- Animation variants ----------------------------------------------------

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

// ---- Custom Recharts Tooltip -----------------------------------------------

interface TooltipPayload {
  value: number
  payload: { fullName: string; score: number }
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]
  const score = item.value

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-card)',
        fontSize: '13px',
        color: 'var(--text-primary)',
      }}
    >
      <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>{item.payload.fullName}</p>
      <p style={{ margin: 0, color: getTierColor(score) }}>
        {score} — {getTierLabel(score)}
      </p>
    </div>
  )
}

// ---- Page ------------------------------------------------------------------

export default function StressTestPage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('market-crash')

  const clients = useMemo(() => getDemoClientRows(), [])

  const scoredClients = useMemo(() => {
    return clients
      .map((client) => ({
        client,
        score: computeStressScore(client, selectedScenario),
      }))
      .sort((a, b) => b.score - a.score)
  }, [clients, selectedScenario])

  const chartData = useMemo(() => {
    return scoredClients.map(({ client, score }) => ({
      name: client.first_name,
      fullName: `${client.first_name} ${client.last_name}`,
      score,
    }))
  }, [scoredClients])

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenario) ?? SCENARIOS[0]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="p-6 md:p-8">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/dashboard/scenario-lab"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            marginBottom: '16px',
            transition: 'color var(--transition-fast)',
          }}
          className="hover:text-[var(--text-primary)]"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Scenario Lab
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: `${activeScenario.color}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color var(--transition-base)',
            }}
          >
            <activeScenario.Icon size={20} color={activeScenario.color} strokeWidth={1.75} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Stress Test
            </h1>
            <p
              style={{
                marginTop: '4px',
                fontSize: '14px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              Behavioral risk scores per client under simulated market events.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario selector */}
      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          Select Scenario
        </p>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {SCENARIOS.map((scenario) => {
            const isActive = selectedScenario === scenario.id
            const Icon = scenario.Icon

            return (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-btn)',
                  border: `1px solid ${isActive ? scenario.color : 'var(--border)'}`,
                  backgroundColor: isActive ? scenario.color : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? `0 2px 8px ${scenario.color}44` : 'none',
                }}
              >
                <Icon size={14} strokeWidth={2} />
                {scenario.name}
              </button>
            )
          })}
        </div>

        {/* Scenario description */}
        <p
          style={{
            marginTop: '12px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          {activeScenario.description}
        </p>
      </div>

      {/* Summary bar chart */}
      <OculusCard style={{ marginBottom: '32px', padding: '24px' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            letterSpacing: '-0.01em',
          }}
        >
          Behavioral Risk Score by Client
        </p>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              barCategoryGap="28%"
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'var(--bg-input)', radius: 6 }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTierColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { color: '#34C759', label: 'Low Risk (0-39)' },
            { color: '#FF9500', label: 'Moderate (40-64)' },
            { color: '#FF3B30', label: 'High Risk (65-100)' },
          ].map(({ color, label }) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              {label}
            </div>
          ))}
        </div>
      </OculusCard>

      {/* Client risk cards */}
      <p
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        Client Risk Breakdown — Sorted by Exposure
      </p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={selectedScenario}
      >
        {scoredClients.map(({ client, score }, index) => {
          const tierColor = getTierColor(score)
          const tierLabel = getTierLabel(score)
          const predictionText = buildPredictionText(client, score, selectedScenario)
          const rank = index + 1

          return (
            <motion.div key={client.id} variants={cardVariants}>
              <OculusCard
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  padding: '20px',
                  borderLeft: `3px solid ${tierColor}`,
                }}
              >
                {/* Top row: rank + name + badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: tierColor,
                        backgroundColor: `${tierColor}18`,
                        borderRadius: '6px',
                        padding: '2px 7px',
                        flexShrink: 0,
                        letterSpacing: '0.02em',
                      }}
                    >
                      #{rank}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {client.first_name} {client.last_name}
                      </p>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
                  </div>
                </div>

                {/* Risk bar */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '6px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Behavioral Stress Score
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '22px',
                          fontWeight: 700,
                          color: tierColor,
                          letterSpacing: '-0.02em',
                          lineHeight: 1,
                        }}
                      >
                        {score}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: tierColor,
                          backgroundColor: `${tierColor}18`,
                          borderRadius: '5px',
                          padding: '2px 6px',
                        }}
                      >
                        {tierLabel}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar track */}
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-input)',
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      style={{
                        height: '100%',
                        borderRadius: '4px',
                        backgroundColor: tierColor,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.04 }}
                    />
                  </div>
                </div>

                {/* Prediction text */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px',
                  }}
                >
                  {predictionText}
                </p>
              </OculusCard>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
