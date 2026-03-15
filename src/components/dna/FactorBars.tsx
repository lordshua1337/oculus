'use client'

import { motion } from 'framer-motion'
import type { FactorCode } from '@/lib/dna/types'
import type { FactorScores } from '@/lib/dna/types'
import { FactorBar } from './FactorBar'

const FACTOR_ORDER: FactorCode[] = ['RP', 'DS', 'CN', 'TO', 'SI', 'ES', 'SP', 'IP']

interface FactorBarsProps {
  factors: FactorScores
  className?: string
}

export function FactorBars({ factors, className = '' }: FactorBarsProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {FACTOR_ORDER.map((code, index) => (
        <motion.div
          key={code}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.35,
            delay: index * 0.06,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <FactorBar
            factorCode={code}
            score={factors[code].normalized}
          />
        </motion.div>
      ))}
    </div>
  )
}
