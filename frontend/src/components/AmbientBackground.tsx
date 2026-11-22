'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { getTeamTheme } from '../data/teamThemes'

export function AmbientBackground() {
  const pathname = usePathname()
  const storeTheme = useStore((state) => state.theme)
  const activeCampaign = useCampaignStore((state) => {
    const activeId = state.activeCampaignId
    return activeId ? state.campaigns[activeId] : null
  })

  // If on home ('/'), allow immediate preview of whatever team tab the user clicked in storeTheme
  // On all other pages (e.g. playing-xi, auction, match), prioritize the active campaign's team
  const currentTeamId = useMemo(() => {
    if (pathname === '/' || !activeCampaign?.teamId) {
      return (storeTheme || activeCampaign?.teamId || 'rcb').toLowerCase()
    }
    return (activeCampaign.teamId || storeTheme || 'rcb').toLowerCase()
  }, [pathname, storeTheme, activeCampaign?.teamId])

  const t = getTeamTheme(currentTeamId)

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-700 ease-out"
      style={{ backgroundColor: t.bgDeep }}
      aria-hidden="true"
    >
      {/* ─── LAYER 1: Deep Stadium Night Atmosphere & Team Glow ─── */}
      <div 
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, ${t.glowPrimary} 0%, transparent 60%),
            linear-gradient(180deg, 
              ${t.bgDeep} 0%, 
              ${t.bgMid || t.bgDeep}99 40%, 
              #030712 100%
            )
          `
        }}
      />

      {/* ─── LAYER 2: Radiant Top Stadium Floodlight Spotlight ─── */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 20%, ${t.glowPrimary} 0%, ${t.glowSecondary} 40%, transparent 75%)`,
          filter: 'blur(50px)',
          opacity: 0.65,
        }}
      />

      {/* ─── LAYER 3: Flank Atmospheric Auras ─── */}
      <div
        className="absolute top-0 left-0 w-[450px] h-[450px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 10% 20%, ${t.glowPrimary} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          opacity: 0.45,
        }}
      />
      <div
        className="absolute top-0 right-0 w-[450px] h-[450px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at 90% 20%, ${t.glowSecondary} 0%, transparent 65%)`,
          filter: 'blur(60px)',
          opacity: 0.4,
        }}
      />

      {/* ─── LAYER 4: Subtle Clean Cyber Dot Pattern ─── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 transition-all duration-700 ease-out"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${t.primary} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* ─── LAYER 5: Soft Vignette for 100% High-Contrast Legibility ─── */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 40%, #030712f5 95%)`,
          opacity: 0.7,
        }}
      />
    </div>
  )
}
