'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'oculus-theme'
const DARK_VALUE = 'dark'
const LIGHT_VALUE = 'light'

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === DARK_VALUE) return true
  if (stored === LIGHT_VALUE) return false
  // Fall back to system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(isDark: boolean): void {
  document.documentElement.setAttribute('data-theme', isDark ? DARK_VALUE : LIGHT_VALUE)
}

export function useTheme(): { isDark: boolean; toggleTheme: () => void } {
  const [isDark, setIsDark] = useState<boolean>(false)

  // Sync from localStorage on mount (runs only on client)
  useEffect(() => {
    const initial = getInitialTheme()
    setIsDark(initial)
    applyTheme(initial)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? DARK_VALUE : LIGHT_VALUE)
      applyTheme(next)
      return next
    })
  }, [])

  return { isDark, toggleTheme }
}
