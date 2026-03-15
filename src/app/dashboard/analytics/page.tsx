'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'
import { MetricCard, OculusCard } from '@/components/ui'
import { FactorBars } from '@/components/dna/FactorBars'
import { getDemoClientRows } from '@/lib/demo-clients'
import { getDemoStats, getDemoArchetypeDistribution } from '@/lib/demo-data'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import {
  STATUS_COLORS,
  ARCHETYPE_COLORS,
} from '@/lib/utils/constants'
import type { FactorCode } from '@/lib/dna/types'
import type { FactorScores } from '@/lib/dna/types'

// ---- Types ------------------------------------------------------------------

interface ComplianceRow {
  id: string
  name: string
  lastReview: string
  dueDate: string
  status: 'On Track' | 'Due Soon' | 'Overdue'
}

// ---- Helpers ----------------------------------------------------------------

function computeAveragedFactors(clients: ReturnType<typeof getDemoClientRows>): FactorScores {
  const factorCodes: FactorCode[] = ['RP', 'DS', 'CN', 'TO', 'SI', 'ES', 'SP', 'IP']
  const n = clients.length

  const averaged = {} as Record<FactorCode, { raw: number; normalized: number; percentile: number; confidence: number }>

  for (const code of factorCodes) {
    const totals = clients.reduce(
      (acc, client) => {
        const f = client.dna_profile.factors[code]
        return {
          raw: acc.raw + f.raw,
          normalized: acc.normalized + f.normalized,
          percentile: acc.percentile + f.percentile,
          confidence: acc.confidence + f.confidence,
        }
      },
      { raw: 0, normalized: 0, percentile: 0, confidence: 0 }
    )

    averaged[code] = {
      raw: Math.round((totals.raw / n) * 10) / 10,
      normalized: Math.round(totals.normalized / n),
      percentile: Math.round(totals.percentile / n),
      confidence: Math.round((totals.confidence / n) * 100) / 100,
    }
  }

  return averaged as FactorScores
}

function computeAumByStatus(
  clients: ReturnType<typeof getDemoClientRows>
): { name: string; aum: number; color: string }[] {
  const statuses = ['lead', 'onboarding', 'active', 'review', 'churned'] as const
  return statuses.map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    aum: clients
      .filter((c) => c.status === status)
      .reduce((sum, c) => sum + c.aum, 0),
    color: STATUS_COLORS[status],
  }))
}

function computeComplianceRows(
  clients: ReturnType<typeof getDemoClientRows>
): ComplianceRow[] {
  const now = new Date()
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

  return clients.map((client) => {
    const lastContact = new Date(client.last_contact_at)
    const dueDate = new Date(lastContact.getTime() + ninetyDaysMs)
    const diffMs = dueDate.getTime() - now.getTime()

    let status: ComplianceRow['status']
    if (diffMs < 0) {
      status = 'Overdue'
    } else if (diffMs < thirtyDaysMs) {
      status = 'Due Soon'
    } else {
      status = 'On Track'
    }

    return {
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
      lastReview: client.last_contact_at,
      dueDate: dueDate.toISOString(),
      status,
    }
  })
}

// ---- Mock timeline data (6-month engagement) --------------------------------

const ENGAGEMENT_TIMELINE = [
  { month: 'Oct', meetings: 12, emails: 34, reviews: 2 },
  { month: 'Nov', meetings: 15, emails: 41, reviews: 3 },
  { month: 'Dec', meetings: 8,  emails: 28, reviews: 1 },
  { month: 'Jan', meetings: 18, emails: 52, reviews: 4 },
  { month: 'Feb', meetings: 21, emails: 60, reviews: 3 },
  { month: 'Mar', meetings: 24, emails: 68, reviews: 5 },
]

// ---- Stagger helper ---------------------------------------------------------

function staggerDelay(baseDelay: number, index: number, step = 0.08): number {
  return baseDelay + index * step
}

// ---- Tooltip styles ---------------------------------------------------------

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontSize: '12px',
  boxShadow: 'var(--shadow-card)',
}

// ---- Custom DonutLabel -------------------------------------------------------

