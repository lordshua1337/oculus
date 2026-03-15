// Pure formatting utility functions.
// All functions handle null/undefined inputs without throwing.
// No external dependencies — uses only Intl APIs and native JS.

/**
 * Format a number as USD currency.
 * If compact is true, abbreviates large values: $2.4M, $890K, etc.
 */
export function formatCurrency(
  value: number | null | undefined,
  options?: { compact?: boolean }
): string {
  if (value === null || value === undefined || isNaN(value)) return '—'

  if (options?.compact) {
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''

    if (abs >= 1_000_000_000) {
      return `${sign}$${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
    }
    if (abs >= 1_000_000) {
      return `${sign}$${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    }
    if (abs >= 1_000) {
      return `${sign}$${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`
    }
    return `${sign}$${abs.toFixed(2)}`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a number as a percentage string.
 * Handles both decimal form (0.074 -> "7.40%") and already-percentage form (7.4 -> "7.40%").
 * Values > 1 are treated as already being a percentage.
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) return '—'

  const pct = value > 1 || value < -1 ? value : value * 100
  return `${pct.toFixed(decimals)}%`
}

/**
 * Format an ISO date string using Intl.DateTimeFormat.
 * - 'short': "Mar 14, 2026"
 * - 'long':  "March 14, 2026"
 * - 'numeric': "3/14/2026"
 */
export function formatDate(
  iso: string | null | undefined,
  format: 'short' | 'long' | 'numeric' = 'short'
): string {
  if (!iso) return '—'

  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'

  const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    numeric: { month: 'numeric', day: 'numeric', year: 'numeric' },
  }

  return new Intl.DateTimeFormat('en-US', formatMap[format]).format(date)
}

/**
 * Format an ISO date string as a relative time string.
 * Examples: "2 days ago", "3 hours ago", "just now"
 * Pure JS — no date-fns or external libs.
 */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'

  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)

  if (diffSeconds < 0) {
    // Future date
    const absDiff = Math.abs(diffSeconds)
    if (absDiff < 60) return 'in a few seconds'
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`
    return `in ${Math.floor(absDiff / 86400)} days`
  }

  if (diffSeconds < 10) return 'just now'
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (diffSeconds < 2592000) {
    const days = Math.floor(diffSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  if (diffSeconds < 31536000) {
    const months = Math.floor(diffSeconds / 2592000)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }

  const years = Math.floor(diffSeconds / 31536000)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

/**
 * Return the initials for a person's name.
 * Takes first char of each provided name, uppercased, max 2 chars.
 */
export function getInitials(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const first = firstName?.trim()?.[0]?.toUpperCase() ?? ''
  const last = lastName?.trim()?.[0]?.toUpperCase() ?? ''
  return `${first}${last}`.slice(0, 2)
}
