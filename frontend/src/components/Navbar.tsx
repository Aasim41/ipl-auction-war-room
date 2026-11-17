'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Users, 
  Shield, 
  Gavel, 
  Crosshair, 
  ArrowLeftRight, 
  Target, 
  MapPin, 
  ArrowLeft,
  Activity
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { getStadiumForTeam } from '../data/stadiums'
import { getFranchise } from '../data/franchises'

const navLinks = [
  { href: '/trade', label: '1. Trade', icon: ArrowLeftRight },
  { href: '/squad', label: '2. Retain & Release', icon: Users },
  { href: '/auction', label: '3. Mini-Auction', icon: Gavel },
  { href: '/playing-xi', label: '4. Playing XI & Ground', icon: Crosshair },
  { href: '/hub', label: 'Analytics', icon: Activity },
  { href: '/stats', label: 'Player Pool', icon: Shield },
  { href: '/win-prob', label: 'Win Matrix', icon: Target },
]

export function Navbar() {
  const theme = useStore((state) => state.theme)
  const { getActiveCampaign } = useCampaignStore()
  const activeCamp = getActiveCampaign()
  const activeTeamId = activeCamp?.teamId || theme
  const stadium = getStadiumForTeam(activeTeamId)
  const franchise = getFranchise(activeTeamId)
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/' || pathname === '/select-team') return null

  const handleBack = () => {
    if (pathname === '/playing-xi') {
      router.push('/auction')
    } else if (pathname === '/auction') {
      router.push('/squad')
    } else if (pathname === '/squad') {
      router.push('/trade')
    } else if (pathname === '/trade') {
      router.push('/')
    } else {
      router.back()
    }
  }

  return (
    <nav className="fixed top-0 w-full h-12 sm:h-14 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-50 shadow-2xl overflow-x-hidden">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-2 sm:px-4 gap-2">
        
        {/* Left: Back Button & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={handleBack}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1 text-xs font-black cursor-pointer transition-all border border-white/15 shadow-sm"
            title="Go Back to Previous Phase"
          >
            <ArrowLeft size={14} className="text-amber-400" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm tracking-tight transition-all duration-300 group-hover:scale-105 shadow-lg"
              style={{
                backgroundColor: franchise.color || 'var(--accent-primary)',
                color: '#ffffff',
                boxShadow: '0 0 12px var(--accent-glow)'
              }}
            >
              {franchise.emoji || '🏏'}
            </div>
            <span className="font-display text-sm sm:text-base tracking-wider text-white hidden md:inline">
              AUCTION<span style={{ color: franchise.color || 'var(--accent-primary)' }}>XI</span>
            </span>
          </Link>
        </div>

        {/* Center: Phase Tabs (Scrollable on mobile landscape, always visible!) */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[60vw] sm:max-w-none scrollbar-none py-1 px-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-[1.03] border border-amber-400'
                    : 'text-gray-300 hover:text-white bg-slate-900/80 hover:bg-white/10 border border-white/5'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping shrink-0" />
                )}
                <link.icon size={12} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right: Franchise & Fortress / GM Badge */}
        <Link
          href="/select-team"
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all hover:scale-105 group cursor-pointer shrink-0 bg-black/50"
          style={{
            borderColor: franchise.color || 'var(--accent-primary)',
          }}
          title="Switch franchise campaign"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="text-left text-xs leading-tight">
            <span 
              className="font-black uppercase tracking-wider block text-[11px]" 
              style={{ color: franchise.color || 'var(--accent-primary)' }}
            >
              {stadium.teamShort}
            </span>
            <span className="text-[9px] text-gray-400 group-hover:text-white flex items-center gap-0.5">
              <MapPin size={8} className="text-emerald-400" />
              {stadium.shortName}
            </span>
          </div>
        </Link>

      </div>
    </nav>
  )
}
