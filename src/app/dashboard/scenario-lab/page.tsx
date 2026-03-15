'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Layers, Scale, ArrowRight } from 'lucide-react'
import { OculusCard } from '@/components/ui/OculusCard'

const SCENARIOS = [
  {
    id: 'stress-test',
    title: 'Stress Test',
    description:
      "Simulate market crashes, rate hikes, and inflation shocks. See how each client's behavioral DNA predicts their reaction.",
    href: '/dashboard/scenario-lab/stress-test',
    icon: Flame,
    color: '#ff5102',
  },
  {
    id: 'multi-portfolio',
    title: 'Multi-Portfolio',
    description:
      'View multiple client portfolios side by side. Spot concentration risk and archetype mismatches.',
    href: '/dashboard/scenario-lab/multi-portfolio',
    icon: Layers,
    color: '#006DD8',
  },
  {
    id: 'rebalancer',
    title: 'Rebalancer',
    description:
      'Generate rebalancing recommendations with tax-sensitivity awareness based on client DNA.',
    href: '/dashboard/scenario-lab/rebalancer',
    icon: Scale,
    color: '#00b982',
  },
] as const

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}

export default function ScenarioLabPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="p-6 md:p-8">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Scenario Lab
        </h1>
        <p
          style={{
            marginTop: '8px',
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          Run stress tests, compare portfolios, and optimize rebalancing -- before markets force
          your hand.
        </p>
      </div>

      {/* Cards grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon

          return (
            <motion.div key={scenario.id} variants={cardVariants} whileHover={{ y: -4 }}>
              <Link href={scenario.href} style={{ textDecoration: 'none', display: 'block' }}>
                <OculusCard
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                  className="oculus-card-hover"
                >
                  {/* Icon box */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      backgroundColor: `${scenario.color}1a`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} color={scenario.color} strokeWidth={1.75} />
                  </div>

                  {/* Title + description */}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {scenario.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                      }}
                    >
                      {scenario.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: scenario.color,
                    }}
                  >
                    <span>Open Lab</span>
                    <ArrowRight size={14} strokeWidth={2} />
                  </div>
                </OculusCard>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
