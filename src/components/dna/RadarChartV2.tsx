'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PRIMARY_FACTORS } from '@/lib/dna/factors'
import type { FactorScores, FactorCode } from '@/lib/dna/types'

// ---- Types ----------------------------------------------------------------

interface Props {
  factors?: FactorScores
  size?: number
  showLabels?: boolean
  className?: string
}

interface TooltipState {
  index: number
  x: number
  y: number
}

// ---- Constants -------------------------------------------------------------

const FACTOR_ORDER: FactorCode[] = ['RP', 'DS', 'CN', 'TO', 'SI', 'ES', 'SP', 'IP']

const MIN_SIZE = 200
const DEFAULT_SIZE = 280
const LABEL_OFFSET = 20
const GRID_RINGS = [0.25, 0.5, 0.75, 1.0]

// ---- Math helpers ----------------------------------------------------------

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  }
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  maxR: number,
  scores: number[]
): string {
  return scores
    .map((score, i) => {
      const angle = (2 * Math.PI * i) / scores.length
      const r = (score / 100) * maxR
      const pt = polarToCartesian(cx, cy, r, angle)
      return `${pt.x},${pt.y}`
    })
    .join(' ')
}

// ---- Component -------------------------------------------------------------

export function RadarChartV2({
  factors,
  size: rawSize,
  showLabels = true,
  className = '',
}: Props) {
  const size = Math.max(MIN_SIZE, rawSize ?? DEFAULT_SIZE)
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 40

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const spokeAngles = useMemo(
    () => FACTOR_ORDER.map((_, i) => (2 * Math.PI * i) / FACTOR_ORDER.length),
    []
  )

  const spokeTips = useMemo(
    () => spokeAngles.map((angle) => polarToCartesian(cx, cy, maxR, angle)),
    [spokeAngles, cx, cy, maxR]
  )

  const normalizedScores: number[] = useMemo(() => {
    if (!factors) return FACTOR_ORDER.map(() => 0)
    return FACTOR_ORDER.map((code) => factors[code]?.normalized ?? 0)
  }, [factors])

  const polygonPoints = useMemo(
    () => buildPolygonPoints(cx, cy, maxR, normalizedScores),
    [cx, cy, maxR, normalizedScores]
  )

  const hasData = factors !== undefined

  return (
    <div
      className={className}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Radar chart showing 8 behavioral DNA factor scores"
        role="img"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Grid rings */}
        {GRID_RINGS.map((fraction) => {
          const r = maxR * fraction
          const ringPoints = Array.from({ length: FACTOR_ORDER.length }, (_, i) => {
            const angle = (2 * Math.PI * i) / FACTOR_ORDER.length
            const pt = polarToCartesian(cx, cy, r, angle)
            return `${pt.x},${pt.y}`
          }).join(' ')
          return (
            <polygon
              key={fraction}
              points={ringPoints}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1}
            />
          )
        })}

        {/* Spoke lines */}
        {spokeAngles.map((angle, i) => {
          const tip = polarToCartesian(cx, cy, maxR, angle)
          return (
            <line
              key={FACTOR_ORDER[i]}
              x1={cx}
              y1={cy}
              x2={tip.x}
              y2={tip.y}
              stroke="var(--border)"
              strokeWidth={1}
            />
          )
        })}

        {/* Data polygon (only when factors provided) */}
        {hasData && (
          <motion.polygon
            points={polygonPoints}
            fill="var(--oculus-blue)"
            fillOpacity={0.15}
            stroke="var(--oculus-blue)"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        )}

        {/* Score dots */}
        {hasData &&
          FACTOR_ORDER.map((code, i) => {
            const score = normalizedScores[i]
            const angle = spokeAngles[i]
            const r = (score / 100) * maxR
            const pt = polarToCartesian(cx, cy, r, angle)
            const svgPt = polarToCartesian(cx, cy, r + 12, angle)

            return (
              <motion.circle
                key={code}
                cx={pt.x}
                cy={pt.y}
                r={5}
                fill="var(--oculus-blue)"
                stroke="white"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                onMouseEnter={() =>
                  setTooltip({ index: i, x: svgPt.x, y: svgPt.y })
                }
                onMouseLeave={() => setTooltip(null)}
                aria-label={`${PRIMARY_FACTORS[code].name}: ${score}`}
              />
            )
          })}

        {/* Labels */}
        {showLabels &&
          FACTOR_ORDER.map((code, i) => {
            const angle = spokeAngles[i]
            const labelPt = polarToCartesian(cx, cy, maxR + LABEL_OFFSET, angle)
            return (
              <text
                key={code}
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={500}
                fill="var(--text-secondary)"
                style={{ fontFamily: 'inherit', userSelect: 'none' }}
              >
                {code}
              </text>
            )
          })}

        {/* SVG-space tooltip anchor — used for absolute positioning */}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip !== null && hasData && (() => {
          const code = FACTOR_ORDER[tooltip.index]
          const info = PRIMARY_FACTORS[code]
          const score = normalizedScores[tooltip.index]
          // Convert SVG coords to percentage for CSS positioning
          const leftPct = (tooltip.x / size) * 100
          const topPct = (tooltip.y / size) * 100

          return (
            <motion.div
              key={`tooltip-${tooltip.index}`}
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: 'translate(-50%, -100%) translateY(-8px)',
                zIndex: 10,
                pointerEvents: 'none',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0, 109, 216, 0.18), 0 1px 4px rgba(0, 0, 0, 0.16)',
                padding: '8px 12px',
                whiteSpace: 'nowrap',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--oculus-blue)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                {code}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}
              >
                {info.name}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {score}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    letterSpacing: 0,
                    marginLeft: '2px',
                  }}
                >
                  / 100
                </span>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
