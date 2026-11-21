'use client'

import { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const storeTheme = useStore((state) => state.theme)
  const activeCampaign = useCampaignStore((state) => {
    const activeId = state.activeCampaignId
    return activeId ? state.campaigns[activeId] : null
  })

  const currentTheme = useMemo(() => {
    if (pathname === '/' || !activeCampaign?.teamId) {
      return (storeTheme || activeCampaign?.teamId || 'rcb').toLowerCase()
    }
    return (activeCampaign.teamId || storeTheme || 'rcb').toLowerCase()
  }, [pathname, storeTheme, activeCampaign?.teamId])

  useEffect(() => {
    // Remove all previous theme classes
    document.body.className = document.body.className.replace(/\btheme-[a-z0-9]+\b/g, '').trim()
    // Add current theme class
    document.body.classList.add(`theme-${currentTheme}`)
  }, [currentTheme])

  return <>{children}</>
}
