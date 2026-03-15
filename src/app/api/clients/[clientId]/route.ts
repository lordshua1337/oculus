// GET /api/clients/[clientId]
// Returns a single client by ID.
// In demo mode: looks up from getDemoClientById, returns 404 if not found.
// In non-demo mode: returns 404 (Supabase not configured yet).

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoClientById } from '@/lib/demo-clients'

interface RouteContext {
  params: Promise<{ clientId: string }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { clientId } = await context.params

  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const client = getDemoClientById(clientId)

  if (client === undefined) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json({ client }, { status: 200 })
}
