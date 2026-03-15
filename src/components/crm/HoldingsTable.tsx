'use client'

import { motion, type Variants } from 'framer-motion'
import { OculusBadge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/format'

// ---- Types ----

export interface Holding {
  readonly ticker: string
  readonly name: string
  readonly shares: number
  readonly value: number
  readonly sector: string
  readonly assetClass: 'equity' | 'fixed-income' | 'cash' | 'alternative'
  readonly changePercent: number
}

// ---- Demo Holdings Data ----

const DEMO_HOLDINGS: Record<string, Holding[]> = {
  // Sarah Mitchell — big_picture_optimist, AUM $2.4M — growth heavy
  'sarah-mitchell': [
    { ticker: 'AAPL', name: 'Apple Inc.', shares: 1820, value: 386490, sector: 'Technology', assetClass: 'equity', changePercent: 2.14 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 920, value: 374400, sector: 'Technology', assetClass: 'equity', changePercent: 1.87 },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', shares: 1650, value: 301980, sector: 'Consumer Discretionary', assetClass: 'equity', changePercent: 3.42 },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 1450, value: 248120, sector: 'Communication Services', assetClass: 'equity', changePercent: -0.63 },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 1800, value: 518400, sector: 'Diversified', assetClass: 'equity', changePercent: 1.22 },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 2600, value: 202800, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 460, value: 368810, sector: 'Technology', assetClass: 'equity', changePercent: 4.91 },
  ],

  // James Chen — values_anchored_steward, AUM $1.8M — income/bonds
  'james-chen': [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 1900, value: 547200, sector: 'Diversified', assetClass: 'equity', changePercent: 1.22 },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 4200, value: 327600, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
    { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', shares: 3100, value: 279000, sector: 'Diversified', assetClass: 'equity', changePercent: 0.84 },
    { ticker: 'MUB', name: 'iShares Natl Muni Bond ETF', shares: 3800, value: 418000, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.09 },
    { ticker: 'TIPS', name: 'iShares TIPS Bond ETF', shares: 1200, value: 138600, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.31 },
    { ticker: 'ESGV', name: 'Vanguard ESG US Stock ETF', shares: 620, value: 89600, sector: 'Diversified', assetClass: 'equity', changePercent: 1.05 },
  ],

  // Maria Rodriguez — action_first_decider, AUM $890K — high growth/speculative
  'maria-rodriguez': [
    { ticker: 'TSLA', name: 'Tesla Inc.', shares: 680, value: 212040, sector: 'Consumer Discretionary', assetClass: 'equity', changePercent: 6.73 },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 240, value: 192480, sector: 'Technology', assetClass: 'equity', changePercent: 4.91 },
    { ticker: 'ARKK', name: 'ARK Innovation ETF', shares: 3200, value: 162240, sector: 'Technology', assetClass: 'equity', changePercent: 3.18 },
    { ticker: 'COIN', name: 'Coinbase Global Inc.', shares: 980, value: 152880, sector: 'Financials', assetClass: 'alternative', changePercent: 8.44 },
    { ticker: 'SQ', name: 'Block Inc.', shares: 1450, value: 93480, sector: 'Financials', assetClass: 'equity', changePercent: 2.29 },
    { ticker: 'MSTR', name: 'MicroStrategy Inc.', shares: 120, value: 76880, sector: 'Technology', assetClass: 'alternative', changePercent: 11.02 },
  ],

  // Robert Park — reassurance_seeker, AUM $3.1M — conservative/bonds
  'robert-park': [
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 8200, value: 639600, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
    { ticker: 'VCIT', name: 'Vanguard Interm-Term Corp Bond ETF', shares: 6400, value: 537600, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.12 },
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 2100, value: 604800, sector: 'Diversified', assetClass: 'equity', changePercent: 1.22 },
    { ticker: 'PGX', name: 'Invesco Preferred ETF', shares: 7200, value: 529200, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.07 },
    { ticker: 'SCHO', name: 'Schwab Short-Term US Treasury ETF', shares: 5500, value: 544500, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.04 },
    { ticker: 'VMFXX', name: 'Vanguard Federal Money Market Fund', shares: 244300, value: 244300, sector: 'Cash', assetClass: 'cash', changePercent: 0.01 },
  ],

  // Emily Watson — values_anchored_steward, AUM $450K — ESG focused
  'emily-watson': [
    { ticker: 'ESGV', name: 'Vanguard ESG US Stock ETF', shares: 1420, value: 205316, sector: 'Diversified', assetClass: 'equity', changePercent: 1.05 },
    { ticker: 'ICLN', name: 'iShares Global Clean Energy ETF', shares: 4800, value: 79680, sector: 'Utilities', assetClass: 'equity', changePercent: 2.37 },
    { ticker: 'VSGX', name: 'Vanguard ESG International Stock ETF', shares: 2100, value: 89040, sector: 'International', assetClass: 'equity', changePercent: 0.68 },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 976, value: 76128, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
  ],

  // David Kim — systems_builder, AUM $5.2M — systematic/diversified
  'david-kim': [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 4800, value: 1382400, sector: 'Diversified', assetClass: 'equity', changePercent: 1.22 },
    { ticker: 'QQQ', name: 'Invesco QQQ Trust', shares: 1200, value: 576000, sector: 'Technology', assetClass: 'equity', changePercent: 1.89 },
    { ticker: 'AAPL', name: 'Apple Inc.', shares: 2100, value: 445950, sector: 'Technology', assetClass: 'equity', changePercent: 2.14 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 1050, value: 427350, sector: 'Technology', assetClass: 'equity', changePercent: 1.87 },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 8400, value: 655200, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
    { ticker: 'GLD', name: 'SPDR Gold Shares', shares: 1450, value: 431600, sector: 'Commodities', assetClass: 'alternative', changePercent: 0.54 },
    { ticker: 'VXUS', name: 'Vanguard Total Intl Stock ETF', shares: 3200, value: 281500, sector: 'International', assetClass: 'equity', changePercent: 0.77 },
  ],

  // Lisa Thompson — collaborative_partner, AUM $1.5M — balanced
  'lisa-thompson': [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', shares: 1700, value: 489600, sector: 'Diversified', assetClass: 'equity', changePercent: 1.22 },
    { ticker: 'VXUS', name: 'Vanguard Total Intl Stock ETF', shares: 2200, value: 193600, sector: 'International', assetClass: 'equity', changePercent: 0.77 },
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 3800, value: 296400, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
    { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', shares: 1600, value: 161600, sector: 'Real Estate', assetClass: 'alternative', changePercent: -0.42 },
    { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', shares: 2600, value: 234000, sector: 'Diversified', assetClass: 'equity', changePercent: 0.84 },
    { ticker: 'VCIT', name: 'Vanguard Interm-Term Corp Bond ETF', shares: 1500, value: 124800, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.12 },
  ],

  // Michael Torres — avoider_under_stress, AUM $750K — ultra-conservative
  'michael-torres': [
    { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', shares: 2400, value: 187200, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: -0.18 },
    { ticker: 'VMFXX', name: 'Vanguard Federal Money Market Fund', shares: 282500, value: 282500, sector: 'Cash', assetClass: 'cash', changePercent: 0.01 },
    { ticker: 'SCHO', name: 'Schwab Short-Term US Treasury ETF', shares: 1900, value: 188100, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.04 },
    { ticker: 'VTIP', name: 'Vanguard Short-Term Inflation-Prot ETF', shares: 900, value: 92200, sector: 'Fixed Income', assetClass: 'fixed-income', changePercent: 0.22 },
  ],
}

// ---- Asset class badge variant mapping ----

const ASSET_CLASS_BADGE_VARIANT: Record<
  Holding['assetClass'],
  'blue' | 'green' | 'yellow' | 'orange'
> = {
  equity: 'blue',
  'fixed-income': 'green',
  cash: 'yellow',
  alternative: 'orange',
}

const ASSET_CLASS_LABEL: Record<Holding['assetClass'], string> = {
  equity: 'Equity',
  'fixed-income': 'Fixed Income',
  cash: 'Cash',
  alternative: 'Alternative',
}

// ---- Animation variants ----

const tableVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
}

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
}

