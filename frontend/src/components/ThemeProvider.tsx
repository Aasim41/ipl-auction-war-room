'use client'

import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useStore((state) => state.theme)

  useEffect(() => {
    // Remove all previous theme classes
    document.body.className = document.body.className.replace(/\btheme-[a-z]+\b/g, '')
    // Add current theme class
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return <>{children}</>
}