function DonutCenterLabel({ cx, cy, count }: { cx: number; cy: number; count: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan
        x={cx}
        dy="-0.3em"
        style={{ fill: 'var(--text-primary)', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em' }}
      >
        {count}
      </tspan>
      <tspan
        x={cx}
        dy="1.5em"
        style={{ fill: 'var(--text-muted)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}
      >
        Clients
      </tspan>
    </text>
  )
}

// ---- Compliance status badge ------------------------------------------------

function ComplianceBadge({ status }: { status: ComplianceRow['status'] }) {
  const config = {
    'On Track': { bg: 'rgba(52, 199, 89, 0.12)', color: '#34C759' },
    'Due Soon': { bg: 'rgba(255, 149, 0, 0.12)', color: '#FF9500' },
    'Overdue': { bg: 'rgba(255, 59, 48, 0.12)', color: '#FF3B30' },
  }[status]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {status}
    </span>
  )
}

// ---- Page ------------------------------------------------------------------

export default function AnalyticsPage() {
  const clients = getDemoClientRows()
  const stats = getDemoStats()
  const archetypeDistribution = getDemoArchetypeDistribution()

  const reviewCompliance = useMemo(() => {
    const rows = computeComplianceRows(clients)
    const onTrack = rows.filter((r) => r.status === 'On Track').length
    return Math.round((onTrack / rows.length) * 100)
  }, [clients])

  const archetypeData = useMemo(
    () =>
      Object.entries(archetypeDistribution).map(([key, count]) => ({
        name: key
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        value: count,
        color: ARCHETYPE_COLORS[key as keyof typeof ARCHETYPE_COLORS] ?? '#7a7d85',
      })),
    [archetypeDistribution]
  )

  const aumByStatus = useMemo(() => computeAumByStatus(clients), [clients])

  const averagedFactors = useMemo(() => computeAveragedFactors(clients), [clients])

  const complianceRows = useMemo(() => computeComplianceRows(clients), [clients])

  const totalClientCount = clients.length

  return (
    <div
      style={{
        padding: '32px 32px 48px',
        maxWidth: 1400,
        margin: '0 auto',
        backgroundColor: 'var(--bg-base)',
        minHeight: '100vh',
      }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: '32px' }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Analytics
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            marginTop: '6px',
            marginBottom: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Practice-wide performance, behavioral trends, and review compliance
        </p>
      </motion.div>

      {/* Metric cards row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {[
          {
            label: 'Total AUM',
            value: formatCurrency(stats.totalAUM, { compact: true }),
            delta: '+4.2% this quarter',
            deltaType: 'positive' as const,
            icon: <DollarSign size={18} />,
          },
          {
            label: 'Active Clients',
            value: stats.activeCount,
            delta: `${stats.clientCount} total`,
            deltaType: 'neutral' as const,
            icon: <Users size={18} />,
          },
          {
            label: 'Avg Risk Score',
            value: stats.avgRiskScore,
            delta: 'Moderate posture',
            deltaType: 'neutral' as const,
            icon: <TrendingUp size={18} />,
          },
          {
            label: 'Review Compliance',
            value: `${reviewCompliance}%`,
            delta: reviewCompliance >= 70 ? 'Healthy' : 'Needs attention',
            deltaType: (reviewCompliance >= 70 ? ('positive' as const) : ('negative' as const)),
            icon: <CheckCircle size={18} />,
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: staggerDelay(0.08, index) }}
          >
            <MetricCard
              label={card.label}
              value={card.value}
              delta={card.delta}
              deltaType={card.deltaType}
              icon={card.icon}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Archetype Distribution donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22 }}
        >
          <OculusCard style={{ padding: '24px' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: '0 0 20px 0',
              }}
            >
              Archetype Distribution
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={archetypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy }) => (
                      <DonutCenterLabel cx={cx} cy={cy} count={totalClientCount} />
                    )}
                  >
                    {archetypeData.map((entry, index) => (
                      <Cell key={`arch-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${value} client${Number(value) !== 1 ? 's' : ''}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0, flex: 1 }}>
                {archetypeData.map((entry) => (
                  <div
                    key={entry.name}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: entry.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {entry.name}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        marginLeft: 'auto',
                        flexShrink: 0,
                      }}
                    >
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </OculusCard>
        </motion.div>

        {/* AUM by Stage bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <OculusCard style={{ padding: '24px' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: '0 0 20px 0',
              }}
            >
              AUM by Stage
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aumByStatus} barSize={32} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [formatCurrency(Number(value), { compact: true }), 'AUM']}
                  cursor={{ fill: 'rgba(0, 109, 216, 0.06)' }}
                />
                <Bar dataKey="aum" radius={[6, 6, 0, 0]}>
                  {aumByStatus.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </OculusCard>
        </motion.div>
      </div>

      {/* Practice DNA Factor Averages */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        style={{ marginBottom: '24px' }}
      >
        <OculusCard>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
            }}
          >
            Practice DNA Factor Averages
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: '0 0 24px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Mean normalized score across all {totalClientCount} clients
          </p>
          <FactorBars factors={averagedFactors} />
        </OculusCard>
      </motion.div>

      {/* Client Engagement Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.38 }}
        style={{ marginBottom: '24px' }}
      >
        <OculusCard>
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
            }}
          >
            Client Engagement Timeline
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              margin: '0 0 24px 0',
              letterSpacing: '-0.01em',
            }}
          >
            Meetings, emails, and reviews over the last 6 months
          </p>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Meetings', color: '#006DD8' },
              { label: 'Emails', color: '#00b982' },
              { label: 'Reviews', color: '#AF52DE' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: color, display: 'block' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ENGAGEMENT_TIMELINE} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#006DD8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#006DD8', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#006DD8', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="emails"
                stroke="#00b982"
                strokeWidth={2}
                dot={{ r: 3, fill: '#00b982', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#00b982', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="reviews"
                stroke="#AF52DE"
                strokeWidth={2}
                dot={{ r: 3, fill: '#AF52DE', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#AF52DE', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </OculusCard>
      </motion.div>

      {/* Review Compliance Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.46 }}
      >
        <OculusCard style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 0' }}>
            <h2
              style={{
                fontSize: '15px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}
            >
              Review Compliance Tracker
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                margin: '0 0 16px 0',
                letterSpacing: '-0.01em',
              }}
            >
              Reviews due 90 days after last contact. Due Soon = within 30 days.
            </p>
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr',
              gap: '0 16px',
              padding: '10px 24px',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {['Client', 'Last Review', 'Due Date', 'Status'].map((col) => (
              <span
                key={col}
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Table rows */}
          <div>
            {complianceRows.map((row, index) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.5 + index * 0.04 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.4fr 1.4fr 1fr',
                  gap: '0 16px',
                  padding: '14px 24px',
                  borderBottom: index < complianceRows.length - 1 ? '1px solid var(--border)' : undefined,
                  alignItems: 'center',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--oculus-blue-soft)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {row.name}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatDate(row.lastReview)}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatDate(row.dueDate)}
                </span>
                <ComplianceBadge status={row.status} />
              </motion.div>
            ))}
          </div>
        </OculusCard>
      </motion.div>
    </div>
  )
}
