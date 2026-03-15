// GET /api/clients
// Returns all clients. Supports optional search and status query params.
// In demo mode: filters in-memory from getDemoClientRows().
// In non-demo mode: returns empty array (Supabase not configured yet).

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoClientRows } from '@/lib/demo-clients'
import type { ClientRow, ClientStatus } from '@/lib/db/types'

const VALID_STATUSES: ReadonlyArray<ClientStatus> = [
  'lead',
  'onboarding',
  'active',
  'review',
  'churned',
]

function isValidStatus(value: string): value is ClientStatus {
  return VALID_STATUSES.includes(value as ClientStatus)
}

function applySearch(clients: ClientRow[], query: string): ClientRow[] {
  const normalized = query.toLowerCase()
  return clients.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
    return fullName.includes(normalized)
  })
}

function applyStatusFilter(clients: ClientRow[], status: ClientStatus): ClientRow[] {
  return clients.filter((c) => c.status === status)
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isDemoMode()) {
    return NextResponse.json({ clients: [] }, { status: 200 })
  }

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search')
  const statusParam = searchParams.get('status')

  let clients = getDemoClientRows()

  if (search !== null && search.trim().length > 0) {
    clients = applySearch(clients, search.trim())
  }

  if (statusParam !== null) {
    if (!isValidStatus(statusParam)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }
    clients = applyStatusFilter(clients, statusParam)
  }

  return NextResponse.json({ clients }, { status: 200 })
}
