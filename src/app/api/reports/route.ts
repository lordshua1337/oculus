// GET /api/reports
// Returns the list of generated reports for the current session.
// In demo mode, always returns an empty list — reports are generated on demand
// via POST /api/reports/generate and are not persisted server-side.

import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo-clients'
import type { ReportRecord } from '@/lib/db/types'

interface ReportsListResponse {
  readonly reports: readonly ReportRecord[]
  readonly source: 'demo' | 'database'
}

export async function GET(): Promise<NextResponse<ReportsListResponse | { error: string }>> {
  if (isDemoMode()) {
    return NextResponse.json(
      { reports: [], source: 'demo' },
      { status: 200 }
    )
  }

  // Placeholder for real database query when Supabase is connected.
  // This branch is not reached in the current demo build.
  return NextResponse.json(
    { error: 'Database mode not yet configured' },
    { status: 501 }
  )
}
