'use client'

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector,
  type PieSectorDataItem,
} from 'recharts'
import type { ClientRow } from '@/lib/db/types'
import type { ArchetypeKey } from '@/lib/dna/types'
import { ARCHETYPE_INFO } from '@/lib/dna/archetypes'
import { ARCHETYPE_COLORS } from '@/lib/utils/constants'

// ---- Types ----

interface Props {
  readonly clients: ClientRow[]
}

interface ChartEntry {
  readonly key: ArchetypeKey
  readonly name: string
  readonly count: number
  readonly color: string
  readonly total: number
}

// ---- Data Derivation ----

function computeArchetypeCounts(clients: ClientRow[]): Omit<ChartEntry, 'total'>[] {
  const counts: Partial<Record<ArchetypeKey, number>> = {}

  for (const client of clients) {
    const key = client.archetype
    counts[key] = (counts[key] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([key, count]) => {
      const archetypeKey = key as ArchetypeKey
      return {
        key: archetypeKey,
        name: ARCHETYPE_INFO[archetypeKey]?.name ?? archetypeKey,
        count: count ?? 0,
        color: ARCHETYPE_COLORS[archetypeKey] ?? '#7a7d85',
      }
    })
    .sort((a, b) => b.count - a.count)
}

// ---- Custom Active Shape ----

function renderActiveShape(props: PieSectorDataItem) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = '',
    cornerRadius,
  } = props

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={Number(outerRadius) + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={cornerRadius}
    />
  )
}

// ---- Custom Tooltip ----

function renderTooltipContent(props: Record<string, unknown>) {
  const active = props['active'] as boolean | undefined
  const payload = props['payload'] as Array<{ payload?: ChartEntry }> | undefined

  if (!active || !payload || payload.length === 0) return null

  const entry = payload[0]?.payload
  if (!entry) return null

  const pct = entry.total > 0 ? Math.round((entry.count / entry.total) * 100) : 0

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-card-hover)',
        minWidth: '160px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: entry.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {entry.name}
        </span>
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {entry.count}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.01em' }}>
        {pct}% of clients
      </div>
    </div>
  )
}

// ---- Legend ----

interface LegendProps {
  readonly data: Omit<ChartEntry, 'total'>[]
  readonly total: number
  readonly activeIndex: number | null
  readonly onHover: (index: number | null) => void
}

function ArchetypeLegend({ data, total, activeIndex, onHover }: LegendProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 16px',
        marginTop: '16px',
        justifyContent: 'center',
      }}
    >
      {data.map((entry, index) => {
        const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
        const isActive = activeIndex === index

        return (
          <div
            key={entry.key}
            onMouseEnter={() => onHover(index)}
            onMouseLeave={() => onHover(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'default',
              opacity: activeIndex !== null && !isActive ? 0.4 : 1,
              padding: '3px 8px',
              borderRadius: '8px',
              background: isActive ? 'var(--bg-input)' : 'transparent',
              transition: 'opacity 200ms ease, background 150ms ease',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: entry.color,
                flexShrink: 0,
                boxShadow: isActive ? `0 0 6px ${entry.color}90` : 'none',
                transition: 'box-shadow 200ms ease',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                letterSpacing: '-0.01em',
                transition: 'color 150ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.name}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginLeft: '2px',
              }}
            >
              {entry.count}{' '}
              <span style={{ opacity: 0.7, fontWeight: 400 }}>({pct}%)</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ---- Main Component ----

export function ArchetypeDistributionChart({ clients }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const rawData = useMemo(() => computeArchetypeCounts(clients), [clients])
  const total = useMemo(() => rawData.reduce((sum, e) => sum + e.count, 0), [rawData])

  // Enrich with total for tooltip percentage
  const chartData: ChartEntry[] = useMemo(
    () => rawData.map((entry) => ({ ...entry, total })),
    [rawData, total]
  )

  if (clients.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '280px',
        }}
      >
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No client data available</span>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Donut chart with center overlay */}
      <div style={{ width: '100%', height: '260px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              isAnimationActive={true}
              animationBegin={200}
              animationDuration={800}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.color}
                  stroke="transparent"
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip
              content={renderTooltipContent as (props: unknown) => React.ReactNode}
              cursor={false}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Absolute center label — sits over the donut hole */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {total}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px',
              letterSpacing: '0.01em',
            }}
          >
            clients
          </div>
        </div>
      </div>

      {/* Two-column flex-wrap legend */}
      <ArchetypeLegend
        data={rawData}
        total={total}
        activeIndex={activeIndex}
        onHover={setActiveIndex}
      />
    </div>
  )
}
