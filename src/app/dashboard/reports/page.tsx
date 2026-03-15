'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, AlertCircle, RefreshCw } from 'lucide-react'
import { getDemoClientRows } from '@/lib/demo-clients'
import {
  OculusCard,
  OculusButton,
  SkeletonLoader,
  EmptyState,
} from '@/components/ui'
import { ArchetypeBadge } from '@/components/dna/ArchetypeBadge'
import { formatCurrency } from '@/lib/utils/format'

// ---- Types ------------------------------------------------------------------

type ReportType = 'quarterly' | 'annual' | 'tax' | 'compliance'

interface ReportTab {
  id: ReportType
  label: string
}

// ---- Constants --------------------------------------------------------------

const REPORT_TABS: ReportTab[] = [
  { id: 'quarterly', label: 'Quarterly Review' },
  { id: 'annual', label: 'Annual Summary' },
  { id: 'tax', label: 'Tax Report' },
  { id: 'compliance', label: 'Compliance' },
]

const ALL_CLIENTS = getDemoClientRows()

// ---- Report content renderer ------------------------------------------------

function renderReportContent(text: string): React.ReactNode {
  const paragraphs = text.split('\n').filter((line) => line.trim().length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {paragraphs.map((para, idx) => {
        // Parse **bold** markers
        const parts = para.split(/(\*\*[^*]+\*\*)/g)
        const rendered = parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong
                key={partIdx}
                style={{ color: 'var(--text-primary)', fontWeight: 600 }}
              >
                {part.slice(2, -2)}
              </strong>
            )
          }
          return <span key={partIdx}>{part}</span>
        })

        return (
          <p
            key={idx}
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              letterSpacing: '-0.01em',
            }}
          >
            {rendered}
          </p>
        )
      })}
    </div>
  )
}

// ---- Skeleton rows for generating state -------------------------------------

function ReportSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
      <SkeletonLoader variant="text-lg" width="55%" />
      <SkeletonLoader variant="text-base" width="90%" />
      <SkeletonLoader variant="text-base" width="80%" />
      <SkeletonLoader variant="text-base" width="85%" />
      <SkeletonLoader variant="text-sm" width="60%" />
      <div style={{ marginTop: '8px' }}>
        <SkeletonLoader variant="text-lg" width="40%" />
      </div>
      <SkeletonLoader variant="text-base" width="95%" />
      <SkeletonLoader variant="text-base" width="75%" />
      <SkeletonLoader variant="text-base" width="88%" />
      <SkeletonLoader variant="text-sm" width="50%" />
      <div style={{ marginTop: '8px' }}>
        <SkeletonLoader variant="text-lg" width="45%" />
      </div>
      <SkeletonLoader variant="text-base" width="82%" />
      <SkeletonLoader variant="text-base" width="70%" />
    </div>
  )
}

// ---- Error toast ------------------------------------------------------------

interface ErrorToastProps {
  message: string
  onRetry: () => void
}

function ErrorToast({ message, onRetry }: ErrorToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-input)',
        marginBottom: '20px',
      }}
    >
      <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} aria-hidden />
      <span
        style={{
          fontSize: '13px',
          color: '#ef4444',
          flex: 1,
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}
      >
        {message}
      </span>
      <button
        onClick={onRetry}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: 500,
          color: '#ef4444',
          background: 'none',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '8px',
          padding: '4px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        <RefreshCw size={11} aria-hidden />
        Retry
      </button>
    </motion.div>
  )
}

// ---- Page ------------------------------------------------------------------

