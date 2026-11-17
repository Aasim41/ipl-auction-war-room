'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCampaignStore } from '../store/useCampaignStore'
import { getFranchise } from '../data/franchises'
import { BCCIRulesModal } from './BCCIRulesModal'
import { 
  ArrowLeftRight, 
  Users, 
  Gavel, 
  Crosshair, 
  Shield, 
  RotateCcw, 
  ChevronRight,
  User,
  Plus,
  ArrowLeft
} from 'lucide-react'

const PHASES = [
  { id: 'trade', label: '1. Trade Window', href: '/trade', icon: ArrowLeftRight },
  { id: 'retain_release', label: '2. Retain & Release', href: '/squad', icon: Users },
  { id: 'mini_auction', label: '3. Mini-Auction', href: '/auction', icon: Gavel },
  { id: 'playing_xi', label: '4. Playing XI & Match', href: '/playing-xi', icon: Crosshair },
]

export function CampaignPhaseStepper() {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    currentUser, 
    campaigns, 
    activeCampaignId, 
    getActiveCampaign, 
    switchCampaign, 
    createCampaign, 
    resetCampaign 
  } = useCampaignStore()

  const [showRules, setShowRules] = useState(false)
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false)

  const activeCamp = getActiveCampaign()
  if (!activeCamp) return null

  const franchise = getFranchise(activeCamp.teamId)
  const activeCount = activeCamp.squad.filter((p) => !p.is_released).length
  const overseasCount = activeCamp.squad.filter((p) => !p.is_released && p.is_overseas).length

  const handleStepBack = () => {
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
    <>
      <div className="w-full bg-slate-950/95 backdrop-blur-md border-b border-white/10 px-2 sm:px-4 py-1.5 z-40 text-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          
          {/* Left: Back button & Active Franchise Info */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={handleStepBack}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 hover:text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-all border border-white/10 shrink-0"
              title="Return to previous screen"
            >
              <ArrowLeft size={13} className="text-amber-400" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-md shrink-0"
                style={{ backgroundColor: franchise.color, color: '#fff' }}
              >
                {franchise.emoji}
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <span className="font-display font-black text-xs sm:text-sm text-white tracking-wide">
                    {franchise.name}
                  </span>
                  <button
                    onClick={() => setShowTeamSwitcher(!showTeamSwitcher)}
                    className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 font-bold cursor-pointer transition-all border border-white/10"
                    title="Switch or Start another franchise campaign"
                  >
                    Saves ▾
                  </button>
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-1.5 font-mono">
                  <span>Purse: <strong className="text-emerald-400">₹{activeCamp.remainingPurse.toFixed(2)} Cr</strong></span>
                  <span>•</span>
                  <span>Squad: <strong className="text-indigo-300">{activeCount}/25</strong> (OS: {overseasCount}/8)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (BCCI Rules & Reset) */}
            <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
              <button
                onClick={() => setShowRules(true)}
                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="View Official BCCI Rules & Cycle Directives"
              >
                <Shield size={11} />
                <span className="hidden sm:inline">BCCI Rules</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Reset ${franchise.name} campaign back to Day 1?`)) {
                    resetCampaign(activeCamp.id)
                    router.push('/trade')
                  }
                }}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-300 text-[10px] cursor-pointer transition-colors"
                title="Reset this franchise campaign"
              >
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* Right: The 4-Phase Interactive Progress Stepper */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 md:pb-0 shrink-0">
            {PHASES.map((phase, idx) => {
              const isActive = pathname === phase.href || activeCamp.currentPhase === phase.id
              const Icon = phase.icon
              return (
                <React.Fragment key={phase.id}>
                  <Link
                    href={phase.href}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02] border border-amber-400'
                        : 'bg-slate-900/80 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-slate-950' : 'text-gray-400'} />
                    <span>{phase.label}</span>
                  </Link>
                  {idx < PHASES.length - 1 && (
                    <ChevronRight size={10} className="text-gray-600 shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>

        </div>

        {/* Dropdown: Team Campaign Save Switcher */}
        {showTeamSwitcher && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl max-w-xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                <User size={14} className="text-amber-400" />
                Your Active Franchise Saves
              </h4>
              <Link
                href="/select-team"
                onClick={() => setShowTeamSwitcher(false)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center gap-1 cursor-pointer hover:bg-amber-400"
              >
                <Plus size={12} />
                <span>New Franchise Save</span>
              </Link>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {Object.values(campaigns).map((c) => {
                const f = getFranchise(c.teamId)
                const isCurrent = c.id === activeCamp.id
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      switchCampaign(c.id)
                      setShowTeamSwitcher(false)
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{f.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{f.name}</span>
                          {isCurrent && <span className="text-[9px] px-1.5 rounded bg-amber-500 text-black font-black">ACTIVE</span>}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Phase: <span className="text-amber-300 font-bold uppercase">{c.currentPhase.replace('_', ' ')}</span> • Purse: ₹{c.remainingPurse.toFixed(2)} Cr
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">Load ➔</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      <BCCIRulesModal
        isOpen={showRules}
        teamName={franchise.name}
        teamEmoji={franchise.emoji}
        onAccept={() => setShowRules(false)}
      />
    </>
  )
}