// ---- Component ----

interface HoldingsTableProps {
  clientId: string
}

export function HoldingsTable({ clientId }: HoldingsTableProps) {
  const holdings = DEMO_HOLDINGS[clientId] ?? []

  if (holdings.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '2rem' }}>—</span>
        <p style={{ margin: 0 }}>No holdings found for this client.</p>
      </div>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
  const bestPerformer = holdings.reduce((best, h) =>
    h.changePercent > best.changePercent ? h : best
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Portfolio Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        <SummaryStat label="Total Holdings" value={String(holdings.length)} />
        <SummaryStat label="Total Value" value={formatCurrency(totalValue, { compact: true })} />
        <SummaryStat
          label="Best Performer"
          value={bestPerformer.ticker}
          sub={`+${bestPerformer.changePercent.toFixed(2)}%`}
          subColor="var(--oculus-green)"
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border)',
              }}
            >
              {['Ticker', 'Name', 'Shares', 'Value', 'Sector', 'Asset Class', 'Change'].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      position: 'sticky',
                      top: 0,
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text-muted)',
                      textAlign: col === 'Shares' || col === 'Value' || col === 'Change' ? 'right' : 'left',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-card)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>

          <motion.tbody
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {holdings.map((holding) => (
              <motion.tr
                key={holding.ticker}
                variants={rowVariants}
                style={{
                  borderBottom: '1px solid var(--border)',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                    'var(--bg-input)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'
                }}
              >
                {/* Ticker */}
                <td
                  style={{
                    padding: '11px 12px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {holding.ticker}
                </td>

                {/* Name */}
                <td
                  style={{
                    padding: '11px 12px',
                    color: 'var(--text-secondary)',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {holding.name}
                </td>

                {/* Shares */}
                <td
                  style={{
                    padding: '11px 12px',
                    textAlign: 'right',
                    color: 'var(--text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {holding.shares.toLocaleString('en-US')}
                </td>

                {/* Value */}
                <td
                  style={{
                    padding: '11px 12px',
                    textAlign: 'right',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCurrency(holding.value)}
                </td>

                {/* Sector */}
                <td
                  style={{
                    padding: '11px 12px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {holding.sector}
                </td>

                {/* Asset Class */}
                <td style={{ padding: '11px 12px', whiteSpace: 'nowrap' }}>
                  <OculusBadge variant={ASSET_CLASS_BADGE_VARIANT[holding.assetClass]}>
                    {ASSET_CLASS_LABEL[holding.assetClass]}
                  </OculusBadge>
                </td>

                {/* Change */}
                <td
                  style={{
                    padding: '11px 12px',
                    textAlign: 'right',
                    fontWeight: 500,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                    color:
                      holding.changePercent > 0
                        ? 'var(--oculus-green)'
                        : holding.changePercent < 0
                          ? '#ef4444'
                          : 'var(--text-muted)',
                  }}
                >
                  {holding.changePercent > 0 ? '+' : ''}
                  {holding.changePercent.toFixed(2)}%
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Summary Stat sub-component ----

interface SummaryStatProps {
  label: string
  value: string
  sub?: string
  subColor?: string
}

function SummaryStat({ label, value, sub, subColor }: SummaryStatProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-input)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: subColor ?? 'var(--text-muted)',
            }}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}