export default function ReportsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [reportType, setReportType] = useState<ReportType>('quarterly')
  const [generating, setGenerating] = useState(false)
  const [reportContent, setReportContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedClient = selectedClientId
    ? ALL_CLIENTS.find((c) => c.id === selectedClientId) ?? null
    : null

  async function handleGenerate() {
    if (!selectedClientId || generating) return
    setGenerating(true)
    setError(null)
    setReportContent(null)

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClientId, reportType }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          (body as { error?: string }).error ?? `Request failed with status ${res.status}`
        )
      }

      const data = await res.json()
      setReportContent((data as { report: string }).report)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = selectedClientId !== null && !generating

  const reportTabLabel =
    REPORT_TABS.find((t) => t.id === reportType)?.label ?? 'Report'

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area {
            position: fixed;
            inset: 0;
            padding: 48px;
            background: white;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-base)',
          padding: '32px 28px',
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              margin: 0,
              marginBottom: '6px',
            }}
          >
            Reports
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Generate client reports for quarterly reviews, tax planning, and compliance.
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
          }}
          className="reports-layout"
        >
          {/* ---- Sidebar ---- */}
          <div
            style={{
              width: '320px',
              flexShrink: 0,
              position: 'sticky',
              top: '24px',
            }}
            className="reports-sidebar"
          >
            <OculusCard style={{ padding: '20px' }}>
              {/* Client selector */}
              <div style={{ marginBottom: '20px' }}>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: 0,
                    marginBottom: '12px',
                  }}
                >
                  Select Client
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {ALL_CLIENTS.map((client) => {
                    const isActive = client.id === selectedClientId
                    return (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClientId(client.id)
                          setReportContent(null)
                          setError(null)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: 'none',
                          borderLeft: isActive
                            ? '3px solid var(--oculus-blue)'
                            : '3px solid transparent',
                          backgroundColor: isActive
                            ? 'var(--oculus-blue-soft)'
                            : 'var(--bg-input)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          fontFamily: 'inherit',
                          transition:
                            'background-color var(--transition-fast), border-color var(--transition-fast)',
                        }}
                        aria-pressed={isActive}
                      >
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              marginBottom: '4px',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: isActive
                                ? 'var(--oculus-blue)'
                                : 'var(--text-primary)',
                              letterSpacing: '-0.01em',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {client.first_name} {client.last_name}
                          </p>
                          <ArchetypeBadge archetypeKey={client.archetype} size="sm" />
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--text-muted)',
                            marginLeft: '8px',
                            flexShrink: 0,
                          }}
                        >
                          {formatCurrency(client.aum, { compact: true })}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Report type tabs */}
              <div style={{ marginBottom: '20px' }}>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: 0,
                    marginBottom: '10px',
                  }}
                >
                  Report Type
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  {REPORT_TABS.map((tab) => {
                    const isActive = tab.id === reportType
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setReportType(tab.id)
                          setReportContent(null)
                          setError(null)
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          border: 'none',
                          backgroundColor: isActive
                            ? 'var(--oculus-blue)'
                            : 'var(--bg-input)',
                          color: isActive ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          letterSpacing: '-0.01em',
                          transition:
                            'background-color var(--transition-fast), color var(--transition-fast)',
                        }}
                        aria-pressed={isActive}
                      >
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Generate button */}
              <OculusButton
                variant="primary"
                size="md"
                disabled={!canGenerate}
                loading={generating}
                onClick={handleGenerate}
                style={{ width: '100%' }}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </OculusButton>
            </OculusCard>
          </div>

          {/* ---- Main preview area ---- */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence>
              {error && (
                <ErrorToast
                  key="error"
                  message={error}
                  onRetry={handleGenerate}
                />
              )}
            </AnimatePresence>

            {/* No client selected */}
            {!selectedClientId && !generating && (
              <OculusCard style={{ padding: '0' }}>
                <EmptyState
                  icon={FileText}
                  title="No client selected"
                  description="Select a client and report type from the sidebar, then click Generate Report."
                />
              </OculusCard>
            )}

            {/* Client selected but no report yet */}
            {selectedClientId && !generating && !reportContent && !error && (
              <OculusCard style={{ padding: '0' }}>
                <EmptyState
                  icon={FileText}
                  title="Ready to generate"
                  description={`Choose a report type and click Generate Report to create a ${reportTabLabel.toLowerCase()} for ${selectedClient?.first_name ?? 'this client'}.`}
                />
              </OculusCard>
            )}

            {/* Generating skeleton */}
            {generating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <OculusCard>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: 'var(--oculus-blue)',
                      margin: 0,
                      marginBottom: '20px',
                    }}
                  >
                    Generating report...
                  </p>
                  <ReportSkeleton />
                </OculusCard>
              </motion.div>
            )}

            {/* Report content */}
            {!generating && reportContent && (
              <motion.div
                id="report-print-area"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <OculusCard>
                  {/* Report header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '24px',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--oculus-blue)',
                          margin: 0,
                          marginBottom: '6px',
                        }}
                      >
                        {reportTabLabel}
                      </p>
                      <h2
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          letterSpacing: '-0.03em',
                          margin: 0,
                          marginBottom: '4px',
                        }}
                      >
                        {selectedClient?.first_name} {selectedClient?.last_name}
                      </h2>
                      {selectedClient && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '6px',
                          }}
                        >
                          <ArchetypeBadge
                            archetypeKey={selectedClient.archetype}
                            size="sm"
                          />
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            AUM: {formatCurrency(selectedClient.aum, { compact: true })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PDF export button */}
                    <OculusButton
                      variant="outline"
                      size="sm"
                      onClick={() => window.print()}
                    >
                      <Download size={13} aria-hidden />
                      Export PDF
                    </OculusButton>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'var(--border)',
                      marginBottom: '24px',
                    }}
                  />

                  {/* Report body */}
                  {renderReportContent(reportContent)}
                </OculusCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive stacking for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .reports-layout {
            flex-direction: column !important;
          }
          .reports-sidebar {
            width: 100% !important;
            position: static !important;
          }
        }
      `}</style>
    </>
  )
}
