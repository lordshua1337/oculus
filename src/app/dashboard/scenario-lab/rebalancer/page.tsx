'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ArrowLeft, Scale, AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { getDemoClientRows } from '@/lib/demo-clients'
import { OculusCard, OculusButton } from '@/components/ui'
import { ArchetypeBadge } from '@/components/dna/ArchetypeBadge'
import { formatCurrency } from '@/lib/utils/format'
import { CHART_PALETTE } from '@/lib/utils/constants'
import type { ArchetypeKey } from '@/lib/dna/types'

// ---- Types ------------------------------------------------------------------

interface Allocation {
  readonly equity: number
  readonly fixedIncome: number
  readonly cash: number
  readonly alternatives: number
}

interface Trade {
  readonly ticker: string
  readonly action: 'buy' | 'sell'
  readonly shares: number
  readonly value: number
  readonly taxImpact: number
}

interface ClientPlan {
  readonly before: Allocation
  readonly after: Allocation
  readonly trades: readonly Trade[]
  readonly summary: {
    readonly netTaxImpact: number
    readonly driftCorrection: number
    readonly expectedRiskReduction: number
  }
}

// ---- Demo Allocations -------------------------------------------------------

const DEMO_PLANS: Readonly<Record<string, ClientPlan>> = {
  'david-kim': {
    before: { equity: 75, fixedIncome: 15, cash: 5, alternatives: 5 },
    after: { equity: 65, fixedIncome: 20, cash: 10, alternatives: 5 },
    trades: [
      { ticker: 'SPY', action: 'sell', shares: 120, value: 54480, taxImpact: -8200 },
      { ticker: 'QQQ', action: 'sell', shares: 85, value: 38675, taxImpact: -5940 },
      { ticker: 'BND', action: 'buy', shares: 640, value: 52224, taxImpact: 0 },
      { ticker: 'SHV', action: 'buy', shares: 420, value: 42000, taxImpact: 0 },
      { ticker: 'GLD', action: 'buy', shares: 38, value: 9310, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -14140, driftCorrection: 8.6, expectedRiskReduction: 12 },
  },
  'robert-park': {
    before: { equity: 25, fixedIncome: 55, cash: 15, alternatives: 5 },
    after: { equity: 30, fixedIncome: 50, cash: 15, alternatives: 5 },
    trades: [
      { ticker: 'VTI', action: 'buy', shares: 220, value: 48400, taxImpact: 0 },
      { ticker: 'VTIP', action: 'buy', shares: 310, value: 30690, taxImpact: 0 },
      { ticker: 'VCSH', action: 'sell', shares: 480, value: 38880, taxImpact: -2100 },
      { ticker: 'VMBS', action: 'sell', shares: 390, value: 39780, taxImpact: -1450 },
    ],
    summary: { netTaxImpact: -3550, driftCorrection: 5.2, expectedRiskReduction: 4 },
  },
  'maria-rodriguez': {
    before: { equity: 85, fixedIncome: 5, cash: 5, alternatives: 5 },
    after: { equity: 70, fixedIncome: 15, cash: 10, alternatives: 5 },
    trades: [
      { ticker: 'NVDA', action: 'sell', shares: 95, value: 119712, taxImpact: -28600 },
      { ticker: 'TSLA', action: 'sell', shares: 140, value: 38920, taxImpact: -9800 },
      { ticker: 'AGG', action: 'buy', shares: 580, value: 60088, taxImpact: 0 },
      { ticker: 'SGOV', action: 'buy', shares: 440, value: 44440, taxImpact: 0 },
      { ticker: 'IGSB', action: 'buy', shares: 360, value: 36072, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -38400, driftCorrection: 14.1, expectedRiskReduction: 22 },
  },
  'sarah-mitchell': {
    before: { equity: 70, fixedIncome: 20, cash: 5, alternatives: 5 },
    after: { equity: 65, fixedIncome: 25, cash: 5, alternatives: 5 },
    trades: [
      { ticker: 'VWO', action: 'sell', shares: 320, value: 14976, taxImpact: -2280 },
      { ticker: 'IVV', action: 'sell', shares: 40, value: 22000, taxImpact: -3100 },
      { ticker: 'VBTLX', action: 'buy', shares: 900, value: 34200, taxImpact: 0 },
      { ticker: 'VCIT', action: 'buy', shares: 280, value: 28280, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -5380, driftCorrection: 6.0, expectedRiskReduction: 7 },
  },
  'james-chen': {
    before: { equity: 55, fixedIncome: 30, cash: 5, alternatives: 10 },
    after: { equity: 50, fixedIncome: 35, cash: 5, alternatives: 10 },
    trades: [
      { ticker: 'ESGU', action: 'sell', shares: 200, value: 18600, taxImpact: -2900 },
      { ticker: 'SUSL', action: 'buy', shares: 280, value: 18200, taxImpact: 0 },
      { ticker: 'ESGD', action: 'buy', shares: 160, value: 10560, taxImpact: 0 },
      { ticker: 'VCOBX', action: 'buy', shares: 210, value: 10500, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -2900, driftCorrection: 4.8, expectedRiskReduction: 6 },
  },
  'emily-watson': {
    before: { equity: 60, fixedIncome: 25, cash: 10, alternatives: 5 },
    after: { equity: 55, fixedIncome: 30, cash: 10, alternatives: 5 },
    trades: [
      { ticker: 'SUSA', action: 'sell', shares: 90, value: 9630, taxImpact: -1200 },
      { ticker: 'ESGE', action: 'buy', shares: 120, value: 8400, taxImpact: 0 },
      { ticker: 'BNDX', action: 'buy', shares: 145, value: 7685, taxImpact: 0 },
      { ticker: 'VCSH', action: 'buy', shares: 140, value: 5565, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -1200, driftCorrection: 3.5, expectedRiskReduction: 5 },
  },
  'lisa-thompson': {
    before: { equity: 65, fixedIncome: 25, cash: 5, alternatives: 5 },
    after: { equity: 60, fixedIncome: 28, cash: 7, alternatives: 5 },
    trades: [
      { ticker: 'VGT', action: 'sell', shares: 55, value: 24750, taxImpact: -4100 },
      { ticker: 'VHT', action: 'buy', shares: 88, value: 20856, taxImpact: 0 },
      { ticker: 'MUB', action: 'buy', shares: 180, value: 18396, taxImpact: 0 },
      { ticker: 'SGOV', action: 'buy', shares: 80, value: 8080, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -4100, driftCorrection: 5.4, expectedRiskReduction: 8 },
  },
  'michael-torres': {
    before: { equity: 40, fixedIncome: 30, cash: 25, alternatives: 5 },
    after: { equity: 45, fixedIncome: 35, cash: 15, alternatives: 5 },
    trades: [
      { ticker: 'VMFXX', action: 'sell', shares: 1000, value: 75000, taxImpact: -450 },
      { ticker: 'VTI', action: 'buy', shares: 85, value: 18700, taxImpact: 0 },
      { ticker: 'BND', action: 'buy', shares: 440, value: 35904, taxImpact: 0 },
      { ticker: 'SCHD', action: 'buy', shares: 130, value: 12350, taxImpact: 0 },
    ],
    summary: { netTaxImpact: -450, driftCorrection: 9.8, expectedRiskReduction: 3 },
  },
} as const

// ---- Tax Note by Archetype --------------------------------------------------

const TAX_NOTES: Readonly<Partial<Record<ArchetypeKey, string>>> = {
  systems_builder:
    'Systematic tax-loss harvesting should be modeled alongside this rebalance. Coordinate with tax optimizer before executing.',
  values_anchored_steward:
    'ESG fund transitions carry embedded gains. Stage sales across tax years where possible to minimize impact.',
  big_picture_optimist:
    'Long-term capital gains rates apply — plan execution timing around annual income brackets.',
  collaborative_partner:
    'Walk through the tax implications together before executing. Transparency here builds trust.',
  action_first_decider:
    'Flag realized gains before executing. Fast movers often underestimate tax drag on net returns.',
  trend_sensitive_explorer:
    'Recent position gains are short-term. Waiting 12 months converts to long-term rates where feasible.',
  reassurance_seeker:
    'Highlight that this rebalance is tax-aware — it will reduce future tax exposure, not increase it.',
  avoider_under_stress:
    'Break this into two phases to reduce decision burden. Phase 1: sells. Phase 2: buys after 30 days.',
  analytical_skeptic:
    'Provide full after-tax return projections. This client will model it themselves if you do not.',
  diy_controller:
    'Provide the full tax workup for their records. They will want to verify each lot independently.',
}

function getTaxNote(archetype: ArchetypeKey): string {
  return TAX_NOTES[archetype] ?? 'Review tax implications with your CPA before executing this rebalance.'
}

// ---- Helpers ----------------------------------------------------------------

function isTaxSensitive(client: ReturnType<typeof getDemoClientRows>[number]): boolean {
  return (client.dna_profile?.factors?.TO?.normalized ?? 0) > 65
}

function allocationToChartData(allocation: Allocation) {
  return [
    { name: 'Equity', value: allocation.equity },
    { name: 'Fixed Income', value: allocation.fixedIncome },
    { name: 'Cash', value: allocation.cash },
    { name: 'Alternatives', value: allocation.alternatives },
  ]
}

const PIE_COLORS = [CHART_PALETTE[0], CHART_PALETTE[1], CHART_PALETTE[2], CHART_PALETTE[3]] as const

// ---- Sub-components ---------------------------------------------------------

interface PieTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}

function AllocationTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <span style={{ fontWeight: 600 }}>{item.name}</span>
      <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{item.value}%</span>
    </div>
  )
}

interface AllocationPieProps {
  allocation: Allocation
  label: string
}

function AllocationPie({ allocation, label }: AllocationPieProps) {
  const data = allocationToChartData(allocation)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </p>
      <div style={{ width: '100%', height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<AllocationTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {data.map((item, i) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {item.name} <span style={{ color: 'var(--text-muted)' }}>{item.value}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Main Page --------------------------------------------------------------

const clients = getDemoClientRows()

export default function RebalancerPage() {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id ?? '')
  const [showAfter, setShowAfter] = useState(false)

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? clients[0]
  const plan = DEMO_PLANS[selectedClientId] ?? DEMO_PLANS[clients[0]?.id ?? '']
  const taxSensitive = isTaxSensitive(selectedClient)
  const taxNote = getTaxNote(selectedClient.archetype)

  function handleClientChange(id: string) {
    setSelectedClientId(id)
    setShowAfter(false)
  }

  function handleGenerate() {
    setShowAfter(true)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="p-6 md:p-8">

      {/* Back link */}
      <Link
        href="/dashboard/scenario-lab"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          marginBottom: '24px',
          transition: 'color var(--transition-fast)',
        }}
        className="hover:text-[var(--text-primary)]"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Scenario Lab
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 185, 130, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scale size={20} color="#00b982" strokeWidth={1.75} />
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Portfolio Rebalancer
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
          Generate rebalancing recommendations with tax-sensitivity awareness based on client DNA.
        </p>
      </div>

      {/* Client Selector */}
      <OculusCard style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ flex: '1 1 280px' }}>
            <label
              htmlFor="client-select"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              Select Client
            </label>
            <select
              id="client-select"
              className="oculus-select"
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} — {client.archetype.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingTop: '20px' }}>
            <ArchetypeBadge archetypeKey={selectedClient.archetype} size="md" />
            {taxSensitive && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(252, 163, 17, 0.12)',
                  paddingLeft: '10px',
                  paddingRight: '10px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#fca311',
                  whiteSpace: 'nowrap',
                }}
              >
                <AlertTriangle size={12} strokeWidth={2.5} aria-hidden />
                Tax Sensitive
              </span>
            )}
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <OculusButton variant="primary" onClick={handleGenerate} disabled={showAfter}>
              <Zap size={15} strokeWidth={2} />
              {showAfter ? 'Plan Generated' : 'Generate Rebalance Plan'}
            </OculusButton>
          </div>
        </div>

        {taxSensitive && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(252, 163, 17, 0.08)',
              border: '1px solid rgba(252, 163, 17, 0.2)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            <span style={{ fontWeight: 600, color: '#fca311' }}>Tax Sensitivity Note — </span>
            {taxNote}
          </div>
        )}
      </OculusCard>

      {/* Before / After Pie Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <OculusCard>
          <AllocationPie allocation={plan.before} label="Current Allocation" />
        </OculusCard>

        <OculusCard
          style={{
            position: 'relative',
            overflow: 'hidden',
            opacity: showAfter ? 1 : 0.38,
            transition: 'opacity 0.4s ease',
            border: showAfter ? '1px solid rgba(0, 185, 130, 0.3)' : '1px solid var(--border)',
          }}
        >
          {!showAfter && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                borderRadius: 'var(--radius-card)',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                Generate plan to reveal
              </span>
            </div>
          )}
          <AllocationPie allocation={plan.after} label="Target Allocation" />
        </OculusCard>
      </div>

      {/* Trade List */}
      <AnimatePresence>
        {showAfter && (
          <motion.div
            key="trades"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ marginBottom: '24px' }}
          >
            <OculusCard>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 20px 0',
                  letterSpacing: '-0.01em',
                }}
              >
                Recommended Trades
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                  <thead>
                    <tr>
                      {['Ticker', 'Action', 'Shares', 'Value', 'Tax Impact'].map((col) => (
                        <th
                          key={col}
                          style={{
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            paddingBottom: '12px',
                            borderBottom: '1px solid var(--border)',
                            paddingRight: '16px',
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plan.trades.map((trade, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: idx < plan.trades.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <td
                          style={{
                            padding: '14px 16px 14px 0',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontFamily: 'ui-monospace, "SF Mono", monospace',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {trade.ticker}
                        </td>
                        <td style={{ padding: '14px 16px 14px 0' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '6px',
                              padding: '3px 9px',
                              fontSize: '11px',
                              fontWeight: 600,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              backgroundColor:
                                trade.action === 'buy'
                                  ? 'rgba(0, 185, 130, 0.12)'
                                  : 'rgba(255, 59, 48, 0.12)',
                              color: trade.action === 'buy' ? '#00b982' : '#FF3B30',
                            }}
                          >
                            {trade.action === 'buy' ? (
                              <TrendingUp size={11} strokeWidth={2.5} aria-hidden />
                            ) : (
                              <TrendingDown size={11} strokeWidth={2.5} aria-hidden />
                            )}
                            {trade.action}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '14px 16px 14px 0',
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {trade.shares.toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px 14px 0',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {formatCurrency(trade.value, { compact: true })}
                        </td>
                        <td
                          style={{
                            padding: '14px 0',
                            fontSize: '13px',
                            fontWeight: 500,
                            color:
                              trade.taxImpact < 0
                                ? '#FF3B30'
                                : trade.taxImpact > 0
                                  ? '#00b982'
                                  : 'var(--text-muted)',
                          }}
                        >
                          {trade.taxImpact === 0
                            ? '—'
                            : `${trade.taxImpact < 0 ? '-' : '+'}${formatCurrency(Math.abs(trade.taxImpact), { compact: true })}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </OculusCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards */}
      <AnimatePresence>
        {showAfter && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <SummaryMetric
                label="Net Tax Impact"
                value={formatCurrency(plan.summary.netTaxImpact, { compact: true })}
                sub="estimated realized gains"
                color="#FF3B30"
                icon={<TrendingDown size={18} strokeWidth={1.75} />}
              />
              <SummaryMetric
                label="Drift Correction"
                value={`${plan.summary.driftCorrection}%`}
                sub="allocation deviation closed"
                color="#006DD8"
                icon={<Scale size={18} strokeWidth={1.75} />}
              />
              <SummaryMetric
                label="Expected Risk Reduction"
                value={`${plan.summary.expectedRiskReduction}%`}
                sub="portfolio volatility improvement"
                color="#00b982"
                icon={<TrendingUp size={18} strokeWidth={1.75} />}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---- Summary Metric Card ----------------------------------------------------

interface SummaryMetricProps {
  label: string
  value: string
  sub: string
  color: string
  icon: React.ReactNode
}

function SummaryMetric({ label, value, sub, color, icon }: SummaryMetricProps) {
  return (
    <OculusCard style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: `${color}1a`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color,
          }}
        >
          {icon}
        </div>
        <div>
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {label}
          </p>
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {value}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</p>
        </div>
      </div>
    </OculusCard>
  )
}
