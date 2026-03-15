// Database row types for the Oculus advisor platform.
// These map 1:1 to Supabase table rows.
// All fields are readonly to enforce immutability.

import type { DNAProfileV2, ArchetypeKey } from '../dna/types'

// ---- Scalar Enums ----

export type ClientStatus = 'lead' | 'onboarding' | 'active' | 'review' | 'churned'
export type NoteType = 'general' | 'meeting' | 'call' | 'compliance' | 'review'

// ---- Table Row Types ----

// Represents a single row from the clients table.
export interface ClientRow {
  readonly id: string
  readonly first_name: string
  readonly last_name: string
  readonly email: string
  readonly phone?: string
  readonly status: ClientStatus
  readonly archetype: ArchetypeKey
  readonly dna_profile: DNAProfileV2
  readonly aum: number
  readonly risk_score: number
  readonly brand_color: string
  readonly notes?: string
  readonly last_contact_at: string
  readonly next_review_at?: string
  readonly created_at: string
  readonly updated_at: string
}

// Represents a single row from the client_notes table.
export interface ClientNote {
  readonly id: string
  readonly client_id: string
  readonly type: NoteType
  readonly content: string
  readonly created_at: string
  readonly created_by?: string
}

// ---- Report Types ----

export type ReportType = 'quarterly' | 'annual' | 'tax' | 'compliance'

// Represents a generated report record (stored in memory or database).
export interface ReportRecord {
  readonly id: string
  readonly client_id: string
  readonly client_name: string
  readonly report_type: ReportType
  readonly content: string
  readonly source: 'static' | 'claude'
  readonly generated_at: string
}

// Represents a single row from the portfolio_holdings table.
export interface PortfolioHolding {
  readonly id: string
  readonly client_id: string
  readonly ticker: string
  readonly name: string
  readonly shares: number
  readonly price: number
  readonly value: number
  readonly allocation_pct: number
  readonly asset_class: string
  readonly sector?: string
}
