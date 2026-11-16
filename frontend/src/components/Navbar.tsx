'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, Users, Shield, Gavel, Crosshair, ArrowLeftRight, Target, GitCompare, MapPin } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getStadiumForTeam } from '../data/stadiums'

const navLinks = [
  { href: '/trade', label: '1. Trade Window', icon: ArrowLeftRight },
  { href: '/squad', label: '2. Retain & Release', icon: Users },
  { href: '/auction', label: '3. Mini-Auction', icon: Gavel },
  { href: '/playing-xi', label: '4. Playing XI & Ground', icon: Crosshair },
  { href: '/hub', label: 'Analytics Hub', icon: Activity },
  { href: '/stats', label: 'Player Pool', icon: Shield },
  { href: '/win-prob', label: 'Win Matrix', icon: Target },
]

export function Navbar() {
  const theme = useStore((state) => state.theme)
  const stadium = getStadiumForTeam(theme)
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/' || pathname === '/select-team') return null

  return (
    <nav className="fixed top-0 w-full h-14 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo with Cricket Ball motif */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm tracking-tight transition-all duration-300 group-hover:scale-105 shadow-lg"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#000000',
              boxShadow: '0 0 15px var(--accent-glow)'
            }}
          >
            🏏
          </div>
          <span className="font-display text-lg tracking-wider text-white">
            AUCTION<span className="text-[var(--accent-primary)]">XI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden lg:flex items-center gap-1 mx-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm border border-white/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  color: isActive ? 'var(--accent-primary)' : undefined,
                }}
              >
                <link.icon size={13} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Home Fortress & Team Badge (Clickable to switch franchise) */}
        <Link
          href="/select-team"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all hover:scale-105 group cursor-pointer"
          style={{
            borderColor: 'var(--accent-primary)',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          title="Click to change your franchise & home fortress"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-left text-xs">
            <span className="font-black uppercase tracking-wider block" style={{ color: 'var(--accent-primary)' }}>
              {stadium.teamShort}
            </span>
            <span className="text-[10px] text-gray-400 group-hover:text-white flex items-center gap-0.5">
              <MapPin size={9} className="text-emerald-400" />
              {stadium.shortName}
            </span>
          </div>
        </Link>

      </div>
    </nav>
  )
}
