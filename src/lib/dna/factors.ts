import type { FactorCode } from './types'

export interface FactorInfo {
  readonly code: FactorCode
  readonly name: string
  readonly lowLabel: string
  readonly highLabel: string
  readonly description: string
  readonly color: string
}

export const PRIMARY_FACTORS: Readonly<Record<FactorCode, FactorInfo>> = {
  RP: {
    code: 'RP',
    name: 'Risk Posture',
    lowLabel: 'Conservative',
    highLabel: 'Aggressive',
    description:
      'Measures how much risk the investor is comfortable taking on in pursuit of returns.',
    color: '#FF3B30',
  },
  DS: {
    code: 'DS',
    name: 'Decision Speed',
    lowLabel: 'Deliberate',
    highLabel: 'Impulsive',
    description:
      'Measures the pace at which the investor moves from information to action.',
    color: '#FF9500',
  },
  CN: {
    code: 'CN',
    name: 'Control Need',
    lowLabel: 'Delegator',
    highLabel: 'Hands-On',
    description:
      'Measures how much direct oversight and autonomy the investor wants over their portfolio.',
    color: '#fca311',
  },
  TO: {
    code: 'TO',
    name: 'Time Orientation',
    lowLabel: 'Short-Term',
    highLabel: 'Long-Term',
    description:
      'Measures whether the investor focuses on near-term gains or multi-year compounding.',
    color: '#34C759',
  },
  SI: {
    code: 'SI',
    name: 'Social Influence',
    lowLabel: 'Independent',
    highLabel: 'Influenced',
    description:
      'Measures how much external opinion, media, and peer behavior shapes investment decisions.',
    color: '#007AFF',
  },
  ES: {
    code: 'ES',
    name: 'Emotional Steadiness',
    lowLabel: 'Reactive',
    highLabel: 'Steady',
    description:
      'Measures how calmly the investor responds to portfolio volatility and market stress.',
    color: '#5856D6',
  },
  SP: {
    code: 'SP',
    name: 'Structure Preference',
    lowLabel: 'Flexible',
    highLabel: 'Structured',
    description:
      'Measures preference for rules, systems, and rigid plans versus adaptive, intuitive approaches.',
    color: '#AF52DE',
  },
  IP: {
    code: 'IP',
    name: 'Information Processing',
    lowLabel: 'Intuitive',
    highLabel: 'Analytical',
    description:
      'Measures whether the investor relies on gut instinct or detailed data analysis when deciding.',
    color: '#006DD8',
  },
} as const
